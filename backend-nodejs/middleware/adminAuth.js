const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

exports.adminAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                statuscode: 1,
                status: 'error',
                message: 'Access denied. No token provided.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_dev_secret_change_in_production');
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({
                statuscode: 1,
                status: 'error',
                message: 'Invalid token. User not found.'
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

        // Get admin profile
        const admin = await Admin.findOne({ user: user._id });
        if (!admin || !admin.isActive) {
            return res.status(403).json({
                statuscode: 1,
                status: 'error',
                message: 'Access denied. Admin account not active.'
            });
        }

        req.user = user;
        req.admin = admin;
        next();
    } catch (error) {
        console.error('Admin auth error:', error);
        res.status(401).json({
            statuscode: 1,
            status: 'error',
            message: 'Invalid token.'
        });
    }
};

exports.checkPermission = (permission) => {
    return (req, res, next) => {
        if (!req.admin) {
            return res.status(403).json({
                statuscode: 1,
                status: 'error',
                message: 'Access denied.'
            });
        }

        // super_admin always passes
        if (req.admin.role === 'super_admin') return next();

        const permKey = permission.replace(/\./g, '_');
        const hasPermission = req.admin.permissions.get(permKey) === true;

        if (!hasPermission) {
            return res.status(403).json({
                statuscode: 1,
                status: 'error',
                message: `Access denied. '${permission}' permission required.`
            });
        }

        next();
    };
};