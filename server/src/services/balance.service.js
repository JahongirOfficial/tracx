const prisma = require('../config/database');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

const DAILY_RATE_PER_VEHICLE = 1000; // UZS per vehicle per day
const TRIAL_DAYS = parseInt(process.env.TRIAL_DAYS || '30', 10);

/* ── helpers ── */
const toDecimal = (v) => parseFloat(v || 0);

/**
 * Get full balance info for a businessman.
 * Returns: balance, isTrial, trialDaysLeft, daysLeft, dailyCost, vehicleCount, isExpired
 */
const getBalanceInfo = async (businessmanId) => {
  const biz = await prisma.businessman.findUnique({
    where: { id: businessmanId },
    select: {
      balance: true,
      trialEndsAt: true,
      suspendedAt: true,
      isActive: true,
      registrationDate: true,
    },
  });
  if (!biz) throw new AppError('Biznesmen topilmadi', 404);

  const now = new Date();

  // If trialEndsAt not set yet, calculate from registrationDate
  const trialEnd = biz.trialEndsAt
    ? new Date(biz.trialEndsAt)
    : new Date(new Date(biz.registrationDate).getTime() + TRIAL_DAYS * 86400000);

  const isTrial = now < trialEnd;
  const trialDaysLeft = isTrial
    ? Math.ceil((trialEnd - now) / 86400000)
    : 0;

  // Count active vehicles for cost calculation
  const vehicleCount = await prisma.vehicle.count({
    where: { businessmanId, isActive: true },
  });

  const dailyCost = vehicleCount * DAILY_RATE_PER_VEHICLE;
  const balance = toDecimal(biz.balance);

  // Days remaining based on balance
  const daysLeft = dailyCost > 0
    ? Math.max(0, Math.floor(balance / dailyCost))
    : isTrial ? trialDaysLeft : 999;

  const isExpired = !isTrial && (balance < 0 || !!biz.suspendedAt);

  return {
    balance,
    isTrial,
    trialDaysLeft,
    trialEndsAt: trialEnd,
    vehicleCount,
    dailyCost,
    daysLeft,
    isExpired,
    suspendedAt: biz.suspendedAt,
  };
};

/**
 * Credit balance after a successful Payme payment.
 */
const topUp = async (businessmanId, amount, paymeId = null) => {
  const biz = await prisma.businessman.findUnique({
    where: { id: businessmanId },
    select: { balance: true, suspendedAt: true },
  });
  if (!biz) throw new AppError('Biznesmen topilmadi', 404);

  const before = toDecimal(biz.balance);
  const after = before + toDecimal(amount);

  const [updated] = await prisma.$transaction([
    prisma.businessman.update({
      where: { id: businessmanId },
      data: {
        balance: after,
        // Reactivate if was suspended and now has positive balance
        suspendedAt: after >= 0 ? null : biz.suspendedAt,
      },
      select: { balance: true },
    }),
    prisma.balanceTransaction.create({
      data: {
        businessmanId,
        type: 'topup',
        amount: toDecimal(amount),
        balanceBefore: before,
        balanceAfter: after,
        description: `Balans to'ldirildi: ${Number(amount).toLocaleString()} UZS`,
        paymeId: paymeId || null,
        paymeState: paymeId ? 2 : null,
      },
    }),
  ]);

  return { balance: toDecimal(updated.balance) };
};

/**
 * Run daily charge for ONE businessman.
 * Deducts vehicleCount × 1000 UZS from balance.
 */
const dailyChargeSingle = async (businessmanId) => {
  const biz = await prisma.businessman.findUnique({
    where: { id: businessmanId },
    select: { balance: true, trialEndsAt: true, registrationDate: true, isActive: true },
  });
  if (!biz || !biz.isActive) return null;

  const now = new Date();
  const trialEnd = biz.trialEndsAt
    ? new Date(biz.trialEndsAt)
    : new Date(new Date(biz.registrationDate).getTime() + TRIAL_DAYS * 86400000);

  // Skip if still in trial
  if (now < trialEnd) return null;

  const vehicleCount = await prisma.vehicle.count({
    where: { businessmanId, isActive: true },
  });

  if (vehicleCount === 0) return null;

  const charge = vehicleCount * DAILY_RATE_PER_VEHICLE;
  const before = toDecimal(biz.balance);
  const after = before - charge;

  await prisma.$transaction([
    prisma.businessman.update({
      where: { id: businessmanId },
      data: {
        balance: after,
        suspendedAt: after < 0 ? (after < -charge * 3 ? now : null) : null,
      },
    }),
    prisma.balanceTransaction.create({
      data: {
        businessmanId,
        type: 'daily_charge',
        amount: -charge,
        balanceBefore: before,
        balanceAfter: after,
        vehicleCount,
        description: `Kunlik to'lov: ${vehicleCount} ta mashina × ${DAILY_RATE_PER_VEHICLE.toLocaleString()} UZS`,
      },
    }),
  ]);

  logger.info(`[Billing] ${businessmanId}: -${charge} UZS (${vehicleCount} vehicles), balance: ${after}`);
  return { businessmanId, charge, vehicleCount, before, after };
};

/**
 * Run daily charge for ALL eligible businessmen.
 * Called by CRON job every night at 00:00.
 */
const dailyChargeAll = async () => {
  const businessmen = await prisma.businessman.findMany({
    where: { isActive: true },
    select: { id: true },
  });

  const results = await Promise.allSettled(
    businessmen.map((b) => dailyChargeSingle(b.id))
  );

  const charged = results.filter((r) => r.status === 'fulfilled' && r.value).length;
  logger.info(`[Billing] Daily charge complete: ${charged}/${businessmen.length} businesses charged`);
  return charged;
};

/**
 * Get paginated transaction history.
 */
const getTransactions = async (businessmanId, { page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;
  const [transactions, total] = await Promise.all([
    prisma.balanceTransaction.findMany({
      where: { businessmanId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.balanceTransaction.count({ where: { businessmanId } }),
  ]);

  return {
    transactions,
    meta: { total, page, limit, pages: Math.ceil(total / limit) },
  };
};

/**
 * Set trialEndsAt for a businessman if not set (called on first login).
 */
const initTrial = async (businessmanId) => {
  const biz = await prisma.businessman.findUnique({
    where: { id: businessmanId },
    select: { trialEndsAt: true, registrationDate: true },
  });
  if (!biz || biz.trialEndsAt) return;

  const trialEnd = new Date(new Date(biz.registrationDate).getTime() + TRIAL_DAYS * 86400000);

  await prisma.businessman.update({
    where: { id: businessmanId },
    data: { trialEndsAt: trialEnd },
  });
};

module.exports = {
  getBalanceInfo,
  topUp,
  dailyChargeSingle,
  dailyChargeAll,
  getTransactions,
  initTrial,
  DAILY_RATE_PER_VEHICLE,
};
