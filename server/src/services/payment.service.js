/**
 * Payme Business API webhook handler.
 *
 * Payme sends JSON-RPC 2.0 requests to POST /api/payments/payme.
 * Authorization: Basic base64("Paycom:{PAYME_KEY}")
 *
 * Flow:
 *   1. CheckPerformTransaction — validate account & amount
 *   2. CreateTransaction       — create pending BalanceTransaction
 *   3. PerformTransaction      — credit businessman's balance
 *   4. CancelTransaction       — reverse if needed
 *   5. CheckTransaction        — return current state
 *   6. GetStatement            — return list of transactions
 */

const prisma = require('../config/database');
const { topUp } = require('./balance.service');
const logger = require('../utils/logger');
const env = require('../config/env');

/* ── Error codes defined by Payme ── */
const ERRORS = {
  PARSE_ERROR:           { code: -32700, message: 'Parse error' },
  INTERNAL_ERROR:        { code: -32603, message: 'Internal error' },
  INVALID_AMOUNT:        { code: -31001, message: { uz: "Noto'g'ri miqdor", ru: 'Неверная сумма', en: 'Invalid amount' } },
  ACCOUNT_NOT_FOUND:     { code: -31050, message: { uz: 'Hisob topilmadi',  ru: 'Аккаунт не найден', en: 'Account not found' } },
  TRANSACTION_NOT_FOUND: { code: -31003, message: { uz: 'Tranzaksiya topilmadi', ru: 'Транзакция не найдена', en: 'Transaction not found' } },
  CANT_PERFORM:          { code: -31008, message: { uz: 'Bajarib bo\'lmaydi', ru: 'Невозможно выполнить', en: 'Cannot perform' } },
  ALREADY_DONE:          { code: -31060, message: { uz: 'Allaqachon bajarilgan', ru: 'Уже выполнено', en: 'Already done' } },
};

const throwPayme = (err) => {
  const e = new Error(JSON.stringify(err));
  e.isPayme = true;
  throw e;
};

/* Minimum topup: 10,000 UZS = 1,000,000 tiyins */
const MIN_AMOUNT_TIYINS = 1_000_000;

/* ── Verify Basic auth header ── */
const verifyPaymeAuth = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Basic ')) return false;
  try {
    const decoded = Buffer.from(authHeader.slice(6), 'base64').toString('utf8');
    return decoded === `Paycom:${env.PAYME_KEY}`;
  } catch {
    return false;
  }
};

/* ── CheckPerformTransaction ── */
const checkPerform = async (params) => {
  const { amount, account } = params;
  if (!account?.businessmanId) throwPayme(ERRORS.ACCOUNT_NOT_FOUND);

  const biz = await prisma.businessman.findUnique({
    where: { id: account.businessmanId },
    select: { id: true, isActive: true },
  });
  if (!biz || !biz.isActive) throwPayme(ERRORS.ACCOUNT_NOT_FOUND);

  if (!amount || amount < MIN_AMOUNT_TIYINS) throwPayme(ERRORS.INVALID_AMOUNT);

  return { allow: true };
};

/* ── CreateTransaction ── */
const createTransaction = async (params) => {
  const { id: paymeId, time, amount, account } = params;

  if (!account?.businessmanId) throwPayme(ERRORS.ACCOUNT_NOT_FOUND);
  if (!amount || amount < MIN_AMOUNT_TIYINS) throwPayme(ERRORS.INVALID_AMOUNT);

  const biz = await prisma.businessman.findUnique({
    where: { id: account.businessmanId },
    select: { id: true, isActive: true, balance: true },
  });
  if (!biz || !biz.isActive) throwPayme(ERRORS.ACCOUNT_NOT_FOUND);

  // Check for existing transaction
  const existing = await prisma.balanceTransaction.findUnique({
    where: { paymeId },
  });

  if (existing) {
    if (existing.paymeState === -1) throwPayme(ERRORS.CANT_PERFORM);
    return {
      create_time: existing.paymeTime ? Number(existing.paymeTime) : time,
      transaction: existing.id,
      state: existing.paymeState || 1,
    };
  }

  const amountUZS = amount / 100; // tiyins → UZS
  const before = parseFloat(biz.balance || 0);

  const tx = await prisma.balanceTransaction.create({
    data: {
      businessmanId: account.businessmanId,
      type: 'topup',
      amount: amountUZS,
      balanceBefore: before,
      balanceAfter: before,          // will be updated on PerformTransaction
      description: `Payme to'lov: ${amountUZS.toLocaleString()} UZS`,
      paymeId,
      paymeState: 1,
      paymeTime: BigInt(time),
    },
  });

  return {
    create_time: time,
    transaction: tx.id,
    state: 1,
  };
};

