const express = require('express');
const router = express.Router();
const {
  getProfile, getMyFlights, getMyFlight,
  addExpense, updateLocation, confirmExpense,
} = require('../controllers/driverPanel.controller');
const { protect, driverOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createExpenseSchema } = require('../validators/flight.validator');
const { locationSchema } = require('../validators/driver.validator');

router.use(protect, driverOnly);

router.get('/profile', getProfile);
router.get('/flights', getMyFlights);
router.get('/flights/:id', getMyFlight);
router.post('/flights/:id/expenses', validate(createExpenseSchema), addExpense);
router.put('/location', validate(locationSchema), updateLocation);
router.post('/expenses/:id/confirm', confirmExpense);

module.exports = router;
