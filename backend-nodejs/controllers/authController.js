const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const OTPStorage = require('../models/OTPStorage');

// ─── Email transporter ────────────────────────────────────────────────────────
const createTransporter = () => nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendOTPEmail = async (email, otpCode) => {
    // If no email credentials configured, just log (dev mode)
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log(`\n📧 [DEV] OTP for ${email} → ${otpCode}\n`);
        return;
    }

    const transporter = createTransporter();
    await transporter.sendMail({
        from: `"Health Market Arena" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your Health Market Arena Verification Code',
        html: `
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px;">
                <div style="text-align:center;margin-bottom:24px;">
                    <h2 style="color:#2563eb;margin:0;">Health Market Arena</h2>
                    <p style="color:#6b7280;margin:4px 0 0;">Email Verification</p>
                </div>
                <div style="background:#fff;border-radius:8px;padding:24px;text-align:center;">
                    <p style="color:#374151;margin-top:0;">Use the code below to verify your email address. It expires in <strong>10 minutes</strong>.</p>
                    <div style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#2563eb;background:#eff6ff;border-radius:8px;padding:16px 24px;margin:20px 0;display:inline-block;">
                        ${otpCode}
                    </div>
                    <p style="color:#6b7280;font-size:13px;margin-bottom:0;">If you did not request this code, please ignore this email.</p>
                </div>
                <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:20px;">© 2026 Health Market Arena · healthmarketarena.com</p>
            </div>
        `,
    });
    console.log(`📧 OTP email sent to ${email}`);
};

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId, type: 'access' }, process.env.JWT_SECRET, {
        expiresIn: '1d'
    });
};

const generateRefreshToken = async (userId) => {
    const token = jwt.sign({ userId, type: 'refresh' }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh', {
        expiresIn: '30d'
    });
    await User.findByIdAndUpdate(userId, {
        refreshToken: token,
        refreshTokenExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    return token;
};

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// ─── Send OTP ────────────────────────────────────────────────────────────────
exports.sendOTP = async (req, res) => {
    try {
        // Accept email (new) or phone/phoneNumber (legacy fallback)
        const { email, phone, phoneNumber } = req.body;
        const identifier = email || phone || phoneNumber;

        if (!identifier) {
            return res.status(400).json({
                statuscode: 1, status: "error",
                message: "Email is required"
            });
        }

        const otpCode = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store keyed by identifier (email or phone)
        await OTPStorage.deleteMany({ phone: identifier });
        await OTPStorage.create({ phone: identifier, otpCode, expiresAt });

        // Send email if identifier looks like an email, otherwise log (phone fallback)
        if (identifier.includes('@')) {
            try {
                await sendOTPEmail(identifier, otpCode);
            } catch (emailError) {
                console.error('❌ Email send failed:', emailError.message);
                console.error('Email config — USER:', process.env.EMAIL_USER ? '✓ set' : '✗ MISSING', '| PASS:', process.env.EMAIL_PASS ? '✓ set' : '✗ MISSING');
                // Still return success so the user isn't blocked, but log the failure
                // The OTP is stored in DB so they can still verify if they have the code
                return res.status(500).json({
                    statuscode: 1, status: "error",
                    message: `Failed to send email: ${emailError.message}`
                });
            }
        } else {
            console.log(`\n📱 [NO SMS] OTP for ${identifier} → ${otpCode}\n`);
        }

        res.status(200).json({
            statuscode: 0, status: "success", success: true,
            message: identifier.includes('@')
                ? "Verification code sent to your email"
                : "OTP sent successfully",
            data: { email: identifier, expiresIn: 600 }
        });
    } catch (error) {
        console.error('Send OTP Error:', error);
        res.status(500).json({ statuscode: 1, status: "error", message: "Failed to send verification code" });
    }
};

// ─── Verify OTP ───────────────────────────────────────────────────────────────
exports.verifyPhoneOTP = async (req, res) => {
    try {
        // Accept email (new) or phone/phoneNumber (legacy)
        const { email, phone, phoneNumber, otp } = req.body;
        const identifier = email || phone || phoneNumber;

        if (!identifier || !otp) {
            return res.status(400).json({
                statuscode: 1, status: "error",
                message: "Email and OTP code are required"
            });
        }

        const otpRecord = await OTPStorage.findOne({ phone: identifier, otpCode: otp });

        if (!otpRecord) {
            return res.status(400).json({
                statuscode: 1, status: "error", message: "Invalid verification code"
            });
        }

        if (new Date() > otpRecord.expiresAt) {
            await OTPStorage.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({
                statuscode: 1, status: "error", message: "Verification code has expired"
            });
        }

        await OTPStorage.deleteOne({ _id: otpRecord._id });

        res.status(200).json({
            statuscode: 0, status: "success", success: true,
            message: "Email verified successfully",
            data: { email: identifier, verified: true }
        });
    } catch (error) {
        console.error('Verify OTP Error:', error);
        res.status(500).json({ statuscode: 1, status: "error", message: "Failed to verify code" });
    }
};

// ─── Register ────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
    try {
        const {
            email, password, firstName, lastName, phone, role,
            phoneVerified,
            // Patient fields
            dateOfBirth, gender, address, city, state,
            // Professional fields
            professionalType, licenseNumber, specialization, yearsOfExperience,
            // Hospital fields
            hospitalName, registrationNumber, hospitalType,
            // Ambulance fields
            serviceName, emergencyNumber, serviceType, baseAddress,
            // Gym-physio fields
            businessType, businessName, yearsInBusiness
        } = req.body;

        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({
                success: false,
                message: "Email, password, first name and last name are required"
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "An account with this email already exists"
            });
        }

        // Map role
        const userRole = role || 'client';

        // Create user
        const user = await User.create({
            email: email.toLowerCase(),
            password,
            firstName,
            lastName,
            phone,
            role: userRole,
            phoneVerified: phoneVerified || false,
            dateOfBirth: dateOfBirth || null,
            gender: gender || undefined,
            address: address || baseAddress || undefined,
            city: city || undefined,
            state: state || undefined,
        });

        // Create role-specific profile
        try {
            if (userRole === 'professional') {
                const Professional = require('../models/Professional');
                await Professional.create({
                    user: user._id,
                    professionalType: professionalType || 'other',
                    licenseNumber: licenseNumber || '',
                    specialization: specialization || '',
                    yearsOfExperience: parseInt(yearsOfExperience) || 0
                });
            } else if (userRole === 'hospital') {
                const Hospital = require('../models/Hospital');
                // Ensure registrationNumber is unique — append timestamp if duplicate
                let regNum = registrationNumber || `REG-${Date.now()}`;
                const existingHospital = await Hospital.findOne({ registrationNumber: regNum });
                if (existingHospital) {
                    regNum = `${regNum}-${Date.now()}`;
                }
                await Hospital.create({
                    user: user._id,
                    hospitalName: hospitalName || `${firstName} ${lastName}`,
                    registrationNumber: regNum,
                    hospitalType: hospitalType || 'General Hospital',
                    phone: phone || '',
                    email: email,
                    address: {
                        street: address || '',
                        city: city || '',
                        state: state || ''
                    }
                });
            } else if (userRole === 'ambulance') {
                const Ambulance = require('../models/Ambulance');
                let ambRegNum = registrationNumber || `AMB-${Date.now()}`;
                const existingAmb = await Ambulance.findOne({ registrationNumber: ambRegNum });
                if (existingAmb) {
                    ambRegNum = `${ambRegNum}-${Date.now()}`;
                }
                await Ambulance.create({
                    user: user._id,
                    serviceName: serviceName || `${firstName} ${lastName}`,
                    emergencyNumber: emergencyNumber || phone,
                    registrationNumber: ambRegNum,
                    serviceType: serviceType || 'Basic Life Support (BLS)',
                    phone: phone || '',
                    baseAddress: {
                        street: baseAddress || address || '',
                        city: city || '',
                        state: state || ''
                    }
                });
            } else if (userRole === 'gym-physio') {
                const GymPhysio = require('../models/GymPhysio');
                await GymPhysio.create({
                    user: user._id,
                    businessType: businessType || 'gym',
                    businessName: businessName || `${firstName} ${lastName}`,
                    licenseNumber: licenseNumber || '',
                    specialization: specialization || '',
                    yearsInBusiness: parseInt(yearsInBusiness) || 0,
                    city: city || '',
                    state: state || ''
                });
            } else if (userRole === 'client') {
                const Client = require('../models/Client');
                await Client.create({
                    user: user._id,
                    phone: phone || '',
                    dateOfBirth: dateOfBirth || null,
                    gender: gender || undefined,
                    address: {
                        street: address || '',
                        city: city || '',
                        state: state || ''
                    }
                });
            }
        } catch (profileError) {
            console.error('Profile creation error (non-fatal):', profileError.message);
        }

        const token = generateToken(user._id);
        const refreshToken = await generateRefreshToken(user._id);

        res.status(201).json({
            success: true,
            message: "Registration successful",
            data: {
                user: {
                    id: user._id,
                    userid: user.userid,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    phone: user.phone,
                    phoneVerified: user.phoneVerified,
                    emailVerified: user.emailVerified
                },
                token,
                refresh: refreshToken
            }
        });
    } catch (error) {
        console.error('Register Error:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "An account with this email already exists"
            });
        }
        res.status(500).json({ success: false, message: "Registration failed. Please try again." });
    }
};

// ─── Login ───────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false, message: "Email and password are required"
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false, message: "Invalid credentials"
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false, message: "Invalid credentials"
            });
        }

        if (user.status === 'suspended') {
            return res.status(403).json({
                success: false, message: "Your account has been suspended"
            });
        }

        await user.updateLoginInfo();

        const token = generateToken(user._id);
        const refreshToken = await generateRefreshToken(user._id);

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: {
                    id: user._id,
                    userid: user.userid,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    phone: user.phone,
                    phoneVerified: user.phoneVerified,
                    emailVerified: user.emailVerified
                },
                token,
                refresh: refreshToken
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: "Login failed. Please try again." });
    }
};

console.log("✅ authController.js loaded successfully");
