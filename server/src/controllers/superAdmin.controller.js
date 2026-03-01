const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const env = require('../config/env');
const { getBalanceInfo, getTransactions, topUp } = require('../services/balance.service');

/* ── shared select shape ── */
const bizSelect = {
  id: true, username: true, fullName: true, phone: true,
  companyName: true, isActive: true, plan: true,
  subscriptionStart: true, subscriptionEnd: true,
  registrationDate: true, createdAt: true,
  balance: true, trialEndsAt: true, suspendedAt: true,
  _count: { select: { drivers: true, vehicles: true, flights: true } },
};

/* ── GET /super-admin/stats ── */
const getStats = catchAsync(async (req, res) => {
  const [
    totalBusinessmen, activeBusinessmen,
    totalDrivers, totalVehicles, totalFlights, activeFlights,
  ] = await Promise.all([
    prisma.businessman.count(),
    prisma.businessman.count({ where: { isActive: true } }),
    prisma.driver.count(),
    prisma.vehicle.count(),
    prisma.flight.count(),
    prisma.flight.count({ where: { status: 'active' } }),
  ]);

  const revenueAgg = await prisma.flight.aggregate({
    _sum: { totalIncome: true, netProfit: true },
  });

  const balanceAgg = await prisma.businessman.aggregate({
    _sum: { balance: true },
    where: { isActive: true },
  });
  const trialCount = await prisma.businessman.count({
    where: { plan: 'trial', isActive: true },
  });
  const suspendedCount = await prisma.businessman.count({
    where: { suspendedAt: { not: null }, isActive: true },
  });

  res.json({
    success: true,
    data: {
      totalBusinessmen, activeBusinessmen,
      totalDrivers, totalVehicles,
      totalFlights, activeFlights,
      totalRevenue:         parseFloat(revenueAgg._sum.totalIncome || 0),
      totalProfit:          parseFloat(revenueAgg._sum.netProfit  || 0),
      totalPlatformBalance: parseFloat(balanceAgg._sum.balance    || 0),
      trialCount,
      suspendedCount,
    },
  });
});

/* ── GET /super-admin/businessmen ── */
const getBusinessmen = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, search, status, plan } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {};
  if (search) {
    where.OR = [
      { username:    { contains: search, mode: 'insensitive' } },
      { fullName:    { contains: search, mode: 'insensitive' } },
      { companyName: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (status === 'active')  where.isActive = true;
  if (status === 'blocked') where.isActive = false;
  if (plan)                 where.plan = plan;

  const [businessmen, total] = await Promise.all([
    prisma.businessman.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      select: bizSelect,
    }),
    prisma.businessman.count({ where }),
  ]);

  const now = new Date();
  const DAILY_RATE = 1000;
  const data = businessmen.map((b) => {
    const vehicleCount = b._count.vehicles;
    const dailyCost    = vehicleCount * DAILY_RATE;
    const balance      = parseFloat(b.balance || 0);
    const isTrial      = b.trialEndsAt ? new Date(b.trialEndsAt) > now : false;
    const trialDaysLeft = isTrial ? Math.ceil((new Date(b.trialEndsAt) - now) / 86400000) : 0;
    const daysLeft     = isTrial ? trialDaysLeft : (dailyCost > 0 ? Math.floor(balance / dailyCost) : 0);
    return {
      ...b,
      balance,
      vehicleCount,
      dailyCost,
      daysLeft,
      isTrial,
      isExpired:           !isTrial && !!b.suspendedAt,
      subscriptionExpired: now > b.subscriptionEnd,
    };
  });

  res.json({
    success: true,
    data,
    meta: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
  });
});

/* ── GET /super-admin/businessmen/:id ── */
const getBusinessman = catchAsync(async (req, res, next) => {
  const b = await prisma.businessman.findUnique({
    where: { id: req.params.id },
    select: {
      ...bizSelect,
      drivers:  { select: { id: true, fullName: true, status: true, isActive: true }, take: 5 },
      vehicles: { select: { id: true, plateNumber: true, brand: true, model: true  }, take: 5 },
    },
  });
  if (!b) return next(new AppError('Biznesmen topilmadi', 404));

  const balanceInfo = await getBalanceInfo(req.params.id);
  res.json({ success: true, data: { ...b, balanceInfo } });
});

/* ── POST /super-admin/businessmen ── */
const createBusinessman = catchAsync(async (req, res) => {
  const { username, password, fullName, phone, companyName } = req.body;
  const hashed = await bcrypt.hash(password, 12);

  const trialDays = parseInt(env.TRIAL_DAYS) || 7;
  const subscriptionEnd = new Date();
  subscriptionEnd.setDate(subscriptionEnd.getDate() + trialDays);
  const trialEndsAt = new Date(subscriptionEnd);

  const businessman = await prisma.businessman.create({
    data: { username, password: hashed, fullName, phone, companyName, subscriptionEnd, trialEndsAt },
    select: bizSelect,
  });

  res.status(201).json({ success: true, data: businessman });
});

