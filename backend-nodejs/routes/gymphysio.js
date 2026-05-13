const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const GymPhysio = require('../models/GymPhysio');
const Service = require('../models/Service');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Schedule = require('../models/Schedule');
const BlockedDate = require('../models/BlockedDate');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/gym-physio');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'gym-physio-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Dashboard stats
router.get('/dashboard-stats', protect, async (req, res) => {
    try {
        const gymPhysio = await GymPhysio.findOne({ user: req.user._id });

        // Get real counts from DB
        const activeServices = gymPhysio
            ? await Service.countDocuments({ gymPhysio: gymPhysio._id, status: 'active' })
            : 0;

        const totalServices = gymPhysio
            ? await Service.countDocuments({ gymPhysio: gymPhysio._id })
            : 0;

        const upcomingAppointments = gymPhysio
            ? await Appointment.countDocuments({
                gymPhysio: gymPhysio._id,
                status: { $in: ['scheduled', 'confirmed'] },
                scheduledDate: { $gte: new Date() }
              })
            : 0;

        const completedAppointments = gymPhysio
            ? await Appointment.countDocuments({ gymPhysio: gymPhysio._id, status: 'completed' })
            : 0;

        const totalBookings = gymPhysio ? (gymPhysio.totalBookings || completedAppointments) : 0;
        const completionRate = totalBookings > 0
            ? Math.round((completedAppointments / totalBookings) * 100) : 0;

        res.json({
            success: true,
            data: {
                totalEarnings: 0,
                pendingPayments: 0,
                upcomingAppointments,
                activeServices,
                totalServices,
                completedBookings: completedAppointments,
                totalBookings,
                completionRate,
                averageRating: gymPhysio ? gymPhysio.averageRating : 0,
                totalReviews: gymPhysio ? gymPhysio.totalReviews : 0,
                isVerified: gymPhysio ? gymPhysio.isVerified : false,
            }
        });
    } catch (error) {
        res.json({ success: true, data: { totalEarnings: 0, pendingPayments: 0, upcomingAppointments: 0, activeServices: 0, completionRate: 0, averageRating: 0, totalReviews: 0, totalBookings: 0, completedBookings: 0 } });
    }
});

