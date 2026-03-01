const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const jwt = require('jsonwebtoken');
const { pubClient, subClient } = require('../config/redis');
const env = require('../config/env');
const logger = require('../utils/logger');
const registerHandlers = require('./handlers');

const initSocket = async (server) => {
  await Promise.all([pubClient.connect(), subClient.connect()]);

  const io = new Server(server, {
    cors: {
      origin: env.CORS_ORIGINS.split(','),
      credentials: true,
    },
    pingTimeout: 60000,
  });

  io.adapter(createAdapter(pubClient, subClient));

  // Auth middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error'));

    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} [${socket.user?.role}]`);
    registerHandlers(io, socket);

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  logger.info('Socket.io initialized with Redis adapter');
  return io;
};

module.exports = initSocket;
