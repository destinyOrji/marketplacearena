const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../../models/User');
const Admin = require('../../models/Admin');

// Generate short-lived access token (1 day)
const generateAccessToken = (userId) => {
    return jwt.sign({ userId, type: 'access' }, process.env.JWT_SECRET, {
        expiresIn: '1d'
    });
};

// Generate long-lived refresh token (30 days) and store in DB
const generateRefreshToken = async (userId) => {
    const token = jwt.sign({ userId, type: 'refresh' }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh', {
        expiresIn: '30d'
    });

    // Store refresh token in user record
    await User.findByIdAndUpdate(userId, {
        refreshToken: token,
        refreshTokenExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    return token;
};

// Admin registration (for creating new admin users)
exports.register = async (req, res) => {
    try {
        const { email, password, firstName, lastName, role = 'admin' } = req.body;

        // Validate required fields
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({
                statuscode: 1,
                status: 'error',
                message: 'Email, password, first name, and last name are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                statuscode: 1,
                status: 'error',
                message: 'Invalid email format'
            });
        }

        // Validate password strength
        if (password.length < 8) {
            return res.status(400).json({
                statuscode: 1,
                status: 'error',
                message: 'Password must be at least 8 characters long'
            });
        }

        // Validate role
        if (!['super_admin', 'admin', 'moderator'].includes(role)) {
            return res.status(400).json({
                statuscode: 1,
                status: 'error',
                message: 'Invalid role. Must be super_admin, admin, or moderator'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                statuscode: 1,
                status: 'error',
                message: 'Admin with this email already exists'
            });
        }

        // Create user
        const user = new User({
            email,
            password,
            firstName,
            lastName,
            role: role === 'super_admin' ? 'super_admin' : 'admin',
            isActive: true,
            isStaff: true,
            emailVerified: true,
            isVerified: true
        });

        await user.save();

        // Set permissions based on role
        let permissions = new Map();
        if (role === 'super_admin') {
            permissions = new Map([
                ['users_view', true],
                ['users_edit', true],
                ['users_delete', true],
                ['professionals_view', true],
                ['professionals_verify', true],
                ['hospitals_view', true],
                ['hospitals_verify', true],
                ['ambulances_view', true],
                ['ambulances_verify', true],
                ['dashboard_view', true],
                ['settings_edit', true]
            ]);
        } else if (role === 'admin') {
            permissions = new Map([
                ['users_view', true],
                ['users_edit', true],
                ['users_delete', false],
                ['professionals_view', true],
                ['professionals_verify', true],
                ['hospitals_view', true],
                ['hospitals_verify', true],
                ['ambulances_view', true],
                ['ambulances_verify', true],
                ['dashboard_view', true],
                ['settings_edit', false]
            ]);
        } else {
            permissions = new Map([
                ['users_view', true],
                ['users_edit', false],
                ['users_delete', false],
                ['professionals_view', true],
                ['professionals_verify', false],
                ['hospitals_view', true],
                ['hospitals_verify', false],
                ['ambulances_view', true],
                ['ambulances_verify', false],
                ['dashboard_view', true],
                ['settings_edit', false]
            ]);
        }

        // Create admin profile
        const admin = new Admin({
            user: user._id,
            role,
            permissions,
            isActive: true
        });

        await admin.save();

        // Generate tokens
        const accessToken = generateAccessToken(user._id);
        const refreshToken = await generateRefreshToken(user._id);

        res.status(201).json({
            statuscode: 0,
            status: 'success',
            message: 'Admin registered successfully',
            data: {
                access: accessToken,
                refresh: refreshToken,
                admin: {
                    id: admin._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: admin.role,
                    permissions: Object.fromEntries(admin.permissions)
                }
            }
        });

    } catch (error) {
        console.error('Admin registration error:', error);
        res.status(500).json({
            statuscode: 1,
            status: 'error',
            message: 'Registration failed',
            error: error.message
        });
    }
};

