const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Personal Information
    dateOfBirth: Date,
    gender: {
        type: String,
        enum: ['male', 'female', 'other']
    },
    bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    maritalStatus: {
        type: String,
        enum: ['single', 'married', 'divorced', 'widowed']
    },
    
    // Contact Information
    phone: {
        type: String,
        required: true
    },
    alternatePhone: String,
    
    // Address
    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String
    },
    
    // Emergency Contact
    emergencyContact: {
        name: String,
        relationship: String,
        phone: String,
        email: String
    },
    
    // Medical Information
    medicalHistory: [{
        condition: String,
        diagnosedDate: Date,
        status: {
            type: String,
            enum: ['active', 'resolved', 'chronic']
        },
        notes: String
    }],
    
    allergies: [{
        allergen: String,
        severity: {
            type: String,
            enum: ['mild', 'moderate', 'severe']
        },
        reaction: String
    }],
    
    currentMedications: [{
        medicationName: String,
        dosage: String,
        frequency: String,
        prescribedBy: String,
        startDate: Date,
        endDate: Date
    }],
    
    // Insurance Information
    insurance: {
        provider: String,
        policyNumber: String,
        groupNumber: String,
        expiryDate: Date,
        coverageType: String
    },
    
    // Preferences
    preferredLanguage: {
        type: String,
        default: 'English'
    },
    preferredHospitals: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital'
    }],
    preferredDoctors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Professional'
    }],
    
    // Health Metrics
    healthMetrics: {
        height: Number, // in cm
        weight: Number, // in kg
        bmi: Number,
        lastUpdated: Date
    },
    
    // Documents
    profilePicture: String,
    identityDocument: String,
    insuranceCard: String,
    
    // Statistics
    totalAppointments: {
        type: Number,
        default: 0
    },
    totalConsultations: {
        type: Number,
        default: 0
    },
    lastAppointment: Date
}, {
    timestamps: true
});

// Indexes
clientSchema.index({ user: 1 });
clientSchema.index({ phone: 1 });
clientSchema.index({ 'address.city': 1 });
clientSchema.index({ 'address.state': 1 });

// Calculate BMI before saving
clientSchema.pre('save', function(next) {
    if (this.healthMetrics && this.healthMetrics.height && this.healthMetrics.weight) {
        const heightInMeters = this.healthMetrics.height / 100;
        this.healthMetrics.bmi = (this.healthMetrics.weight / (heightInMeters * heightInMeters)).toFixed(1);
        this.healthMetrics.lastUpdated = new Date();
    }
    next();
});

module.exports = mongoose.model('Client', clientSchema);