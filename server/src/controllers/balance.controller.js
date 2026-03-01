const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const {
  getBalanceInfo, topUp, getTransactions,
} = require('../services/balance.service');
const env = require('../config/env');

/* ── GET /api/balance ── */
const getBalance = catchAsync(async (req, res) => {
  const info = await getBalanceInfo(req.user.id);
  res.json({ success: true, data: info });
});

/* ── GET /api/balance/transactions ── */
const listTransactions = catchAsync(async (req, res) => {
  const page  = parseInt(req.query.page  || '1',  10);
  const limit = parseInt(req.query.limit || '20', 10);
  const result = await getTransactions(req.user.id, { page, limit });
  res.json({ success: true, ...result });
});

/**
 * POST /api/balance/checkout
 * Generates a Payme checkout URL for the requested amount.
 *
 * Payme checkout URL format:
 *   https://test.paycom.uz/{base64({"m":merchantId,"ac":{"businessmanId":"..."},"a":amountTiyins,"l":"uz"})}
 *
 * Amount rules:
 *   - Must be in TIYINS (UZS × 100)
 *   - Min: 1,000,000 tiyins = 10,000 UZS
 */
const createCheckout = catchAsync(async (req, res) => {
  const amount = parseInt(req.body.amount, 10); // UZS

  if (!amount || amount < 10_000) {
    throw new AppError("Minimal miqdor 10,000 UZS bo'lishi kerak", 400);
  }

  const merchantId = env.PAYME_MERCHANT_ID;
  if (!merchantId) {
    throw new AppError('Payme sozlanmagan. PAYME_MERCHANT_ID muhit o\'zgaruvchisini to\'ldiring', 503);
  }

  // Tiyins = UZS × 100
  const amountTiyins = amount * 100;

  // Build checkout params object
  const params = {
    m:   merchantId,
    ac:  { businessmanId: req.user.id },
    a:   amountTiyins,
    l:   'uz',
  };

  // Base64 encode the params
  const encoded = Buffer.from(JSON.stringify(params)).toString('base64');

  // Use test URL always when PAYME_KEY starts with test indicator or NODE_ENV !== production
  const isProduction = env.NODE_ENV === 'production' && !env.PAYME_KEY?.includes('Test');
  const baseUrl = isProduction
    ? 'https://checkout.paycom.uz'
    : 'https://test.paycom.uz';

  const url = `${baseUrl}/${encoded}`;

  res.json({
    success: true,
    data: { url, amount, amountTiyins },
  });
});

/* ── POST /api/balance/topup (manual — dev only) ── */
const manualTopUp = catchAsync(async (req, res) => {
  if (env.NODE_ENV === 'production') {
    throw new AppError('Bu endpoint faqat development muhitida ishlaydi', 403);
  }
  const amount = parseFloat(req.body.amount);
  if (!amount || amount <= 0) throw new AppError("Noto'g'ri miqdor", 400);

  const result = await topUp(req.user.id, amount);
  res.json({ success: true, data: result });
});

module.exports = { getBalance, listTransactions, createCheckout, manualTopUp };
