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

// Logout (stateless JWT — just acknowledge)
router.post('/logout', (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
});

// OTP path aliases the patient frontend calls
router.post('/verify-otp', authController.verifyPhoneOTP);
router.post('/resend-otp', authController.sendOTP);

// Forgot / Reset password (email-based OTP flow)
router.post('/forgot-password', async (req, res) => {
    try {
        const User = require('../models/User');
        const OTPStorage = require('../models/OTPStorage');
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            // Don't reveal whether the account exists
            return res.json({ success: true, message: 'If an account with that email exists, a reset code has been sent.' });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await OTPStorage.deleteMany({ phone: email });
        await OTPStorage.create({ phone: email, otpCode, expiresAt });

        // Send OTP via email
        try {
            const nodemailer = require('nodemailer');
            if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                const transporter = nodemailer.createTransport({
                    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
                    port: parseInt(process.env.EMAIL_PORT || '587'),
                    secure: false,
                    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
                });
                await transporter.sendMail({
                    from: `"Health Market Arena" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: 'Password Reset Code — Health Market Arena',
                    html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px;">
                        <h2 style="color:#2563eb;text-align:center;">Password Reset</h2>
                        <div style="background:#fff;border-radius:8px;padding:24px;text-align:center;">
                            <p style="color:#374151;">Your password reset code (expires in 10 minutes):</p>
                            <div style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#2563eb;background:#eff6ff;border-radius:8px;padding:16px 24px;margin:20px 0;display:inline-block;">${otpCode}</div>
                            <p style="color:#6b7280;font-size:13px;">If you did not request this, please ignore this email.</p>
                        </div>
                    </div>`,
                });
                console.log(`📧 Password reset OTP sent to ${email}`);
            } else {
                console.log(`\n🔑 [DEV] Password reset OTP for ${email} → ${otpCode}\n`);
            }
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
        // Accept either token (= OTP code) or separate email+otpCode fields
        const emailVal = email;
        const otp = token || otpCode;
        if (!emailVal || !otp || !password) {
            return res.status(400).json({ success: false, message: 'Email, OTP code, and new password are required' });
        }
        const record = await OTPStorage.findOne({ phone: emailVal, otpCode: otp });
        if (!record) return res.status(400).json({ success: false, message: 'Invalid or expired reset code' });
        if (new Date() > record.expiresAt) {
            await OTPStorage.deleteOne({ _id: record._id });
            return res.status(400).json({ success: false, message: 'Reset code has expired' });
        }
        const user = await User.findOne({ email: emailVal.toLowerCase() });
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
        if (!phone || !otpCode || !newPassword) {
            return res.status(400).json({ success: false, message: 'Phone, OTP, and new password are required' });
        }
        const record = await OTPStorage.findOne({ phone, otpCode });
        if (!record) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        if (new Date() > record.expiresAt) {
            await OTPStorage.deleteOne({ _id: record._id });
            return res.status(400).json({ success: false, message: 'OTP has expired' });
        }
        const user = await User.findOne({ phone });
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

console.log("✅ Auth routes loaded successfully");

module.exports = router;
