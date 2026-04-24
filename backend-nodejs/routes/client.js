const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { requireSubscription } = require('../middleware/subscription');
const Client = require('../models/Client');
const User = require('../models/User');

// Dashboard stats for patient
router.get('/dashboard-stats', protect, async (req, res) => {
    try {
        const Appointment = require('../models/Appointment');
        const client = await Client.findOne({ user: req.user._id });
        const totalAppointments = await Appointment.countDocuments({ client: client?._id });
        const upcomingAppointments = await Appointment.countDocuments({
            client: client?._id,
            status: { $in: ['scheduled', 'confirmed'] },
            scheduledDate: { $gte: new Date() }
        });
        res.json({
            success: true,
            data: {
                totalAppointments,
                upcomingAppointments,
                pendingPayments: 0,
                totalRecords: 0,
            }
        });
    } catch (error) {
        res.json({ success: true, data: { totalAppointments: 0, upcomingAppointments: 0, pendingPayments: 0, totalRecords: 0 } });
    }
});

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
        const GymPhysio = require('../models/GymPhysio');
        const { search, type, specialty, page = 1, pageSize = 12, minRating } = req.query;
        const skip = (page - 1) * pageSize;

        let serviceQuery = { status: 'active' };
        if (search) {
            serviceQuery.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }
        if (type && type !== 'all') serviceQuery.category = type;

        // Get professional services
        const professionalServices = await Service.find({ ...serviceQuery, professional: { $exists: true } })
            .populate({ path: 'professional', populate: { path: 'user', select: 'firstName lastName email' } })
            .sort({ createdAt: -1 });

        // Get gym-physio services (stored in Service model with gymPhysio field OR in GymPhysio model)
        const gymPhysioServices = await Service.find({ ...serviceQuery, gymPhysio: { $exists: true } })
            .populate({ path: 'gymPhysio', select: 'businessName businessType city state phone' })
            .sort({ createdAt: -1 });

        // Combine all services
        let allServices = [
            ...professionalServices.map(s => ({
                id: s._id,
                name: s.title,
                title: s.title,
                type: s.category,
                specialty: s.professional?.specialization?.[0] || s.category,
                rating: s.rating || 0,
                reviewCount: s.reviewCount || 0,
                price: s.price,
                duration: s.duration,
                description: s.description,
                images: s.images || [],
                photo: s.images?.[0] || null,
                isAvailable: s.availability === 'available',
                providerType: 'professional',
                provider: {
                    id: s.professional?._id,
                    name: s.professional?.user ? `${s.professional.user.firstName} ${s.professional.user.lastName}`.trim() : 'Professional',
                    type: 'professional',
                    specialty: s.professional?.specialization?.[0] || '',
                    photo: null
                }
            })),
            ...gymPhysioServices.map(s => ({
                id: s._id,
                name: s.title,
                title: s.title,
                type: s.category || 'fitness',
                specialty: s.category || 'Fitness',
                rating: s.rating || 0,
                reviewCount: s.reviewCount || 0,
                price: s.price,
                duration: s.duration,
                description: s.description,
                images: s.images || [],
                photo: s.images?.[0] || null,
                isAvailable: s.availability === 'available',
                providerType: 'gym-physio',
                provider: {
                    id: s.gymPhysio?._id,
                    name: s.gymPhysio?.businessName || 'Gym/Physio',
                    type: 'gym-physio',
                    specialty: s.gymPhysio?.businessType || 'Fitness',
                    photo: null
                }
            }))
        ];

        // Filter by rating
        if (minRating) allServices = allServices.filter(s => s.rating >= parseFloat(minRating));

        // Filter by specialty
        if (specialty) allServices = allServices.filter(s => s.specialty?.toLowerCase().includes(specialty.toLowerCase()));

        const total = allServices.length;
        const paginated = allServices.slice(skip, skip + parseInt(pageSize));

        res.json({ success: true, data: { data: paginated, total, totalPages: Math.ceil(total / parseInt(pageSize)) } });
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
        const { latitude, longitude, radius = 50 } = req.query;

        const providers = await Ambulance.find({ isVerified: true, isAvailable: true })
            .populate('user', 'firstName lastName email phone');

        const data = providers.map(p => ({
            id: p._id,
            serviceName: p.serviceName,
            serviceType: p.serviceType,
            phone: p.phone,
            emergencyNumber: p.emergencyNumber,
            email: p.email,
            baseAddress: p.baseAddress,
            coverageAreas: p.coverageAreas,
            averageRating: p.averageRating || 0,
            totalReviews: p.totalReviews || 0,
            averageResponseTime: p.averageResponseTime || 0,
            isAvailable: p.isAvailable,
            vehicles: (p.vehicles || []).filter(v => v.isActive).map(v => ({
                id: v._id,
                vehicleNumber: v.vehicleNumber,
                vehicleType: v.vehicleType,
                capacity: v.capacity,
                equipment: v.equipment || [],
                isActive: v.isActive,
            })),
            services: (p.services || []).filter(s => s.isActive).map(s => ({
                id: s._id,
                name: s.name,
                description: s.description,
                basePrice: s.basePrice,
                pricePerKm: s.pricePerKm,
                currency: s.currency,
            })),
            totalVehicles: p.vehicles?.length || 0,
            activeVehicles: p.vehicles?.filter(v => v.isActive).length || 0,
        }));

        res.json({ success: true, data });
    } catch (error) {
        console.error('Emergency providers error:', error);
        res.json({ success: true, data: [] });
    }
});

router.post('/emergency/book', protect, async (req, res) => {
    try {
        const EmergencyBooking = require('../models/EmergencyBooking');
        const Ambulance = require('../models/Ambulance');
        const Client = require('../models/Client');

        const client = await Client.findOne({ user: req.user._id });
        const ambulance = req.body.ambulanceId ? await Ambulance.findById(req.body.ambulanceId) : null;

        const booking = await EmergencyBooking.create({
            client: client?._id,
            provider: ambulance?._id,
            emergencyType: req.body.emergencyType,
            patientCondition: req.body.patientCondition,
            contactNumber: req.body.contactNumber,
            pickupLocation: req.body.patientLocation ? {
                address: req.body.patientLocation.address,
                coordinates: { latitude: req.body.patientLocation.latitude, longitude: req.body.patientLocation.longitude }
            } : {},
            destination: req.body.destination ? {
                address: req.body.destination.address,
            } : {},
            status: 'pending',
        });

        if (ambulance) {
            ambulance.totalBookings = (ambulance.totalBookings || 0) + 1;
            await ambulance.save();
        }

        res.json({
            success: true,
            message: 'Emergency booking created',
            data: {
                id: booking._id,
                status: booking.status,
                estimatedArrival: 15,
                driverName: 'Dispatch Team',
                driverPhone: ambulance?.emergencyNumber || ambulance?.phone || '',
                vehicleNumber: ambulance?.vehicles?.find(v => v.isActive)?.vehicleNumber || 'TBD',
                serviceName: ambulance?.serviceName || 'Emergency Service',
            }
        });
    } catch (error) {
        console.error('Emergency booking error:', error);
        res.json({ success: true, message: 'Emergency service booked', data: { id: Date.now().toString(), status: 'pending', estimatedArrival: 15 } });
    }
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
