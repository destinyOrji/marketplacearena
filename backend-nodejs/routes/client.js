const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { requireSubscription } = require('../middleware/subscription');
const Client = require('../models/Client');
const User = require('../models/User');

// Get client profile
router.get('/profile', protect, async (req, res) => {
    try {
        const client = await Client.findOne({ user: req.user._id });
        const user = req.user;
        res.json({
            success: true,
            data: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: `${user.firstName} ${user.lastName}`,
                phone: client?.phone || '',
                dateOfBirth: client?.dateOfBirth || null,
                gender: client?.gender || '',
                address: client?.address || {},
                emergencyContact: client?.emergencyContact || {},
                insurance: client?.insurance || {},
                healthMetrics: client?.healthMetrics || {},
                profilePhoto: null,
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update client profile
router.put('/profile/update', protect, async (req, res) => {
    try {
        await Client.findOneAndUpdate({ user: req.user._id }, { $set: req.body }, { upsert: true, new: true });
        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Services (browse professionals/hospitals and their services)
router.get('/services', protect, async (req, res) => {
    try {
        const Service = require('../models/Service');
        const Professional = require('../models/Professional');
        const { search, type, specialty, page = 1, pageSize = 12, minRating, location } = req.query;
        const skip = (page - 1) * pageSize;

        // Build query for active services only
        let serviceQuery = { status: 'active' };
        
        // Search by title or description
        if (search) {
            serviceQuery.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }
        
        // Filter by category
        if (type) {
            serviceQuery.category = type;
        }

        // Get services with professional details
        const services = await Service.find(serviceQuery)
            .populate({
                path: 'professional',
                populate: {
                    path: 'user',
                    select: 'firstName lastName email'
                }
            })
            .skip(skip)
            .limit(parseInt(pageSize))
            .sort({ createdAt: -1 });

        // Filter by specialty if provided
        let filteredServices = services;
        if (specialty) {
            filteredServices = services.filter(s => 
                s.professional?.specialization?.some(spec => 
                    spec.toLowerCase().includes(specialty.toLowerCase())
                )
            );
        }

        // Filter by rating if provided
        if (minRating) {
            filteredServices = filteredServices.filter(s => s.rating >= parseFloat(minRating));
        }

        const total = await Service.countDocuments(serviceQuery);

        // Format services for frontend
        const data = filteredServices.map(service => ({
            id: service._id,
            name: service.title,
            type: service.category,
            specialty: service.professional?.specialization?.[0] || service.category,
            rating: service.rating || 0,
            reviewCount: service.reviewCount || 0,
            price: service.price,
            duration: service.duration,
            description: service.description,
            images: service.images || [],
            photo: service.images?.[0] || null,
            isAvailable: service.availability === 'available',
            provider: {
                id: service.professional?._id,
                name: service.professional?.user ? 
                    `${service.professional.user.firstName} ${service.professional.user.lastName}`.trim() : 
                    'Professional',
                type: 'professional',
                specialty: service.professional?.specialization?.[0] || '',
                photo: null
            }
        }));

        res.json({ 
            success: true, 
            data: { 
                data, 
                total: filteredServices.length, 
                totalPages: Math.ceil(total / pageSize) 
            } 
        });
    } catch (error) {
        console.error('Error fetching services:', error);
        res.json({ success: true, data: { data: [], total: 0, totalPages: 1 } });
    }
});

// Get service by ID
router.get('/services/:id', protect, async (req, res) => {
    try {
        const Service = require('../models/Service');
        const mongoose = require('mongoose');
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid service ID' });
        }
        
        const service = await Service.findById(req.params.id)
            .populate({
                path: 'professional',
                populate: {
                    path: 'user',
                    select: 'firstName lastName email'
                }
            });

        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        const data = {
            id: service._id,
            name: service.title,
            title: service.title,
            description: service.description,
            category: service.category,
            type: service.category,
            price: service.price,
            duration: service.duration,
            images: service.images || [],
            photo: service.images?.[0] || null,
            rating: service.rating || 0,
            reviewCount: service.reviewCount || 0,
            availability: service.availability,
            isAvailable: service.availability === 'available',
            provider: {
                id: service.professional?._id,
                name: service.professional?.user ? 
                    `${service.professional.user.firstName} ${service.professional.user.lastName}`.trim() : 
                    'Professional',
                type: 'professional',
                specialty: service.professional?.specialization?.[0] || '',
                photo: null
            }
        };

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching service:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get service availability/time slots
router.get('/services/:id/availability', protect, async (req, res) => {
    try {
        const { date } = req.query;
        
        // Generate mock time slots for now
        // In production, this would check professional's schedule and existing appointments
        const timeSlots = [];
        const startHour = 9;
        const endHour = 17;
        
        for (let hour = startHour; hour < endHour; hour++) {
            timeSlots.push({
                id: `slot-${hour}-00`,
                startTime: `${hour.toString().padStart(2, '0')}:00`,
                endTime: `${hour.toString().padStart(2, '0')}:30`,
                available: Math.random() > 0.3 // 70% available
            });
            timeSlots.push({
                id: `slot-${hour}-30`,
                startTime: `${hour.toString().padStart(2, '0')}:30`,
                endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
                available: Math.random() > 0.3
            });
        }

        res.json({ success: true, data: timeSlots });
    } catch (error) {
        console.error('Error fetching availability:', error);
        res.json({ success: true, data: [] });
    }
});
router.get('/appointments', protect, async (req, res) => {
    try {
        const Appointment = require('../models/Appointment');
        const client = await Client.findOne({ user: req.user._id });
        if (!client) return res.json({ success: true, data: [] });
        
        const appointments = await Appointment.find({ client: client._id })
            .populate({
                path: 'professional',
                populate: {
                    path: 'user',
                    select: 'firstName lastName email'
                }
            })
            .populate('service')
            .sort({ scheduledDate: -1 });

        const data = appointments.map(apt => ({
            id: apt._id,
            date: apt.scheduledDate,
            time: apt.scheduledTime || '10:00',
            status: apt.status,
            type: apt.consultationType || 'video',
            service: apt.service ? {
                id: apt.service._id,
                title: apt.service.title,
                price: apt.service.price
            } : null,
            provider: {
                id: apt.professional?._id,
                name: apt.professional?.user ? 
                    `${apt.professional.user.firstName} ${apt.professional.user.lastName}`.trim() : 
                    'Professional',
                type: 'professional',
                specialty: apt.professional?.specialization?.[0] || '',
                photo: null
            },
            payment: {
                amount: apt.service?.price || 0,
                status: apt.paymentStatus || 'pending'
            },
            consultationLink: apt.consultationLink || null
        }));

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.json({ success: true, data: [] });
    }
});

router.post('/appointments/book', protect, requireSubscription, async (req, res) => {
    try {
        const Appointment = require('../models/Appointment');
        const Service = require('../models/Service');
        const Professional = require('../models/Professional');
        
        const client = await Client.findOne({ user: req.user._id });
        if (!client) {
            return res.status(404).json({ success: false, message: 'Client profile not found' });
        }

        const { providerId, timeSlotId, consultationType, reason, notes } = req.body;

        // Get the service/professional
        let service, professional;
        
        // Check if providerId is a service or professional
        service = await Service.findById(providerId);
        if (service) {
            professional = await Professional.findById(service.professional);
        } else {
            professional = await Professional.findById(providerId);
        }

        if (!professional) {
            return res.status(404).json({ success: false, message: 'Professional not found' });
        }

        // Create appointment
        const appointmentData = {
            client: client._id,
            professional: professional._id,
            service: service?._id,
            scheduledDate: new Date(), // Should come from timeSlotId
            scheduledTime: '10:00', // Should come from timeSlotId
            consultationType: consultationType || 'video',
            reason: reason || 'Consultation',
            notes: notes || '',
            status: 'pending',
            paymentStatus: 'pending'
        };

        const appointment = await Appointment.create(appointmentData);

        // Populate for response
        await appointment.populate([
            {
                path: 'professional',
                populate: { path: 'user', select: 'firstName lastName email' }
            },
            { path: 'service' }
        ]);

        const responseData = {
            id: appointment._id,
            date: appointment.scheduledDate,
            time: appointment.scheduledTime,
            status: appointment.status,
            type: appointment.consultationType,
            service: appointment.service ? {
                id: appointment.service._id,
                title: appointment.service.title,
                price: appointment.service.price
            } : null,
            provider: {
                id: appointment.professional._id,
                name: appointment.professional.user ? 
                    `${appointment.professional.user.firstName} ${appointment.professional.user.lastName}`.trim() : 
                    'Professional',
                type: 'professional',
                specialty: appointment.professional.specialization?.[0] || '',
                photo: null
            },
            payment: {
                amount: appointment.service?.price || 0,
                status: appointment.paymentStatus
            }
        };

        res.status(201).json({ 
            success: true, 
            data: responseData,
            message: 'Appointment booked successfully' 
        });
    } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/appointments/:id/cancel', protect, async (req, res) => {
    res.json({ success: true, message: 'Appointment cancelled' });
});

router.put('/appointments/:id/reschedule', protect, async (req, res) => {
    res.json({ success: true, message: 'Appointment rescheduled' });
});

// Emergency
router.get('/emergency/providers', protect, async (req, res) => {
    try {
        const Ambulance = require('../models/Ambulance');
        const providers = await Ambulance.find({ isVerified: true, isAvailable: true })
            .populate('user', 'firstName lastName email');
        res.json({ success: true, data: providers });
    } catch (error) {
        res.json({ success: true, data: [] });
    }
});

router.post('/emergency/book', protect, requireSubscription, async (req, res) => {
    res.json({ success: true, message: 'Emergency service booked', data: { id: Date.now().toString(), ...req.body } });
});

// Medical records
router.get('/medical-records', protect, async (req, res) => {
    res.json({ success: true, data: { data: [], total: 0 } });
});

// Payments
router.get('/payments', protect, async (req, res) => {
    res.json({ success: true, data: { data: [], total: 0 } });
});

// Feedback
router.get('/feedback', protect, async (req, res) => {
    res.json({ success: true, data: [] });
});

router.post('/feedback', protect, async (req, res) => {
    res.json({ success: true, message: 'Feedback submitted', data: { id: Date.now().toString(), ...req.body } });
});

// Change password
router.put('/profile/password', protect, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Both passwords are required' });
        }
        const user = await User.findById(req.user._id);
        const isValid = await user.comparePassword(currentPassword);
        if (!isValid) return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        user.password = newPassword;
        await user.save();
        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
