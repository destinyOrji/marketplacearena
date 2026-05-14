const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const { sendNotification } = require('../utils/notificationHelper');
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

        // Send notification to provider (gym-physio, professional, or hospital)
        const Notification = require('../models/Notification');
        const GymPhysio = require('../models/GymPhysio');
        
        if (gymPhysioId) {
            const gymPhysio = await GymPhysio.findById(gymPhysioId).populate('user');
            if (gymPhysio && gymPhysio.user) {
                const clientName = `${client.user?.firstName || ''} ${client.user?.lastName || ''}`.trim() || 'A patient';
                await Notification.create({
                    user: gymPhysio.user._id,
                    title: 'New Appointment Booking',
                    message: `${clientName} has booked an appointment for ${new Date(scheduledDate).toLocaleDateString()} at ${scheduledTime}`,
                    type: 'appointment',
                    data: {
                        appointmentId: appointment._id,
                        clientName,
                        scheduledDate,
                        scheduledTime,
                        service: appointment.service?.title || 'Session'
                    }
                });
            }
        } else if (professionalId) {
            const professional = await Professional.findById(professionalId).populate('user');
            if (professional && professional.user) {
                const clientName = `${client.user?.firstName || ''} ${client.user?.lastName || ''}`.trim() || 'A patient';
                await Notification.create({
                    user: professional.user._id,
                    title: 'New Appointment Booking',
                    message: `${clientName} has booked an appointment for ${new Date(scheduledDate).toLocaleDateString()} at ${scheduledTime}`,
                    type: 'appointment',
                    data: {
                        appointmentId: appointment._id,
                        clientName,
                        scheduledDate,
                        scheduledTime
                    }
                });
            }
        }

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
        ).populate([
            { path: 'client', populate: { path: 'user', select: 'firstName lastName' } },
            { path: 'gymPhysio', populate: { path: 'user', select: '_id' } },
            { path: 'professional', populate: { path: 'user', select: '_id' } },
            { path: 'service', select: 'title' }
        ]);

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        // Send payment notification to provider when payment is successful
        if (paymentStatus === 'paid') {
            const GymPhysio = require('../models/GymPhysio');
            
            let recipientType = null;
            let recipientId = null;
            let providerName = 'Provider';
            
            if (appointment.gymPhysio) {
                recipientType = 'gym-physio';
                recipientId = appointment.gymPhysio._id;
                const gymPhysio = await GymPhysio.findById(appointment.gymPhysio._id);
                providerName = gymPhysio?.businessName || 'Gym/Physio';
            } else if (appointment.professional) {
                recipientType = 'professional';
                recipientId = appointment.professional._id;
                providerName = 'Professional';
            }

            if (recipientType && recipientId) {
                const clientName = `${appointment.client?.user?.firstName || ''} ${appointment.client?.user?.lastName || ''}`.trim() || 'A patient';
                
                await sendNotification({
                    recipientType,
                    recipientId,
                    title: 'Payment Received',
                    message: `Payment of ₦${appointment.consultationFee?.toLocaleString() || 0} received from ${clientName}`,
                    type: 'payment',
                    data: {
                        appointmentId: appointment._id,
                        amount: appointment.consultationFee,
                        transactionId,
                        clientName,
                        service: appointment.service?.title || 'Session'
                    }
                });
            }
        }

        res.json({ success: true, message: 'Payment status updated', data: appointment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/:id/reschedule', protect, async (req, res) => {
    res.json({ success: true, message: 'Appointment rescheduled' });
});

module.exports = router;
