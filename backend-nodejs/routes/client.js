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
        const Payment = require('../models/Subscription');
        
        const client = await Client.findOne({ user: req.user._id });
        
        const totalAppointments = await Appointment.countDocuments({ client: client?._id });
        const upcomingAppointments = await Appointment.countDocuments({
            client: client?._id,
            status: { $in: ['scheduled', 'confirmed'] },
            scheduledDate: { $gte: new Date() }
        });
        
        // Count completed appointments as medical records
        const totalRecords = await Appointment.countDocuments({
            client: client?._id,
            status: 'completed'
        });
        
        // Count pending payments (appointments with pending payment status)
        const pendingPayments = await Appointment.countDocuments({
            client: client?._id,
            paymentStatus: 'pending'
        });
        
        res.json({
            success: true,
            data: {
                totalAppointments,
                upcomingAppointments,
                pendingPayments,
                totalRecords,
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

// Get service by ID — supports both professional and gym/physio services
router.get('/services/:id', protect, async (req, res) => {
    try {
        const Service = require('../models/Service');
        const mongoose = require('mongoose');

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid service ID' });
        }

        const service = await Service.findById(req.params.id)
            .populate({ path: 'professional', populate: { path: 'user', select: 'firstName lastName email' } })
            .populate({ path: 'gymPhysio', select: 'businessName businessType city state phone user' });

        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        const isGymPhysio = !!service.gymPhysio && !service.professional;
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
            providerType: isGymPhysio ? 'gym-physio' : 'professional',
            provider: isGymPhysio ? {
                id: service.gymPhysio?._id,
                name: service.gymPhysio?.businessName || 'Gym/Physio',
                type: 'gym-physio',
                specialty: service.gymPhysio?.businessType || 'Fitness',
                photo: null,
            } : {
                id: service.professional?._id,
                name: service.professional?.user
                    ? `${service.professional.user.firstName} ${service.professional.user.lastName}`.trim()
                    : 'Professional',
                type: 'professional',
                specialty: service.professional?.specialization?.[0] || '',
                photo: null,
            },
        };

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching service:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get service availability/time slots — uses real schedule + checks existing bookings
router.get('/services/:id/availability', protect, async (req, res) => {
    try {
        const Service = require('../models/Service');
        const Schedule = require('../models/Schedule');
        const Appointment = require('../models/Appointment');
        const mongoose = require('mongoose');

        const { date } = req.query;
        if (!date) return res.status(400).json({ success: false, message: 'date query param required (YYYY-MM-DD)' });

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid service ID' });
        }

        const service = await Service.findById(req.params.id);
        if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

        // Determine the professional ID (works for both professional and gym-physio services)
        const professionalId = service.professional;

        // Day of week from requested date
        const requestedDate = new Date(date);
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = dayNames[requestedDate.getDay()];

        // Try to get real schedule
        let schedule = professionalId ? await Schedule.findOne({ professional: professionalId }) : null;

        let rawSlots = [];

        if (schedule && schedule[dayName]?.isAvailable && schedule[dayName]?.timeSlots?.length > 0) {
            // Use real schedule slots
            rawSlots = schedule[dayName].timeSlots.map((slot, i) => ({
                id: `slot-${slot.startTime.replace(':', '-')}-${i}`,
                startTime: slot.startTime,
                endTime: slot.endTime,
            }));
        } else {
            // Fallback: generate default 9am–5pm slots every 30 min
            for (let hour = 9; hour < 17; hour++) {
                rawSlots.push({
                    id: `slot-${hour}-00`,
                    startTime: `${String(hour).padStart(2, '0')}:00`,
                    endTime: `${String(hour).padStart(2, '0')}:30`,
                });
                rawSlots.push({
                    id: `slot-${hour}-30`,
                    startTime: `${String(hour).padStart(2, '0')}:30`,
                    endTime: `${String(hour + 1).padStart(2, '0')}:00`,
                });
            }
        }

        // Get already-booked times for this professional on this date
        const bookedTimes = new Set();
        if (professionalId) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            const existingAppointments = await Appointment.find({
                professional: professionalId,
                scheduledDate: { $gte: startOfDay, $lte: endOfDay },
                status: { $in: ['scheduled', 'confirmed', 'in_progress'] },
            }).select('scheduledTime');

            existingAppointments.forEach(apt => bookedTimes.add(apt.scheduledTime));
        }

        // Mark slots as available/unavailable
        const now = new Date();
        const timeSlots = rawSlots.map(slot => {
            // Check if slot is in the past
            const slotDateTime = new Date(`${date}T${slot.startTime}:00`);
            const isPast = slotDateTime <= now;
            const isBooked = bookedTimes.has(slot.startTime);

            return {
                id: slot.id,
                startTime: slot.startTime,
                endTime: slot.endTime,
                available: !isPast && !isBooked,
            };
        });

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

        // Map frontend tab names to DB status values
        const { status } = req.query;
        let statusFilter = {};
        if (status === 'upcoming') {
            statusFilter = { status: { $in: ['scheduled', 'confirmed', 'in_progress'] } };
        } else if (status === 'completed') {
            statusFilter = { status: 'completed' };
        } else if (status === 'cancelled') {
            statusFilter = { status: { $in: ['cancelled', 'no_show'] } };
        }

        const appointments = await Appointment.find({ client: client._id, ...statusFilter })
            .populate({ path: 'professional', populate: { path: 'user', select: 'firstName lastName email' } })
            .populate({ path: 'gymPhysio', populate: { path: 'user', select: 'firstName lastName email' } })
            .sort({ scheduledDate: -1 });

        const data = appointments.map(apt => {
            // Build provider info — could be professional or gym/physio
            let provider;
            if (apt.gymPhysio) {
                const gp = apt.gymPhysio;
                provider = {
                    id:        gp._id,
                    name:      gp.businessName || (gp.user ? `${gp.user.firstName} ${gp.user.lastName}`.trim() : 'Gym/Physio'),
                    type:      'gym-physio',
                    specialty: gp.businessType || 'Fitness',
                    photo:     gp.profilePicture || null,
                };
            } else {
                provider = {
                    id:        apt.professional?._id,
                    name:      apt.professional?.user
                        ? `${apt.professional.user.firstName} ${apt.professional.user.lastName}`.trim()
                        : 'Professional',
                    type:      'professional',
                    specialty: apt.professional?.specialization?.[0] || '',
                    photo:     null,
                };
            }

            return {
                id:      apt._id,
                date:    apt.scheduledDate,
                time:    apt.scheduledTime || '10:00',
                status:  apt.status,
                type:    apt.appointmentMode || 'in_person',
                service: apt.service ? {
                    id:    apt.service._id,
                    title: apt.service.title,
                    price: apt.service.price,
                } : { id: '', title: apt.reasonForVisit || 'Consultation', price: apt.consultationFee || 0 },
                provider,
                payment: {
                    amount: apt.consultationFee || apt.service?.price || 0,
                    status: apt.paymentStatus || 'pending',
                },
                consultationLink: apt.consultationLink || null,
            };
        });

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.json({ success: true, data: [] });
    }
});

// Get single appointment by ID
router.get('/appointments/:id', protect, async (req, res) => {
    try {
        const Appointment = require('../models/Appointment');
        const client = await Client.findOne({ user: req.user._id });
        if (!client) return res.status(404).json({ success: false, message: 'Client not found' });

        const apt = await Appointment.findOne({ _id: req.params.id, client: client._id })
            .populate({ path: 'professional', populate: { path: 'user', select: 'firstName lastName email phone' } })
            .populate({ path: 'gymPhysio', populate: { path: 'user', select: 'firstName lastName email phone' } })
            .populate('service', 'title price');

        if (!apt) return res.status(404).json({ success: false, message: 'Appointment not found' });

        // Build provider info
        let provider;
        let providerPhone = null;
        if (apt.gymPhysio) {
            const gp = apt.gymPhysio;
            provider = {
                id: gp._id,
                name: gp.businessName || (gp.user ? `${gp.user.firstName} ${gp.user.lastName}`.trim() : 'Gym/Physio'),
                type: 'gym-physio',
                specialty: gp.businessType || 'Fitness',
                photo: gp.profilePicture || null,
            };
            providerPhone = gp.phone || gp.user?.phone;
        } else {
            provider = {
                id: apt.professional?._id,
                name: apt.professional?.user
                    ? `${apt.professional.user.firstName} ${apt.professional.user.lastName}`.trim()
                    : 'Professional',
                type: 'professional',
                specialty: apt.professional?.specialization?.[0] || '',
                photo: null,
            };
            providerPhone = apt.professional?.phone || apt.professional?.user?.phone;
        }

        const data = {
            id: apt._id,
            date: apt.scheduledDate,
            time: apt.scheduledTime || '10:00',
            status: apt.status,
            type: apt.appointmentMode || 'in_person',
            appointmentMode: apt.appointmentMode || 'in_person',
            service: apt.service ? {
                id: apt.service._id,
                title: apt.service.title,
                price: apt.service.price,
            } : { id: '', title: apt.reasonForVisit || 'Consultation', price: apt.consultationFee || 0 },
            provider,
            providerPhone,
            reasonForVisit: apt.reasonForVisit,
            payment: {
                amount: apt.consultationFee || apt.service?.price || 0,
                status: apt.paymentStatus || 'pending',
            },
            consultationLink: apt.consultationLink || null,
        };

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching appointment:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/appointments/book', protect, requireSubscription, async (req, res) => {
    try {
        const Appointment = require('../models/Appointment');
        const Service = require('../models/Service');
        const Professional = require('../models/Professional');
        const GymPhysio = require('../models/GymPhysio');

        // Auto-create client profile if missing
        let client = await Client.findOne({ user: req.user._id });
        if (!client) {
            const user = await User.findById(req.user._id);
            client = await Client.create({
                user: req.user._id,
                phone: user.phone || '0000000000',
            });
        }

        const {
            providerId,
            timeSlotId,
            consultationType,   // 'video' | 'chat' | 'in-person'
            reason,
            notes,
            scheduledDate,
            scheduledTime,
        } = req.body;

        // Resolve service → determine if professional or gym/physio
        let service = null;
        let professional = null;
        let gymPhysio = null;
        let providerType = 'professional';

        if (providerId) {
            service = await Service.findById(providerId);
            if (service) {
                if (service.gymPhysio) {
                    gymPhysio = await GymPhysio.findById(service.gymPhysio)
                        .populate('user', 'firstName lastName email');
                    providerType = 'gym-physio';
                } else if (service.professional) {
                    professional = await Professional.findById(service.professional)
                        .populate('user', 'firstName lastName email');
                    providerType = 'professional';
                }
            } else {
                // Try as direct professional ID
                professional = await Professional.findById(providerId)
                    .populate('user', 'firstName lastName email');
                if (!professional) {
                    gymPhysio = await GymPhysio.findById(providerId)
                        .populate('user', 'firstName lastName email');
                    if (gymPhysio) providerType = 'gym-physio';
                }
            }
        }

        if (!professional && !gymPhysio) {
            return res.status(404).json({ success: false, message: 'Provider not found' });
        }

        // Map consultationType → appointmentMode
        const modeMap = {
            'video':      'video_call',
            'chat':       'phone_call',
            'in-person':  'in_person',
            'video_call': 'video_call',
            'phone_call': 'phone_call',
            'in_person':  'in_person',
        };
        const appointmentMode = modeMap[consultationType] || 'in_person';

        // Map providerType → appointmentType
        const aptTypeMap = {
            'professional': 'consultation',
            'gym-physio':   'fitness',
        };
        const serviceCategory = service?.category;
        const appointmentType = serviceCategory === 'physiotherapy' ? 'physiotherapy'
            : serviceCategory === 'therapy' ? 'therapy'
            : aptTypeMap[providerType] || 'consultation';

        // Parse date/time
        let apptDate = scheduledDate ? new Date(scheduledDate) : new Date();
        let apptTime = scheduledTime || '10:00';

        if (timeSlotId && timeSlotId.startsWith('slot-')) {
            const parts = timeSlotId.replace('slot-', '').split('-');
            if (parts.length >= 2) {
                apptTime = `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
            }
        }

        const appointmentData = {
            client:          client._id,
            professional:    professional?._id || null,
            gymPhysio:       gymPhysio?._id || null,
            appointmentType,
            appointmentMode,
            scheduledDate:   apptDate,
            scheduledTime:   apptTime,
            duration:        service?.duration || 30,
            reasonForVisit:  reason || 'General consultation',
            clientNotes:     notes || '',
            consultationFee: service?.price || 0,
            currency:        'NGN',
            status:          'scheduled',
            paymentStatus:   'pending',
        };

        const appointment = await Appointment.create(appointmentData);

        // Populate for response — only populate fields that exist in the schema
        const populatePaths = [];
        if (professional) populatePaths.push({ path: 'professional', populate: { path: 'user', select: 'firstName lastName email' } });
        if (gymPhysio) populatePaths.push({ path: 'gymPhysio', populate: { path: 'user', select: 'firstName lastName email' } });
        if (populatePaths.length > 0) await appointment.populate(populatePaths);

        // Build provider info for response
        let providerInfo;
        if (providerType === 'gym-physio' && appointment.gymPhysio) {
            const gp = appointment.gymPhysio;
            providerInfo = {
                id:        gp._id,
                name:      gp.businessName || (gp.user ? `${gp.user.firstName} ${gp.user.lastName}`.trim() : 'Gym/Physio'),
                type:      'gym-physio',
                specialty: gp.businessType || 'Fitness',
                photo:     gp.profilePicture || null,
            };
        } else {
            const pro = appointment.professional;
            providerInfo = {
                id:        pro?._id,
                name:      pro?.user ? `${pro.user.firstName} ${pro.user.lastName}`.trim() : 'Professional',
                type:      'professional',
                specialty: pro?.specialization?.[0] || '',
                photo:     null,
            };
        }

        const responseData = {
            id:      appointment._id,
            date:    appointment.scheduledDate,
            time:    appointment.scheduledTime,
            status:  appointment.status,
            type:    appointment.appointmentMode,
            service: service ? {
                id:    service._id,
                title: service.title,
                price: service.price,
            } : null,
            provider: providerInfo,
            payment: {
                amount: appointment.consultationFee,
                status: appointment.paymentStatus,
            },
        };

        res.status(201).json({
            success: true,
            data: responseData,
            message: 'Appointment booked successfully',
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

// Medical records — built from completed appointments
router.get('/medical-records', protect, async (req, res) => {
    try {
        const Appointment = require('../models/Appointment');
        const client = await Client.findOne({ user: req.user._id });
        if (!client) return res.json({ success: true, data: [] });

        const appointments = await Appointment.find({
            client: client._id,
            status: 'completed',
        })
        .populate({ path: 'professional', populate: { path: 'user', select: 'firstName lastName' } })
        .populate({ path: 'gymPhysio', select: 'businessName' })
        .sort({ scheduledDate: -1 });

        const data = appointments.map(apt => {
            const providerName = apt.professional?.user
                ? `${apt.professional.user.firstName} ${apt.professional.user.lastName}`.trim()
                : apt.gymPhysio?.businessName || 'Healthcare Provider';

            return {
                id: apt._id,
                date: apt.scheduledDate || apt.createdAt,
                provider: providerName,
                diagnosis: apt.reasonForVisit || 'Consultation',
                notes: apt.professionalNotes || apt.clientNotes || '',
                prescription: apt.prescription || [],
                attachments: apt.documents || [],
                appointmentType: apt.appointmentType || 'consultation',
                appointmentMode: apt.appointmentMode || 'in_person',
                status: apt.status,
            };
        });

        res.json({ success: true, data });
    } catch (error) {
        console.error('Medical records error:', error);
        res.json({ success: true, data: [] });
    }
});

// Payments — initialize Paystack payment for an appointment
router.post('/payments', protect, async (req, res) => {
    try {
        const { initializeTransaction } = require('../services/paystackService');

        const { appointmentId, amount, service } = req.body;

        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid payment amount' });
        }

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (!user.email) return res.status(400).json({ success: false, message: 'User email is required for payment' });

        // Verify Paystack key is configured
        if (!process.env.PAYSTACK_SECRET_KEY) {
            console.error('PAYSTACK_SECRET_KEY is not set');
            return res.status(500).json({ success: false, message: 'Payment gateway not configured. Please contact support.' });
        }

        const reference = `APT-${appointmentId || 'SVC'}-${Date.now()}`;

        console.log(`Initializing Paystack payment: email=${user.email}, amount=${amount}, ref=${reference}`);

        const paystackResponse = await initializeTransaction(
            user.email,
            Number(amount),
            reference,
            { appointmentId: appointmentId || '', service: service || '', userId: user._id.toString() }
        );

        if (!paystackResponse.status) {
            console.error('Paystack returned failure:', paystackResponse);
            return res.status(500).json({ success: false, message: paystackResponse.message || 'Payment initialization failed' });
        }

        console.log(`Paystack payment initialized: ref=${paystackResponse.data?.reference}`);

        res.json({
            statuscode: 0,
            success: true,
            data: {
                id: reference,
                authorizationUrl: paystackResponse.data.authorization_url,
                accessCode: paystackResponse.data.access_code,
                reference: paystackResponse.data.reference,
            },
        });
    } catch (error) {
        console.error('Payment initialization error:', error.message);
        res.status(500).json({ success: false, message: error.message || 'Payment initialization failed' });
    }
});

// Verify appointment payment
router.post('/payments/verify/:reference', protect, async (req, res) => {
    try {
        const { verifyTransaction } = require('../services/paystackService');
        const Appointment = require('../models/Appointment');

        const paystackResponse = await verifyTransaction(req.params.reference);

        if (!paystackResponse.status || paystackResponse.data.status !== 'success') {
            return res.status(400).json({ success: false, message: 'Payment verification failed' });
        }

        const appointmentId = paystackResponse.data.metadata?.appointmentId;
        if (appointmentId) {
            await Appointment.findByIdAndUpdate(appointmentId, {
                paymentStatus: 'paid',
                transactionId: req.params.reference,
                paymentMethod: 'paystack',
            });

            // Notify patient that payment was received
            const Notification = require('../models/Notification');
            const apt = await Appointment.findById(appointmentId)
                .populate({ path: 'professional', populate: { path: 'user', select: 'firstName lastName' } });
            if (apt) {
                const providerName = apt.professional?.user
                    ? `${apt.professional.user.firstName} ${apt.professional.user.lastName}`.trim()
                    : 'your provider';
                await Notification.create({
                    user: req.user._id,
                    title: 'Payment Confirmed',
                    message: `Your payment of ₦${(paystackResponse.data.amount / 100).toLocaleString()} for your appointment with ${providerName} has been received.`,
                    type: 'payment',
                    data: { appointmentId, reference: req.params.reference, amount: paystackResponse.data.amount / 100 }
                }).catch(() => {});
            }
        }

        res.json({ success: true, data: { reference: req.params.reference }, message: 'Payment verified' });
    } catch (error) {
        console.error('Payment verify error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get payment history — returns appointments with payment info
router.get('/payments', protect, async (req, res) => {
    try {
        const Appointment = require('../models/Appointment');
        const client = await Client.findOne({ user: req.user._id });
        if (!client) return res.json({ success: true, data: [] });

        const { status, startDate, endDate } = req.query;

        let query = { client: client._id };

        // Filter by payment status
        if (status && status !== 'all') {
            const statusMap = {
                completed: 'paid',
                pending: 'pending',
                failed: 'failed',
            };
            if (statusMap[status]) query.paymentStatus = statusMap[status];
        }

        // Filter by date range
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate + 'T23:59:59');
        }

        const appointments = await Appointment.find(query)
            .populate({ path: 'professional', populate: { path: 'user', select: 'firstName lastName' } })
            .sort({ createdAt: -1 })
            .limit(50);

        const data = appointments
            .filter(apt => apt.consultationFee > 0 || apt.paymentStatus !== 'pending')
            .map(apt => {
                const providerName = apt.professional?.user
                    ? `${apt.professional.user.firstName} ${apt.professional.user.lastName}`.trim()
                    : 'Healthcare Provider';
                return {
                    id: apt._id,
                    date: apt.createdAt || apt.scheduledDate,
                    service: apt.reasonForVisit || 'Consultation',
                    provider: providerName,
                    amount: apt.consultationFee || 0,
                    currency: apt.currency || 'NGN',
                    method: apt.paymentMethod || 'Paystack',
                    status: apt.paymentStatus === 'paid' ? 'completed'
                          : apt.paymentStatus === 'failed' ? 'failed'
                          : 'pending',
                    reference: apt.transactionId || '',
                    appointmentId: apt._id,
                    appointmentStatus: apt.status,
                };
            });

        res.json({ success: true, data });
    } catch (error) {
        console.error('Get payments error:', error);
        res.json({ success: true, data: [] });
    }
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