/* ── PUT /super-admin/businessmen/:id ── */
const updateBusinessman = catchAsync(async (req, res, next) => {
  const { isActive, fullName, phone, companyName, plan, subscriptionEnd } = req.body;
  const existing = await prisma.businessman.findUnique({ where: { id: req.params.id } });
  if (!existing) return next(new AppError('Biznesmen topilmadi', 404));

  const data = {};
  if (isActive !== undefined) data.isActive = isActive;
  if (fullName)               data.fullName = fullName;
  if (phone)                  data.phone = phone;
  if (companyName)            data.companyName = companyName;
  if (plan)                   data.plan = plan;
  if (subscriptionEnd)        data.subscriptionEnd = new Date(subscriptionEnd);

  const updated = await prisma.businessman.update({
    where: { id: req.params.id },
    data,
    select: bizSelect,
  });

  res.json({ success: true, data: updated });
});

/* ── DELETE /super-admin/businessmen/:id ── */
const deleteBusinessman = catchAsync(async (req, res, next) => {
  const existing = await prisma.businessman.findUnique({ where: { id: req.params.id } });
  if (!existing) return next(new AppError('Biznesmen topilmadi', 404));

  await prisma.businessman.update({
    where: { id: req.params.id },
    data: { isActive: false },
  });

  res.json({ success: true, message: 'Biznesmen bloklandi' });
});

/* ── PUT /super-admin/businessmen/:id/subscription ── */
const manageSubscription = catchAsync(async (req, res, next) => {
  const { plan, months = 1 } = req.body;
  const existing = await prisma.businessman.findUnique({ where: { id: req.params.id } });
  if (!existing) return next(new AppError('Biznesmen topilmadi', 404));

  const now = new Date();
  const startDate = existing.subscriptionEnd > now ? existing.subscriptionEnd : now;
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + months);

  const updated = await prisma.businessman.update({
    where: { id: req.params.id },
    data: { plan, subscriptionStart: now, subscriptionEnd: endDate },
    select: bizSelect,
  });

  res.json({ success: true, data: updated });
});

/* ── GET /super-admin/businessmen/:id/balance ── */
const getBusinessmanBalance = catchAsync(async (req, res, next) => {
  const biz = await prisma.businessman.findUnique({
    where: { id: req.params.id }, select: { id: true },
  });
  if (!biz) return next(new AppError('Biznesmen topilmadi', 404));

  const info = await getBalanceInfo(req.params.id);
  res.json({ success: true, data: info });
});

/* ── GET /super-admin/businessmen/:id/transactions ── */
const getBusinessmanTransactions = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;
  const biz = await prisma.businessman.findUnique({
    where: { id: req.params.id }, select: { id: true },
  });
  if (!biz) return next(new AppError('Biznesmen topilmadi', 404));

  const result = await getTransactions(req.params.id, {
    page: parseInt(page), limit: parseInt(limit),
  });
  res.json({ success: true, ...result });
});

/* ── POST /super-admin/businessmen/:id/balance/topup ── */
const topUpBusinessmanBalance = catchAsync(async (req, res, next) => {
  const { amount } = req.body;
  if (!amount || parseFloat(amount) <= 0) throw new AppError("Noto'g'ri miqdor", 400);

  const biz = await prisma.businessman.findUnique({
    where: { id: req.params.id }, select: { id: true },
  });
  if (!biz) return next(new AppError('Biznesmen topilmadi', 404));

  await topUp(req.params.id, parseFloat(amount));
  const info = await getBalanceInfo(req.params.id);
  res.json({ success: true, data: info });
});

/* ── POST /super-admin/businessmen/:id/balance/set ── */
const setBusinessmanBalance = catchAsync(async (req, res, next) => {
  const { balance } = req.body;
  if (balance === undefined || balance === null) throw new AppError('Miqdor kerak', 400);

  const biz = await prisma.businessman.findUnique({
    where: { id: req.params.id }, select: { id: true, balance: true },
  });
  if (!biz) return next(new AppError('Biznesmen topilmadi', 404));

  const before     = parseFloat(biz.balance);
  const newBalance = parseFloat(balance);

  await prisma.$transaction([
    prisma.businessman.update({
      where: { id: req.params.id },
      data: { balance: newBalance, ...(newBalance > 0 ? { suspendedAt: null } : {}) },
    }),
    prisma.balanceTransaction.create({
      data: {
        businessmanId: req.params.id,
        type: 'manual',
        amount: newBalance - before,
        balanceBefore: before,
        balanceAfter:  newBalance,
        description:   `SuperAdmin: balans ${Math.round(newBalance).toLocaleString('uz-UZ')} UZS ga o'rnatildi`,
      },
    }),
  ]);

  const info = await getBalanceInfo(req.params.id);
  res.json({ success: true, data: info });
});

module.exports = {
  getStats,
  getBusinessmen, getBusinessman, createBusinessman,
  updateBusinessman, deleteBusinessman, manageSubscription,
  getBusinessmanBalance, getBusinessmanTransactions,
  topUpBusinessmanBalance, setBusinessmanBalance,
};
