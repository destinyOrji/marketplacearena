const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    professional: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Professional',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['consultation', 'procedure', 'therapy', 'diagnostic', 'emergency', 'other']
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    duration: {
        type: Number, // in minutes
        required: true,
        min: 15
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending'],
        default: 'active'
    },
    images: [{
        type: String
    }],
    tags: [{
        type: String
    }],
    availability: {
        type: String,
        enum: ['available', 'limited', 'unavailable'],
        default: 'available'
    },
    bookingCount: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    reviewCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for faster queries
serviceSchema.index({ professional: 1, status: 1 });
serviceSchema.index({ category: 1, status: 1 });
serviceSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Service', serviceSchema);
