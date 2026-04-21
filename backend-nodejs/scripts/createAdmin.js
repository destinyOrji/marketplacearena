const mongoose = require('mongoose');
const User = require('../models/User');
const Admin = require('../models/Admin');
require('dotenv').config();

async function createAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@healthmarketarena.com' });
        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        // Create admin user
        const adminUser = new User({
            email: 'admin@healthmarketarena.com',
            password: 'Admin@123456',
            firstName: 'System',
            lastName: 'Administrator',
            role: 'super_admin',
            isActive: true,
            isStaff: true,
            emailVerified: true,
            isVerified: true
        });

        await adminUser.save();
        console.log('Admin user created successfully');

        // Create admin profile
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
        console.log('Admin profile created successfully');

        console.log('\n=== ADMIN CREDENTIALS ===');
        console.log('Email: admin@healthmarketarena.com');
        console.log('Password: Admin@123456');
        console.log('Role: super_admin');
        console.log('========================\n');

        process.exit(0);

    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
}

createAdmin();