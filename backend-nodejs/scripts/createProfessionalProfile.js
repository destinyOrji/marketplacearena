const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Professional = require('../models/Professional');

dotenv.config();

async function createProfessionalProfile() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find a professional user without a profile
        const professionalUsers = await User.find({ role: 'professional' });
        
        if (professionalUsers.length === 0) {
            console.log('❌ No professional users found');
            process.exit(1);
        }

        console.log(`\nFound ${professionalUsers.length} professional user(s):`);
        
        for (const user of professionalUsers) {
            console.log(`\n📋 User: ${user.email} (${user.firstName} ${user.lastName})`);
            
            // Check if professional profile exists
            const existingProfile = await Professional.findOne({ user: user._id });
            
            if (existingProfile) {
                console.log(`✅ Professional profile already exists (ID: ${existingProfile._id})`);
                console.log(`   Type: ${existingProfile.professionalType}`);
                console.log(`   License: ${existingProfile.licenseNumber}`);
                console.log(`   Specialization: ${existingProfile.specialization}`);
            } else {
                console.log(`⚠️  No professional profile found. Creating one...`);
                
                const professional = await Professional.create({
                    user: user._id,
                    phone: '+1234567890',
                    professionalType: 'doctor',
                    licenseNumber: `LIC-${Date.now()}`,
                    specialization: 'General Practice',
                    yearsOfExperience: 5,
                    isVerified: true,
                    isAvailable: true,
                    consultationFee: 100,
                    bio: 'Experienced healthcare professional',
                    averageRating: 0,
                    totalReviews: 0,
                    totalAppointments: 0,
                    completedAppointments: 0
                });
                
                console.log(`✅ Professional profile created (ID: ${professional._id})`);
            }
        }

        console.log('\n✅ Done!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

createProfessionalProfile();
