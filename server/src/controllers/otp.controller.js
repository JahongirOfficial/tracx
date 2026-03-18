const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { sendOtp } = require('../services/eskiz.service');
const { generateTokens } = require('../services/auth.service');
const env = require('../config/env');

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 5;

/* ── Normalize phone: always 998XXXXXXXXX ── */
const normalizePhone = (phone) => {
  const digits = phone.replace(/\D/g, '');
  return digits.startsWith('998') ? digits : `998${digits}`;
};

/* ── Generate 6-digit code ── */
const generateCode = () => String(Math.floor(100000 + Math.random() * 900000));

/* ── POST /auth/otp/send ── */
const sendOtpCode = catchAsync(async (req, res, next) => {
  const { phone } = req.body;
  if (!phone) throw new AppError('Telefon raqam kerak', 400);

  const normalized = normalizePhone(phone);

  // Rate limit: max 1 SMS per minute
  const recent = await prisma.otpCode.findFirst({
    where: {
      phone: normalized,
      createdAt: { gt: new Date(Date.now() - 60 * 1000) },
    },
  });
  if (recent) throw new AppError("Iltimos 1 daqiqa kuting", 429);

  // Delete old codes for this phone
  await prisma.otpCode.deleteMany({ where: { phone: normalized } });

  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await prisma.otpCode.create({
    data: { phone: normalized, code, expiresAt, purpose: 'register' },
  });

  await sendOtp(normalized, code);

  res.json({ success: true, message: 'SMS yuborildi', phone: normalized });
});

/* ── POST /auth/otp/verify ── */
const verifyOtpCode = catchAsync(async (req, res, next) => {
  const { phone, code } = req.body;
  if (!phone || !code) throw new AppError('Telefon va kod kerak', 400);

  const normalized = normalizePhone(phone);

  const otp = await prisma.otpCode.findFirst({
    where: { phone: normalized, purpose: 'register' },
    orderBy: { createdAt: 'desc' },
  });

  if (!otp) throw new AppError('Kod topilmadi. Qayta SMS yuboring', 400);
  if (new Date() > otp.expiresAt) {
    await prisma.otpCode.delete({ where: { id: otp.id } });
    throw new AppError('Kod muddati tugagan. Qayta SMS yuboring', 400);
  }
  if (otp.attempts >= MAX_ATTEMPTS) throw new AppError("Ko'p marta xato kiritildi. Qayta SMS yuboring", 400);
  if (otp.code !== code) {
    await prisma.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    throw new AppError(`Kod noto'g'ri. ${MAX_ATTEMPTS - otp.attempts - 1} urinish qoldi`, 400);
  }

  // Mark as verified — delete it
  await prisma.otpCode.delete({ where: { id: otp.id } });

  res.json({ success: true, verified: true, phone: normalized });
});

/* ── POST /auth/register/phone ── */
const registerWithPhone = catchAsync(async (req, res, next) => {
  const { phone, password, fullName, companyName } = req.body;
  if (!phone || !password) throw new AppError('Telefon va parol kerak', 400);
  if (password.length < 8) throw new AppError("Parol kamida 8 ta belgi bo'lishi kerak", 400);

  const normalized = normalizePhone(phone);

  // Verify OTP was completed (no active OTP = verified)
  const pendingOtp = await prisma.otpCode.findFirst({ where: { phone: normalized } });
  if (pendingOtp) throw new AppError("Telefon raqam tasdiqlanmagan. Avval SMS kodni tasdiqlang", 400);

  // Check if phone already registered (as username)
  const existing = await prisma.businessman.findUnique({ where: { username: normalized } });
  if (existing) throw new AppError('Bu raqam allaqachon ro\'yxatdan o\'tgan', 409);

  const hashed = await bcrypt.hash(password, 12);
  const trialDays = parseInt(env.TRIAL_DAYS) || 7;
  const trialEndsAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000);

  const businessman = await prisma.businessman.create({
    data: {
      username: normalized,
      password: hashed,
      phone: normalized,
      fullName: fullName || null,
      companyName: companyName || null,
      plan: 'free',
      subscriptionEnd: trialEndsAt,
      trialEndsAt,
    },
  });

  const { accessToken, refreshToken } = await generateTokens(businessman.id, 'business');

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: businessman.id,
        username: businessman.username,
        role: 'business',
        fullName: businessman.fullName,
        companyName: businessman.companyName,
      },
      accessToken,
      refreshToken,
      role: 'business',
    },
  });
});

module.exports = { sendOtpCode, verifyOtpCode, registerWithPhone };
