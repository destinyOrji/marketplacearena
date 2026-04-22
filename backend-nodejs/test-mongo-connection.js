const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
    try {
        console.log('🔄 Attempting to connect to MongoDB...');
        console.log('📍 URI:', process.env.MONGODB_URI.replace(/:[^:]*@/, ':****@'));
        
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        
        console.log('✅ Connected successfully to MongoDB Atlas!');
        
        // Test database operations
        const User = require('./models/User');
        const Admin = require('./models/Admin');
        
        const userCount = await User.countDocuments();
        const adminCount = await Admin.countDocuments();
        
        console.log(`\n📊 Database Statistics:`);
        console.log(`   Users: ${userCount}`);
        console.log(`   Admins: ${adminCount}`);
        
        // Check if admin exists
        const adminUser = await User.findOne({ email: 'admin@healthmarketarena.com' });
        if (adminUser) {
            console.log('\n✅ Admin user exists!');
            console.log(`   Email: ${adminUser.email}`);
            console.log(`   Role: ${adminUser.role}`);
            console.log(`   Active: ${adminUser.isActive}`);
        } else {
            console.log('\n⚠️  Admin user does NOT exist - need to create one');
        }
        
        await mongoose.connection.close();
        console.log('\n✅ Connection closed successfully');
        process.exit(0);
        
    } catch (error) {
        console.error('\n❌ Connection failed!');
        console.error('Error:', error.message);
        
        if (error.message.includes('ETIMEOUT')) {
            console.error('\n💡 Troubleshooting Tips:');
            console.error('   1. Check MongoDB Atlas Network Access (IP Whitelist)');
            console.error('   2. Add your IP or use 0.0.0.0/0 for testing');
            console.error('   3. Verify your internet connection');
            console.error('   4. Check if firewall is blocking MongoDB port (27017)');
        }
        
        process.exit(1);
    }
}

testConnection();
