/**
 * Test script to verify service creation in MongoDB
 * Run with: node test-service-creation.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('./models/Service');
const Professional = require('./models/Professional');
const User = require('./models/User');

async function testServiceCreation() {
    try {
        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthmarketarena');
        console.log('✅ Connected to MongoDB');

        // Check if Service model is loaded
        console.log('\n📋 Service Model Schema:');
        console.log(Object.keys(Service.schema.paths));

        // Find a professional to test with
        console.log('\n🔍 Finding a professional...');
        const professional = await Professional.findOne().populate('user');
        
        if (!professional) {
            console.log('❌ No professional found in database');
            console.log('Please create a professional user first');
            process.exit(1);
        }

        console.log(`✅ Found professional: ${professional.user?.firstName} ${professional.user?.lastName}`);
        console.log(`   Professional ID: ${professional._id}`);

        // Create a test service
        console.log('\n📝 Creating test service...');
        const testService = {
            professional: professional._id,
            title: 'Test Service - ' + Date.now(),
            description: 'This is a test service to verify database saving',
            category: 'consultation',
            price: 50,
            duration: 30,
            status: 'active',
            images: [],
            tags: ['test'],
            availability: 'available'
        };

        console.log('Service data:', testService);

        const service = await Service.create(testService);
        console.log('✅ Service created successfully!');
        console.log(`   Service ID: ${service._id}`);
        console.log(`   Title: ${service.title}`);

        // Verify service was saved
        console.log('\n🔍 Verifying service in database...');
        const savedService = await Service.findById(service._id);
        
        if (savedService) {
            console.log('✅ Service verified in database!');
            console.log(`   Found: ${savedService.title}`);
        } else {
            console.log('❌ Service not found in database');
        }

        // Count total services
        const totalServices = await Service.countDocuments();
        console.log(`\n📊 Total services in database: ${totalServices}`);

        // List all services
        console.log('\n📋 All services:');
        const allServices = await Service.find().populate('professional');
        allServices.forEach((s, index) => {
            console.log(`   ${index + 1}. ${s.title} (${s.category}) - $${s.price}`);
        });

        console.log('\n✅ Test completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

// Run the test
testServiceCreation();
