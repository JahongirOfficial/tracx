require('dotenv').config();
const http = require('http');
const app = require('./app');
const initSocket = require('./socket');
const prisma = require('./config/database');
const { redis } = require('./config/redis');
const logger = require('./utils/logger');
const env = require('./config/env');
const { startBillingJob } = require('./jobs/billing');

const server = http.createServer(app);

const start = async () => {
  try {
    // Connect Redis
    await redis.connect();

    // Connect DB
    await prisma.$connect();
    logger.info('Database connected');

    // Init Socket.io
    const io = await initSocket(server);
    app.set('io', io);

    // Start daily billing CRON
    startBillingJob();

    // Start server
    server.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
    });
  } catch (err) {
    logger.error('Server start failed:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down...');
  server.close();
  await prisma.$disconnect();
  redis.quit();
  process.exit(0);
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled rejection:', err);
  server.close(() => process.exit(1));
});

start();
