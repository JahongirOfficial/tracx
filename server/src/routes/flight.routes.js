const express = require('express');
const router = express.Router();
const {
  getFlights, getFlight, createFlight, updateFlight, deleteFlight, completeFlight, cancelFlight,
  addLeg, updateLeg, deleteLeg, updateLegStatus,
  addExpense, updateExpense, deleteExpense, addDriverPayment, addRoadMoneyPayment,
  recalculateFlight,
  getStatsSummary, getDriverDebts,
} = require('../controllers/flight.controller');
const { protect, hasPermission } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createFlightSchema, updateFlightSchema, completeFlightSchema,
  createLegSchema, updateLegSchema,
  createExpenseSchema, updateExpenseSchema,
  driverPaymentSchema, flightFilterSchema,
} = require('../validators/flight.validator');
const { z } = require('zod');

// Stats
router.get('/stats/summary', protect, hasPermission('finance.view_reports'), getStatsSummary);
router.get('/driver-debts', protect, hasPermission('finance.view_reports'), getDriverDebts);

// Flights CRUD
router.get('/', protect, hasPermission('flights.view'), validate(flightFilterSchema, 'query'), getFlights);
router.post('/', protect, hasPermission('flights.create'), validate(createFlightSchema), createFlight);
router.get('/:id', protect, hasPermission('flights.view'), getFlight);
router.put('/:id', protect, hasPermission('flights.edit'), validate(updateFlightSchema), updateFlight);
router.delete('/:id', protect, hasPermission('flights.delete'), deleteFlight);
router.put('/:id/complete', protect, hasPermission('flights.complete'), validate(completeFlightSchema), completeFlight);
router.put('/:id/cancel', protect, hasPermission('flights.cancel'), cancelFlight);

// Legs
router.post('/:id/legs', protect, hasPermission('legs.add'), validate(createLegSchema), addLeg);
router.put('/:id/legs/:legId', protect, hasPermission('legs.edit'), validate(updateLegSchema), updateLeg);
router.delete('/:id/legs/:legId', protect, hasPermission('legs.delete'), deleteLeg);
router.put('/:id/legs/:legId/status', protect, hasPermission('legs.edit'), validate(z.object({ status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']) })), updateLegStatus);

// Expenses
router.post('/:id/expenses', protect, hasPermission('expenses.add'), validate(createExpenseSchema), addExpense);
router.put('/:id/expenses/:expId', protect, hasPermission('expenses.edit'), validate(updateExpenseSchema), updateExpense);
router.delete('/:id/expenses/:expId', protect, hasPermission('expenses.delete'), deleteExpense);

// Driver payment
router.post('/:id/driver-payment', protect, hasPermission('finance.add_driver_payment'), validate(driverPaymentSchema), addDriverPayment);

// Road money payment
router.post('/:id/road-money', protect, hasPermission('finance.add_driver_payment'), validate(driverPaymentSchema), addRoadMoneyPayment);

// Recalculate finances
router.post('/:id/recalculate', protect, hasPermission('flights.edit'), recalculateFlight);

module.exports = router;
