const mongoose = require('mongoose');

const blockedDateSchema = new mongoose.Schema({
    professional: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Professional',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    reason: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Index for faster queries
blockedDateSchema.index({ professional: 1, date: 1 });

module.exports = mongoose.model('BlockedDate', blockedDateSchema);
