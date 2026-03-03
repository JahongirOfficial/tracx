const express = require('express');
const router = express.Router();
const { protect, businessOnly } = require('../middleware/auth');
const {
  getEmployees, getEmployee, createEmployee,
  updateEmployee, deleteEmployee, changePassword,
} = require('../controllers/employee.controller');

router.use(protect, businessOnly);

router.get('/',      getEmployees);
router.post('/',     createEmployee);
router.get('/:id',   getEmployee);
router.put('/:id',   updateEmployee);
router.delete('/:id', deleteEmployee);
router.put('/:id/password', changePassword);

module.exports = router;
