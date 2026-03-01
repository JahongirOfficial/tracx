const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const getDrivers = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, search, status } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const businessmanId = req.user.id;

  const where = { businessmanId };
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { username: { contains: search, mode: 'insensitive' } },
      { fullName: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [drivers, total] = await Promise.all([
    prisma.driver.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, username: true, fullName: true, phone: true,
        status: true, isActive: true, paymentType: true,
        baseSalary: true, perTripRate: true, currentBalance: true,
        createdAt: true,
        _count: { select: { flights: true } },
      },
    }),
    prisma.driver.count({ where }),
  ]);

  res.json({
    success: true,
    data: drivers,
    meta: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
  });
});

const getDriver = catchAsync(async (req, res, next) => {
  const driver = await prisma.driver.findFirst({
    where: { id: req.params.id, businessmanId: req.user.id },
    include: {
      flights: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true, status: true, startedAt: true, completedAt: true,
          totalIncome: true, netProfit: true, paymentStatus: true,
          vehicle: { select: { plateNumber: true } },
        },
      },
      salaryPayments: {
        orderBy: { paidAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!driver) return next(new AppError('Haydovchi topilmadi', 404));
  res.json({ success: true, data: driver });
});

const createDriver = catchAsync(async (req, res) => {
  const { username, password, fullName, phone, paymentType, baseSalary, perTripRate } = req.body;
  const hashed = await bcrypt.hash(password, 12);

  const driver = await prisma.driver.create({
    data: {
      businessmanId: req.user.id,
      username,
      password: hashed,
      fullName,
      phone,
      paymentType: paymentType || 'per_trip',
      baseSalary: baseSalary || 0,
      perTripRate: perTripRate || 0,
    },
    select: {
      id: true, username: true, fullName: true, phone: true,
      status: true, isActive: true, paymentType: true,
      baseSalary: true, perTripRate: true, currentBalance: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      businessmanId: req.user.id,
      userId: req.user.id,
      userRole: req.user.role,
      action: 'create',
      entity: 'driver',
      entityId: driver.id,
      newData: driver,
      ipAddress: req.ip,
    },
  }).catch(() => {});

  res.status(201).json({ success: true, data: driver });
});

const updateDriver = catchAsync(async (req, res, next) => {
  const existing = await prisma.driver.findFirst({
    where: { id: req.params.id, businessmanId: req.user.id },
  });
  if (!existing) return next(new AppError('Haydovchi topilmadi', 404));

  const { fullName, phone, paymentType, baseSalary, perTripRate, isActive, status } = req.body;
  const data = {};
  if (fullName !== undefined) data.fullName = fullName;
  if (phone !== undefined) data.phone = phone;
  if (paymentType) data.paymentType = paymentType;
  if (baseSalary !== undefined) data.baseSalary = baseSalary;
  if (perTripRate !== undefined) data.perTripRate = perTripRate;
  if (isActive !== undefined) data.isActive = isActive;
  if (status) data.status = status;

  const updated = await prisma.driver.update({
    where: { id: req.params.id },
    data,
    select: {
      id: true, username: true, fullName: true, phone: true,
      status: true, isActive: true, paymentType: true,
      baseSalary: true, perTripRate: true, currentBalance: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      businessmanId: req.user.id, userId: req.user.id,
      userRole: req.user.role, action: 'update',
      entity: 'driver', entityId: req.params.id,
      oldData: existing, newData: updated, ipAddress: req.ip,
    },
  }).catch(() => {});

  res.json({ success: true, data: updated });
});

const deleteDriver = catchAsync(async (req, res, next) => {
  const existing = await prisma.driver.findFirst({
    where: { id: req.params.id, businessmanId: req.user.id },
  });
  if (!existing) return next(new AppError('Haydovchi topilmadi', 404));

  await prisma.driver.update({ where: { id: req.params.id }, data: { isActive: false } });

  res.json({ success: true, message: 'Haydovchi o\'chirildi' });
});

const paySalary = catchAsync(async (req, res, next) => {
  const driver = await prisma.driver.findFirst({
    where: { id: req.params.id, businessmanId: req.user.id },
  });
  if (!driver) return next(new AppError('Haydovchi topilmadi', 404));

  const { amount, note } = req.body;

  const [payment] = await prisma.$transaction([
    prisma.salaryPayment.create({
      data: { driverId: driver.id, amount, note },
    }),
    prisma.driver.update({
      where: { id: driver.id },
      data: { currentBalance: { increment: amount } },
    }),
  ]);

  res.status(201).json({ success: true, data: payment });
});

const getDriverStats = catchAsync(async (req, res, next) => {
  const driver = await prisma.driver.findFirst({
    where: { id: req.params.id, businessmanId: req.user.id },
  });
  if (!driver) return next(new AppError('Haydovchi topilmadi', 404));

  const [flightsAgg, flightCount, salaryTotal] = await Promise.all([
    prisma.flight.aggregate({
      where: { driverId: driver.id, status: 'completed' },
      _sum: { totalIncome: true, netProfit: true, driverProfitAmount: true, driverOwes: true, driverPaidAmount: true },
      _count: true,
    }),
    prisma.flight.count({ where: { driverId: driver.id } }),
    prisma.salaryPayment.aggregate({
      where: { driverId: driver.id },
      _sum: { amount: true },
    }),
  ]);

  res.json({
    success: true,
    data: {
      totalFlights: flightCount,
      completedFlights: flightsAgg._count,
      totalIncome: flightsAgg._sum.totalIncome || 0,
      totalProfit: flightsAgg._sum.netProfit || 0,
      driverShare: flightsAgg._sum.driverProfitAmount || 0,
      totalOwed: flightsAgg._sum.driverOwes || 0,
      totalPaid: flightsAgg._sum.driverPaidAmount || 0,
      currentBalance: driver.currentBalance,
      totalSalaryPaid: salaryTotal._sum.amount || 0,
    },
  });
});

module.exports = { getDrivers, getDriver, createDriver, updateDriver, deleteDriver, paySalary, getDriverStats };
