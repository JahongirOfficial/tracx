const express = require('express');
const router = express.Router();
const {
  getDrivers, getDriver, createDriver, updateDriver,
  deleteDriver, paySalary, getDriverStats,
} = require('../controllers/driver.controller');
const { protect, hasPermission } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createDriverSchema, updateDriverSchema, salaryPaymentSchema } = require('../validators/driver.validator');
const { paginationSchema } = require('../validators/common.validator');

router.get('/', protect, hasPermission('drivers.view'), validate(paginationSchema, 'query'), getDrivers);
router.post('/', protect, hasPermission('drivers.create'), validate(createDriverSchema), createDriver);
router.get('/:id', protect, hasPermission('drivers.view'), getDriver);
router.put('/:id', protect, hasPermission('drivers.edit'), validate(updateDriverSchema), updateDriver);
router.delete('/:id', protect, hasPermission('drivers.delete'), deleteDriver);
router.post('/:id/salary', protect, hasPermission('drivers.pay_salary'), validate(salaryPaymentSchema), paySalary);
router.get('/:id/stats', protect, hasPermission('drivers.view'), getDriverStats);

module.exports = router;
