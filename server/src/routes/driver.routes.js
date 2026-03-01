const express = require('express');
const router = express.Router();
const {
  getDrivers, getDriver, createDriver, updateDriver,
  deleteDriver, paySalary, getDriverStats,
} = require('../controllers/driver.controller');
const { protect, businessOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createDriverSchema, updateDriverSchema, salaryPaymentSchema } = require('../validators/driver.validator');
const { paginationSchema } = require('../validators/common.validator');

router.use(protect, businessOnly);

router.get('/', validate(paginationSchema, 'query'), getDrivers);
router.post('/', validate(createDriverSchema), createDriver);
router.get('/:id', getDriver);
router.put('/:id', validate(updateDriverSchema), updateDriver);
router.delete('/:id', deleteDriver);
router.post('/:id/salary', validate(salaryPaymentSchema), paySalary);
router.get('/:id/stats', getDriverStats);

module.exports = router;
