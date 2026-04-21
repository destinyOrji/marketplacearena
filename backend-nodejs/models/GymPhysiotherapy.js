const mongoose = require('mongoose');

const gymPhysiotherapySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    businessType: {
        type: String,
        required: true,
        enum: ['gym', 'physiotherapy', 'both']
    },
    businessName: {
        type: String,
        required: true
    },
    licenseNumber: {
        type: String,
        required: true
    },
    specialization: {
        type: String,
        required: true
    },
    yearsOfExperience: {
        type: Number,
        required: true,
        min: 0
    },
    
    // Profile details
    facilities: [{
        name: String,
        description: String,
        available: {
            type: Boolean,
            default: true
        }
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
    businessDocument: String,
    profilePicture: String,
    facilityImages: [String],
    
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
        default: 'USD'
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
    activeMembers: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes
gymPhysiotherapySchema.index({ user: 1 });
gymPhysiotherapySchema.index({ licenseNumber: 1 });
gymPhysiotherapySchema.index({ businessType: 1 });
gymPhysiotherapySchema.index({ specialization: 1 });
gymPhysiotherapySchema.index({ isVerified: 1 });

module.exports = mongoose.model('GymPhysiotherapy', gymPhysiotherapySchema);
