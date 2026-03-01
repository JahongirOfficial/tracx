const express = require('express');
const router = express.Router();
const {
  login, getMe, refresh, logout,
  getSubscription, upgradeSubscriptionHandler, changePassword,
} = require('../controllers/auth.controller');
const { protect, businessOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { loginLimiter, sensitiveLimiter } = require('../middleware/rateLimiter');
const {
  loginSchema, refreshSchema, changePasswordSchema, upgradeSubscriptionSchema,
} = require('../validators/auth.validator');

router.post('/login', loginLimiter, validate(loginSchema), login);
router.get('/me', protect, getMe);
router.post('/refresh', validate(refreshSchema), refresh);
router.post('/logout', protect, logout);
router.get('/subscription', protect, businessOnly, getSubscription);
router.post('/subscription/upgrade', protect, businessOnly, validate(upgradeSubscriptionSchema), upgradeSubscriptionHandler);
router.post('/change-password', protect, sensitiveLimiter, validate(changePasswordSchema), changePassword);

module.exports = router;
