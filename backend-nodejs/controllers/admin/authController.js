const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Admin = require('../../models/Admin');

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
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
        const accessToken = generateToken(user._id);
        const refreshToken = generateToken(user._id);

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
        const accessToken = generateToken(user._id);
        const refreshToken = generateToken(user._id); // In production, use different secret/expiry

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

// Admin logout
exports.logout = async (req, res) => {
    try {
        // In a production app, you might want to blacklist the token
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