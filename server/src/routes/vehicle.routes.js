const express = require('express');
const router = express.Router();
const {
  getVehicles, getVehicle, createVehicle, updateVehicle,
  deleteVehicle, assignDriver, addMaintenance,
} = require('../controllers/vehicle.controller');
const { protect, hasPermission } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createVehicleSchema, updateVehicleSchema, assignDriverSchema, maintenanceSchema } = require('../validators/vehicle.validator');
const { paginationSchema } = require('../validators/common.validator');

router.get('/', protect, hasPermission('vehicles.view'), validate(paginationSchema, 'query'), getVehicles);
router.post('/', protect, hasPermission('vehicles.create'), validate(createVehicleSchema), createVehicle);
router.get('/:id', protect, hasPermission('vehicles.view'), getVehicle);
router.put('/:id', protect, hasPermission('vehicles.edit'), validate(updateVehicleSchema), updateVehicle);
router.delete('/:id', protect, hasPermission('vehicles.delete'), deleteVehicle);
router.put('/:id/assign-driver', protect, hasPermission('vehicles.assign_driver'), validate(assignDriverSchema), assignDriver);
router.post('/:id/maintenance', protect, hasPermission('vehicles.add_maintenance'), validate(maintenanceSchema), addMaintenance);

module.exports = router;
