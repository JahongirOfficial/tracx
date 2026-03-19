const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { generateTokens, revokeToken, refreshTokens } = require('../services/auth.service');
const { checkSubscription, upgradeSubscription } = require('../services/subscription.service');
const env = require('../config/env');

const login = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;

  let user = null;
  let role = null;

  // Search order: SuperAdmin → Businessman → Driver
  const superAdmin = await prisma.superAdmin.findUnique({ where: { username } });
  if (superAdmin) { user = superAdmin; role = 'super_admin'; }

  if (!user) {
    const businessman = await prisma.businessman.findUnique({ where: { username } });
    if (businessman && businessman.isActive) { user = businessman; role = 'business'; }
    else if (businessman && !businessman.isActive) {
      return next(new AppError('Hisobingiz bloklangan', 403));
    }
  }

  if (!user) {
    const driver = await prisma.driver.findUnique({ where: { username } });
    if (driver && driver.isActive) { user = driver; role = 'driver'; }
    else if (driver && !driver.isActive) {
      return next(new AppError('Hisobingiz bloklangan', 403));
    }
  }

  if (!user) {
    const employee = await prisma.employee.findUnique({ where: { username } });
    if (employee && employee.isActive) { user = employee; role = 'employee'; }
    else if (employee && !employee.isActive) {
      return next(new AppError('Hisobingiz bloklangan', 403));
    }
  }

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Username yoki parol noto\'g\'ri', 401));
  }

  const { accessToken, refreshToken } = await generateTokens(user.id, role);

  // AuditLog
  await prisma.auditLog.create({
    data: {
      businessmanId: role === 'business' ? user.id : role === 'driver' ? user.businessmanId : undefined,
      userId: user.id,
      userRole: role,
      action: 'login',
      entity: role,
      entityId: user.id,
      ipAddress: req.ip,
    },
  }).catch(() => {});

  const userData = {
    id: user.id,
    username: user.username,
    role,
    fullName: user.fullName || null,
    companyName: user.companyName || null,
    businessmanId: role === 'driver' ? user.businessmanId : undefined,
    permissions: role === 'employee' ? user.permissions : undefined,
  };

  res.json({
    success: true,
    data: { user: userData, accessToken, refreshToken, role },
  });
});

const getMe = catchAsync(async (req, res, next) => {
  let user = null;
  const { id, role } = req.user;

  if (role === 'super_admin') {
    user = await prisma.superAdmin.findUnique({
      where: { id },
      select: { id: true, username: true, role: true, createdAt: true },
    });
  } else if (role === 'business') {
    user = await prisma.businessman.findUnique({
      where: { id },
      select: {
        id: true, username: true, fullName: true, phone: true,
        companyName: true, role: true, isActive: true,
        plan: true, subscriptionStart: true, subscriptionEnd: true,
      },
    });
    if (user) {
      const now = new Date();
      user.subscription = {
        plan: user.plan,
        isExpired: now > user.subscriptionEnd,
        daysLeft: Math.max(0, Math.ceil((user.subscriptionEnd - now) / (1000 * 60 * 60 * 24))),
        subscriptionEnd: user.subscriptionEnd,
      };
    }
  } else if (role === 'driver') {
    user = await prisma.driver.findUnique({
      where: { id },
      select: {
        id: true, username: true, fullName: true, phone: true,
        role: true, isActive: true, status: true, businessmanId: true,
        paymentType: true, perTripRate: true, currentBalance: true,
      },
    });
  }

  if (!user) return next(new AppError('Foydalanuvchi topilmadi', 404));

  res.json({ success: true, data: { user, role } });
});

const refresh = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;
  const tokens = await refreshTokens(refreshToken);
  res.json({ success: true, data: tokens });
});

const logout = catchAsync(async (req, res) => {
  await revokeToken(req.token);

  await prisma.auditLog.create({
    data: {
      businessmanId: req.user.role === 'business' ? req.user.id : req.user.businessmanId,
      userId: req.user.id,
      userRole: req.user.role,
      action: 'logout',
      entity: req.user.role,
      entityId: req.user.id,
      ipAddress: req.ip,
    },
  }).catch(() => {});

  res.json({ success: true, message: 'Tizimdan chiqdingiz' });
});

const getSubscription = catchAsync(async (req, res, next) => {
  const sub = await checkSubscription(req.user.id);
  res.json({ success: true, data: sub });
});

const upgradeSubscriptionHandler = catchAsync(async (req, res) => {
  const { plan, months } = req.body;
  const result = await upgradeSubscription(req.user.id, plan, months);
  res.json({ success: true, data: result });
});

const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const { id, role } = req.user;

  let user;
  if (role === 'super_admin') user = await prisma.superAdmin.findUnique({ where: { id } });
  else if (role === 'business') user = await prisma.businessman.findUnique({ where: { id } });
  else user = await prisma.driver.findUnique({ where: { id } });

  if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
    return next(new AppError('Joriy parol noto\'g\'ri', 400));
  }

  const hashed = await bcrypt.hash(newPassword, 12);

  if (role === 'super_admin') await prisma.superAdmin.update({ where: { id }, data: { password: hashed } });
  else if (role === 'business') await prisma.businessman.update({ where: { id }, data: { password: hashed } });
  else await prisma.driver.update({ where: { id }, data: { password: hashed } });

  res.json({ success: true, message: 'Parol muvaffaqiyatli o\'zgartirildi' });
});

