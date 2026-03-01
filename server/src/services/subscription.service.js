const prisma = require('../config/database');
const AppError = require('../utils/AppError');
const { getBalanceInfo } = require('./balance.service');

/**
 * Check subscription/balance status for a businessman.
 * Delegates to balance.service which handles trial + prepaid balance logic.
 */
const checkSubscription = async (businessmanId) => {
  return await getBalanceInfo(businessmanId);
};

/**
 * Manual upgrade via super_admin (extends subscriptionEnd for legacy compat).
 */
const upgradeSubscription = async (businessmanId, plan, months = 1) => {
  const businessman = await prisma.businessman.findUnique({ where: { id: businessmanId } });
  if (!businessman) throw new AppError('Biznesmen topilmadi', 404);

  const now = new Date();
  const startDate = businessman.subscriptionEnd > now ? businessman.subscriptionEnd : now;
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + months);

  return await prisma.businessman.update({
    where: { id: businessmanId },
    data: { plan, subscriptionStart: now, subscriptionEnd: endDate },
    select: { id: true, plan: true, subscriptionStart: true, subscriptionEnd: true },
  });
};

module.exports = { checkSubscription, upgradeSubscription };
