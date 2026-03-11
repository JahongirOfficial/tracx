const prisma = require('../config/database');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { convertToUZS } = require('../utils/currency');

const getProfile = catchAsync(async (req, res, next) => {
  const driver = await prisma.driver.findUnique({
    where: { id: req.user.id },
    select: {
      id: true, username: true, fullName: true, phone: true,
      status: true, paymentType: true, perTripRate: true,
      baseSalary: true, currentBalance: true, businessmanId: true,
      businessman: { select: { companyName: true, fullName: true, phone: true } },
    },
  });
  if (!driver) return next(new AppError('Haydovchi topilmadi', 404));
  res.json({ success: true, data: driver });
});

const getMyFlights = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = { driverId: req.user.id };
  if (status) where.status = status;

  const [flights, total] = await Promise.all([
    prisma.flight.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
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

const getMyFlight = catchAsync(async (req, res, next) => {
  const flight = await prisma.flight.findFirst({
    where: { id: req.params.id, driverId: req.user.id },
    include: {
      vehicle: { select: { plateNumber: true, brand: true, model: true } },
      legs: { orderBy: { createdAt: 'asc' } },
      expenses: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!flight) return next(new AppError('Reys topilmadi', 404));
  res.json({ success: true, data: flight });
});

const addExpense = catchAsync(async (req, res, next) => {
  const flight = await prisma.flight.findFirst({
    where: { id: req.params.id, driverId: req.user.id, status: 'active' },
  });
  if (!flight) return next(new AppError('Faol reys topilmadi', 404));

  const {
    type, amount, currency = 'UZS', exchangeRate, description, timing = 'during',
    fuelLiters, fuelPricePerLiter, odometerAtExpense, expenseDate,
    paidFromOwn = false,
  } = req.body;

  // Determine expense class
  const FUEL_TYPES = ['fuel', 'fuel_metan', 'fuel_propan', 'fuel_benzin', 'fuel_diesel'];
  const HEAVY_TYPES = ['repair_major', 'tire', 'accident', 'insurance', 'oil', 'border_customs'];
  const expenseClass = HEAVY_TYPES.includes(type) ? 'heavy'
    : FUEL_TYPES.includes(type) ? 'light'
    : 'light';

  const amountInUZS = convertToUZS(amount, currency, exchangeRate);

  const expenseData = {
    flightId: flight.id,
    type,
    expenseClass,
    amount,
    currency,
    exchangeRate,
    amountInUZS,
    description,
    timing,
    paidFromOwn: expenseClass === 'light' ? !!paidFromOwn : false,
    addedBy: 'driver',
    addedById: req.user.id,
    driverRelId: req.user.id,
    expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
  };

  if (fuelLiters !== undefined && fuelLiters !== null) expenseData.fuelLiters = fuelLiters;
  if (fuelPricePerLiter !== undefined && fuelPricePerLiter !== null) expenseData.fuelPricePerLiter = fuelPricePerLiter;
  if (odometerAtExpense !== undefined && odometerAtExpense !== null) expenseData.odometerAtExpense = odometerAtExpense;

  const expense = await prisma.expense.create({ data: expenseData });

  // Recalculate finances
  const { recalculateFlightFinances } = require('../services/flight.service');
  await recalculateFlightFinances(flight.id);

  // Emit socket event
  const io = req.app.get('io');
  if (io) {
    io.to(`business-${flight.businessmanId}`).emit('expense-added', {
      flightId: flight.id,
      expense,
      addedBy: 'driver',
    });
  }

  res.status(201).json({ success: true, data: expense });
});

const updateLocation = catchAsync(async (req, res) => {
  const { lat, lng, speed, heading } = req.body;

  await prisma.driver.update({
    where: { id: req.user.id },
    data: { lastLat: lat, lastLng: lng, lastSpeed: speed, lastHeading: heading, locationUpdatedAt: new Date() },
  });

  // Emit to business room
  const driver = await prisma.driver.findUnique({
    where: { id: req.user.id },
    select: { businessmanId: true },
  });

  const io = req.app.get('io');
  if (io && driver) {
    io.to(`business-${driver.businessmanId}`).emit('driver-location-update', {
      driverId: req.user.id,
      lat, lng, speed, heading,
      timestamp: new Date(),
    });
  }

  res.json({ success: true, message: 'Joylashuv yangilandi' });
});

const confirmExpense = catchAsync(async (req, res, next) => {
  const expense = await prisma.expense.findFirst({
    where: {
      id: req.params.id,
      flight: { driverId: req.user.id },
    },
    include: { flight: { select: { businessmanId: true } } },
  });
  if (!expense) return next(new AppError('Xarajat topilmadi', 404));

  const updated = await prisma.expense.update({
    where: { id: req.params.id },
    data: { confirmedByDriver: true },
  });

  const io = req.app.get('io');
  if (io) {
    io.to(`business-${expense.flight.businessmanId}`).emit('expense-confirmed', {
      expenseId: expense.id,
      flightId: expense.flightId,
    });
  }

  res.json({ success: true, data: updated });
});

module.exports = { getProfile, getMyFlights, getMyFlight, addExpense, updateLocation, confirmExpense };
