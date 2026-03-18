const express = require('express');
const router = express.Router();
const { paymeWebhook, getPaymentStatus } = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth');

router.post('/payme', paymeWebhook);
router.get('/status/:id', protect, getPaymentStatus);

module.exports = router;
