const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');
const Ambulance = require('../models/Ambulance');

async function resetAmbulance() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find and delete existing ambulance user
        const existingUser = await User.findOne({ email: 'ambulance@example.com' });
        if (existingUser) {
            await Ambulance.deleteMany({ user: existingUser._id });
            await User.deleteOne({ _id: existingUser._id });
            console.log('✅ Deleted existing ambulance user');
        }

        console.log('Now run: node scripts/createAmbulance.js');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

resetAmbulance();
