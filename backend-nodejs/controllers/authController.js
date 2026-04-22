const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const OTPStorage = require('../models/OTPStorage');

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
        const { phone, phoneNumber } = req.body;
        const phoneNum = phone || phoneNumber;

        if (!phoneNum) {
            return res.status(400).json({
                statuscode: 1, status: "error",
                message: "Phone number is required"
            });
        }

        const otpCode = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await OTPStorage.deleteMany({ phone: phoneNum });
        await OTPStorage.create({ phone: phoneNum, otpCode, expiresAt });

        console.log(`\n📱 OTP for ${phoneNum} → ${otpCode}\n`);

        res.status(200).json({
            statuscode: 0, status: "success", success: true,
            message: "OTP sent successfully to your phone",
            data: { phoneNumber: phoneNum, expiresIn: 600 }
        });
    } catch (error) {
        console.error('Send OTP Error:', error);
        res.status(500).json({ statuscode: 1, status: "error", message: "Failed to send OTP" });
    }
};

// ─── Verify Phone OTP ────────────────────────────────────────────────────────
exports.verifyPhoneOTP = async (req, res) => {
    try {
        const { phone, phoneNumber, otp } = req.body;
        const phoneNum = phone || phoneNumber;

        if (!phoneNum || !otp) {
            return res.status(400).json({
                statuscode: 1, status: "error",
                message: "Phone and OTP code are required"
            });
        }

        const otpRecord = await OTPStorage.findOne({ phone: phoneNum, otpCode: otp });

        if (!otpRecord) {
            return res.status(400).json({
                statuscode: 1, status: "error", message: "Invalid OTP code"
            });
        }

        if (new Date() > otpRecord.expiresAt) {
            await OTPStorage.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({
                statuscode: 1, status: "error", message: "OTP has expired"
            });
        }

        await OTPStorage.deleteOne({ _id: otpRecord._id });

        res.status(200).json({
            statuscode: 0, status: "success", success: true,
            message: "Phone number verified successfully",
            data: { phoneNumber: phoneNum, verified: true }
        });
    } catch (error) {
        console.error('Verify OTP Error:', error);
        res.status(500).json({ statuscode: 1, status: "error", message: "Failed to verify OTP" });
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
                await Hospital.create({
                    user: user._id,
                    hospitalName: hospitalName || `${firstName} ${lastName}`,
                    registrationNumber: registrationNumber || `REG-${Date.now()}`,
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
                await Ambulance.create({
                    user: user._id,
                    serviceName: serviceName || `${firstName} ${lastName}`,
                    emergencyNumber: emergencyNumber || phone,
                    registrationNumber: registrationNumber || `AMB-${Date.now()}`,
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
