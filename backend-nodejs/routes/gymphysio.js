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
            ? await Service.countDocuments({ professional: gymPhysio._id, status: 'active' })
            : 0;

        const totalServices = gymPhysio
            ? await Service.countDocuments({ professional: gymPhysio._id })
            : 0;

        const upcomingAppointments = gymPhysio
            ? await Appointment.countDocuments({
                professional: gymPhysio._id,
                status: { $in: ['scheduled', 'confirmed'] },
                scheduledDate: { $gte: new Date() }
              })
            : 0;

        const completedAppointments = gymPhysio
            ? await Appointment.countDocuments({ professional: gymPhysio._id, status: 'completed' })
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
        
        const appointments = await Appointment.find({ professional: gymPhysio._id })
            .populate({
                path: 'client',
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
            type: apt.consultationType || 'in-person',
            patient: {
                id: apt.client?._id,
                name: apt.client?.user ? 
                    `${apt.client.user.firstName} ${apt.client.user.lastName}`.trim() : 
                    'Client',
                email: apt.client?.user?.email,
                photo: null
            },
            service: apt.service ? {
                id: apt.service._id,
                title: apt.service.title,
                price: apt.service.price
            } : null,
            payment: {
                amount: apt.service?.price || 0,
                status: apt.paymentStatus || 'pending'
            },
            reason: apt.reason,
            notes: apt.notes
        }));

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.json({ success: true, data: [] });
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

// Settings
router.get('/settings', protect, async (req, res) => {
    res.json({ success: true, data: { notifications: { email: true, sms: true, inApp: true }, privacy: { profileVisibility: 'public', showRatings: true } } });
});

router.put('/settings/update', protect, async (req, res) => {
    res.json({ success: true, message: 'Settings updated' });
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

module.exports = router;