const register = catchAsync(async (req, res, next) => {
  const { email, fullName, password, phone, companyName } = req.body;

  const existing = await prisma.businessman.findFirst({
    where: { OR: [{ username: email }, { email }] },
  });
  if (existing) return next(new AppError("Bu email allaqachon ro'yxatdan o'tgan", 400));

  const hashed = await bcrypt.hash(password, 12);

  const businessman = await prisma.businessman.create({
    data: {
      username: email,
      email,
      password: hashed,
      fullName,
      phone: phone || null,
      companyName: companyName || null,
      plan: 'free',
      subscriptionEnd: new Date('2099-12-31'),
    },
  });

  const { accessToken, refreshToken } = await generateTokens(businessman.id, 'business');

  const userData = {
    id: businessman.id,
    username: businessman.username,
    email: businessman.email,
    role: 'business',
    fullName: businessman.fullName,
    companyName: businessman.companyName,
  };

  res.status(201).json({
    success: true,
    data: { user: userData, accessToken, refreshToken, role: 'business' },
  });
});

const googleAuth = catchAsync(async (req, res, next) => {
  const { token } = req.body;
  if (!token) return next(new AppError('Google token kerak', 400));

  // Verify token with Google and get user info
  const googleRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!googleRes.ok) return next(new AppError('Google token yaroqsiz', 401));
  const googleUser = await googleRes.json();

  const { email, name } = googleUser;
  if (!email) return next(new AppError('Google emailni bermadi', 400));

  // Find or create businessman
  let businessman = await prisma.businessman.findFirst({
    where: { OR: [{ email }, { username: email }] },
  });

  if (!businessman) {
    businessman = await prisma.businessman.create({
      data: {
        username: email,
        email,
        password: '',
        fullName: name || email,
        plan: 'free',
        subscriptionEnd: new Date('2099-12-31'),
      },
    });
  }

  if (!businessman.isActive) return next(new AppError('Hisobingiz bloklangan', 403));

  const { accessToken, refreshToken } = await generateTokens(businessman.id, 'business');

  const userData = {
    id: businessman.id,
    username: businessman.username,
    email: businessman.email,
    role: 'business',
    fullName: businessman.fullName,
    companyName: businessman.companyName,
  };

  res.json({ success: true, data: { user: userData, accessToken, refreshToken, role: 'business' } });
});

/* ── OTP in-memory store ── */
// { phone: { code, expiresAt, attempts } }
const otpStore = new Map();
const OTP_TTL_MS  = 5 * 60 * 1000; // 5 daqiqa
const OTP_MAX_ATT = 5;

const sendOtp = catchAsync(async (req, res, next) => {
  const { phone } = req.body;
  if (!phone) return next(new AppError('Telefon raqam kiritilishi shart', 400));

  const normalized = phone.replace(/\D/g, '');
  const fullPhone  = normalized.startsWith('998') ? normalized : `998${normalized}`;

  const code = String(Math.floor(100000 + Math.random() * 900000));
  otpStore.set(fullPhone, { code, expiresAt: Date.now() + OTP_TTL_MS, attempts: 0 });

  const { sendOtp: sendSmsOtp } = require('../services/eskiz.service');
  await sendSmsOtp(fullPhone, code);

  res.json({ success: true, message: 'SMS yuborildi' });
});

const verifyOtp = catchAsync(async (req, res, next) => {
  const { phone, code } = req.body;
  if (!phone || !code) return next(new AppError('Telefon va kod kiritilishi shart', 400));

  const normalized = phone.replace(/\D/g, '');
  const fullPhone  = normalized.startsWith('998') ? normalized : `998${normalized}`;

  const entry = otpStore.get(fullPhone);
  if (!entry)                        return next(new AppError('Avval SMS kod yuboring', 400));
  if (Date.now() > entry.expiresAt)  { otpStore.delete(fullPhone); return next(new AppError('Kod muddati tugagan', 400)); }
  if (entry.attempts >= OTP_MAX_ATT) { otpStore.delete(fullPhone); return next(new AppError('Urinishlar soni tugadi, qayta yuboring', 429)); }

  entry.attempts += 1;
  if (entry.code !== String(code)) return next(new AppError("Kod noto'g'ri", 401));

  otpStore.delete(fullPhone);

  // Phone bo'yicha businessman qidirish (turli formatlar)
  const businessman = await prisma.businessman.findFirst({
    where: {
      OR: [
        { phone: fullPhone },
        { phone: `+${fullPhone}` },
        { phone: normalized },
      ],
      isActive: true,
    },
  });
  if (!businessman) return next(new AppError("Bu raqamga bog'liq aktiv hisob topilmadi", 404));

  const { accessToken, refreshToken } = await generateTokens(businessman.id, 'business');

  const userData = {
    id: businessman.id,
    username: businessman.username,
    role: 'business',
    fullName: businessman.fullName,
    companyName: businessman.companyName,
  };

  res.json({ success: true, data: { user: userData, accessToken, refreshToken, role: 'business' } });
});

module.exports = { login, register, googleAuth, getMe, refresh, logout, getSubscription, upgradeSubscriptionHandler, changePassword, sendOtp, verifyOtp };