// Admin login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                statuscode: 1,
                status: 'error',
                message: 'Email and password are required'
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                statuscode: 1,
                status: 'error',
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                statuscode: 1,
                status: 'error',
                message: 'Invalid credentials'
            });
        }

        // Check if user has admin role
        if (!['super_admin', 'admin'].includes(user.role)) {
            return res.status(403).json({
                statuscode: 1,
                status: 'error',
                message: 'Access denied. Admin privileges required.'
            });
        }

        // Get or create admin profile
        let admin = await Admin.findOne({ user: user._id });
        if (!admin) {
            admin = new Admin({
                user: user._id,
                role: user.role === 'super_admin' ? 'super_admin' : 'admin'
            });
            await admin.save();
        }

        if (!admin.isActive) {
            return res.status(403).json({
                statuscode: 1,
                status: 'error',
                message: 'Admin account is deactivated'
            });
        }

        // Update login info
        admin.lastLogin = new Date();
        await admin.save();
        await user.updateLoginInfo();

        // Generate tokens
        const accessToken = generateAccessToken(user._id);
        const refreshToken = await generateRefreshToken(user._id);

        res.json({
            statuscode: 0,
            status: 'success',
            message: 'Login successful',
            data: {
                access: accessToken,
                refresh: refreshToken,
                admin: {
                    id: admin._id,
                    email: user.email,
                    role: admin.role,
                    permissions: Object.fromEntries(admin.permissions)
                }
            }
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            statuscode: 1,
            status: 'error',
            message: 'Login failed',
            error: error.message
        });
    }
};

// Admin logout - clears refresh token from DB
exports.logout = async (req, res) => {
    try {
        // Clear refresh token from database
        await User.findByIdAndUpdate(req.user._id, {
            refreshToken: null,
            refreshTokenExpiry: null
        });

        res.json({
            statuscode: 0,
            status: 'success',
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Admin logout error:', error);
        res.status(500).json({
            statuscode: 1,
            status: 'error',
            message: 'Logout failed',
            error: error.message
        });
    }
};

// Refresh access token using refresh token stored in DB
exports.refreshToken = async (req, res) => {
    try {
        const { refresh } = req.body;

        if (!refresh) {
            return res.status(400).json({
                statuscode: 1,
                status: 'error',
                message: 'Refresh token is required'
            });
        }

        // Verify refresh token
        let decoded;
        try {
            decoded = jwt.verify(refresh, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh');
        } catch (err) {
            return res.status(401).json({
                statuscode: 1,
                status: 'error',
                message: 'Invalid or expired refresh token. Please login again.'
            });
        }

        // Find user and validate stored refresh token
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                statuscode: 1,
                status: 'error',
                message: 'User not found'
            });
        }

        // Check if refresh token matches what's stored in DB
        if (user.refreshToken !== refresh) {
            return res.status(401).json({
                statuscode: 1,
                status: 'error',
                message: 'Refresh token is invalid or has been revoked. Please login again.'
            });
        }

        // Check if refresh token is expired in DB
        if (user.refreshTokenExpiry && new Date() > user.refreshTokenExpiry) {
            await User.findByIdAndUpdate(user._id, { refreshToken: null, refreshTokenExpiry: null });
            return res.status(401).json({
                statuscode: 1,
                status: 'error',
                message: 'Refresh token expired. Please login again.'
            });
        }

        // Check admin role
        if (!['super_admin', 'admin'].includes(user.role)) {
            return res.status(403).json({
                statuscode: 1,
                status: 'error',
                message: 'Access denied.'
            });
        }

        // Issue new access token (and rotate refresh token)
        const newAccessToken = generateAccessToken(user._id);
        const newRefreshToken = await generateRefreshToken(user._id);

        res.json({
            statuscode: 0,
            status: 'success',
            message: 'Token refreshed successfully',
            data: {
                access: newAccessToken,
                refresh: newRefreshToken
            }
        });

    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({
            statuscode: 1,
            status: 'error',
            message: 'Token refresh failed',
            error: error.message
        });
    }
};

// Get admin profile
exports.getProfile = async (req, res) => {
    try {
        const admin = await Admin.findOne({ user: req.user._id }).populate('user', 'email firstName lastName');
        
        if (!admin) {
            return res.status(404).json({
                statuscode: 1,
                status: 'error',
                message: 'Admin profile not found'
            });
        }

        res.json({
            statuscode: 0,
            status: 'success',
            data: {
                id: admin._id,
                email: admin.user.email,
                firstName: admin.user.firstName,
                lastName: admin.user.lastName,
                role: admin.role,
                permissions: Object.fromEntries(admin.permissions),
                lastLogin: admin.lastLogin,
                createdAt: admin.createdAt
            }
        });

    } catch (error) {
        console.error('Get admin profile error:', error);
        res.status(500).json({
            statuscode: 1,
            status: 'error',
            message: 'Failed to get profile',
            error: error.message
        });
    }
};