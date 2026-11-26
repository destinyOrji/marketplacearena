/**
 * One-time script: reset passwords for hospital staff with double-hashed passwords.
 * Run: node scripts/resetStaffPasswords.js
 *
 * This finds all users with mustChangePassword=true (hospital staff invites)
 * and resets their password to a known temp password so they can log in.
 */

require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.production', override: true });

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error('MONGODB_URI not set'); process.exit(1); }

// The new temp password ALL affected staff will use to first login
const NEW_TEMP_PASSWORD = 'Staff@2026!';

async function run() {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const User = require('../models/User');

    // Find all staff with mustChangePassword = true (these are the double-hashed ones)
    const affected = await User.find({ mustChangePassword: true, role: 'professional' });
    console.log(`Found ${affected.length} affected staff accounts`);

    const hashed = await bcrypt.hash(NEW_TEMP_PASSWORD, 12);

    for (const user of affected) {
        // Use findByIdAndUpdate to bypass the pre('save') hook — write hash directly
        await User.findByIdAndUpdate(user._id, { password: hashed });
        console.log(`  ✓ Reset: ${user.email}`);
    }

    console.log(`\n✅ Done. All ${affected.length} accounts reset.`);
    console.log(`   New temp password: ${NEW_TEMP_PASSWORD}`);
    console.log(`   Staff should login with this, then change their password.`);

    await mongoose.disconnect();
    process.exit(0);
}

run().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
