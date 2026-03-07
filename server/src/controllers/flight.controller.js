const prisma = require('../config/database');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { recalculateFlightFinances } = require('../services/flight.service');
const { convertToUZS } = require('../utils/currency');
const { FUEL_TYPES, HEAVY_TYPES } = require('../validators/flight.validator');

// ===== FLIGHTS =====
const getFlights = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, status, driverId, vehicleId, dateFrom, dateTo } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const businessmanId = req.user.id;

  const where = { businessmanId };
  if (status) where.status = status;
  if (driverId) where.driverId = driverId;
  if (vehicleId) where.vehicleId = vehicleId;
  if (dateFrom || dateTo) {
    where.startedAt = {};
    if (dateFrom) where.startedAt.gte = new Date(dateFrom);
    if (dateTo) where.startedAt.lte = new Date(dateTo);
  }

  const [flights, total] = await Promise.all([
    prisma.flight.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        driver: { select: { fullName: true, phone: true } },
        vehicle: { select: { plateNumber: true, brand: true, model: true } },
        _count: { select: { legs: true, expenses: true } },
      },
    }),
    prisma.flight.count({ where }),
  ]);

  res.json({
    success: true,
    data: flights,
    meta: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
  });
});

const getFlight = catchAsync(async (req, res, next) => {
  const flight = await prisma.flight.findFirst({
    where: { id: req.params.id, businessmanId: req.user.id },
    include: {
      driver: { select: { id: true, fullName: true, phone: true, status: true, perTripRate: true } },
      vehicle: { select: { id: true, plateNumber: true, brand: true, model: true } },
      legs: { orderBy: { createdAt: 'asc' } },
      expenses: { orderBy: { createdAt: 'desc' } },
      driverPayments: { orderBy: { paidAt: 'asc' } },
    },
  });
  if (!flight) return next(new AppError('Reys topilmadi', 404));
  res.json({ success: true, data: flight });
});

const createFlight = catchAsync(async (req, res, next) => {
  const { driverId, vehicleId, flightType, roadMoney, fuelType, startOdometer, startFuel } = req.body;
  const businessmanId = req.user.id;

  const [driver, vehicle] = await Promise.all([
    prisma.driver.findFirst({ where: { id: driverId, businessmanId } }),
    prisma.vehicle.findFirst({ where: { id: vehicleId, businessmanId } }),
  ]);

  if (!driver) return next(new AppError('Haydovchi topilmadi', 404));
  if (!vehicle) return next(new AppError('Mashina topilmadi', 404));

  // Haydovchi ulushini driver.perTripRate dan olamiz
  const driverProfitPercent = parseFloat(driver.perTripRate) || 0;

  const flight = await prisma.flight.create({
    data: {
      businessmanId,
      driverId,
      vehicleId,
      flightType: flightType || 'domestic',
      roadMoney: roadMoney || 0,
      driverProfitPercent,
      startOdometer,
      startFuel,
    },
    include: {
      driver: { select: { fullName: true } },
      vehicle: { select: { plateNumber: true } },
    },
  });

  await prisma.driver.update({ where: { id: driverId }, data: { status: 'busy' } });

  await prisma.auditLog.create({
    data: {
      businessmanId, userId: req.user.id, userRole: req.user.role,
      action: 'create', entity: 'flight', entityId: flight.id,
      newData: { driverId, vehicleId }, ipAddress: req.ip,
    },
  }).catch(() => {});

  const io = req.app.get('io');
  if (io) io.to(`driver-${driverId}`).emit('flight-updated', { type: 'new', flight });

  res.status(201).json({ success: true, data: flight });
});

const updateFlight = catchAsync(async (req, res, next) => {
  const flight = await prisma.flight.findFirst({
    where: { id: req.params.id, businessmanId: req.user.id },
  });
  if (!flight) return next(new AppError('Reys topilmadi', 404));
  if (flight.status !== 'active') return next(new AppError("Faqat faol reysni o'zgartirish mumkin", 400));

  const { roadMoney, driverProfitPercent, flightType } = req.body;
  const data = {};
  if (roadMoney !== undefined) data.roadMoney = roadMoney;
  if (driverProfitPercent !== undefined) data.driverProfitPercent = driverProfitPercent;
  if (flightType) data.flightType = flightType;

  await prisma.flight.update({ where: { id: req.params.id }, data });
  await recalculateFlightFinances(req.params.id);

  const updated = await prisma.flight.findUnique({ where: { id: req.params.id } });
  res.json({ success: true, data: updated });
});

