const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const { redis } = require('../config/redis');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const env = require('../config/env');

const protect = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Kirish uchun tizimga kiring', 401));
  }

  const token = authHeader.split(' ')[1];

  // Check blacklist
  const isBlacklisted = await redis.get(`blacklist:${token}`);
  if (isBlacklisted) {
    return next(new AppError('Token yaroqsiz. Iltimos, qayta kiring', 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
  } catch (err) {
    return next(new AppError('Yaroqsiz token', 401));
  }

  // Find user by role
  let user = null;
  if (decoded.role === 'super_admin') {
    user = await prisma.superAdmin.findUnique({ where: { id: decoded.id } });
  } else if (decoded.role === 'business') {
    user = await prisma.businessman.findUnique({ where: { id: decoded.id } });
    if (user && !user.isActive) {
      return next(new AppError('Hisobingiz bloklangan', 403));
    }
  } else if (decoded.role === 'driver') {
    user = await prisma.driver.findUnique({ where: { id: decoded.id } });
    if (user && !user.isActive) {
      return next(new AppError('Hisobingiz bloklangan', 403));
    }
  }

  if (!user) {
    return next(new AppError('Foydalanuvchi topilmadi', 401));
  }

  req.user = {
    id: user.id,
    role: decoded.role,
    username: user.username,
    businessmanId: decoded.role === 'driver' ? user.businessmanId : undefined,
  };
  req.token = token;

  next();
});

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('Bu amal uchun ruxsatingiz yo\'q', 403));
  }
  next();
};

const businessOnly = authorize('business');
const driverOnly = authorize('driver');
const superAdminOnly = authorize('super_admin');

module.exports = { protect, authorize, businessOnly, driverOnly, superAdminOnly };
