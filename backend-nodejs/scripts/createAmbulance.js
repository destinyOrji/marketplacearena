const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');
const Ambulance = require('../models/Ambulance');

async function createAmbulance() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if ambulance user already exists
        const existingUser = await User.findOne({ email: 'ambulance@example.com' });
        if (existingUser) {
            console.log('Ambulance user already exists');
            console.log('Email: ambulance@example.com');
            console.log('Password: password123');
            process.exit(0);
        }

        // Create user (password will be hashed automatically by pre-save hook)
        const user = await User.create({
            userid: Date.now().toString(),
            email: 'ambulance@example.com',
            password: 'password123',
            firstName: 'Emergency',
            lastName: 'Ambulance',
            role: 'ambulance',
            emailVerified: true
        });

        // Create ambulance profile
        await Ambulance.create({
            user: user._id,
            serviceName: 'Quick Response Ambulance Services',
            registrationNumber: 'AMB-2024-001',
            serviceType: 'advanced',
            phone: '+1234567890',
            emergencyNumber: '+1234567899',
            email: 'ambulance@example.com',
            baseAddress: {
                street: '456 Emergency Lane',
                city: 'New York',
                state: 'NY',
                zipCode: '10002',
                country: 'USA',
                coordinates: {
                    latitude: 40.730610,
                    longitude: -73.935242
                }
            },
            coverageAreas: [
                { city: 'New York', state: 'NY', radius: 50 },
                { city: 'Brooklyn', state: 'NY', radius: 30 },
                { city: 'Queens', state: 'NY', radius: 30 }
            ],
            vehicles: [
                {
                    vehicleNumber: 'AMB-001',
                    vehicleType: 'advanced',
                    capacity: 2,
                    equipment: [
                        'Defibrillator',
                        'Oxygen Supply',
                        'First Aid Kit',
                        'Stretcher',
                        'ECG Monitor',
                        'Ventilator'
                    ],
                    isActive: true,
                    currentLocation: {
                        latitude: 40.730610,
                        longitude: -73.935242,
                        lastUpdated: new Date()
                    }
                }
            ],
            staff: [
                {
                    name: 'John Smith',
                    role: 'paramedic',
                    licenseNumber: 'PMD-001',
                    phone: '+1234567891',
                    isActive: true
                },
                {
                    name: 'Sarah Johnson',
                    role: 'driver',
                    licenseNumber: 'DRV-001',
                    phone: '+1234567892',
                    isActive: true
                }
            ],
            services: [
                {
                    name: 'Emergency Transport',
                    description: 'Rapid emergency medical transport',
                    basePrice: 500,
                    pricePerKm: 5,
                    currency: 'USD',
                    isActive: true
                },
                {
                    name: 'Critical Care Transport',
                    description: 'Advanced life support during transport',
                    basePrice: 800,
                    pricePerKm: 8,
                    currency: 'USD',
                    isActive: true
                }
            ],
            isAvailable: true,
            operatingHours: {
                is24x7: true
            },
            averageResponseTime: 8,
            isVerified: true,
            verificationDate: new Date(),
            averageRating: 4.8,
            totalReviews: 150,
            totalBookings: 200,
            completedBookings: 195,
            totalDistanceCovered: 5000
        });

        console.log('✅ Ambulance user created successfully!');
        console.log('Email: ambulance@example.com');
        console.log('Password: password123');
        console.log('Role: ambulance');
        console.log('Company: Quick Response Ambulance Services');

        process.exit(0);
    } catch (error) {
        console.error('Error creating ambulance:', error);
        process.exit(1);
    }
}

createAmbulance();
