const express = require('express');
const router = express.Router();
const {
  getStats,
  getBusinessmen, getBusinessman, createBusinessman,
  updateBusinessman, deleteBusinessman, manageSubscription,
  getBusinessmanBalance, getBusinessmanTransactions,
  topUpBusinessmanBalance, setBusinessmanBalance,
} = require('../controllers/superAdmin.controller');
const { protect, superAdminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { paginationSchema } = require('../validators/common.validator');
const { z } = require('zod');

const createBusinessmanSchema = z.object({
  username:    z.string().min(3).max(50),
  password:    z.string().min(8),
  fullName:    z.string().optional(),
  phone:       z.string().optional(),
  companyName: z.string().optional(),
});

const topUpSchema = z.object({
  amount: z.number().positive(),
});

const setBalanceSchema = z.object({
  balance: z.number(),
});

router.use(protect, superAdminOnly);

router.get('/stats', getStats);

router.get('/businessmen', validate(paginationSchema, 'query'), getBusinessmen);
router.post('/businessmen', validate(createBusinessmanSchema), createBusinessman);
router.get('/businessmen/:id', getBusinessman);
router.put('/businessmen/:id', updateBusinessman);
router.delete('/businessmen/:id', deleteBusinessman);
router.put('/businessmen/:id/subscription', manageSubscription);

/* ── Balance management ── */
router.get('/businessmen/:id/balance',       getBusinessmanBalance);
router.get('/businessmen/:id/transactions',  getBusinessmanTransactions);
router.post('/businessmen/:id/balance/topup', validate(topUpSchema), topUpBusinessmanBalance);
router.post('/businessmen/:id/balance/set',   validate(setBalanceSchema), setBusinessmanBalance);

module.exports = router;
