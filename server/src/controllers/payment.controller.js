const catchAsync = require('../utils/catchAsync');
const { handlePaymeWebhook, verifyPaymeAuth } = require('../services/payment.service');
const logger = require('../utils/logger');

/**
 * POST /api/payments/payme
 * Payme Business API JSON-RPC 2.0 webhook.
 *
 * Payme always sends:  { id, method, params }
 * We must always reply: { id, result } or { id, error }
 */
const paymeWebhook = catchAsync(async (req, res) => {
  const { id = null, method, params } = req.body || {};

  // 1. Verify Basic auth header
  if (!verifyPaymeAuth(req.headers['authorization'])) {
    logger.warn(`[Payme] Unauthorized request — method: ${method}`);
    return res.status(401).json({
      id,
      error: { code: -32504, message: { uz: 'Avtorizatsiya xatosi', ru: 'Ошибка авторизации', en: 'Authorization error' } },
    });
  }

  // 2. Validate method field
  if (!method) {
    return res.json({ id, error: { code: -32600, message: 'Invalid request' } });
  }

  // 3. Dispatch
  try {
    const result = await handlePaymeWebhook(method, params || {});
    return res.json({ id, result });
  } catch (err) {
    // If error was thrown from our Payme error handlers (structured)
    try {
      const parsed = JSON.parse(err.message);
      logger.warn(`[Payme] Business error — ${method}: ${err.message}`);
      return res.json({ id, error: parsed });
    } catch {
      logger.error(`[Payme] Internal error — ${method}:`, err);
      return res.json({ id, error: { code: -32400, message: 'Internal error' } });
    }
  }
});

const getPaymentStatus = catchAsync(async (req, res) => {
  res.json({ success: true, data: { id: req.params.id, status: 'pending' } });
});

module.exports = { paymeWebhook, getPaymentStatus };
