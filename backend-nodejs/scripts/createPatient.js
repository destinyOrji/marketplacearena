const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');
const Client = require('../models/Client');

async function createPatient() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if patient already exists
        const existingUser = await User.findOne({ email: 'patient@example.com' });
        if (existingUser) {
            console.log('Patient user already exists');
            console.log('Email: patient@example.com');
            console.log('Password: password123');
            process.exit(0);
        }

        // Create user
        const hashedPassword = await bcrypt.hash('password123', 10);
        const user = await User.create({
            userid: Date.now().toString(),
            email: 'patient@example.com',
            password: hashedPassword,
            firstName: 'John',
            lastName: 'Doe',
            role: 'client',
            emailVerified: true
        });

        // Create client profile
        await Client.create({
            user: user._id,
            phone: '+1234567890',
            dateOfBirth: new Date('1990-01-01'),
            gender: 'male',
            address: {
                street: '123 Main St',
                city: 'New York',
                state: 'NY',
                zipCode: '10001',
                country: 'USA'
            }
        });

        console.log('✅ Patient user created successfully!');
        console.log('Email: patient@example.com');
        console.log('Password: password123');
        console.log('Role: client');

        process.exit(0);
    } catch (error) {
        console.error('Error creating patient:', error);
        process.exit(1);
    }
}

createPatient();
