const express = require('express');
const router = express.Router();
const { paymeWebhook, getPaymentStatus } = require('../controllers/payment.controller');

router.post('/payme', paymeWebhook);
router.get('/status/:id', getPaymentStatus);

module.exports = router;
