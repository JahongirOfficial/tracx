const prisma = require('../config/database');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const getVehicles = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, search, status } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const businessmanId = req.user.id;

  const where = { businessmanId };
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { plateNumber: { contains: search, mode: 'insensitive' } },
      { brand: { contains: search, mode: 'insensitive' } },
      { model: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [vehicles, total] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, plateNumber: true, brand: true, model: true,
        year: true, color: true, status: true, isActive: true,
        currentOdometer: true, oilChangeIntervalKm: true, lastOilChangeKm: true,
        currentDriverId: true, createdAt: true,
        _count: { select: { flights: true } },
      },
    }),
    prisma.vehicle.count({ where }),
  ]);

  const now = Date.now();
  const data = vehicles.map((v) => ({
    ...v,
    needsOilChange: (v.currentOdometer - v.lastOilChangeKm) >= v.oilChangeIntervalKm,
    kmSinceOilChange: v.currentOdometer - v.lastOilChangeKm,
  }));

  res.json({
    success: true,
    data,
    meta: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
  });
});

const getVehicle = catchAsync(async (req, res, next) => {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: req.params.id, businessmanId: req.user.id },
    include: {
      tires: true,
      maintenanceLogs: { orderBy: { performedAt: 'desc' } },
      flights: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true, status: true, startedAt: true, completedAt: true,
          totalIncome: true, netProfit: true,
          driver: { select: { fullName: true } },
        },
      },
    },
  });
  if (!vehicle) return next(new AppError('Mashina topilmadi', 404));
  res.json({ success: true, data: vehicle });
});

const createVehicle = catchAsync(async (req, res) => {
  const { plateNumber, brand, model, year, color, currentOdometer, oilChangeIntervalKm, lastOilChangeKm } = req.body;

  const vehicle = await prisma.vehicle.create({
    data: {
      businessmanId: req.user.id,
      plateNumber, brand, model, year, color,
      currentOdometer: currentOdometer || 0,
      oilChangeIntervalKm: oilChangeIntervalKm || 10000,
      lastOilChangeKm: lastOilChangeKm || 0,
    },
  });

  await prisma.auditLog.create({
    data: {
      businessmanId: req.user.id, userId: req.user.id,
      userRole: req.user.role, action: 'create',
      entity: 'vehicle', entityId: vehicle.id,
      newData: vehicle, ipAddress: req.ip,
    },
  }).catch(() => {});

  res.status(201).json({ success: true, data: vehicle });
});

const updateVehicle = catchAsync(async (req, res, next) => {
  const existing = await prisma.vehicle.findFirst({
    where: { id: req.params.id, businessmanId: req.user.id },
  });
  if (!existing) return next(new AppError('Mashina topilmadi', 404));

  const allowed = ['brand', 'model', 'year', 'color', 'currentOdometer', 'oilChangeIntervalKm', 'lastOilChangeKm', 'status', 'isActive'];
  const data = {};
  allowed.forEach((key) => { if (req.body[key] !== undefined) data[key] = req.body[key]; });

  const updated = await prisma.vehicle.update({ where: { id: req.params.id }, data });
  res.json({ success: true, data: updated });
});

const deleteVehicle = catchAsync(async (req, res, next) => {
  const existing = await prisma.vehicle.findFirst({
    where: { id: req.params.id, businessmanId: req.user.id },
  });
  if (!existing) return next(new AppError('Mashina topilmadi', 404));

  await prisma.vehicle.update({ where: { id: req.params.id }, data: { isActive: false } });
  res.json({ success: true, message: 'Mashina o\'chirildi' });
});

const assignDriver = catchAsync(async (req, res, next) => {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: req.params.id, businessmanId: req.user.id },
  });
  if (!vehicle) return next(new AppError('Mashina topilmadi', 404));

  const { driverId } = req.body;

  if (driverId) {
    const driver = await prisma.driver.findFirst({
      where: { id: driverId, businessmanId: req.user.id },
    });
    if (!driver) return next(new AppError('Haydovchi topilmadi', 404));
  }

  const updated = await prisma.vehicle.update({
    where: { id: req.params.id },
    data: { currentDriverId: driverId },
  });

  res.json({ success: true, data: updated });
});

const addMaintenance = catchAsync(async (req, res, next) => {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: req.params.id, businessmanId: req.user.id },
  });
  if (!vehicle) return next(new AppError('Mashina topilmadi', 404));

  const { type, description, cost, odometerAt } = req.body;

  const log = await prisma.maintenanceLog.create({
    data: { vehicleId: vehicle.id, type, description, cost, odometerAt },
  });

  // Update oil change km if it's an oil change
  if (type === 'oil_change' && odometerAt) {
    await prisma.vehicle.update({
      where: { id: vehicle.id },
      data: { lastOilChangeKm: odometerAt },
    });
  }

  res.status(201).json({ success: true, data: log });
});

module.exports = { getVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle, assignDriver, addMaintenance };
