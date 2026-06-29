/**
 * Fix Gym-Physio Profiles Script
 * 
 * This script creates missing GymPhysio profiles for users who have
 * gym-physio role but no corresponding profile (due to registration bug).
 * 
 * Usage: node scripts/fixGymPhysioProfiles.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const GymPhysio = require('../models/GymPhysio');

async function fixGymPhysioProfiles() {
    try {
        // Connect to database
        console.log('🔌 Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to database\n');
        
        // Find all gym-physio users
        console.log('🔍 Finding gym-physio users...');
        const gymPhysioUsers = await User.find({ role: 'gym-physio' });
        console.log(`📊 Found ${gymPhysioUsers.length} gym-physio users\n`);
        
        let fixed = 0;
        let existing = 0;
        let failed = 0;
        
        // Process each user
        for (const user of gymPhysioUsers) {
            try {
                // Check if profile exists
                const profile = await GymPhysio.findOne({ user: user._id });
                
                if (!profile) {
                    // Create missing profile
                    const newProfile = await GymPhysio.create({
                        user: user._id,
                        phone: user.phone || '',
                        businessType: 'gym',
                        businessName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'My Business',
                        licenseNumber: '',
                        specialization: '',
                        yearsInBusiness: 0,
                        city: user.city || '',
                        state: user.state || '',
                        address: user.address || '',
                        country: 'Nigeria',
                        isVerified: false
                    });
                    
                    fixed++;
                    console.log(`✅ Created profile for: ${user.email} (ID: ${newProfile._id})`);
                } else {
                    existing++;
                    console.log(`ℹ️  Profile exists for: ${user.email}`);
                }
            } catch (error) {
                failed++;
                console.error(`❌ Failed to create profile for ${user.email}:`, error.message);
            }
        }
        
        // Summary
        console.log(`\n${'='.repeat(50)}`);
        console.log('📊 SUMMARY');
        console.log(`${'='.repeat(50)}`);
        console.log(`Total gym-physio users:     ${gymPhysioUsers.length}`);
        console.log(`Profiles created (fixed):   ${fixed}`);
        console.log(`Already had profiles:       ${existing}`);
        console.log(`Failed to create:           ${failed}`);
        console.log(`${'='.repeat(50)}\n`);
        
        if (fixed > 0) {
            console.log('✅ Successfully fixed', fixed, 'profiles!');
            console.log('   Users can now login and access their dashboards.\n');
        }
        
        if (failed > 0) {
            console.log('⚠️  Some profiles failed to create. Check error messages above.\n');
        }
        
        if (fixed === 0 && failed === 0) {
            console.log('✅ All gym-physio users already have profiles. Nothing to fix!\n');
        }
        
        // Disconnect
        await mongoose.disconnect();
        console.log('👋 Disconnected from database');
        
    } catch (error) {
        console.error('❌ Script error:', error);
        process.exit(1);
    }
}

// Run the script
console.log('🚀 Starting Gym-Physio Profile Fix Script\n');
fixGymPhysioProfiles()
    .then(() => {
        console.log('\n✅ Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Script failed:', error);
        process.exit(1);
    });
