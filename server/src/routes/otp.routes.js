const express = require('express');
const router = express.Router();
const { sendOtpCode, verifyOtpCode, registerWithPhone } = require('../controllers/otp.controller');

router.post('/otp/send',        sendOtpCode);
router.post('/otp/verify',      verifyOtpCode);
router.post('/register/phone',  registerWithPhone);

module.exports = router;
