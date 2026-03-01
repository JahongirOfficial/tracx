const { z } = require('zod');

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(1000).default(20),
  search: z.string().optional(),
});

const idParamSchema = z.object({
  id: z.string().uuid('Yaroqsiz ID formati'),
});

module.exports = { paginationSchema, idParamSchema };
