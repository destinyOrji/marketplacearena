const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    appointmentId: {
        type: String,
        unique: true,
        default: () => 'APT' + Date.now()
    },
    
    // Participants
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    professional: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Professional',
        required: true
    },
    hospital: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital'
    },
    
    // Appointment Details
    appointmentType: {
        type: String,
        required: true,
        enum: ['consultation', 'follow_up', 'emergency', 'routine_checkup', 'diagnostic', 'treatment']
    },
    appointmentMode: {
        type: String,
        required: true,
        enum: ['in_person', 'video_call', 'phone_call'],
        default: 'in_person'
    },
    
    // Scheduling
    scheduledDate: {
        type: Date,
        required: true
    },
    scheduledTime: {
        type: String,
        required: true
    },
    duration: {
        type: Number, // in minutes
        default: 30
    },
    
    // Status
    status: {
        type: String,
        enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled'],
        default: 'scheduled'
    },
    
    // Reason and Notes
    reasonForVisit: {
        type: String,
        required: true
    },
    symptoms: [String],
    clientNotes: String,
    professionalNotes: String,
    
    // Payment Information
    consultationFee: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'USD'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: String,
    transactionId: String,
    
    // Prescription and Diagnosis
    diagnosis: String,
    prescription: [{
        medicationName: String,
        dosage: String,
        frequency: String,
        duration: String,
        instructions: String
    }],
    
    // Follow-up
    followUpRequired: {
        type: Boolean,
        default: false
    },
    followUpDate: Date,
    followUpNotes: String,
    
    // Documents and Reports
    documents: [{
        name: String,
        type: String,
        url: String,
        uploadedAt: Date
    }],
    
    // Ratings and Feedback
    clientRating: {
        type: Number,
        min: 1,
        max: 5
    },
    clientFeedback: String,
    professionalRating: {
        type: Number,
        min: 1,
        max: 5
    },
    professionalFeedback: String,
    
    // Timestamps
    bookedAt: {
        type: Date,
        default: Date.now
    },
    confirmedAt: Date,
    startedAt: Date,
    completedAt: Date,
    cancelledAt: Date,
    cancellationReason: String,
    cancelledBy: {
        type: String,
        enum: ['client', 'professional', 'hospital', 'system']
    }
}, {
    timestamps: true
});

// Indexes
appointmentSchema.index({ client: 1 });
appointmentSchema.index({ professional: 1 });
appointmentSchema.index({ hospital: 1 });
appointmentSchema.index({ scheduledDate: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ appointmentId: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);