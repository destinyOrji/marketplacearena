const { validationResult } = require('express-validator');

// Simple OTP storage (for development - in production use Redis)
const OTPStorage = require('../models/OTPStorage');

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP to phone
exports.sendOTP = async (req, res) => {
    try {
        // Accept both 'phone' and 'phoneNumber' for compatibility
        const { phone, phoneNumber } = req.body;
        const phoneNum = phone || phoneNumber;

        if (!phoneNum) {
            return res.status(400).json({
                statuscode: 1,
                status: "error",
                message: "Phone number is required"
            });
        }

        const otpCode = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save OTP
        await OTPStorage.deleteMany({ phone: phoneNum });
        await OTPStorage.create({
            phone: phoneNum,
            otpCode,
            expiresAt
        });

        // Log OTP in development
        console.log(`\n📱 OTP for ${phoneNum} → ${otpCode}\n`);

        res.status(200).json({
            statuscode: 0,
            status: "success",
            success: true,
            message: "OTP sent successfully to your phone",
            data: {
                phoneNumber: phoneNum,
                expiresIn: 600
            }
        });

    } catch (error) {
        console.error('Send OTP Error:', error);
        res.status(500).json({
            statuscode: 1,
            status: "error",
            message: "Failed to send OTP"
        });
    }
};

// Verify Phone OTP
exports.verifyPhoneOTP = async (req, res) => {
    try {
        // Accept both 'phone' and 'phoneNumber' for compatibility
        const { phone, phoneNumber, otp } = req.body;
        const phoneNum = phone || phoneNumber;

        if (!phoneNum || !otp) {
            return res.status(400).json({
                statuscode: 1,
                status: "error",
                message: "Phone and OTP code are required"
            });
        }

        const otpRecord = await OTPStorage.findOne({ phone: phoneNum, otpCode: otp });

        if (!otpRecord) {
            return res.status(400).json({
                statuscode: 1,
                status: "error",
                message: "Invalid OTP code"
            });
        }

        if (new Date() > otpRecord.expiresAt) {
            await OTPStorage.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({
                statuscode: 1,
                status: "error",
                message: "OTP has expired"
            });
        }

        await OTPStorage.deleteOne({ _id: otpRecord._id });

        res.status(200).json({
            statuscode: 0,
            status: "success",
            success: true,
            message: "Phone number verified successfully",
            data: {
                phoneNumber: phoneNum,
                verified: true
            }
        });

    } catch (error) {
        console.error('Verify OTP Error:', error);
        res.status(500).json({
            statuscode: 1,
            status: "error",
            message: "Failed to verify OTP"
        });
    }
};

// Placeholder for other routes
exports.register = async (req, res) => {
    res.status(201).json({ success: true, message: "Registration successful" });
};

exports.login = async (req, res) => {
    res.status(200).json({ success: true, message: "Login successful" });
};

console.log("✅ authController.js loaded successfully");
