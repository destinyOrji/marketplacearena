const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    hospital: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: true
    },
    jobTitle: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    jobDescription: { type: String, required: true },
    requiredQualifications: [String],
    experienceLevel: {
        type: String,
        enum: ['entry', 'mid', 'senior', 'expert'],
        default: 'mid'
    },
    minimumExperienceYears: { type: Number, default: 0, min: 0 },
    employmentType: {
        type: String,
        enum: ['full_time', 'part_time', 'contract', 'temporary'],
        default: 'full_time'
    },
    salaryRangeMin: { type: Number, min: 0 },
    salaryRangeMax: { type: Number, min: 0 },
    salaryCurrency: { type: String, default: 'NGN' },
    benefits: [String],
    numberOfPositions: { type: Number, default: 1, min: 1 },
    applicationDeadline: { type: Date },
    status: {
        type: String,
        enum: ['draft', 'active', 'paused', 'closed', 'filled'],
        default: 'draft'
    },
    views: { type: Number, default: 0 },
    publishedAt: Date
}, { timestamps: true });

// Auto-set publishedAt when status changes to active
jobSchema.pre('save', function(next) {
    if (this.isModified('status') && this.status === 'active' && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    next();
});

module.exports = mongoose.model('Job', jobSchema);
