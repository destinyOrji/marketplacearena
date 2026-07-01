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
    attachments: [{ type: String }], // Array of file URLs (resume, certificates, etc.)
    status: {
        type: String,
        enum: ['pending', 'reviewing', 'shortlisted', 'offered', 'accepted', 'rejected', 'withdrawn'],
        default: 'pending'
    },
    reviewNotes: String,
    reviewedAt: Date,
    offeredAt: Date,
    respondedAt: Date,
    
    // Onboarding details (added when accepting application)
    onboarding: {
        startDate: Date,
        interviewDate: Date,
        interviewTime: String,
        interviewLocation: String,
        contactPerson: String,
        contactPhone: String,
        contactEmail: String,
        additionalNotes: String,
        documentsRequired: [String],
        onboardingInstructions: String
    }
}, { timestamps: true });

// Prevent duplicate applications
jobApplicationSchema.index({ job: 1, professional: 1 }, { unique: true });

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
