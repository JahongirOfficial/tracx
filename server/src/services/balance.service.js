const prisma = require('../config/database');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

const MONTHLY_RATE_PER_VEHICLE = 50000; // UZS per extra vehicle per month
const DAILY_RATE_PER_VEHICLE = Math.round(MONTHLY_RATE_PER_VEHICLE / 30); // ~1667 UZS/day
const FREE_VEHICLES = 2; // First 2 vehicles are always free forever

/* ── helpers ── */
const toDecimal = (v) => parseFloat(v || 0);

/**
 * Get full balance info for a businessman.
 */
const getBalanceInfo = async (businessmanId) => {
  const biz = await prisma.businessman.findUnique({
    where: { id: businessmanId },
    select: { balance: true, suspendedAt: true, isActive: true },
  });
  if (!biz) throw new AppError('Biznesmen topilmadi', 404);

  const vehicleCount = await prisma.vehicle.count({
    where: { businessmanId, isActive: true },
  });

  const billableVehicles = Math.max(0, vehicleCount - FREE_VEHICLES);
  const dailyCost = billableVehicles * DAILY_RATE_PER_VEHICLE;
  const monthlyCost = billableVehicles * MONTHLY_RATE_PER_VEHICLE;
  const balance = toDecimal(biz.balance);

  // Days remaining based on balance (if no extra vehicles — infinite)
  const daysLeft = dailyCost > 0
    ? Math.max(0, Math.floor(balance / dailyCost))
    : 9999;

  const isExpired = dailyCost > 0 && (balance < 0 || !!biz.suspendedAt);

  return {
    balance,
    vehicleCount,
    freeVehicles: FREE_VEHICLES,
    billableVehicles,
    dailyCost,
    monthlyCost,
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
 * Only charged if they have more than FREE_VEHICLES active vehicles.
 */
const dailyChargeSingle = async (businessmanId) => {
  const biz = await prisma.businessman.findUnique({
    where: { id: businessmanId },
    select: { balance: true, isActive: true },
  });
  if (!biz || !biz.isActive) return null;

  const vehicleCount = await prisma.vehicle.count({
    where: { businessmanId, isActive: true },
  });

  const billableVehicles = Math.max(0, vehicleCount - FREE_VEHICLES);
  if (billableVehicles === 0) return null; // 2 or fewer vehicles = free forever

  const charge = billableVehicles * DAILY_RATE_PER_VEHICLE;
  const before = toDecimal(biz.balance);
  const after = before - charge;

  await prisma.$transaction([
    prisma.businessman.update({
      where: { id: businessmanId },
      data: {
        balance: after,
        suspendedAt: after < 0 ? (after < -charge * 3 ? new Date() : null) : null,
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
        description: `Kunlik to'lov: ${billableVehicles} ta qo'shimcha mashina × ${DAILY_RATE_PER_VEHICLE.toLocaleString()} UZS (${vehicleCount} ta jami, ${FREE_VEHICLES} ta bepul)`,
      },
    }),
  ]);

  logger.info(`[Billing] ${businessmanId}: -${charge} UZS (${vehicleCount} vehicles), balance: ${after}`);
  return { businessmanId, charge, vehicleCount, before, after };
};

/**
 * Run daily charge for ALL eligible businessmen.
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

module.exports = {
  getBalanceInfo,
  topUp,
  dailyChargeSingle,
  dailyChargeAll,
  getTransactions,
  DAILY_RATE_PER_VEHICLE,
  MONTHLY_RATE_PER_VEHICLE,
  FREE_VEHICLES,
};
