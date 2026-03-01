const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const { redis } = require('../config/redis');
const AppError = require('../utils/AppError');
const env = require('../config/env');

const generateTokens = async (userId, role) => {
  const payload = { id: userId, role };

  const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });

  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({
    data: { token: refreshToken, userId, userRole: role, expiresAt },
  });

  return { accessToken, refreshToken };
};

const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch {
    throw new AppError('Yaroqsiz token', 401);
  }
};

const revokeToken = async (token) => {
  // Decode without verify to get expiry
  const decoded = jwt.decode(token);
  if (decoded && decoded.exp) {
    const ttl = decoded.exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) {
      await redis.setex(`blacklist:${token}`, ttl, '1');
    }
  }
};

const refreshTokens = async (refreshToken) => {
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
  } catch {
    throw new AppError('Yaroqsiz refresh token', 401);
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (!storedToken || storedToken.isRevoked || new Date() > storedToken.expiresAt) {
    throw new AppError('Refresh token yaroqsiz yoki muddati tugagan', 401);
  }

  // Revoke old token
  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { isRevoked: true },
  });

  return generateTokens(decoded.id, decoded.role);
};

module.exports = { generateTokens, verifyToken, revokeToken, refreshTokens };
