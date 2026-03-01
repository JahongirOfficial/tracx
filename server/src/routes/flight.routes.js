const express = require('express');
const router = express.Router();
const {
  getFlights, getFlight, createFlight, updateFlight, deleteFlight, completeFlight, cancelFlight,
  addLeg, updateLeg, deleteLeg, updateLegStatus,
  addExpense, updateExpense, deleteExpense, addDriverPayment,
  getStatsSummary, getDriverDebts,
} = require('../controllers/flight.controller');
const { protect, businessOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createFlightSchema, updateFlightSchema, completeFlightSchema,
  createLegSchema, updateLegSchema,
  createExpenseSchema, updateExpenseSchema,
  driverPaymentSchema, flightFilterSchema,
} = require('../validators/flight.validator');
const { z } = require('zod');

router.use(protect, businessOnly);

// Stats
router.get('/stats/summary', getStatsSummary);
router.get('/driver-debts', getDriverDebts);

// Flights CRUD
router.get('/', validate(flightFilterSchema, 'query'), getFlights);
router.post('/', validate(createFlightSchema), createFlight);
router.get('/:id', getFlight);
router.put('/:id', validate(updateFlightSchema), updateFlight);
router.delete('/:id', deleteFlight);
router.put('/:id/complete', validate(completeFlightSchema), completeFlight);
router.put('/:id/cancel', cancelFlight);

// Legs
router.post('/:id/legs', validate(createLegSchema), addLeg);
router.put('/:id/legs/:legId', validate(updateLegSchema), updateLeg);
router.delete('/:id/legs/:legId', deleteLeg);
router.put('/:id/legs/:legId/status', validate(z.object({ status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']) })), updateLegStatus);

// Expenses
router.post('/:id/expenses', validate(createExpenseSchema), addExpense);
router.put('/:id/expenses/:expId', validate(updateExpenseSchema), updateExpense);
router.delete('/:id/expenses/:expId', deleteExpense);

// Driver payment
router.post('/:id/driver-payment', validate(driverPaymentSchema), addDriverPayment);

module.exports = router;