const deleteFlight = catchAsync(async (req, res, next) => {
  const flight = await prisma.flight.findFirst({
    where: { id: req.params.id, businessmanId: req.user.id },
  });
  if (!flight) return next(new AppError('Reys topilmadi', 404));
  if (flight.status !== 'active') return next(new AppError("Faqat faol reysni o'chirish mumkin", 400));

  await prisma.flight.delete({ where: { id: req.params.id } });
  await prisma.driver.update({ where: { id: flight.driverId }, data: { status: 'free' } });

  res.json({ success: true, message: "Reys o'chirildi" });
});

const completeFlight = catchAsync(async (req, res, next) => {
  const flight = await prisma.flight.findFirst({
    where: { id: req.params.id, businessmanId: req.user.id, status: 'active' },
  });
  if (!flight) return next(new AppError('Faol reys topilmadi', 404));

  const { endOdometer, endFuel } = req.body;

  await prisma.flight.update({
    where: { id: req.params.id },
    data: { status: 'completed', completedAt: new Date(), endOdometer, endFuel },
  });

  await recalculateFlightFinances(req.params.id);
  await prisma.driver.update({ where: { id: flight.driverId }, data: { status: 'free' } });

  if (endOdometer) {
    await prisma.vehicle.update({
      where: { id: flight.vehicleId },
      data: { currentOdometer: endOdometer },
    });
  }

  // Haydovchi balansiga foydani qo'shish
  const updatedFlight = await prisma.flight.findUnique({ where: { id: req.params.id } });
  if (updatedFlight && parseFloat(updatedFlight.driverProfitAmount) > 0) {
    await prisma.driver.update({
      where: { id: flight.driverId },
      data: { currentBalance: { increment: updatedFlight.driverProfitAmount } },
    });
  }

  const io = req.app.get('io');
  if (io) {
    io.to(`driver-${flight.driverId}`).emit('flight-completed', { flightId: req.params.id });
    io.to(`business-${flight.businessmanId}`).emit('flight-updated', { type: 'completed', flight: updatedFlight });
  }

  res.json({ success: true, data: updatedFlight });
});

const cancelFlight = catchAsync(async (req, res, next) => {
  const flight = await prisma.flight.findFirst({
    where: { id: req.params.id, businessmanId: req.user.id, status: 'active' },
  });
  if (!flight) return next(new AppError('Faol reys topilmadi', 404));

  await prisma.flight.update({
    where: { id: req.params.id },
    data: { status: 'cancelled' },
  });
  await prisma.driver.update({ where: { id: flight.driverId }, data: { status: 'free' } });

  res.json({ success: true, message: 'Reys bekor qilindi' });
});

// ===== LEGS (YO'NALISHLAR) =====
const addLeg = catchAsync(async (req, res, next) => {
  const flight = await prisma.flight.findFirst({
    where: { id: req.params.id, businessmanId: req.user.id, status: 'active' },
    include: { legs: true },
  });
  if (!flight) return next(new AppError('Faol reys topilmadi', 404));

  const { fromCity, toCity, cargo, weight, payment, paymentType, transferFeePercent = 0 } = req.body;
  const transferFeeAmount = (payment * transferFeePercent) / 100;
  const netPayment = payment - transferFeeAmount;

  // Yangi yo'nalish qo'shilganda oldingi barcha pending yo'nalishlarni yetib bordi deb belgilash
  const pendingLegs = flight.legs.filter(l => l.status === 'pending');
  if (pendingLegs.length > 0) {
    await prisma.leg.updateMany({
      where: { flightId: flight.id, status: 'pending' },
      data: { status: 'completed' },
    });
  }

  const leg = await prisma.leg.create({
    data: { flightId: flight.id, fromCity, toCity, cargo, weight, payment, paymentType, transferFeePercent, transferFeeAmount, netPayment },
  });

  await recalculateFlightFinances(flight.id);

  const io = req.app.get('io');
  if (io) io.to(`business-${flight.businessmanId}`).emit('flight-updated', { type: 'leg-added', flightId: flight.id });

  res.status(201).json({ success: true, data: leg });
});

