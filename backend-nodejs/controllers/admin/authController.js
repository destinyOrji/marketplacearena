const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../../models/User');
const Admin = require('../../models/Admin');
const validatePassword = require('../../utils/validatePassword');

// ─── Brute-force login protection ────────────────────────────────────────────
// Tracks failed attempts per IP. After 10 failures in 15 min, that IP is locked
// out for 15 minutes. Resets on successful login.
//
// In-memory is intentional for a single PM2 process. If you scale to multiple
// processes, replace with a Redis store.

const LOGIN_MAX_ATTEMPTS = 10;
const LOGIN_WINDOW_MS    = 15 * 60 * 1000; // 15 minutes
const LOGIN_LOCKOUT_MS   = 15 * 60 * 1000; // 15 minutes

const loginAttempts = new Map(); // key: IP address

const getAttemptRecord = (ip) => {
    const now = Date.now();
    let record = loginAttempts.get(ip);

    // Reset if window has expired
    if (record && now - record.windowStart > LOGIN_WINDOW_MS) {
        loginAttempts.delete(ip);
        record = null;
    }

    if (!record) {
        record = { count: 0, windowStart: now, lockedUntil: null };
        loginAttempts.set(ip, record);
    }

    return record;
};

const checkLoginAllowed = (ip) => {
    const record = getAttemptRecord(ip);
    if (record.lockedUntil && Date.now() < record.lockedUntil) {
        const remaining = Math.ceil((record.lockedUntil - Date.now()) / 60000);
        return { allowed: false, minutesLeft: remaining };
    }
    return { allowed: true };
};

const recordFailedLogin = (ip) => {
    const record = getAttemptRecord(ip);
    record.count += 1;
    if (record.count >= LOGIN_MAX_ATTEMPTS) {
        record.lockedUntil = Date.now() + LOGIN_LOCKOUT_MS;
    }
};

const resetLoginAttempts = (ip) => {
    loginAttempts.delete(ip);
};

// Clean up stale records every 30 minutes to prevent memory growth
setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of loginAttempts.entries()) {
        if (now - record.windowStart > LOGIN_WINDOW_MS * 2) loginAttempts.delete(ip);
    }
}, 30 * 60 * 1000);

// Generate short-lived access token (2 hours)
const generateAccessToken = (userId) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) console.error('❌ JWT_SECRET not set in admin auth');
    return jwt.sign({ userId, type: 'access' }, secret || 'fallback_dev_secret_change_in_production', {
        expiresIn: '2h' // 2 hours - user must be active within this time
    });
};

// Generate long-lived refresh token (7 days) and store in DB
const generateRefreshToken = async (userId) => {
    const secret = process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET ? process.env.JWT_SECRET + '_refresh' : 'fallback_refresh_secret');
    const token = jwt.sign({ userId, type: 'refresh' }, secret, {
        expiresIn: '7d' // Refresh token valid for 7 days
    });
    await User.findByIdAndUpdate(userId, {
        refreshToken: token,
        refreshTokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
    return token;
};

// Admin registration (for creating new admin users — requires super_admin)
exports.register = async (req, res) => {
    try {
        // Only super_admin can register new admins
        if (req.admin && req.admin.role !== 'super_admin') {
            return res.status(403).json({
                statuscode: 1,
                status: 'error',
                message: 'Only super admins can register new admin accounts'
            });
        }

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
        const pwCheck = validatePassword(password);
        if (!pwCheck.valid) {
            return res.status(400).json({
                statuscode: 1, status: 'error',
                message: pwCheck.message
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

        // Create user — role stored directly (moderator is now a valid User role)
        const user = new User({
            email,
            password,
            firstName,
            lastName,
            role,
            isActive: true,
            isStaff: true,
            emailVerified: true,
            isVerified: true
        });

        await user.save();

        // Set permissions based on role (full catalogue including gym + blog)
        let permissions = new Map();
        if (role === 'super_admin') {
            permissions = new Map([
                ['dashboard_view', true],
                ['users_view', true], ['users_edit', true], ['users_delete', true],
                ['professionals_view', true], ['professionals_verify', true],
                ['hospitals_view', true], ['hospitals_verify', true],
                ['ambulances_view', true], ['ambulances_verify', true],
                ['gym_view', true], ['gym_verify', true],
                ['blog_view', true], ['blog_edit', true], ['blog_delete', true],
                ['settings_edit', true]
            ]);
        } else if (role === 'admin') {
            permissions = new Map([
                ['dashboard_view', true],
                ['users_view', true], ['users_edit', true], ['users_delete', false],
                ['professionals_view', true], ['professionals_verify', true],
                ['hospitals_view', true], ['hospitals_verify', true],
                ['ambulances_view', true], ['ambulances_verify', true],
                ['gym_view', true], ['gym_verify', true],
                ['blog_view', true], ['blog_edit', true], ['blog_delete', false],
                ['settings_edit', false]
            ]);
        } else {
            // moderator — read-only everywhere
            permissions = new Map([
                ['dashboard_view', true],
                ['users_view', true], ['users_edit', false], ['users_delete', false],
                ['professionals_view', true], ['professionals_verify', false],
                ['hospitals_view', true], ['hospitals_verify', false],
                ['ambulances_view', true], ['ambulances_verify', false],
                ['gym_view', true], ['gym_verify', false],
                ['blog_view', true], ['blog_edit', false], ['blog_delete', false],
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
            message: process.env.NODE_ENV === 'production' ? 'Registration failed' : error.message
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

        // Check IP lockout before hitting the database
        const ip = req.ip || req.connection?.remoteAddress || 'unknown';
        const lockCheck = checkLoginAllowed(ip);
        if (!lockCheck.allowed) {
            return res.status(429).json({
                statuscode: 1,
                status: 'error',
                message: `Too many failed login attempts. Try again in ${lockCheck.minutesLeft} minute${lockCheck.minutesLeft !== 1 ? 's' : ''}.`
            });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            recordFailedLogin(ip);
            return res.status(401).json({
                statuscode: 1,
                status: 'error',
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            recordFailedLogin(ip);
            return res.status(401).json({
                statuscode: 1,
                status: 'error',
                message: 'Invalid credentials'
            });
        }

        // Check if user has admin role
        if (!['super_admin', 'admin', 'moderator'].includes(user.role)) {
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
                role: user.role
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

        // Clear failed-attempt counter on successful login
        resetLoginAttempts(ip);

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
                    firstName: user.firstName,
                    lastName: user.lastName,
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
        if (!['super_admin', 'admin', 'moderator'].includes(user.role)) {
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