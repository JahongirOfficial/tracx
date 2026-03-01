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

module.exports = { login, getMe, refresh, logout, getSubscription, upgradeSubscriptionHandler, changePassword };
