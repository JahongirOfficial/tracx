const { z } = require('zod');

const loginSchema = z.object({
  username: z.string().min(3, 'Username kamida 3 ta belgi').max(50),
  password: z.string().min(6, 'Parol kamida 6 ta belgi'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(8, 'Yangi parol kamida 8 ta belgi'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token kerak'),
});

const upgradeSubscriptionSchema = z.object({
  plan: z.enum(['basic', 'pro']),
  months: z.number().int().min(1).max(12).default(1),
});

module.exports = { loginSchema, changePasswordSchema, refreshSchema, upgradeSubscriptionSchema };
