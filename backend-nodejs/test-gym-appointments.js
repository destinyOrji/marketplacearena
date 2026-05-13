/**
 * Test script to check gym-physio appointments
 * Run with: node test-gym-appointments.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const GymPhysio = require('./models/GymPhysio');
const Appointment = require('./models/Appointment');
const User = require('./models/User');

async function testAppointments() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find all gym-physio users
        const gymPhysioUsers = await User.find({ role: 'gym-physio' });
        console.log(`Found ${gymPhysioUsers.length} gym-physio users\n`);

        for (const user of gymPhysioUsers) {
            console.log(`\n📋 User: ${user.firstName} ${user.lastName} (${user.email})`);
            console.log(`   User ID: ${user._id}`);

            // Find GymPhysio profile
            const gymPhysio = await GymPhysio.findOne({ user: user._id });
            if (!gymPhysio) {
                console.log('   ❌ No GymPhysio profile found');
                continue;
            }

            console.log(`   ✅ GymPhysio profile ID: ${gymPhysio._id}`);
            console.log(`   Business: ${gymPhysio.businessName || 'N/A'}`);

            // Find appointments
            const appointments = await Appointment.find({ gymPhysio: gymPhysio._id })
                .populate('client')
                .populate('service');

            console.log(`   📅 Appointments: ${appointments.length}`);

            if (appointments.length > 0) {
                appointments.forEach((apt, i) => {
                    console.log(`\n   Appointment ${i + 1}:`);
                    console.log(`      ID: ${apt._id}`);
                    console.log(`      Status: ${apt.status}`);
                    console.log(`      Date: ${apt.scheduledDate}`);
                    console.log(`      Time: ${apt.scheduledTime}`);
                    console.log(`      Client: ${apt.client ? 'Found' : 'NOT FOUND'}`);
                    console.log(`      Service: ${apt.service ? apt.service.title : 'N/A'}`);
                });
            }
        }

        // Check all appointments with gymPhysio field
        console.log('\n\n🔍 Checking all appointments with gymPhysio field...');
        const allGymAppointments = await Appointment.find({ gymPhysio: { $exists: true, $ne: null } });
        console.log(`Found ${allGymAppointments.length} appointments with gymPhysio field`);

        if (allGymAppointments.length > 0) {
            console.log('\nSample appointments:');
            allGymAppointments.slice(0, 3).forEach((apt, i) => {
                console.log(`\n${i + 1}. Appointment ${apt._id}`);
                console.log(`   GymPhysio ID: ${apt.gymPhysio}`);
                console.log(`   Status: ${apt.status}`);
                console.log(`   Date: ${apt.scheduledDate}`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n\n✅ Disconnected from MongoDB');
    }
}

testAppointments();
