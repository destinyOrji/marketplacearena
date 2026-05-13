const mongoose = require('mongoose');

const gymPhysioSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    businessType: {
        type: String,
        enum: ['gym', 'physiotherapy', 'both'],
        default: 'gym'
    },
    businessName: {
        type: String,
        default: ''
    },
    licenseNumber: {
        type: String,
        default: ''
    },
    specialization: {
        type: String,
        default: ''
    },
    yearsInBusiness: {
        type: Number,
        default: 0,
        min: 0
    },
    
    // Profile details
    facilities: [{
        name: String,
        description: String,
        images: [String]
    }],
    certifications: [{
        name: String,
        issuingBody: String,
        issueDate: Date,
        expiryDate: Date,
        certificateUrl: String
    }],
    services: [String],
    bio: String,
    
    // Contact information
    phone: {
        type: String,
        required: true
    },
    address: String,
    city: String,
    state: String,
    country: String,
    
    // Documents
    licenseDocument: String,
    businessRegistration: String,
    profilePicture: String,
    
    // Verification status
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationDate: Date,
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    // Availability
    isAvailable: {
        type: Boolean,
        default: true
    },
    membershipFee: {
        type: Number,
        min: 0
    },
    sessionFee: {
        type: Number,
        min: 0
    },
    currency: {
        type: String,
        default: 'NGN'
    },

    // Bank account for payouts
    bankAccount: {
        bankName:      { type: String, default: '' },
        accountNumber: { type: String, default: '' },
        accountName:   { type: String, default: '' },
        bankCode:      { type: String, default: '' },
    },
    
    // Ratings and reviews
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    
    // Statistics
    totalBookings: {
        type: Number,
        default: 0
    },
    completedBookings: {
        type: Number,
        default: 0
    },
    cancelledBookings: {
        type: Number,
        default: 0
    },
    totalRevenue: {
        type: Number,
        default: 0
    },
    
    // Subscription
    subscription: {
        plan: {
            type: String,
            enum: ['basic', 'professional', 'premium', 'none'],
            default: 'none'
        },
        status: {
            type: String,
            enum: ['active', 'expired', 'cancelled', 'none'],
            default: 'none'
        },
        startDate: Date,
        endDate: Date,
        amount: Number,
        transactionReference: String
    }
}, {
    timestamps: true
});

// Indexes
gymPhysioSchema.index({ user: 1 });
gymPhysioSchema.index({ licenseNumber: 1 });
gymPhysioSchema.index({ businessType: 1 });
gymPhysioSchema.index({ specialization: 1 });
gymPhysioSchema.index({ isVerified: 1 });

module.exports = mongoose.model('GymPhysio', gymPhysioSchema);
