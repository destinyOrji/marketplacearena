const mongoose = require('mongoose');

const ambulanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    serviceName: {
        type: String,
        required: true,
        trim: true
    },
    registrationNumber: {
        type: String,
        required: true,
        unique: true
    },
    serviceType: {
        type: String,
        required: true,
        enum: ['basic', 'advanced', 'critical_care', 'air_ambulance', 'patient_transport', 'basic_life_support', 'advanced_life_support', 'neonatal', 'bariatric', 'Basic Life Support (BLS)', 'Advanced Life Support (ALS)', 'Critical Care Transport', 'Neonatal Transport', 'Bariatric Transport', 'Air Ambulance', 'Patient Transport']
    },
    
    // Contact Information
    phone: {
        type: String,
        required: true
    },
    emergencyNumber: {
        type: String,
        required: true
    },
    email: String,
    
    // Address and Coverage
    baseAddress: {
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
    coverageAreas: [{
        city: String,
        state: String,
        radius: Number // in kilometers
    }],
    
    // Fleet Information
    vehicles: [{
        vehicleNumber: String,
        vehicleType: {
            type: String,
            enum: ['basic', 'advanced', 'critical_care', 'air_ambulance']
        },
        capacity: Number,
        equipment: [String],
        isActive: {
            type: Boolean,
            default: true
        },
        currentLocation: {
            latitude: Number,
            longitude: Number,
            lastUpdated: Date
        }
    }],
    
    // Staff Information
    staff: [{
        name: String,
        role: {
            type: String,
            enum: ['driver', 'paramedic', 'nurse', 'doctor', 'technician']
        },
        licenseNumber: String,
        phone: String,
        isActive: {
            type: Boolean,
            default: true
        }
    }],
    
    // Services and Pricing
    services: [{
        name: String,
        description: String,
        basePrice: Number,
        pricePerKm: Number,
        currency: {
            type: String,
            default: 'USD'
        },
        isActive: {
            type: Boolean,
            default: true
        }
    }],
    
    // Availability
    isAvailable: {
        type: Boolean,
        default: true
    },
    operatingHours: {
        is24x7: {
            type: Boolean,
            default: true
        },
        schedule: {
            monday: { open: String, close: String },
            tuesday: { open: String, close: String },
            wednesday: { open: String, close: String },
            thursday: { open: String, close: String },
            friday: { open: String, close: String },
            saturday: { open: String, close: String },
            sunday: { open: String, close: String }
        }
    },
    
    // Response Time
    averageResponseTime: {
        type: Number, // in minutes
        default: 0
    },
    
    // Verification and Licensing
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
    insuranceDocument: String,
    
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
    
    // Statistics
    totalBookings: {
        type: Number,
        default: 0
    },
    completedBookings: {
        type: Number,
        default: 0
    },
    totalDistanceCovered: {
        type: Number, // in kilometers
        default: 0
    }
}, {
    timestamps: true
});

// Indexes
ambulanceSchema.index({ user: 1 });
ambulanceSchema.index({ registrationNumber: 1 });
ambulanceSchema.index({ serviceType: 1 });
ambulanceSchema.index({ 'baseAddress.city': 1 });
ambulanceSchema.index({ 'baseAddress.state': 1 });
ambulanceSchema.index({ isVerified: 1 });
ambulanceSchema.index({ isAvailable: 1 });

module.exports = mongoose.model('Ambulance', ambulanceSchema);