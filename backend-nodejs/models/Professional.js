const mongoose = require('mongoose');

const professionalSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    professionalType: {
        type: String,
        required: true,
        enum: ['doctor', 'nurse', 'technician', 'therapist', 'pharmacist', 'physiotherapist', 'other']
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
    qualifications: [{
        degree: String,
        institution: String,
        year: Number,
        verified: {
            type: Boolean,
            default: false
        }
    }],
    certifications: [{
        name: String,
        issuingBody: String,
        issueDate: Date,
        expiryDate: Date,
        certificateUrl: String
    }],
    skills: [String],
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
    resumeFile: String,
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
    consultationFee: {
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
    totalAppointments: {
        type: Number,
        default: 0
    },
    completedAppointments: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes
professionalSchema.index({ user: 1 });
professionalSchema.index({ licenseNumber: 1 });
professionalSchema.index({ professionalType: 1 });
professionalSchema.index({ specialization: 1 });
professionalSchema.index({ isVerified: 1 });

module.exports = mongoose.model('Professional', professionalSchema);