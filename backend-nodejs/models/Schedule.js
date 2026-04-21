const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    }
}, { _id: false });

const dayScheduleSchema = new mongoose.Schema({
    isAvailable: {
        type: Boolean,
        default: false
    },
    timeSlots: [timeSlotSchema]
}, { _id: false });

const scheduleSchema = new mongoose.Schema({
    professional: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Professional',
        required: true,
        unique: true
    },
    monday: dayScheduleSchema,
    tuesday: dayScheduleSchema,
    wednesday: dayScheduleSchema,
    thursday: dayScheduleSchema,
    friday: dayScheduleSchema,
    saturday: dayScheduleSchema,
    sunday: dayScheduleSchema
}, {
    timestamps: true
});

// Index for faster queries
scheduleSchema.index({ professional: 1 });

module.exports = mongoose.model('Schedule', scheduleSchema);
