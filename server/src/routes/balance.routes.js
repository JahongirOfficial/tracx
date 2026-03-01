const express = require('express');
const router = express.Router();
const { protect, businessOnly } = require('../middleware/auth');
const {
  getBalance, listTransactions, createCheckout, manualTopUp,
} = require('../controllers/balance.controller');

router.use(protect, businessOnly);

router.get('/',              getBalance);
router.get('/transactions',  listTransactions);
router.post('/checkout',     createCheckout);
router.post('/topup',        manualTopUp);   // dev only

module.exports = router;
