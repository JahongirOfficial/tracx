const prisma = require('../config/database');
const logger = require('../utils/logger');

const registerHandlers = (io, socket) => {
  const { user } = socket;

  // Join rooms
  socket.on('join-business', ({ businessmanId }) => {
    if (user.role === 'business' && user.id === businessmanId) {
      socket.join(`business-${businessmanId}`);
      logger.info(`Business ${businessmanId} joined room`);
    } else if (user.role === 'super_admin') {
      socket.join(`business-${businessmanId}`);
    }
  });

  socket.on('join-driver', ({ driverId }) => {
    if (user.role === 'driver' && user.id === driverId) {
      socket.join(`driver-${driverId}`);
      logger.info(`Driver ${driverId} joined room`);
    }
  });

  // Auto-join on connection
  if (user.role === 'business') {
    socket.join(`business-${user.id}`);
  } else if (user.role === 'driver') {
    socket.join(`driver-${user.id}`);
  }

  // GPS location update
  socket.on('driver-location', async ({ lat, lng, speed, heading }) => {
    if (user.role !== 'driver') return;

    try {
      const driver = await prisma.driver.update({
        where: { id: user.id },
        data: { lastLat: lat, lastLng: lng, lastSpeed: speed, lastHeading: heading, locationUpdatedAt: new Date() },
        select: { businessmanId: true },
      });

      io.to(`business-${driver.businessmanId}`).emit('driver-location-update', {
        driverId: user.id,
        lat, lng, speed, heading,
        timestamp: new Date(),
      });
    } catch (err) {
      logger.error('GPS update error:', err.message);
    }
  });
};

module.exports = registerHandlers;
