/**
 * Script to create a blog admin user in the database
 * 
 * Usage: node scripts/createBlogAdmin.js
 * 
 * You can also set env vars before running:
 *   BLOG_ADMIN_EMAIL=your@email.com BLOG_ADMIN_PASSWORD=yourpassword node scripts/createBlogAdmin.js
 */

require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.production', override: true });

const mongoose = require('mongoose');
const BlogAdmin = require('../models/BlogAdmin');

const ADMIN_NAME = process.env.CREATE_BLOG_ADMIN_NAME || 'Blog Admin';
const ADMIN_EMAIL = process.env.CREATE_BLOG_ADMIN_EMAIL || 'blog@healthmarketarena.com';
const ADMIN_PASSWORD = process.env.CREATE_BLOG_ADMIN_PASSWORD || 'BlogAdmin@2025';

async function createBlogAdmin() {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('❌ MONGODB_URI not set in .env');
            process.exit(1);
        }

        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existing = await BlogAdmin.findOne({ email: ADMIN_EMAIL });
        if (existing) {
            console.log(`⚠️  Blog admin with email ${ADMIN_EMAIL} already exists.`);
            console.log('   Use the update option to change the password.');
            
            // Update password if requested
            if (process.argv.includes('--update')) {
                existing.password = ADMIN_PASSWORD;
                await existing.save();
                console.log('✅ Password updated successfully!');
            }
            
            await mongoose.disconnect();
            return;
        }

        // Create new blog admin
        const blogAdmin = await BlogAdmin.create({
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            role: 'blog-admin',
            isActive: true
        });

        console.log('');
        console.log('✅ Blog Admin created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`   Name:     ${blogAdmin.name}`);
        console.log(`   Email:    ${blogAdmin.email}`);
        console.log(`   Password: ${ADMIN_PASSWORD}`);
        console.log(`   Role:     ${blogAdmin.role}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('');
        console.log('🌐 Login at: https://healthmarketarena.com/blog-admin/login');
        console.log('');
        console.log('⚠️  IMPORTANT: Change your password after first login!');

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error creating blog admin:', error.message);
        await mongoose.disconnect();
        process.exit(1);
    }
}

createBlogAdmin();