const updateLeg = catchAsync(async (req, res, next) => {
  const flight = await prisma.flight.findFirst({
    where: { id: req.params.id, businessmanId: req.user.id },
  });
  if (!flight) return next(new AppError('Reys topilmadi', 404));

  const leg = await prisma.leg.findFirst({ where: { id: req.params.legId, flightId: flight.id } });
  if (!leg) return next(new AppError("Yo'nalish topilmadi", 404));

  const data = { ...req.body };
  if (data.payment !== undefined || data.transferFeePercent !== undefined) {
    const payment = data.payment ?? parseFloat(leg.payment);
    const feePercent = data.transferFeePercent ?? parseFloat(leg.transferFeePercent);
    data.transferFeeAmount = (payment * feePercent) / 100;
    data.netPayment = payment - data.transferFeeAmount;
  }

  const updated = await prisma.leg.update({ where: { id: leg.id }, data });
  await recalculateFlightFinances(flight.id);

  res.json({ success: true, data: updated });
});

const deleteLeg = catchAsync(async (req, res, next) => {
  const flight = await prisma.flight.findFirst({
    where: { id: req.params.id, businessmanId: req.user.id },
  });
  if (!flight) return next(new AppError('Reys topilmadi', 404));

  const leg = await prisma.leg.findFirst({ where: { id: req.params.legId, flightId: flight.id } });
  if (!leg) return next(new AppError("Yo'nalish topilmadi", 404));

  await prisma.leg.delete({ where: { id: leg.id } });
  await recalculateFlightFinances(flight.id);

  res.json({ success: true, message: "Yo'nalish o'chirildi" });
});

const updateLegStatus = catchAsync(async (req, res, next) => {
  const flight = await prisma.flight.findFirst({
    where: { id: req.params.id, businessmanId: req.user.id },
  });
  if (!flight) return next(new AppError('Reys topilmadi', 404));

  const leg = await prisma.leg.findFirst({ where: { id: req.params.legId, flightId: flight.id } });
  if (!leg) return next(new AppError("Yo'nalish topilmadi", 404));

  const updated = await prisma.leg.update({
    where: { id: leg.id },
    data: { status: req.body.status },
  });

  res.json({ success: true, data: updated });
});

// ===== EXPENSES =====
const addExpense = catchAsync(async (req, res, next) => {
  const flight = await prisma.flight.findFirst({
    where: { id: req.params.id, businessmanId: req.user.id },
  });
  if (!flight) return next(new AppError('Reys topilmadi', 404));

  const {
    type, amount, currency = 'UZS', exchangeRate, description,
    timing = 'during', fuelLiters, fuelPricePerLiter, odometerAtExpense, expenseDate,
  } = req.body;
  const expenseClass = HEAVY_TYPES.includes(type) ? 'heavy' : 'light';
  const amountInUZS = convertToUZS(amount, currency, exchangeRate);

  const expenseData = {
    flightId: flight.id,
    type, expenseClass, amount, currency, exchangeRate, amountInUZS,
    description, timing,
    addedBy: 'businessman',
    addedById: req.user.id,
    expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
  };

  if (fuelLiters !== undefined && fuelLiters !== null) expenseData.fuelLiters = fuelLiters;
  if (fuelPricePerLiter !== undefined && fuelPricePerLiter !== null) expenseData.fuelPricePerLiter = fuelPricePerLiter;
  if (odometerAtExpense !== undefined && odometerAtExpense !== null) expenseData.odometerAtExpense = odometerAtExpense;

  const expense = await prisma.expense.create({ data: expenseData });

  await recalculateFlightFinances(flight.id);

  const io = req.app.get('io');
  if (io) {
    io.to(`driver-${flight.driverId}`).emit('expense-added', { flightId: flight.id, expense });
  }

  res.status(201).json({ success: true, data: expense });
});

const updateExpense = catchAsync(async (req, res, next) => {
  const flight = await prisma.flight.findFirst({
    where: { id: req.params.id, businessmanId: req.user.id },
  });
  if (!flight) return next(new AppError('Reys topilmadi', 404));

  const expense = await prisma.expense.findFirst({ where: { id: req.params.expId, flightId: flight.id } });
  if (!expense) return next(new AppError('Xarajat topilmadi', 404));

  const { amount, currency, exchangeRate, description, timing, fuelLiters, fuelPricePerLiter, odometerAtExpense, expenseDate } = req.body;
  const data = {};
  if (amount !== undefined) {
    data.amount = amount;
    data.amountInUZS = convertToUZS(amount, currency || expense.currency, exchangeRate || expense.exchangeRate);
  }
  if (currency) data.currency = currency;
  if (exchangeRate !== undefined) data.exchangeRate = exchangeRate;
  if (description !== undefined) data.description = description;
  if (timing) data.timing = timing;
  if (fuelLiters !== undefined) data.fuelLiters = fuelLiters;
  if (fuelPricePerLiter !== undefined) data.fuelPricePerLiter = fuelPricePerLiter;
  if (odometerAtExpense !== undefined) data.odometerAtExpense = odometerAtExpense;
  if (expenseDate) data.expenseDate = new Date(expenseDate);

  const updated = await prisma.expense.update({ where: { id: expense.id }, data });
  await recalculateFlightFinances(flight.id);

  res.json({ success: true, data: updated });
});

