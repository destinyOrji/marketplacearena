const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Admin = require('../models/Admin');

// ⚠️ TEMPORARY ENDPOINT FOR DEVELOPMENT ONLY - REMOVE IN PRODUCTION! ⚠️
// This endpoint allows creating admin users without authentication
// Only use this for initial setup and testing

router.post('/create-admin', async (req, res) => {
    try {
        console.log('🔧 Creating admin user...');
        
        const { email, password, firstName, lastName } = req.body;

        // Use defaults if not provided
        const adminEmail = email || 'admin@healthmarketarena.com';
        const adminPassword = password || 'Admin@123456';
        const adminFirstName = firstName || 'System';
        const adminLastName = lastName || 'Administrator';

        // Check if admin already exists
        const existingUser = await User.findOne({ email: adminEmail });
        if (existingUser) {
            console.log('⚠️  Admin user already exists');
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists',
                data: {
                    email: adminEmail,
                    suggestion: 'Try logging in or use a different email'
                }
            });
        }

        // Create admin user
        const adminUser = new User({
            email: adminEmail,
            password: adminPassword,
            firstName: adminFirstName,
            lastName: adminLastName,
            role: 'super_admin',
            isActive: true,
            isStaff: true,
            emailVerified: true,
            isVerified: true
        });

        await adminUser.save();
        console.log('✅ Admin user created');

        // Create admin profile with full permissions
        const adminProfile = new Admin({
            user: adminUser._id,
            role: 'super_admin',
            permissions: new Map([
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
            ]),
            isActive: true
        });

        await adminProfile.save();
        console.log('✅ Admin profile created');

        console.log('\n=== ADMIN CREDENTIALS ===');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);
        console.log(`Role: super_admin`);
        console.log('========================\n');

        res.status(201).json({
            success: true,
            message: 'Admin created successfully! You can now login.',
            data: {
                email: adminUser.email,
                firstName: adminUser.firstName,
                lastName: adminUser.lastName,
                role: adminUser.role,
                adminId: adminProfile._id,
                credentials: {
                    email: adminEmail,
                    password: '****** (check console or use the password you provided)'
                },
                nextStep: 'Use POST /api/admin/auth/login to get your access token'
            }
        });

    } catch (error) {
        console.error('❌ Error creating admin:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create admin',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Check if admin exists
router.get('/check-admin', async (req, res) => {
    try {
        const { email } = req.query;
        const checkEmail = email || 'admin@healthmarketarena.com';

        const user = await User.findOne({ email: checkEmail });
        
        if (!user) {
            return res.json({
                success: true,
                exists: false,
                message: 'Admin user does not exist',
                suggestion: 'Use POST /api/temp/create-admin to create one'
            });
        }

        const admin = await Admin.findOne({ user: user._id });

        res.json({
            success: true,
            exists: true,
            message: 'Admin user exists',
            data: {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                isActive: user.isActive,
                hasAdminProfile: !!admin,
                adminRole: admin?.role,
                adminActive: admin?.isActive
            },
            nextStep: 'Use POST /api/admin/auth/login to login'
        });

    } catch (error) {
        console.error('Error checking admin:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check admin',
            error: error.message
        });
    }
});

// List all admins (for debugging)
router.get('/list-admins', async (req, res) => {
    try {
        const admins = await Admin.find()
            .populate('user', 'email firstName lastName role isActive')
            .limit(10);

        res.json({
            success: true,
            count: admins.length,
            data: admins.map(admin => ({
                id: admin._id,
                email: admin.user?.email,
                name: `${admin.user?.firstName} ${admin.user?.lastName}`,
                role: admin.role,
                isActive: admin.isActive,
                lastLogin: admin.lastLogin,
                permissions: Object.fromEntries(admin.permissions)
            }))
        });

    } catch (error) {
        console.error('Error listing admins:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to list admins',
            error: error.message
        });
    }
});

// Delete admin (for testing cleanup)
router.delete('/delete-admin', async (req, res) => {
    try {
        const { email } = req.body;
        
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

        // Delete admin profile
        await Admin.deleteOne({ user: user._id });
        
        // Delete user
        await User.deleteOne({ _id: user._id });

        res.json({
            success: true,
            message: 'Admin deleted successfully',
            data: {
                email: email
            }
        });

    } catch (error) {
        console.error('Error deleting admin:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete admin',
            error: error.message
        });
    }
});

module.exports = router;
