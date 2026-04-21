const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');
const Hospital = require('../models/Hospital');

async function createHospital() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if hospital user already exists
        const existingUser = await User.findOne({ email: 'hospital@example.com' });
        if (existingUser) {
            console.log('Hospital user already exists');
            console.log('Email: hospital@example.com');
            console.log('Password: password123');
            process.exit(0);
        }

        // Create user (password will be hashed automatically by pre-save hook)
        const user = await User.create({
            userid: Date.now().toString(),
            email: 'hospital@example.com',
            password: 'password123',
            firstName: 'City',
            lastName: 'Hospital',
            role: 'hospital',
            emailVerified: true
        });

        // Create hospital profile
        await Hospital.create({
            user: user._id,
            hospitalName: 'City General Hospital',
            registrationNumber: 'HOSP-2024-001',
            hospitalType: 'public',
            phone: '+1234567890',
            emergencyPhone: '+1234567899',
            email: 'hospital@example.com',
            address: {
                street: '789 Medical Center Drive',
                city: 'New York',
                state: 'NY',
                zipCode: '10003',
                country: 'USA'
            },
            departments: [
                {
                    name: 'Emergency',
                    headOfDepartment: 'Dr. Sarah Johnson',
                    contactNumber: '+1234567891',
                    bedCapacity: 50,
                    availableBeds: 35
                },
                {
                    name: 'ICU',
                    headOfDepartment: 'Dr. Michael Chen',
                    contactNumber: '+1234567892',
                    bedCapacity: 20,
                    availableBeds: 12
                },
                {
                    name: 'Surgery',
                    headOfDepartment: 'Dr. Emily Brown',
                    contactNumber: '+1234567893',
                    bedCapacity: 30,
                    availableBeds: 20
                }
            ],
            facilities: [
                'Emergency Room',
                'ICU',
                'Operating Theaters',
                'Laboratory',
                'Radiology',
                'Pharmacy',
                'Blood Bank',
                'Ambulance Service'
            ],
            specializations: [
                'Cardiology',
                'Neurology',
                'Orthopedics',
                'Pediatrics',
                'General Surgery',
                'Emergency Medicine'
            ],
            operatingHours: {
                is24x7: true
            },
            isVerified: true,
            verificationDate: new Date(),
            totalBeds: 100,
            availableBeds: 67,
            totalDoctors: 45,
            totalNurses: 120,
            rating: 4.6,
            totalReviews: 230
        });

        console.log('✅ Hospital user created successfully!');
        console.log('Email: hospital@example.com');
        console.log('Password: password123');
        console.log('Role: hospital');
        console.log('Hospital: City General Hospital');

        process.exit(0);
    } catch (error) {
        console.error('Error creating hospital:', error);
        process.exit(1);
    }
}

createHospital();
