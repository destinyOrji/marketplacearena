/**
 * Reset/Create Admin User
 * Run: node scripts/resetAdmin.js
 * 
 * This will DELETE the existing admin and CREATE a fresh one.
 */
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.production', override: true });

const ADMIN_EMAIL    = 'admin@healthmarketarena.com';
const ADMIN_PASSWORD = 'Admin@123456';

async function resetAdmin() {
    if (!process.env.MONGODB_URI) {
        console.error('❌ MONGODB_URI not set. Check .env.production');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const User  = require('../models/User');
        const Admin = require('../models/Admin');

        // Remove existing admin user and profile
        const old = await User.findOne({ email: ADMIN_EMAIL });
        if (old) {
            await Admin.deleteMany({ user: old._id });
            await User.deleteOne({ _id: old._id });
            console.log('🗑️  Old admin removed');
        }

        // Create fresh admin user
        const user = new User({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            firstName: 'System',
            lastName: 'Administrator',
            role: 'super_admin',
            emailVerified: true,
            status: 'active',
        });
        await user.save();

        // Create admin profile
        const admin = new Admin({
            user: user._id,
            role: 'super_admin',
            isActive: true,
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
                ['settings_edit', true],
            ]),
        });
        await admin.save();

        console.log('\n✅ Admin created successfully');
        console.log('================================');
        console.log('  Email:    admin@healthmarketarena.com');
        console.log('  Password: Admin@123456');
        console.log('  Role:     super_admin');
        console.log('================================\n');

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

resetAdmin();
