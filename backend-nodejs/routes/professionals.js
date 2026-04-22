const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const Professional = require('../models/Professional');
const Service = require('../models/Service');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Schedule = require('../models/Schedule');
const BlockedDate = require('../models/BlockedDate');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/services');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'service-' + uniqueSuffix + path.extname(file.originalname));
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

// Debug endpoint
router.get('/debug/check-profile', protect, async (req, res) => {
    try {
        console.log('=== Debug Check Profile ===');
        console.log('User ID:', req.user._id);
        console.log('User object:', req.user);
        
        const professional = await Professional.findOne({ user: req.user._id });
        console.log('Professional found:', professional);
        
        res.json({
            success: true,
            data: {
                userId: req.user._id,
                professionalExists: !!professional,
                professional: professional
            }
        });
    } catch (error) {
        console.error('Debug error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Dashboard stats
router.get('/dashboard-stats', protect, async (req, res) => {
    try {
        const professional = await Professional.findOne({ user: req.user._id });
        res.json({
            success: true,
            data: {
                totalEarnings: 0,
                pendingPayments: 0,
                upcomingAppointments: professional ? Math.max(0, professional.totalAppointments - professional.completedAppointments) : 0,
                activeServices: 0,
                completionRate: professional && professional.totalAppointments > 0
                    ? Math.round((professional.completedAppointments / professional.totalAppointments) * 100) : 0,
                averageRating: professional ? professional.averageRating : 0,
                totalReviews: professional ? professional.totalReviews : 0,
                totalAppointments: professional ? professional.totalAppointments : 0,
                completedAppointments: professional ? professional.completedAppointments : 0,
            }
        });
    } catch (error) {
        res.json({ success: true, data: { totalEarnings: 0, pendingPayments: 0, upcomingAppointments: 0, activeServices: 0, completionRate: 0, averageRating: 0, totalReviews: 0, totalAppointments: 0, completedAppointments: 0 } });
    }
});

// Get professional profile
router.get('/profile', protect, async (req, res) => {
    try {
        const professional = await Professional.findOne({ user: req.user._id }).populate('user', '-password');
        if (!professional) {
            return res.status(404).json({ success: false, message: 'Professional profile not found' });
        }
        res.json({ success: true, data: professional });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update professional profile
router.put('/profile/update', protect, async (req, res) => {
    try {
        const professional = await Professional.findOneAndUpdate(
            { user: req.user._id },
            { $set: req.body },
            { new: true }
        );
        res.json({ success: true, data: professional, message: 'Profile updated successfully' });
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
        
        const photoUrl = `/uploads/services/${req.file.filename}`;
        
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
        
        const documentUrl = `/uploads/services/${req.file.filename}`;
        
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
        const professional = await Professional.findOne({ user: req.user._id });
        if (!professional) {
            return res.json({ success: true, data: [] });
        }
        
        const services = await Service.find({ professional: professional._id })
            .sort({ createdAt: -1 });
        
        // Format services for frontend
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

router.get('/services/:id', protect, async (req, res) => {
    try {
        const professional = await Professional.findOne({ user: req.user._id });
        if (!professional) {
            return res.status(404).json({ success: false, message: 'Professional not found' });
        }
        
        const service = await Service.findOne({ 
            _id: req.params.id, 
            professional: professional._id 
        });
        
        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }
        
        // Format service for frontend
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
        
        res.json({ success: true, data: formattedService });
    } catch (error) {
        console.error('Error fetching service:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/services/create', protect, async (req, res) => {
    try {
        console.log('=== Service Creation Request ===');
        console.log('User ID:', req.user._id);
        console.log('Request Body:', req.body);
        
        let professional = await Professional.findOne({ user: req.user._id });
        console.log('Professional found:', professional ? professional._id : 'NOT FOUND');
        
        // Auto-create professional profile if it doesn't exist
        if (!professional) {
            console.log('Auto-creating Professional profile for user:', req.user._id);
            professional = await Professional.create({
                user: req.user._id,
                professionalType: 'other',
                licenseNumber: '',
                specialization: '',
                yearsOfExperience: 0
            });
            console.log('Professional profile created:', professional._id);
        }
        
        // Validate required fields
        const requiredFields = ['title', 'description', 'category', 'price', 'duration'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            console.log('Missing required fields:', missingFields);
            return res.status(400).json({ 
                success: false, 
                message: `Missing required fields: ${missingFields.join(', ')}` 
            });
        }
        
        // Validate category
        const validCategories = ['consultation', 'procedure', 'therapy', 'diagnostic', 'emergency', 'other'];
        if (!validCategories.includes(req.body.category)) {
            console.log('Invalid category:', req.body.category);
            return res.status(400).json({ 
                success: false, 
                message: `Invalid category. Must be one of: ${validCategories.join(', ')}` 
            });
        }
        
        // Validate price and duration
        if (req.body.price < 0) {
            return res.status(400).json({ success: false, message: 'Price must be >= 0' });
        }
        
        if (req.body.duration < 15) {
            return res.status(400).json({ success: false, message: 'Duration must be >= 15 minutes' });
        }
        
        const serviceData = {
            professional: professional._id,
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            price: parseFloat(req.body.price),
            duration: parseInt(req.body.duration),
            status: req.body.status || 'active',
            images: req.body.images || [],
            tags: req.body.tags || [],
            availability: req.body.availability || 'available'
        };
        
        console.log('Service Data to save:', serviceData);
        
        const service = await Service.create(serviceData);
        console.log('Service created successfully:', service._id);
        
        // Format service for frontend
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
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/services/:id/update', protect, async (req, res) => {
    try {
        const professional = await Professional.findOne({ user: req.user._id });
        if (!professional) {
            return res.status(404).json({ success: false, message: 'Professional not found' });
        }
        
        const service = await Service.findOneAndUpdate(
            { _id: req.params.id, professional: professional._id },
            { $set: req.body },
            { new: true, runValidators: true }
        );
        
        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }
        
        // Format service for frontend
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
        
        res.json({ 
            success: true, 
            data: formattedService, 
            message: 'Service updated successfully' 
        });
    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/services/:id/delete', protect, async (req, res) => {
    try {
        const professional = await Professional.findOne({ user: req.user._id });
        if (!professional) {
            return res.status(404).json({ success: false, message: 'Professional not found' });
        }
        
        const service = await Service.findOneAndDelete({ 
            _id: req.params.id, 
            professional: professional._id 
        });
        
        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }
        
        res.json({ 
            success: true, 
            message: 'Service deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Appointments
router.get('/appointments', protect, async (req, res) => {
    try {
        const professional = await Professional.findOne({ user: req.user._id });
        if (!professional) return res.json({ success: true, data: [] });
        
        const appointments = await Appointment.find({ professional: professional._id })
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
            type: apt.consultationType || 'video',
            patient: {
                id: apt.client?._id,
                name: apt.client?.user ? 
                    `${apt.client.user.firstName} ${apt.client.user.lastName}`.trim() : 
                    'Patient',
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

router.put('/appointments/:id/confirm', protect, async (req, res) => {
    res.json({ success: true, message: 'Appointment confirmed' });
});

router.put('/appointments/:id/cancel', protect, async (req, res) => {
    res.json({ success: true, message: 'Appointment cancelled' });
});

router.put('/appointments/:id/complete', protect, async (req, res) => {
    res.json({ success: true, message: 'Appointment completed' });
});

router.put('/appointments/:id/reschedule', protect, async (req, res) => {
    res.json({ success: true, message: 'Appointment rescheduled' });
});

// Schedule
router.get('/schedule', protect, async (req, res) => {
    try {
        const professional = await Professional.findOne({ user: req.user._id });
        if (!professional) {
            return res.json({ success: true, data: {} });
        }

        let schedule = await Schedule.findOne({ professional: professional._id });
        
        // Create default schedule if doesn't exist
        if (!schedule) {
            const defaultDaySchedule = {
                isAvailable: false,
                timeSlots: []
            };
            
            schedule = await Schedule.create({
                professional: professional._id,
                monday: defaultDaySchedule,
                tuesday: defaultDaySchedule,
                wednesday: defaultDaySchedule,
                thursday: defaultDaySchedule,
                friday: defaultDaySchedule,
                saturday: defaultDaySchedule,
                sunday: defaultDaySchedule
            });
        }

        // Format response
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
        const professional = await Professional.findOne({ user: req.user._id });
        if (!professional) {
            return res.status(404).json({ success: false, message: 'Professional not found' });
        }

        const scheduleData = {
            professional: professional._id,
            monday: req.body.monday || { isAvailable: false, timeSlots: [] },
            tuesday: req.body.tuesday || { isAvailable: false, timeSlots: [] },
            wednesday: req.body.wednesday || { isAvailable: false, timeSlots: [] },
            thursday: req.body.thursday || { isAvailable: false, timeSlots: [] },
            friday: req.body.friday || { isAvailable: false, timeSlots: [] },
            saturday: req.body.saturday || { isAvailable: false, timeSlots: [] },
            sunday: req.body.sunday || { isAvailable: false, timeSlots: [] }
        };

        const schedule = await Schedule.findOneAndUpdate(
            { professional: professional._id },
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

router.get('/schedule/blocked-dates', protect, async (req, res) => {
    try {
        const professional = await Professional.findOne({ user: req.user._id });
        if (!professional) {
            return res.json({ success: true, data: [] });
        }

        const blockedDates = await BlockedDate.find({ professional: professional._id })
            .sort({ date: 1 });

        const data = blockedDates.map(blocked => ({
            id: blocked._id,
            date: blocked.date,
            reason: blocked.reason,
            createdAt: blocked.createdAt
        }));

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching blocked dates:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/schedule/block-date', protect, async (req, res) => {
    try {
        const professional = await Professional.findOne({ user: req.user._id });
        if (!professional) {
            return res.status(404).json({ success: false, message: 'Professional not found' });
        }

        const { date, reason } = req.body;

        if (!date || !reason) {
            return res.status(400).json({ 
                success: false, 
                message: 'Date and reason are required' 
            });
        }

        const blockedDate = await BlockedDate.create({
            professional: professional._id,
            date: new Date(date),
            reason
        });

        res.status(201).json({ 
            success: true, 
            data: {
                id: blockedDate._id,
                date: blockedDate.date,
                reason: blockedDate.reason,
                createdAt: blockedDate.createdAt
            },
            message: 'Date blocked successfully' 
        });
    } catch (error) {
        console.error('Error blocking date:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/schedule/blocked-dates/:id', protect, async (req, res) => {
    try {
        const professional = await Professional.findOne({ user: req.user._id });
        if (!professional) {
            return res.status(404).json({ success: false, message: 'Professional not found' });
        }

        const blockedDate = await BlockedDate.findOneAndDelete({
            _id: req.params.id,
            professional: professional._id
        });

        if (!blockedDate) {
            return res.status(404).json({ success: false, message: 'Blocked date not found' });
        }

        res.json({ 
            success: true, 
            message: 'Date unblocked successfully' 
        });
    } catch (error) {
        console.error('Error unblocking date:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Earnings & Payments
router.get('/earnings', protect, async (req, res) => {
    res.json({ success: true, data: { totalEarnings: 0, pendingPayments: 0, completedPayments: 0, platformFees: 0, netEarnings: 0 } });
});

router.get('/payments', protect, async (req, res) => {
    res.json({ success: true, data: [] });
});

// Analytics
router.get('/analytics', protect, async (req, res) => {
    res.json({ success: true, data: { totalAppointments: 0, completionRate: 0, averageRating: 0, totalReviews: 0, responseTime: 0, popularServices: [] } });
});

// Applications (job applications)
router.get('/applications', protect, async (req, res) => {
    res.json({ success: true, data: [] });
});

// Settings
router.get('/settings', protect, async (req, res) => {
    res.json({ success: true, data: { notifications: { email: true, sms: true, inApp: true, jobAlerts: true }, privacy: { profileVisibility: 'public', showRatings: true } } });
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
