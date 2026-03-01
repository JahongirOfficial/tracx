const { z } = require('zod');

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 chars'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 chars'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  SUPER_ADMIN_USERNAME: z.string().default('superadmin'),
  SUPER_ADMIN_PASSWORD: z.string().default('SuperAdmin@2024!'),
  DEFAULT_USD_RATE: z.string().default('12800'),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  TRIAL_DAYS: z.string().default('7'),
  PAYME_MERCHANT_ID: z.string().optional(),
  PAYME_KEY: z.string().optional(),
});

let env;
try {
  env = envSchema.parse(process.env);
} catch (error) {
  console.error('Invalid environment variables:');
  console.error(error.errors);
  process.exit(1);
}

module.exports = env;
