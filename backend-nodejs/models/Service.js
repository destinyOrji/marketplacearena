const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    professional: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Professional'
        // Not required - gym-physio services won't have this
    },
    gymPhysio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GymPhysio'
        // Set for gym-physio services
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
        enum: ['consultation', 'procedure', 'therapy', 'diagnostic', 'emergency', 'fitness', 'physiotherapy', 'yoga', 'massage', 'nutrition', 'other'],
        default: 'other'
    },
    subcategory: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    duration: {
        type: Number,
        required: true,
        min: 15
    },
    consultationType: {
        type: [String],
        enum: ['in-person', 'virtual', 'home-visit'],
        default: []
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending'],
        default: 'pending'   // requires admin approval before going live
    },
    approvalNote: {
        type: String,        // admin rejection reason
        default: ''
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    },
    images: [{ type: String }],
    tags: [{ type: String }],
    features: [{ type: String }],
    requirements: { type: String, default: '' },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    completionRate: { type: Number, default: 0, min: 0, max: 100 },
    availability: {
        type: String,
        enum: ['available', 'limited', 'unavailable'],
        default: 'available'
    },
    bookingCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 }
}, { timestamps: true });

// Index for faster queries
serviceSchema.index({ professional: 1, status: 1 });
serviceSchema.index({ gymPhysio: 1, status: 1 });
serviceSchema.index({ category: 1, status: 1 });
serviceSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Service', serviceSchema);
