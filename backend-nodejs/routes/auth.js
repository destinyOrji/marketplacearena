const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { sendPasswordResetEmail, verifyConnection } = require('../services/emailService');
const validatePassword = require('../utils/validatePassword');

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
router.post('/refresh-token', authController.refreshToken); // Refresh access token

// Logout (stateless JWT — just acknowledge)
router.post('/logout', (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
});

// OTP path aliases the patient frontend calls
router.post('/verify-otp', authController.verifyPhoneOTP);
router.post('/resend-otp', authController.sendOTP);

// Set new password (first-login flow for hospital staff invited via email)
router.post('/set-new-password', async (req, res) => {
    try {
        const User    = require('../models/User');
        const jwt     = require('jsonwebtoken');
        const bcrypt  = require('bcryptjs');
        const { currentPassword, newPassword } = req.body;

        // Decode JWT — payload uses { userId } (see generateToken in authController)
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        let decoded;
        try {
            const secret = process.env.JWT_SECRET || 'fallback_dev_secret_change_in_production';
            decoded = jwt.verify(authHeader.split(' ')[1], secret);
        } catch (jwtErr) {
            return res.status(401).json({ success: false, message: 'Invalid or expired token. Please log in again.' });
        }

        // JWT payload stores the user ID as `userId`
        const userId = decoded.userId || decoded.id || decoded._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Token payload missing user ID' });
        }

        const user = await User.findById(userId).select('+password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Verify the temp password they received in email
        if (!currentPassword) {
            return res.status(400).json({ success: false, message: 'Current password is required' });
        }
        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) {
            return res.status(400).json({ success: false, message: 'Current (temporary) password is incorrect. Check your invite email.' });
        }

        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
        }

        // Assign plain text — the pre('save') hook in User model will hash it
        user.password           = newPassword;
        user.mustChangePassword = false;
        await user.save();

        res.json({ success: true, message: 'Password updated successfully. You can now use your new password.' });
    } catch (err) {
        console.error('set-new-password error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Forgot / Reset password (email-based OTP flow)
router.post('/forgot-password', async (req, res) => {
    try {
        const User = require('../models/User');
        const OTPStorage = require('../models/OTPStorage');
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

        // Always normalize to lowercase — user records are stored lowercase
        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            // Don't reveal whether the account exists
            return res.json({ success: true, message: 'If an account with that email exists, a reset code has been sent.' });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        // Store against normalized email so reset-password lookup always matches
        await OTPStorage.deleteMany({ phone: normalizedEmail });
        await OTPStorage.create({ phone: normalizedEmail, otpCode, expiresAt });

        // Send password reset OTP via email service
        try {
            await sendPasswordResetEmail(email, otpCode);
        } catch (emailError) {
            console.error('Failed to send reset email:', emailError.message);
            console.log(`\n🔑 [FALLBACK] Password reset OTP for ${email} → ${otpCode}\n`);
        }

        res.json({ success: true, message: 'If an account with that email exists, a reset code has been sent.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ success: false, message: 'Failed to process request' });
    }
});

router.post('/reset-password', async (req, res) => {
    try {
        const User = require('../models/User');
        const OTPStorage = require('../models/OTPStorage');
        const { token, password, email, otpCode } = req.body;
        // Normalize email to lowercase — OTP is stored with lowercase, user record is lowercase
        const emailVal = (email || '').toLowerCase().trim();
        const otp = token || otpCode;
        if (!emailVal || !otp || !password) {
            return res.status(400).json({ success: false, message: 'Email, OTP code, and new password are required' });
        }
        const pwCheck = validatePassword(password);
        if (!pwCheck.valid) {
            return res.status(400).json({ success: false, message: pwCheck.message });
        }
        const record = await OTPStorage.findOne({ phone: emailVal, otpCode: otp });
        if (!record) return res.status(400).json({ success: false, message: 'Invalid or expired reset code' });
        if (new Date() > record.expiresAt) {
            await OTPStorage.deleteOne({ _id: record._id });
            return res.status(400).json({ success: false, message: 'Reset code has expired' });
        }
        const user = await User.findOne({ email: emailVal });
        if (!user) return res.status(404).json({ success: false, message: 'Account not found' });
        user.password = password;
        await user.save();
        await OTPStorage.deleteOne({ _id: record._id });
        res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, message: 'Failed to reset password' });
    }
});

router.post('/reset-password-otp', async (req, res) => {
    try {
        const User = require('../models/User');
        const OTPStorage = require('../models/OTPStorage');
        const { phone, otpCode, newPassword } = req.body;
        // 'phone' field carries the email address (legacy naming from the frontend API client)
        const identifier = (phone || '').toLowerCase().trim();
        if (!identifier || !otpCode || !newPassword) {
            return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
        }
        // Password strength validation
        const pwCheckOtp = validatePassword(newPassword);
        if (!pwCheckOtp.valid) {
            return res.status(400).json({ success: false, message: pwCheckOtp.message });
        }
        // OTP is stored against the identifier (email, lowercased)
        const record = await OTPStorage.findOne({ phone: identifier, otpCode });
        if (!record) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        if (new Date() > record.expiresAt) {
            await OTPStorage.deleteOne({ _id: record._id });
            return res.status(400).json({ success: false, message: 'OTP has expired' });
        }
        // Look up by email — users are stored with lowercase email, not phone
        const user = await User.findOne({ email: identifier });
        if (!user) return res.status(404).json({ success: false, message: 'Account not found' });
        user.password = newPassword;
        await user.save();
        await OTPStorage.deleteOne({ _id: record._id });
        res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset password OTP error:', error);
        res.status(500).json({ success: false, message: 'Failed to reset password' });
    }
});

// ─── Email connection test (dev only) ────────────────────────────────────────
router.get('/test-email', async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(404).json({ success: false, message: 'Not found' });
    }
    const result = await verifyConnection();
    res.json({
        success: result.ok,
        message: result.ok ? 'SMTP connection OK' : result.error,
        from: process.env.EMAIL_USER || 'not configured',
    });
});

console.log("✅ Auth routes loaded successfully");

module.exports = router;
