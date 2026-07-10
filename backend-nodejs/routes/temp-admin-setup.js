const express = require('express');
const router = express.Router();

// ⚠️ TEMP ADMIN SETUP - DISABLED IN PRODUCTION
// This route is intentionally disabled for security.
// Admin users should be created via: node scripts/createAdmin.js

router.post('/create-admin', (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({
            success: false,
            message: 'This endpoint is disabled in production. Use the admin creation script instead.'
        });
    }
    // Only works in development
    return res.status(403).json({
        success: false,
        message: 'Disabled. Use: node scripts/createAdmin.js'
    });
});

module.exports = router;
