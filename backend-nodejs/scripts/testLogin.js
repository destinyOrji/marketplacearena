const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');

async function testLogin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        const email = process.argv[2] || 'patient@example.com';
        const password = process.argv[3] || 'password123';

        console.log(`Testing login for: ${email}`);
        console.log(`Password: ${password}\n`);

        // Find user
        const user = await User.findOne({ email });
        
        if (!user) {
            console.log('❌ User not found in database');
            process.exit(1);
        }

        console.log('✅ User found:');
        console.log(`   ID: ${user._id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Active: ${user.isActive}`);
        console.log(`   Email Verified: ${user.emailVerified}`);

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        
        if (!isPasswordValid) {
            console.log('\n❌ Password is incorrect');
            process.exit(1);
        }

        console.log('\n✅ Password is correct');
        console.log('\n✅ Login should work!');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testLogin();
