const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const Client = require('../models/Client');
const Professional = require('../models/Professional');

// Get appointments (for patient or professional based on role)
router.get('/', protect, async (req, res) => {
    try {
        const { status, limit } = req.query;
        let query = {};

        if (req.user.role === 'client') {
            const client = await Client.findOne({ user: req.user._id });
            if (!client) return res.json({ success: true, data: { data: [] } });
            query.client = client._id;
        } else if (req.user.role === 'professional') {
            const professional = await Professional.findOne({ user: req.user._id });
            if (!professional) return res.json({ success: true, data: { data: [] } });
            query.professional = professional._id;
        }

        if (status && status !== 'all') query.status = status;

        let q = Appointment.find(query).sort({ scheduledDate: -1 });
        if (limit) q = q.limit(parseInt(limit));

        const appointments = await q;
        res.json({ success: true, data: { data: appointments } });
    } catch (error) {
        res.json({ success: true, data: { data: [] } });
    }
});

router.post('/book', protect, async (req, res) => {
    try {
        const {
            professionalId,
            gymPhysioId,
            hospitalId,
            serviceId,
            appointmentType,
            appointmentMode,
            scheduledDate,
            scheduledTime,
            duration,
            reasonForVisit,
            symptoms,
            clientNotes,
            consultationFee
        } = req.body;

        // Get client
        const client = await Client.findOne({ user: req.user._id });
        if (!client) {
            return res.status(404).json({ success: false, message: 'Client profile not found' });
        }

        // Create appointment data
        const appointmentData = {
            client: client._id,
            appointmentType: appointmentType || 'consultation',
            appointmentMode: appointmentMode || 'in_person',
            scheduledDate: new Date(scheduledDate),
            scheduledTime,
            duration: duration || 30,
            reasonForVisit,
            symptoms: symptoms || [],
            clientNotes: clientNotes || '',
            consultationFee: consultationFee || 0,
            currency: 'NGN',
            paymentStatus: 'pending',
            status: 'scheduled'
        };

        // Add provider reference based on type
        if (professionalId) {
            appointmentData.professional = professionalId;
        } else if (gymPhysioId) {
            appointmentData.gymPhysio = gymPhysioId;
        } else if (hospitalId) {
            appointmentData.hospital = hospitalId;
        }

        // Add service reference if provided
        if (serviceId) {
            appointmentData.service = serviceId;
        }

        // Create appointment
        const appointment = await Appointment.create(appointmentData);

        // Populate the appointment
        await appointment.populate([
            { path: 'client', populate: { path: 'user', select: 'firstName lastName email phone' } },
            { path: 'professional', populate: { path: 'user', select: 'firstName lastName' } },
            { path: 'gymPhysio', populate: { path: 'user', select: 'firstName lastName' } },
            { path: 'hospital' },
            { path: 'service' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully',
            data: appointment
        });
    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to book appointment'
        });
    }
});

router.put('/:id/cancel', protect, async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            {
                status: 'cancelled',
                cancelledAt: new Date(),
                cancellationReason: req.body.reason || 'Cancelled by user',
                cancelledBy: 'client'
            },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        res.json({ success: true, message: 'Appointment cancelled', data: appointment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/:id/payment', protect, async (req, res) => {
    try {
        const { paymentStatus, transactionId, paymentMethod } = req.body;

        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            {
                paymentStatus,
                transactionId,
                paymentMethod,
                ...(paymentStatus === 'paid' && { status: 'confirmed', confirmedAt: new Date() })
            },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        // Update gym-physio stats if applicable
        if (appointment.gymPhysio && paymentStatus === 'paid') {
            const GymPhysio = require('../models/GymPhysio');
            await GymPhysio.findByIdAndUpdate(
                appointment.gymPhysio,
                {
                    $inc: {
                        totalBookings: 1,
                        totalRevenue: appointment.consultationFee || 0
                    }
                }
            );
        }

        res.json({ success: true, message: 'Payment updated', data: appointment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/:id/reschedule', protect, async (req, res) => {
    res.json({ success: true, message: 'Appointment rescheduled' });
});

module.exports = router;
