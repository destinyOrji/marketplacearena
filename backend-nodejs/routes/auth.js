const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Phone OTP Routes (Most Important)
// These handle both /api/auth/otp/* and /api/otp/* patterns
router.post('/otp/send', authController.sendOTP);
router.post('/otp/verify', authController.verifyPhoneOTP);
router.post('/otp/resend', authController.sendOTP); // Resend uses same logic as send

// Direct OTP routes (for /api/otp/* pattern)
router.post('/send', authController.sendOTP);
router.post('/verify', authController.verifyPhoneOTP);
router.post('/resend', authController.sendOTP);

// Other basic routes
router.post('/register', authController.register);
router.post('/login', authController.login);

console.log("✅ Auth routes loaded successfully");

module.exports = router;
