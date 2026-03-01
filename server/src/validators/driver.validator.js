const { z } = require('zod');

const createDriverSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(8),
  fullName: z.string().min(2).max(100),
  phone: z.string().optional(),
  paymentType: z.enum(['monthly', 'per_trip']).default('per_trip'),
  baseSalary: z.coerce.number().min(0).default(0),
  perTripRate: z.coerce.number().min(0).max(100).default(0),
});

const updateDriverSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  paymentType: z.enum(['monthly', 'per_trip']).optional(),
  baseSalary: z.coerce.number().min(0).optional(),
  perTripRate: z.coerce.number().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
  status: z.enum(['free', 'busy', 'offline']).optional(),
});

const salaryPaymentSchema = z.object({
  amount: z.number().positive('Miqdor musbat bo\'lishi kerak'),
  note: z.string().optional(),
});

const locationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  speed: z.number().min(0).optional(),
  heading: z.number().min(0).max(360).optional(),
});

module.exports = { createDriverSchema, updateDriverSchema, salaryPaymentSchema, locationSchema };
