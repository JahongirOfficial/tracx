const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

const FIELD_NAMES = {
  username: 'foydalanuvchi nomi',
  plateNumber: 'davlat raqami',
  email: 'email',
};

const handlePrismaError = (err) => {
  if (err.code === 'P2002') {
    const rawField = err.meta?.target?.[0] || 'maydon';
    const field = FIELD_NAMES[rawField] || rawField;
    return new AppError(`Bu ${field} allaqachon mavjud`, 400);
  }
  if (err.code === 'P2025') {
    return new AppError('Resurs topilmadi', 404);
  }
  if (err.code === 'P2003') {
    return new AppError("Bog'liq resurs topilmadi", 400);
  }
  return new AppError('Ma\'lumotlar bazasi xatosi', 500);
};

const handleJWTError = () => new AppError('Yaroqsiz token. Iltimos, qayta kiring', 401);
const handleJWTExpiredError = () => new AppError('Token muddati tugadi. Iltimos, qayta kiring', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  } else {
    logger.error('Unexpected error:', err);
    res.status(500).json({
      success: false,
      message: 'Kutilmagan xato yuz berdi',
    });
  }
};

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Always normalize known error types first
  let error = err;
  if (err.name === 'PrismaClientKnownRequestError' || err.code?.startsWith('P2')) {
    error = handlePrismaError(err);
  } else if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  } else if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }

  if (process.env.NODE_ENV === 'development') {
    logger.error(error);
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

module.exports = errorHandler;
