const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    professional: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Professional',
        required: true
    },
    coverLetter: { type: String },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'shortlisted', 'offered', 'accepted', 'rejected', 'withdrawn'],
        default: 'pending'
    },
    reviewNotes: String,
    reviewedAt: Date,
    offeredAt: Date,
    respondedAt: Date
}, { timestamps: true });

// Prevent duplicate applications
jobApplicationSchema.index({ job: 1, professional: 1 }, { unique: true });

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
