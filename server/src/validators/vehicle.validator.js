const { z } = require('zod');

const createVehicleSchema = z.object({
  plateNumber: z.string().min(1).max(20),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  color: z.string().optional(),
  currentOdometer: z.number().int().min(0).default(0),
  oilChangeIntervalKm: z.number().int().min(1000).default(10000),
  lastOilChangeKm: z.number().int().min(0).default(0),
});

const updateVehicleSchema = z.object({
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.number().int().optional(),
  color: z.string().optional(),
  currentOdometer: z.number().int().min(0).optional(),
  oilChangeIntervalKm: z.number().int().min(1000).optional(),
  lastOilChangeKm: z.number().int().min(0).optional(),
  status: z.enum(['excellent', 'normal', 'attention', 'critical']).optional(),
  isActive: z.boolean().optional(),
});

const assignDriverSchema = z.object({
  driverId: z.string().uuid().nullable(),
});

const maintenanceSchema = z.object({
  type: z.enum(['oil_change', 'tire_change', 'repair', 'inspection']),
  description: z.string().optional(),
  cost: z.number().min(0).optional(),
  odometerAt: z.number().int().min(0).optional(),
});

module.exports = { createVehicleSchema, updateVehicleSchema, assignDriverSchema, maintenanceSchema };