// Get gym/physio profile
router.get('/profile', protect, async (req, res) => {
    try {
        const gymPhysio = await GymPhysio.findOne({ user: req.user._id }).populate('user', '-password');
        if (!gymPhysio) {
            return res.status(404).json({ success: false, message: 'Gym/Physio profile not found' });
        }
        res.json({ success: true, data: gymPhysio });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update gym/physio profile
router.put('/profile/update', protect, async (req, res) => {
    try {
        const gymPhysio = await GymPhysio.findOneAndUpdate(
            { user: req.user._id },
            { $set: req.body },
            { new: true }
        );
        res.json({ success: true, data: gymPhysio, message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Upload photo
router.post('/upload-photo', protect, upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        
        const photoUrl = `/uploads/gym-physio/${req.file.filename}`;
        
        res.json({ 
            success: true, 
            data: { photoUrl },
            message: 'Photo uploaded successfully' 
        });
    } catch (error) {
        console.error('Error uploading photo:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Upload document
router.post('/documents/upload', protect, upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        
        const documentUrl = `/uploads/gym-physio/${req.file.filename}`;
        
        res.json({ 
            success: true, 
            data: { documentUrl },
            message: 'Document uploaded successfully' 
        });
    } catch (error) {
        console.error('Error uploading document:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Services
router.get('/services', protect, async (req, res) => {
    try {
        const gymPhysio = await GymPhysio.findOne({ user: req.user._id });
        if (!gymPhysio) {
            return res.json({ success: true, data: [] });
        }
        
        const services = await Service.find({ professional: gymPhysio._id })
            .sort({ createdAt: -1 });
        
        const formattedServices = services.map(service => ({
            id: service._id.toString(),
            title: service.title,
            description: service.description,
            category: service.category,
            price: service.price,
            duration: service.duration,
            status: service.status,
            images: service.images || [],
            tags: service.tags || [],
            availability: service.availability,
            rating: service.rating || 0,
            reviewCount: service.reviewCount || 0,
            bookingCount: service.bookingCount || 0,
            createdAt: service.createdAt,
            updatedAt: service.updatedAt
        }));
        
        res.json({ success: true, data: formattedServices });
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/services/create', protect, async (req, res) => {
    try {
        let gymPhysio = await GymPhysio.findOne({ user: req.user._id });
        
        // Auto-create gym-physio profile if it doesn't exist
        if (!gymPhysio) {
            gymPhysio = await GymPhysio.create({
                user: req.user._id,
                businessType: 'gym',
                businessName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'My Business',
                licenseNumber: '',
                specialization: '',
                yearsInBusiness: 0,
                phone: req.user.phone || '',
                city: '',
                state: ''
            });
        }
        
        const serviceData = {
            professional: gymPhysio._id,
            gymPhysio: gymPhysio._id, // also store gymPhysio ref so patients can find it
            title: req.body.title,
            description: req.body.description,
            category: req.body.category || 'fitness',
            price: parseFloat(req.body.price),
            duration: parseInt(req.body.duration),
            status: req.body.status || 'active',
            images: req.body.images || [],
            tags: req.body.tags || [],
            availability: req.body.availability || 'available'
        };
        
        const service = await Service.create(serviceData);
        
        const formattedService = {
            id: service._id.toString(),
            title: service.title,
            description: service.description,
            category: service.category,
            price: service.price,
            duration: service.duration,
            status: service.status,
            images: service.images || [],
            tags: service.tags || [],
            availability: service.availability,
            rating: service.rating || 0,
            reviewCount: service.reviewCount || 0,
            bookingCount: service.bookingCount || 0,
            createdAt: service.createdAt,
            updatedAt: service.updatedAt
        };
        
        res.status(201).json({ 
            success: true, 
            data: formattedService, 
            message: 'Service created successfully' 
        });
    } catch (error) {
        console.error('Error creating service:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Appointments
router.get('/appointments', protect, async (req, res) => {
    try {
        const gymPhysio = await GymPhysio.findOne({ user: req.user._id });
        if (!gymPhysio) return res.json({ success: true, data: [] });

        const appointments = await Appointment.find({ gymPhysio: gymPhysio._id })
            .populate({
                path: 'client',
                populate: {
                    path: 'user',
                    select: 'firstName lastName email phone'
                }
            })
            .populate('service')
            .sort({ scheduledDate: -1 });

        const data = appointments.map(apt => ({
            id: apt._id,
            date: apt.scheduledDate,
            time: apt.scheduledTime || '10:00',
            status: apt.status,
            type: apt.appointmentMode || 'in_person',
            patient: {
                id: apt.client?._id,
                name: apt.client?.user
                    ? `${apt.client.user.firstName} ${apt.client.user.lastName}`.trim()
                    : 'Client',
                email: apt.client?.user?.email || '',
                phone: apt.client?.user?.phone || apt.client?.phone || '',
                photo: null,
            },
            service: apt.service ? {
                id: apt.service._id,
                title: apt.service.title,
                price: apt.service.price,
            } : null,
            payment: {
                amount: apt.consultationFee || apt.service?.price || 0,
                status: apt.paymentStatus || 'pending',
            },
            reason: apt.reasonForVisit || '',
            notes: apt.clientNotes || '',
        }));

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.json({ success: true, data: [] });
    }
});

router.put('/appointments/:id/confirm', protect, async (req, res) => {
    try {
        const apt = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status: 'confirmed', professionalNotes: req.body.notes },
            { new: true }
        );
        res.json({ success: true, data: apt, message: 'Appointment confirmed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/appointments/:id/cancel', protect, async (req, res) => {
    try {
        const apt = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status: 'cancelled', cancellationReason: req.body.reason, cancelledBy: 'professional' },
            { new: true }
        );
        res.json({ success: true, data: apt, message: 'Appointment cancelled' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/appointments/:id/complete', protect, async (req, res) => {
    try {
        const apt = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status: 'completed', completedAt: new Date() },
            { new: true }
        );
        // Update gym-physio stats
        await GymPhysio.findOneAndUpdate(
            { user: req.user._id },
            { $inc: { completedBookings: 1 } }
        );
        res.json({ success: true, data: apt, message: 'Appointment completed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Notify patient when gym-physio accepts or rejects appointment
router.post('/appointments/:id/notify-patient', protect, async (req, res) => {
    try {
        const Notification = require('../models/Notification');
        const apt = await Appointment.findById(req.params.id)
            .populate({ path: 'client', populate: { path: 'user', select: '_id firstName lastName' } });

        if (!apt) return res.status(404).json({ success: false, message: 'Appointment not found' });

        const patientUserId = apt.client?.user?._id;
        if (!patientUserId) return res.status(400).json({ success: false, message: 'Patient user not found' });

        const gymPhysio = await GymPhysio.findOne({ user: req.user._id });
        const providerName = gymPhysio?.businessName || 'Your provider';

        const { message, type } = req.body;
        const isRejected = type === 'appointment_rejected';

        await Notification.create({
            user: patientUserId,
            title: isRejected ? 'Booking Request Declined' : 'Booking Confirmed',
            message: message || (isRejected
                ? `Your booking with ${providerName} has been declined.`
                : `Your booking with ${providerName} has been confirmed.`),
            type: isRejected ? 'application_status' : 'appointment',
            data: {
                appointmentId: apt._id,
                providerName,
                scheduledDate: apt.scheduledDate,
                scheduledTime: apt.scheduledTime,
            }
        });

        res.json({ success: true, message: 'Patient notified' });
    } catch (error) {
        console.error('Notify patient error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Schedule
router.get('/schedule', protect, async (req, res) => {
    try {
        const gymPhysio = await GymPhysio.findOne({ user: req.user._id });
        if (!gymPhysio) {
            return res.json({ success: true, data: {} });
        }

        let schedule = await Schedule.findOne({ professional: gymPhysio._id });
        
        if (!schedule) {
            const defaultDaySchedule = {
                isAvailable: false,
                timeSlots: []
            };
            
            schedule = await Schedule.create({
                professional: gymPhysio._id,
                monday: defaultDaySchedule,
                tuesday: defaultDaySchedule,
                wednesday: defaultDaySchedule,
                thursday: defaultDaySchedule,
                friday: defaultDaySchedule,
                saturday: defaultDaySchedule,
                sunday: defaultDaySchedule
            });
        }

        const scheduleData = {
            monday: schedule.monday || { isAvailable: false, timeSlots: [] },
            tuesday: schedule.tuesday || { isAvailable: false, timeSlots: [] },
            wednesday: schedule.wednesday || { isAvailable: false, timeSlots: [] },
            thursday: schedule.thursday || { isAvailable: false, timeSlots: [] },
            friday: schedule.friday || { isAvailable: false, timeSlots: [] },
            saturday: schedule.saturday || { isAvailable: false, timeSlots: [] },
            sunday: schedule.sunday || { isAvailable: false, timeSlots: [] }
        };

        res.json({ success: true, data: scheduleData });
    } catch (error) {
        console.error('Error fetching schedule:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/schedule/update', protect, async (req, res) => {
    try {
        const gymPhysio = await GymPhysio.findOne({ user: req.user._id });
        if (!gymPhysio) {
            return res.status(404).json({ success: false, message: 'Gym/Physio not found' });
        }

        const scheduleData = {
            professional: gymPhysio._id,
            monday: req.body.monday || { isAvailable: false, timeSlots: [] },
            tuesday: req.body.tuesday || { isAvailable: false, timeSlots: [] },
            wednesday: req.body.wednesday || { isAvailable: false, timeSlots: [] },
            thursday: req.body.thursday || { isAvailable: false, timeSlots: [] },
            friday: req.body.friday || { isAvailable: false, timeSlots: [] },
            saturday: req.body.saturday || { isAvailable: false, timeSlots: [] },
            sunday: req.body.sunday || { isAvailable: false, timeSlots: [] }
        };

        const schedule = await Schedule.findOneAndUpdate(
            { professional: gymPhysio._id },
            scheduleData,
            { new: true, upsert: true }
        );

        res.json({ 
            success: true, 
            data: schedule,
            message: 'Schedule updated successfully' 
        });
    } catch (error) {
        console.error('Error updating schedule:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Earnings & Payments
router.get('/earnings', protect, async (req, res) => {
    try {
        const gymPhysio = await GymPhysio.findOne({ user: req.user._id });
        if (!gymPhysio) return res.json({ success: true, data: { totalEarnings: 0, pendingPayments: 0, completedPayments: 0, platformFees: 0, netEarnings: 0 } });

        const completedApts = await Appointment.find({ gymPhysio: gymPhysio._id, status: 'completed' });
        const totalEarnings = completedApts.reduce((sum, apt) => sum + (apt.price || apt.amount || 0), 0);
        const platformFees = Math.round(totalEarnings * 0.1);
        const netEarnings = totalEarnings - platformFees;

        const pendingApts = await Appointment.find({ gymPhysio: gymPhysio._id, status: { $in: ['scheduled', 'confirmed'] } });
        const pendingPayments = pendingApts.reduce((sum, apt) => sum + (apt.price || apt.amount || 0), 0);

        res.json({ success: true, data: { totalEarnings, pendingPayments, completedPayments: totalEarnings, platformFees, netEarnings } });
    } catch (error) {
        res.json({ success: true, data: { totalEarnings: 0, pendingPayments: 0, completedPayments: 0, platformFees: 0, netEarnings: 0 } });
    }
});

// Analytics
router.get('/analytics', protect, async (req, res) => {
    try {
        const gymPhysio = await GymPhysio.findOne({ user: req.user._id });
        if (!gymPhysio) return res.json({ success: true, data: { totalBookings: 0, completionRate: 0, averageRating: 0, totalReviews: 0, activeServices: 0, popularServices: [] } });

        const activeServices = await Service.countDocuments({ professional: gymPhysio._id, status: 'active' });
        const services = await Service.find({ professional: gymPhysio._id }).sort({ bookingCount: -1 }).limit(5);
        const popularServices = services.map(s => ({
            serviceId: s._id,
            serviceName: s.title,
            bookings: s.bookingCount || 0,
            revenue: (s.bookingCount || 0) * (s.price || 0)
        }));

        const completionRate = gymPhysio.totalBookings > 0
            ? Math.round((gymPhysio.completedBookings / gymPhysio.totalBookings) * 100) : 0;

        res.json({
            success: true,
            data: {
                totalBookings: gymPhysio.totalBookings || 0,
                completedBookings: gymPhysio.completedBookings || 0,
                completionRate,
                averageRating: gymPhysio.averageRating || 0,
                totalReviews: gymPhysio.totalReviews || 0,
                activeServices,
                popularServices
            }
        });
    } catch (error) {
        res.json({ success: true, data: { totalBookings: 0, completionRate: 0, averageRating: 0, totalReviews: 0, activeServices: 0, popularServices: [] } });
    }
});

// Bank account settings
router.get('/bank-account', protect, async (req, res) => {
    try {
        const gymPhysio = await GymPhysio.findOne({ user: req.user._id });
        if (!gymPhysio) return res.status(404).json({ success: false, message: 'Profile not found' });
        res.json({ success: true, data: gymPhysio.bankAccount || {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/bank-account', protect, async (req, res) => {
    try {
        const { bankName, accountNumber, accountName, bankCode } = req.body;
        const gymPhysio = await GymPhysio.findOneAndUpdate(
            { user: req.user._id },
            { $set: { bankAccount: { bankName, accountNumber, accountName, bankCode } } },
            { new: true }
        );
        if (!gymPhysio) return res.status(404).json({ success: false, message: 'Profile not found' });
        res.json({ success: true, data: gymPhysio.bankAccount, message: 'Bank account saved' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Settings
router.get('/settings', protect, async (req, res) => {
    try {
        const gymPhysio = await GymPhysio.findOne({ user: req.user._id });
        if (!gymPhysio) return res.json({ success: true, data: { notifications: { email: true, sms: true, inApp: true }, privacy: { profileVisibility: 'public', showRatings: true } } });
        
        res.json({ 
            success: true, 
            data: { 
                notifications: { email: true, sms: true, inApp: true }, 
                privacy: { profileVisibility: 'public', showRatings: true },
                subscription: gymPhysio.subscription || { plan: 'none', status: 'none' }
            } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/settings/update', protect, async (req, res) => {
    res.json({ success: true, message: 'Settings updated' });
});

// Subscription endpoints
router.post('/subscribe', protect, async (req, res) => {
    try {
        const { plan, amount, transactionReference } = req.body;
        
        if (!['basic', 'professional', 'premium'].includes(plan)) {
            return res.status(400).json({ success: false, message: 'Invalid subscription plan' });
        }

        const gymPhysio = await GymPhysio.findOne({ user: req.user._id });
        if (!gymPhysio) {
            return res.status(404).json({ success: false, message: 'Gym/Physio profile not found' });
        }

        // Calculate end date based on plan
        const startDate = new Date();
        const endDate = new Date();
        
        if (plan === 'basic') {
            endDate.setMonth(endDate.getMonth() + 1); // 1 month
        } else if (plan === 'professional') {
            endDate.setMonth(endDate.getMonth() + 6); // 6 months
        } else if (plan === 'premium') {
            endDate.setFullYear(endDate.getFullYear() + 1); // 1 year
        }

        gymPhysio.subscription = {
            plan,
            status: 'active',
            startDate,
            endDate,
            amount,
            transactionReference
        };

        await gymPhysio.save();

        res.json({ 
            success: true, 
            message: 'Subscription activated successfully',
            data: gymPhysio.subscription 
        });
    } catch (error) {
        console.error('Subscription error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/subscription/status', protect, async (req, res) => {
    try {
        const gymPhysio = await GymPhysio.findOne({ user: req.user._id });
        if (!gymPhysio) {
            return res.json({ success: true, data: { plan: 'none', status: 'none' } });
        }

        // Check if subscription has expired
        if (gymPhysio.subscription?.endDate && new Date() > new Date(gymPhysio.subscription.endDate)) {
            gymPhysio.subscription.status = 'expired';
            await gymPhysio.save();
        }

        res.json({ 
            success: true, 
            data: gymPhysio.subscription || { plan: 'none', status: 'none' }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/payments/stats', protect, async (req, res) => {
    try {
        const gymPhysio = await GymPhysio.findOne({ user: req.user._id });
        if (!gymPhysio) {
            return res.json({ 
                success: true, 
                data: { 
                    totalTransactions: 0, 
                    completedPayments: 0, 
                    failedPayments: 0,
                    pendingPayments: 0,
                    totalEarnings: 0,
                    platformFees: 0,
                    netEarnings: 0
                } 
            });
        }

        const completedApts = await Appointment.find({ 
            gymPhysio: gymPhysio._id, 
            status: 'completed',
            paymentStatus: 'paid'
        });
        
        const pendingApts = await Appointment.find({ 
            gymPhysio: gymPhysio._id, 
            status: { $in: ['scheduled', 'confirmed'] },
            paymentStatus: { $in: ['pending', 'processing'] }
        });

        const failedApts = await Appointment.find({ 
            gymPhysio: gymPhysio._id, 
            paymentStatus: 'failed'
        });

        const totalEarnings = completedApts.reduce((sum, apt) => sum + (apt.consultationFee || apt.amount || 0), 0);
        const pendingPayments = pendingApts.reduce((sum, apt) => sum + (apt.consultationFee || apt.amount || 0), 0);
        const platformFees = Math.round(totalEarnings * 0.1);
        const netEarnings = totalEarnings - platformFees;

        res.json({ 
            success: true, 
            data: { 
                totalTransactions: completedApts.length + pendingApts.length + failedApts.length,
                completedPayments: completedApts.length,
                failedPayments: failedApts.length,
                pendingPayments: pendingApts.length,
                totalEarnings,
                platformFees,
                netEarnings
            } 
        });
    } catch (error) {
        console.error('Payment stats error:', error);
        res.json({ 
            success: true, 
            data: { 
                totalTransactions: 0, 
                completedPayments: 0, 
                failedPayments: 0,
                pendingPayments: 0,
                totalEarnings: 0,
                platformFees: 0,
                netEarnings: 0
            } 
        });
    }
});

router.get('/analytics/detailed', protect, async (req, res) => {
    try {
        const gymPhysio = await GymPhysio.findOne({ user: req.user._id });
        if (!gymPhysio) {
            return res.json({ 
                success: true, 
                data: { 
                    totalBookings: 0, 
                    completedBookings: 0,
                    cancelledBookings: 0,
                    completionRate: 0, 
                    averageRating: 0, 
                    totalReviews: 0, 
                    activeServices: 0,
                    totalRevenue: 0,
                    popularServices: [] 
                } 
            });
        }

        const activeServices = await Service.countDocuments({ 
            professional: gymPhysio._id, 
            status: 'active' 
        });
        
        const services = await Service.find({ professional: gymPhysio._id })
            .sort({ bookingCount: -1 })
            .limit(5);
        
        const popularServices = services.map(s => ({
            serviceId: s._id,
            serviceName: s.title,
            bookings: s.bookingCount || 0,
            revenue: (s.bookingCount || 0) * (s.price || 0),
            rating: s.rating || 0,
            completionRate: s.completionRate || 0
        }));

        const completionRate = gymPhysio.totalBookings > 0
            ? Math.round((gymPhysio.completedBookings / gymPhysio.totalBookings) * 100) : 0;

        res.json({
            success: true,
            data: {
                totalBookings: gymPhysio.totalBookings || 0,
                completedBookings: gymPhysio.completedBookings || 0,
                cancelledBookings: gymPhysio.cancelledBookings || 0,
                completionRate,
                averageRating: gymPhysio.averageRating || 0,
                totalReviews: gymPhysio.totalReviews || 0,
                activeServices,
                totalRevenue: gymPhysio.totalRevenue || 0,
                popularServices
            }
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.json({ 
            success: true, 
            data: { 
                totalBookings: 0, 
                completedBookings: 0,
                cancelledBookings: 0,
                completionRate: 0, 
                averageRating: 0, 
                totalReviews: 0, 
                activeServices: 0,
                totalRevenue: 0,
                popularServices: [] 
            } 
        });
    }
});

router.post('/change-password', protect, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
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

// Upload multiple service images
router.post('/services/upload-images', protect, upload.array('images', 5), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No files uploaded' });
        }
        
        const imageUrls = req.files.map(file => `/uploads/gym-physio/${file.filename}`);
        
        res.json({ 
            success: true, 
            data: { imageUrls },
            message: 'Images uploaded successfully' 
        });
    } catch (error) {
        console.error('Error uploading images:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
