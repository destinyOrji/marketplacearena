const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    hospitalName: {
        type: String,
        required: true,
        trim: true
    },
    registrationNumber: {
        type: String,
        required: true,
        unique: true
    },
    hospitalType: {
        type: String,
        required: true,
        enum: ['public', 'private', 'specialty', 'clinic', 'diagnostic_center', 'General Hospital', 'Specialist Hospital', 'Teaching Hospital', 'Private Hospital', 'Clinic', 'Medical Center', 'hospital']
    },
    
    // Contact Information
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    website: String,
    
    // Address
    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String,
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },
    
    // Services and Facilities
    services: [{
        name: String,
        description: String,
        isActive: {
            type: Boolean,
            default: true
        }
    }],
    departments: [{
        name: String,
        headOfDepartment: String,
        contactNumber: String,
        isActive: {
            type: Boolean,
            default: true
        }
    }],
    facilities: [String],
    
    // Capacity and Staff
    totalBeds: {
        type: Number,
        min: 0
    },
    availableBeds: {
        type: Number,
        min: 0
    },
    icuBeds: {
        type: Number,
        min: 0
    },
    emergencyServices: {
        type: Boolean,
        default: false
    },
    
    // Operating Hours
    operatingHours: {
        monday: { open: String, close: String, is24Hours: Boolean },
        tuesday: { open: String, close: String, is24Hours: Boolean },
        wednesday: { open: String, close: String, is24Hours: Boolean },
        thursday: { open: String, close: String, is24Hours: Boolean },
        friday: { open: String, close: String, is24Hours: Boolean },
        saturday: { open: String, close: String, is24Hours: Boolean },
        sunday: { open: String, close: String, is24Hours: Boolean }
    },
    
    // Verification and Status
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationDate: Date,
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    licenseDocument: String,
    
    // Ratings and Reviews
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
    
    // Insurance and Payment
    acceptedInsurance: [String],
    paymentMethods: [String],
    
    // Statistics
    totalAppointments: {
        type: Number,
        default: 0
    },
    totalPatients: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes
hospitalSchema.index({ user: 1 });
hospitalSchema.index({ registrationNumber: 1 });
hospitalSchema.index({ hospitalType: 1 });
hospitalSchema.index({ 'address.city': 1 });
hospitalSchema.index({ 'address.state': 1 });
hospitalSchema.index({ isVerified: 1 });

module.exports = mongoose.model('Hospital', hospitalSchema);