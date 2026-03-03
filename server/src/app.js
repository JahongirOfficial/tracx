const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const env = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const logger = require('./utils/logger');

// Routes
const authRoutes = require('./routes/auth.routes');
const superAdminRoutes = require('./routes/superAdmin.routes');
const driverRoutes = require('./routes/driver.routes');
const driverPanelRoutes = require('./routes/driverPanel.routes');
const vehicleRoutes = require('./routes/vehicle.routes');
const flightRoutes = require('./routes/flight.routes');
const paymentRoutes = require('./routes/payment.routes');
const balanceRoutes = require('./routes/balance.routes');
const employeeRoutes = require('./routes/employee.routes');

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGINS.split(','),
  credentials: true,
}));

// Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
app.use('/api', apiLimiter);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/driver', driverPanelRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/balance',  balanceRoutes);
app.use('/api/employees', employeeRoutes);

// 404
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint topilmadi' });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
