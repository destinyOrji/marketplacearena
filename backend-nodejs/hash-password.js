const bcrypt = require('bcryptjs');

async function hashPassword() {
    const password = process.argv[2] || 'Admin@123456';
    
    console.log('\n🔐 Password Hashing Utility\n');
    console.log('Password to hash:', password);
    console.log('Hashing...\n');
    
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    console.log('✅ Hashed Password:');
    console.log(hash);
    console.log('\n📋 Copy this hash and use it in MongoDB for the password field\n');
    
    // Test the hash
    const isValid = await bcrypt.compare(password, hash);
    console.log('✅ Hash verification:', isValid ? 'PASSED' : 'FAILED');
    console.log('\n');
}

hashPassword().catch(console.error);
