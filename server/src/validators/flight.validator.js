const { z } = require('zod');

const createFlightSchema = z.object({
  driverId: z.string().uuid(),
  vehicleId: z.string().uuid(),
  flightType: z.enum(['domestic', 'international']).default('domestic'),
  roadMoney: z.number().min(0).default(0),
  driverProfitPercent: z.number().min(0).max(100).default(0),
  startOdometer: z.number().int().min(0).optional(),
  startFuel: z.number().min(0).optional(),
});

const updateFlightSchema = z.object({
  roadMoney: z.number().min(0).optional(),
  driverProfitPercent: z.number().min(0).max(100).optional(),
  flightType: z.enum(['domestic', 'international']).optional(),
});

const completeFlightSchema = z.object({
  endOdometer: z.number().int().min(0).optional(),
  endFuel: z.number().min(0).optional(),
});

const createLegSchema = z.object({
  fromCity: z.string().min(1).max(100),
  toCity: z.string().min(1).max(100),
  cargo: z.string().optional(),
  weight: z.number().min(0).optional(),
  payment: z.number().positive('To\'lov musbat bo\'lishi kerak'),
  paymentType: z.enum(['cash', 'peritsena', 'card', 'transfer', 'other']),
  transferFeePercent: z.number().min(0).max(100).default(0),
});

const updateLegSchema = z.object({
  fromCity: z.string().min(1).max(100).optional(),
  toCity: z.string().min(1).max(100).optional(),
  cargo: z.string().optional(),
  weight: z.number().min(0).optional(),
  payment: z.number().positive().optional(),
  paymentType: z.enum(['cash', 'peritsena', 'card', 'transfer', 'other']).optional(),
  transferFeePercent: z.number().min(0).max(100).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
});

const FUEL_TYPES = ['fuel', 'fuel_metan', 'fuel_propan', 'fuel_benzin', 'fuel_diesel'];
const LIGHT_TYPES = ['food', 'toll', 'wash', 'fine', 'repair_small', 'other', 'parking', 'hotel', 'phone', 'platon', 'border'];
const HEAVY_TYPES = ['repair_major', 'tire', 'accident', 'insurance', 'oil', 'border_customs'];
const ALL_EXPENSE_TYPES = [...FUEL_TYPES, ...LIGHT_TYPES, ...HEAVY_TYPES];

const createExpenseSchema = z.object({
  type: z.enum(ALL_EXPENSE_TYPES),
  amount: z.number().positive(),
  currency: z.enum(['UZS', 'USD']).default('UZS'),
  exchangeRate: z.number().positive().optional(),
  description: z.string().optional(),
  timing: z.enum(['before', 'during', 'after']).default('during'),
});

const updateExpenseSchema = z.object({
  amount: z.number().positive().optional(),
  currency: z.enum(['UZS', 'USD']).optional(),
  exchangeRate: z.number().positive().optional(),
  description: z.string().optional(),
  timing: z.enum(['before', 'during', 'after']).optional(),
});

const driverPaymentSchema = z.object({
  amount: z.number().positive(),
});

const flightFilterSchema = z.object({
  status: z.enum(['active', 'completed', 'cancelled']).optional(),
  driverId: z.string().uuid().optional(),
  vehicleId: z.string().uuid().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

module.exports = {
  createFlightSchema,
  updateFlightSchema,
  completeFlightSchema,
  createLegSchema,
  updateLegSchema,
  createExpenseSchema,
  updateExpenseSchema,
  driverPaymentSchema,
  flightFilterSchema,
  FUEL_TYPES,
  LIGHT_TYPES,
  HEAVY_TYPES,
};
