const { z } = require('zod');

const isProduction = process.env.NODE_ENV === 'production';

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
  // Production da ENV dan olish majburiy — default parol ishlatilmaydi
  SUPER_ADMIN_PASSWORD: isProduction
    ? z.string().min(12, 'SUPER_ADMIN_PASSWORD must be at least 12 chars in production')
    : z.string().default('SuperAdmin@2024!'),
  DEFAULT_USD_RATE: z.string().default('12800'),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  // TRIAL_DAYS olib tashlandi — trial tizimi yo'q.
  // Biznes model: 2 ta mashina umrbot bepul, 3+ mashina uchun 50 000 so'm/mashina/oy.
  PAYME_MERCHANT_ID: z.string().optional(),
  PAYME_KEY: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  ESKIZ_EMAIL: z.string().optional(),
  ESKIZ_PASSWORD: z.string().optional(),
  ESKIZ_FROM: z.string().default('4546'),
  ESKIZ_NICK: z.string().optional(),
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
