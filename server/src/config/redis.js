const Redis = require('ioredis');
const env = require('./env');
const logger = require('../utils/logger');

const createRedisClient = (name = 'default') => {
  const client = new Redis(env.REDIS_URL, {
    lazyConnect: true,
    retryStrategy: (times) => Math.min(times * 100, 3000),
  });

  client.on('connect', () => logger.info(`Redis [${name}] connected`));
  client.on('error', (err) => logger.error(`Redis [${name}] error:`, err.message));

  return client;
};

const redis = createRedisClient('main');
const pubClient = createRedisClient('pub');
const subClient = createRedisClient('sub');

module.exports = { redis, pubClient, subClient };
