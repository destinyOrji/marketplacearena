const mongoose = require('mongoose');

const emergencyBookingSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
    },
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ambulance',
    },
    emergencyType: {
        type: String,
        default: 'General Emergency',
    },
    patientCondition: String,
    contactNumber: String,
    pickupLocation: {
        address: String,
        coordinates: {
            latitude: Number,
            longitude: Number,
        },
    },
    destination: {
        address: String,
        coordinates: {
            latitude: Number,
            longitude: Number,
        },
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'active', 'completed', 'cancelled'],
        default: 'pending',
    },
    acceptedAt: Date,
    completedAt: Date,
    cancelledAt: Date,
    cancellationReason: String,
    patientName: String,
    notes: String,
}, { timestamps: true });

module.exports = mongoose.model('EmergencyBooking', emergencyBookingSchema);