const deleteExpense = catchAsync(async (req, res, next) => {
  const flight = await prisma.flight.findFirst({
    where: { id: req.params.id, businessmanId: req.user.id },
  });
  if (!flight) return next(new AppError('Reys topilmadi', 404));

  const expense = await prisma.expense.findFirst({ where: { id: req.params.expId, flightId: flight.id } });
  if (!expense) return next(new AppError('Xarajat topilmadi', 404));

  await prisma.expense.delete({ where: { id: expense.id } });
  await recalculateFlightFinances(flight.id);

  res.json({ success: true, message: "Xarajat o'chirildi" });
});

const addDriverPayment = catchAsync(async (req, res, next) => {
  const flight = await prisma.flight.findFirst({
    where: { id: req.params.id, businessmanId: req.user.id },
  });
  if (!flight) return next(new AppError('Reys topilmadi', 404));

  const { amount, paidAt, note } = req.body;

  await prisma.driverPayment.create({
    data: {
      flightId: flight.id,
      amount,
      paidAt: paidAt ? new Date(paidAt) : new Date(),
      note: note || null,
    },
  });

  await prisma.flight.update({
    where: { id: flight.id },
    data: { driverPaidAmount: { increment: amount } },
  });

  await recalculateFlightFinances(flight.id);
  const updated = await prisma.flight.findUnique({
    where: { id: flight.id },
    include: { driverPayments: { orderBy: { paidAt: 'asc' } } },
  });

  res.json({ success: true, data: updated });
});

// ===== STATS =====
const getStatsSummary = catchAsync(async (req, res) => {
  const { dateFrom, dateTo } = req.query;
  const businessmanId = req.user.id;

  const where = { businessmanId };
  if (dateFrom || dateTo) {
    where.startedAt = {};
    if (dateFrom) where.startedAt.gte = new Date(dateFrom);
    if (dateTo) where.startedAt.lte = new Date(dateTo);
  }

  const [agg, byStatus] = await Promise.all([
    prisma.flight.aggregate({
      where,
      _sum: { totalIncome: true, lightExpenses: true, heavyExpenses: true, netProfit: true, businessProfit: true, driverProfitAmount: true },
      _count: true,
    }),
    prisma.flight.groupBy({
      by: ['status'],
      where,
      _count: true,
    }),
  ]);

  res.json({
    success: true,
    data: {
      totalFlights: agg._count,
      totalIncome: agg._sum.totalIncome || 0,
      lightExpenses: agg._sum.lightExpenses || 0,
      heavyExpenses: agg._sum.heavyExpenses || 0,
      netProfit: agg._sum.netProfit || 0,
      businessProfit: agg._sum.businessProfit || 0,
      driverProfitAmount: agg._sum.driverProfitAmount || 0,
      byStatus: byStatus.reduce((acc, s) => ({ ...acc, [s.status]: s._count }), {}),
    },
  });
});

const getDriverDebts = catchAsync(async (req, res) => {
  const businessmanId = req.user.id;

  const drivers = await prisma.driver.findMany({
    where: { businessmanId, isActive: true },
    select: {
      id: true, fullName: true, status: true,
      flights: {
        where: { status: 'completed', paymentStatus: { not: 'paid' } },
        select: { driverOwes: true, driverPaidAmount: true, id: true },
      },
    },
  });

  const data = drivers
    .map((d) => ({
      id: d.id,
      fullName: d.fullName,
      status: d.status,
      totalOwed: d.flights.reduce((s, f) => s + parseFloat(f.driverOwes), 0),
      totalPaid: d.flights.reduce((s, f) => s + parseFloat(f.driverPaidAmount), 0),
      pendingFlights: d.flights.length,
    }))
    .filter((d) => d.totalOwed > d.totalPaid);

  res.json({ success: true, data });
});

module.exports = {
  getFlights, getFlight, createFlight, updateFlight, deleteFlight, completeFlight, cancelFlight,
  addLeg, updateLeg, deleteLeg, updateLegStatus,
  addExpense, updateExpense, deleteExpense, addDriverPayment,
  getStatsSummary, getDriverDebts,
};
