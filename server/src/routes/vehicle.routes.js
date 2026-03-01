const express = require('express');
const router = express.Router();
const {
  getVehicles, getVehicle, createVehicle, updateVehicle,
  deleteVehicle, assignDriver, addMaintenance,
} = require('../controllers/vehicle.controller');
const { protect, businessOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createVehicleSchema, updateVehicleSchema, assignDriverSchema, maintenanceSchema } = require('../validators/vehicle.validator');
const { paginationSchema } = require('../validators/common.validator');

router.use(protect, businessOnly);

router.get('/', validate(paginationSchema, 'query'), getVehicles);
router.post('/', validate(createVehicleSchema), createVehicle);
router.get('/:id', getVehicle);
router.put('/:id', validate(updateVehicleSchema), updateVehicle);
router.delete('/:id', deleteVehicle);
router.put('/:id/assign-driver', validate(assignDriverSchema), assignDriver);
router.post('/:id/maintenance', validate(maintenanceSchema), addMaintenance);

module.exports = router;