/* ── PerformTransaction ── */
const performTransaction = async (params) => {
  const { id: paymeId } = params;

  const tx = await prisma.balanceTransaction.findUnique({ where: { paymeId } });
  if (!tx) throwPayme(ERRORS.TRANSACTION_NOT_FOUND);
  if (tx.paymeState === -1) throwPayme(ERRORS.CANT_PERFORM);

  const now = Date.now();

  if (tx.paymeState === 2) {
    // Already performed
    return { transaction: tx.id, perform_time: now, state: 2 };
  }

  // Credit the balance
  await topUp(tx.businessmanId, tx.amount, null /* already stored */);

  // Update transaction state
  const biz = await prisma.businessman.findUnique({
    where: { id: tx.businessmanId },
    select: { balance: true },
  });

  await prisma.balanceTransaction.update({
    where: { id: tx.id },
    data: {
      paymeState: 2,
      balanceAfter: parseFloat(biz.balance),
    },
  });

  logger.info(`[Payme] PerformTransaction: ${paymeId} — +${tx.amount} UZS to ${tx.businessmanId}`);

  return { transaction: tx.id, perform_time: now, state: 2 };
};

/* ── CancelTransaction ── */
const cancelTransaction = async (params) => {
  const { id: paymeId, reason } = params;

  const tx = await prisma.balanceTransaction.findUnique({ where: { paymeId } });
  if (!tx) throwPayme(ERRORS.TRANSACTION_NOT_FOUND);

  const now = Date.now();

  if (tx.paymeState === -1) {
    return { transaction: tx.id, cancel_time: now, state: -1 };
  }

  if (tx.paymeState === 2) {
    // Reverse the top-up
    const biz = await prisma.businessman.findUnique({
      where: { id: tx.businessmanId },
      select: { balance: true },
    });
    const before = parseFloat(biz.balance);
    const after = before - parseFloat(tx.amount);

    await prisma.$transaction([
      prisma.businessman.update({
        where: { id: tx.businessmanId },
        data: { balance: after },
      }),
      prisma.balanceTransaction.create({
        data: {
          businessmanId: tx.businessmanId,
          type: 'manual',
          amount: -parseFloat(tx.amount),
          balanceBefore: before,
          balanceAfter: after,
          description: `Payme bekor qilish: ${tx.paymeId}`,
        },
      }),
    ]);
  }

  await prisma.balanceTransaction.update({
    where: { id: tx.id },
    data: { paymeState: -1 },
  });

  return { transaction: tx.id, cancel_time: now, state: -1 };
};

/* ── CheckTransaction ── */
const checkTransaction = async (params) => {
  const { id: paymeId } = params;
  const tx = await prisma.balanceTransaction.findUnique({ where: { paymeId } });
  if (!tx) throwPayme(ERRORS.TRANSACTION_NOT_FOUND);

  return {
    create_time: tx.paymeTime ? Number(tx.paymeTime) : 0,
    perform_time: tx.paymeState === 2 ? Date.now() : 0,
    cancel_time:  tx.paymeState === -1 ? Date.now() : 0,
    transaction:  tx.id,
    state:        tx.paymeState || 1,
    reason:       null,
  };
};

/* ── GetStatement ── */
const getStatement = async (params) => {
  const { from, to } = params;
  const txs = await prisma.balanceTransaction.findMany({
    where: {
      paymeId: { not: null },
      createdAt: {
        gte: new Date(from),
        lte: new Date(to),
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return {
    transactions: txs.map((t) => ({
      id:           t.paymeId,
      time:         t.paymeTime ? Number(t.paymeTime) : t.createdAt.getTime(),
      amount:       parseFloat(t.amount) * 100,
      account:      { businessmanId: t.businessmanId },
      create_time:  t.createdAt.getTime(),
      perform_time: t.paymeState === 2 ? t.createdAt.getTime() : 0,
      cancel_time:  t.paymeState === -1 ? t.createdAt.getTime() : 0,
      transaction:  t.id,
      state:        t.paymeState || 1,
      reason:       null,
    })),
  };
};

/* ── Main dispatcher ── */
const handlePaymeWebhook = async (method, params) => {
  switch (method) {
    case 'CheckPerformTransaction': return await checkPerform(params);
    case 'CreateTransaction':       return await createTransaction(params);
    case 'PerformTransaction':      return await performTransaction(params);
    case 'CancelTransaction':       return await cancelTransaction(params);
    case 'CheckTransaction':        return await checkTransaction(params);
    case 'GetStatement':            return await getStatement(params);
    default: throw new Error('Method not found');
  }
};

module.exports = { verifyPaymeAuth, handlePaymeWebhook };
