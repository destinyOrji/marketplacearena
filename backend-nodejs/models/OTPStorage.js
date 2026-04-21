const mongoose = require('mongoose');

const otpStorageSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        index: true
    },
    otpCode: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600 // Document will be automatically deleted after 10 minutes (600 seconds)
    }
});

// Index for automatic cleanup
otpStorageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OTPStorage', otpStorageSchema);
