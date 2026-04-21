const express = require('express');
const User = require('../models/User');

const router = express.Router();

// Get OTP for testing purposes (only in development)
router.get('/get-otp/:email', async (req, res) => {
    try {
        // Only allow in development
        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({
                success: false,
                message: 'This endpoint is only available in development'
            });
        }

        const { email } = req.params;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const isExpired = user.otpExpiresAt && new Date() > user.otpExpiresAt;

        res.json({
            success: true,
            data: {
                email: user.email,
                otpCode: user.otpCode,
                expiresAt: user.otpExpiresAt,
                isExpired: isExpired,
                emailVerified: user.emailVerified
            }
        });

    } catch (error) {
        console.error('Get OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get OTP',
            error: error.message
        });
    }
});

// Get all users with their OTP status (for testing)
router.get('/users-otp-status', async (req, res) => {
    try {
        // Only allow in development
        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({
                success: false,
                message: 'This endpoint is only available in development'
            });
        }

        const users = await User.find()
            .select('email firstName lastName role otpCode otpExpiresAt emailVerified createdAt')
            .sort({ createdAt: -1 })
            .limit(20);

        const usersWithOtpStatus = users.map(user => {
            const isExpired = user.otpExpiresAt && new Date() > user.otpExpiresAt;
            return {
                id: user._id,
                email: user.email,
                name: `${user.firstName} ${user.lastName}`,
                role: user.role,
                otpCode: user.otpCode,
                expiresAt: user.otpExpiresAt,
                isExpired: isExpired,
                emailVerified: user.emailVerified,
                createdAt: user.createdAt
            };
        });

        res.json({
            success: true,
            data: usersWithOtpStatus
        });

    } catch (error) {
        console.error('Get users OTP status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get users OTP status',
            error: error.message
        });
    }
});

// Set test OTP for a user (for testing)
router.post('/set-test-otp', async (req, res) => {
    try {
        // Only allow in development
        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({
                success: false,
                message: 'This endpoint is only available in development'
            });
        }

        const { email, otpCode = '123456' } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Set test OTP that expires in 1 hour
        user.otpCode = otpCode;
        user.otpExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await user.save();

        res.json({
            success: true,
            message: `Test OTP set for ${email}`,
            data: {
                email: user.email,
                otpCode: user.otpCode,
                expiresAt: user.otpExpiresAt
            }
        });

    } catch (error) {
        console.error('Set test OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to set test OTP',
            error: error.message
        });
    }
});

module.exports = router;