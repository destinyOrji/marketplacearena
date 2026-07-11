const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const { requireVerification } = require('../middleware/requireVerification');
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
router.get('/dashboard-stats', protect, requireVerification, async (req, res) => {
    try {
        const professional = await Professional.findOne({ user: req.user._id });
        const activeServices = professional ? await Service.countDocuments({ professional: professional._id, status: 'active' }) : 0;
        const upcomingAppointments = professional ? await Appointment.countDocuments({
            professional: professional._id,
            status: { $in: ['scheduled', 'confirmed'] },
            scheduledDate: { $gte: new Date() }
        }) : 0;

        res.json({
            success: true,
            data: {
                totalEarnings: 0,
                pendingPayments: 0,
                upcomingAppointments,
                activeServices,
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
        
        // Calculate profile completion percentage dynamically
        let completionPercentage = 0;
        
        // Basic fields (30%)
        let basicFieldsScore = 0;
        if (professional.professionalType && professional.professionalType !== 'other') basicFieldsScore += 5;
        if (professional.licenseNumber && professional.licenseNumber.trim() !== '') basicFieldsScore += 5;
        if (professional.specialization && professional.specialization.trim() !== '') basicFieldsScore += 5;
        if (professional.phone && professional.phone.trim() !== '') basicFieldsScore += 5;
        if (professional.bio && professional.bio.trim() !== '') basicFieldsScore += 5;
        if (professional.yearsOfExperience > 0) basicFieldsScore += 5;
        completionPercentage += basicFieldsScore;
        
        // Contact & Location (15%)
        let locationScore = 0;
        if (professional.address && professional.address.trim() !== '') locationScore += 5;
        if (professional.city && professional.city.trim() !== '') locationScore += 5;
        if (professional.state && professional.state.trim() !== '') locationScore += 5;
        completionPercentage += locationScore;
        
        // Professional Details (25%)
        let professionalDetailsScore = 0;
        if (professional.qualifications && professional.qualifications.length > 0) professionalDetailsScore += 10;
        if (professional.certifications && professional.certifications.length > 0) professionalDetailsScore += 10;
        if (professional.skills && professional.skills.length > 0) professionalDetailsScore += 5;
        completionPercentage += professionalDetailsScore;
        
        // Documents (15%)
        let documentsScore = 0;
        if (professional.licenseDocument && professional.licenseDocument.trim() !== '') documentsScore += 5;
        if (professional.profilePicture && professional.profilePicture.trim() !== '') documentsScore += 5;
        if (professional.resumeFile && professional.resumeFile.trim() !== '') documentsScore += 5;
        completionPercentage += documentsScore;
        
        // Consultation Fee (5%)
        if (professional.consultationFee && professional.consultationFee > 0) {
            completionPercentage += 5;
        }
        
        // Verification Status (10% bonus)
        if (professional.isVerified) {
            completionPercentage += 10;
        }
        
        // Ensure percentage is between 0 and 100
        completionPercentage = Math.min(100, Math.max(0, completionPercentage));
        
        // Format response to match frontend expectations
        const professionalData = {
            id: professional._id,
            userId: professional.user._id,
            email: professional.user.email,
            firstName: professional.user.firstName,
            lastName: professional.user.lastName,
            fullName: `${professional.user.firstName} ${professional.user.lastName}`,
            role: professional.user.role,
            professionalType: professional.professionalType,
            licenseNumber: professional.licenseNumber,
            specialization: professional.specialization,
            yearsOfExperience: professional.yearsOfExperience,
            qualifications: professional.qualifications,
            certifications: professional.certifications,
            skills: professional.skills,
            bio: professional.bio,
            phone: professional.phone,
            address: professional.address,
            city: professional.city,
            state: professional.state,
            country: professional.country,
            isVerified: professional.isVerified,
            verificationStatus: professional.user.verificationStatus || (professional.isVerified ? 'verified' : 'pending'),
            verificationDate: professional.verificationDate,
            isAvailable: professional.isAvailable,
            consultationFee: professional.consultationFee,
            currency: professional.currency,
            averageRating: professional.averageRating,
            rating: professional.averageRating,
            totalReviews: professional.totalReviews,
            reviewCount: professional.totalReviews,
            profilePicture: professional.profilePicture,
            completionPercentage: completionPercentage, // Add calculated completion percentage
            createdAt: professional.createdAt,
            updatedAt: professional.updatedAt
        };
        
        res.json({ success: true, data: professionalData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update professional profile
router.put('/profile/update', protect, async (req, res) => {
    try {
        // Whitelist only safe fields - prevent mass assignment
        const allowedFields = [
            'firstName', 'lastName', 'phone', 'bio', 'specialization',
            'professionalType', 'yearsOfExperience', 'languages',
            'location', 'address', 'city', 'state', 'country',
            'consultationFee', 'currency', 'availableForConsultation',
            'profilePicture', 'education', 'certifications', 'skills',
            'consultationType', 'licenseNumber', 'licenseExpiry'
        ];

        const updateData = {};
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        const professional = await Professional.findOneAndUpdate(
            { user: req.user._id },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!professional) {
            return res.status(404).json({ success: false, message: 'Professional profile not found' });
        }

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
            consultationType: service.consultationType || [],
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
            consultationType: service.consultationType || [],
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
        
        // Force status to 'pending' for new services - admin must approve
        const serviceData = {
            professional: professional._id,
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            price: parseFloat(req.body.price),
            duration: parseInt(req.body.duration),
            status: 'pending', // Always pending for new services
            images: req.body.images || [],
            tags: req.body.tags || [],
            consultationType: req.body.consultationType || [],
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
            consultationType: service.consultationType || [],
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
            message: 'Service created and pending admin approval' 
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
        
        // Get the current service to check its status
        const currentService = await Service.findOne({ 
            _id: req.params.id, 
            professional: professional._id 
        });
        
        if (!currentService) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }
        
        // Prepare update data
        const updateData = { ...req.body };
        
        // Prevent professionals from setting status to 'active' - only admin can approve
        // Professionals can only toggle between 'inactive' (paused) and their current status
        if (updateData.status) {
            if (updateData.status === 'active' && currentService.status !== 'active') {
                // If trying to set to active when not already active, reject
                delete updateData.status; // Remove status from update
            } else if (updateData.status === 'inactive' && currentService.status === 'active') {
                // Allow pausing an active service
                updateData.status = 'inactive';
            } else if (updateData.status === 'active' && currentService.status === 'inactive') {
                // Allow resuming a paused service (if it was previously approved)
                updateData.status = 'active';
            } else if (updateData.status === 'pending') {
                // Don't allow changing back to pending
                delete updateData.status;
            }
        }
        
        const service = await Service.findOneAndUpdate(
            { _id: req.params.id, professional: professional._id },
            { $set: updateData },
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
            consultationType: service.consultationType || req.body.consultationType || [],
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
            .sort({ scheduledDate: -1 });

        const data = appointments.map(apt => ({
            id: apt._id,
            date: apt.scheduledDate,
            time: apt.scheduledTime || '10:00',
            status: apt.status,
            type: apt.appointmentMode || 'in_person',
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
            } : { id: '', title: apt.reasonForVisit || 'Consultation', price: apt.consultationFee || 0 },
            payment: {
                amount: apt.consultationFee || apt.service?.price || 0,
                status: apt.paymentStatus || 'pending'
            },
            reason: apt.reasonForVisit || '',
            notes: apt.clientNotes || ''
        }));

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.json({ success: true, data: [] });
    }
});

router.put('/appointments/:id/confirm', protect, async (req, res) => {
    try {
        const apt = await Appointment.findByIdAndUpdate(req.params.id, { status: 'confirmed', notes: req.body.notes }, { new: true });
        res.json({ success: true, data: apt, message: 'Appointment confirmed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/appointments/:id/cancel', protect, async (req, res) => {
    try {
        const apt = await Appointment.findByIdAndUpdate(req.params.id, { status: 'cancelled', cancellationReason: req.body.reason }, { new: true });
        res.json({ success: true, data: apt, message: 'Appointment cancelled' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/appointments/:id/complete', protect, async (req, res) => {
    try {
        const apt = await Appointment.findByIdAndUpdate(req.params.id, { status: 'completed' }, { new: true });
        // Update professional stats
        await Professional.findOneAndUpdate({ user: req.user._id }, { $inc: { completedAppointments: 1 } });
        res.json({ success: true, data: apt, message: 'Appointment completed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/appointments/:id/reschedule', protect, async (req, res) => {
    try {
        const apt = await Appointment.findByIdAndUpdate(req.params.id, { scheduledDate: req.body.date, scheduledTime: req.body.time, status: 'scheduled' }, { new: true });
        res.json({ success: true, data: apt, message: 'Appointment rescheduled' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Notify patient when professional accepts or rejects appointment
router.post('/appointments/:id/notify-patient', protect, async (req, res) => {
    try {
        const Notification = require('../models/Notification');
        const Client = require('../models/Client');

        const apt = await Appointment.findById(req.params.id)
            .populate({ path: 'client', populate: { path: 'user', select: '_id firstName lastName' } })
            .populate('service', 'title');

        if (!apt) return res.status(404).json({ success: false, message: 'Appointment not found' });

        const patientUserId = apt.client?.user?._id;
        if (!patientUserId) return res.status(400).json({ success: false, message: 'Patient user not found' });

        const professional = await Professional.findOne({ user: req.user._id }).populate('user', 'firstName lastName');
        const providerName = professional?.user
            ? `${professional.user.firstName} ${professional.user.lastName}`
            : 'Your healthcare provider';

        const { message, type } = req.body;
        const notifType = type === 'appointment_rejected' ? 'application_status' : 'appointment';
        const title = type === 'appointment_rejected'
            ? 'Appointment Request Declined'
            : 'Appointment Confirmed';

        await Notification.create({
            user: patientUserId,
            title,
            message: message || (type === 'appointment_rejected'
                ? `Your appointment with ${providerName} has been declined.`
                : `Your appointment with ${providerName} has been confirmed.`),
            type: notifType,
            data: {
                appointmentId: apt._id,
                serviceTitle: apt.service?.title || 'Consultation',
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
    try {
        const professional = await Professional.findOne({ user: req.user._id });
        if (!professional) return res.json({ success: true, data: { totalEarnings: 0, pendingPayments: 0, completedPayments: 0, platformFees: 0, netEarnings: 0 } });

        const appointments = await Appointment.find({ professional: professional._id, status: 'completed' });
        const totalEarnings = appointments.reduce((sum, apt) => sum + (apt.consultationFee || 0), 0);
        const platformFees = totalEarnings * 0.1; // 10% platform fee
        const netEarnings = totalEarnings - platformFees;

        const pendingApts = await Appointment.find({ professional: professional._id, status: { $in: ['scheduled', 'confirmed'] } });
        const pendingPayments = pendingApts.reduce((sum, apt) => sum + (apt.consultationFee || 0), 0);

        res.json({
            success: true,
            data: {
                totalEarnings,
                pendingPayments,
                completedPayments: totalEarnings,
                platformFees,
                netEarnings
            }
        });
    } catch (error) {
        res.json({ success: true, data: { totalEarnings: 0, pendingPayments: 0, completedPayments: 0, platformFees: 0, netEarnings: 0 } });
    }
});

router.get('/payments', protect, async (req, res) => {
    try {
        const professional = await Professional.findOne({ user: req.user._id });
        if (!professional) return res.json({ success: true, data: [] });

        const appointments = await Appointment.find({ professional: professional._id, status: 'completed' })
            .populate({ path: 'client', populate: { path: 'user', select: 'firstName lastName' } })
            .populate('service', 'title price')
            .sort({ updatedAt: -1 })
            .limit(50);

        const data = appointments.map(apt => ({
            id: apt._id,
            date: apt.updatedAt || apt.scheduledDate,
            patient: apt.client?.user ? `${apt.client.user.firstName} ${apt.client.user.lastName}` : 'Patient',
            service: apt.service?.title || 'Consultation',
            grossAmount: apt.service?.price || apt.price || 0,
            platformFee: Math.round((apt.service?.price || apt.price || 0) * 0.1),
            netAmount: Math.round((apt.service?.price || apt.price || 0) * 0.9),
            status: 'completed',
        }));

        res.json({ success: true, data });
    } catch (error) {
        res.json({ success: true, data: [] });
    }
});

// Analytics
router.get('/analytics', protect, async (req, res) => {
    try {
        const Appointment = require('../models/Appointment');
        const professional = await Professional.findOne({ user: req.user._id });
        if (!professional) return res.json({ success: true, data: { totalAppointments: 0, completedAppointments: 0, cancelledAppointments: 0, completionRate: 0, averageRating: 0, totalReviews: 0, totalRevenue: 0, responseTime: 0, popularServices: [] } });

        const { period = 'month' } = req.query;
        const now = new Date();
        const cutoff = new Date();
        if (period === 'week') cutoff.setDate(now.getDate() - 7);
        else if (period === 'month') cutoff.setMonth(now.getMonth() - 1);
        else if (period === 'quarter') cutoff.setMonth(now.getMonth() - 3);
        else cutoff.setFullYear(now.getFullYear() - 1);

        const periodQuery = { professional: professional._id, createdAt: { $gte: cutoff } };

        const [totalAppointments, completedAppointments, cancelledAppointments, paidApts] = await Promise.all([
            Appointment.countDocuments(periodQuery),
            Appointment.countDocuments({ ...periodQuery, status: 'completed' }),
            Appointment.countDocuments({ ...periodQuery, status: 'cancelled' }),
            Appointment.find({ ...periodQuery, status: 'completed', paymentStatus: 'paid' }),
        ]);

        const totalRevenue = paidApts.reduce((sum, a) => sum + (a.consultationFee || 0), 0);
        const completionRate = totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 0;

        // Popular services by actual appointments in period
        const services = await Service.find({ professional: professional._id });
        const popularServicesRaw = await Promise.all(services.map(async (s) => {
            const serviceBookings = await Appointment.countDocuments({ ...periodQuery, service: s._id });
            const serviceApts = await Appointment.find({ ...periodQuery, service: s._id, status: 'completed', paymentStatus: 'paid' });
            const serviceRevenue = serviceApts.reduce((sum, a) => sum + (a.consultationFee || 0), 0);
            return { serviceId: s._id, serviceName: s.title, bookings: serviceBookings, revenue: serviceRevenue };
        }));
        const popularServices = popularServicesRaw.filter(s => s.bookings > 0).sort((a, b) => b.bookings - a.bookings).slice(0, 5);
        // Fallback: if no appointments yet, use service bookingCount
        const fallbackServices = services.sort((a, b) => (b.bookingCount || 0) - (a.bookingCount || 0)).slice(0, 5)
            .map(s => ({ serviceId: s._id, serviceName: s.title, bookings: s.bookingCount || 0, revenue: (s.bookingCount || 0) * (s.price || 0) }));

        res.json({
            success: true,
            data: {
                totalAppointments,
                completedAppointments,
                cancelledAppointments,
                completionRate,
                averageRating: professional.averageRating || 0,
                totalReviews: professional.totalReviews || 0,
                totalRevenue,
                responseTime: 2,
                popularServices: popularServices.length > 0 ? popularServices : fallbackServices,
            }
        });
    } catch (error) {
        console.error('Professional analytics error:', error);
        res.json({ success: true, data: { totalAppointments: 0, completedAppointments: 0, cancelledAppointments: 0, completionRate: 0, averageRating: 0, totalReviews: 0, totalRevenue: 0, responseTime: 0, popularServices: [] } });
    }
});

// Applications (job applications)
router.get('/applications', protect, async (req, res) => {
    try {
        const JobApplication = require('../models/JobApplication');
        const professional = await Professional.findOne({ user: req.user._id });
        if (!professional) return res.json({ success: true, data: [] });

        const applications = await JobApplication.find({ professional: professional._id })
            .populate({
                path: 'job',
                populate: { path: 'hospital', select: 'hospitalName address' }
            })
            .sort({ createdAt: -1 });

        const data = applications.map(app => ({
            id: app._id,
            status: app.status,
            coverLetter: app.coverLetter,
            appliedDate: app.createdAt,
            reviewedAt: app.reviewedAt,
            reviewNotes: app.reviewNotes,
            job: {
                id: app.job?._id,
                title: app.job?.jobTitle || 'N/A',
                specialty: app.job?.department || '',
                location: [app.job?.hospital?.address?.city, app.job?.hospital?.address?.state].filter(Boolean).join(', ') || 'On-site',
                jobType: (app.job?.employmentType || 'full_time').replace(/_/g, '-'),
                hospitalName: app.job?.hospital?.hospitalName || '',
                compensation: {
                    type: app.job?.salaryRangeMin ? 'fixed' : 'negotiable',
                    amount: app.job?.salaryRangeMin
                }
            }
        }));

        res.json({ success: true, data });
    } catch (error) {
        console.error('Get applications error:', error);
        res.json({ success: true, data: [] });
    }
});

// Bank account settings
router.get('/bank-account', protect, async (req, res) => {
    try {
        const professional = await Professional.findOne({ user: req.user._id });
        if (!professional) return res.status(404).json({ success: false, message: 'Professional not found' });
        res.json({ success: true, data: professional.bankAccount || {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/bank-account', protect, async (req, res) => {
    try {
        const { bankName, accountNumber, accountName, bankCode } = req.body;
        const professional = await Professional.findOneAndUpdate(
            { user: req.user._id },
            { $set: { bankAccount: { bankName, accountNumber, accountName, bankCode } } },
            { new: true }
        );
        if (!professional) return res.status(404).json({ success: false, message: 'Professional not found' });
        res.json({ success: true, data: professional.bankAccount, message: 'Bank account saved' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/settings/update', protect, async (req, res) => {
    res.json({ success: true, message: 'Settings updated' });
});

// Patient Records — completed appointments from the professional's perspective
router.get('/patient-records', protect, async (req, res) => {
    try {
        const professional = await Professional.findOne({ user: req.user._id });
        if (!professional) return res.json({ success: true, data: [] });

        const { search, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = {
            professional: professional._id,
            status: 'completed',
        };

        const appointments = await Appointment.find(query)
            .populate({
                path: 'client',
                populate: { path: 'user', select: 'firstName lastName email phone' }
            })
            .populate('service', 'title category price')
            .sort({ scheduledDate: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Appointment.countDocuments(query);

        const data = appointments
            .map(apt => {
                const patientName = apt.client?.user
                    ? `${apt.client.user.firstName} ${apt.client.user.lastName}`.trim()
                    : 'Patient';
                const patientEmail = apt.client?.user?.email || '';
                const patientPhone = apt.client?.user?.phone || '';

                return {
                    id: apt._id,
                    date: apt.scheduledDate || apt.createdAt,
                    patient: {
                        id: apt.client?._id,
                        name: patientName,
                        email: patientEmail,
                        phone: patientPhone,
                        initials: patientName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase(),
                    },
                    service: apt.service?.title || apt.reasonForVisit || 'Consultation',
                    serviceCategory: apt.service?.category || '',
                    diagnosis: apt.reasonForVisit || 'General Consultation',
                    notes: apt.professionalNotes || apt.clientNotes || '',
                    prescription: apt.prescription || [],
                    appointmentMode: apt.appointmentMode || 'in_person',
                    fee: apt.consultationFee || apt.service?.price || 0,
                    paymentStatus: apt.paymentStatus || 'pending',
                };
            })
            .filter(r => {
                if (!search) return true;
                const q = search.toLowerCase();
                return r.patient.name.toLowerCase().includes(q)
                    || r.diagnosis.toLowerCase().includes(q)
                    || r.service.toLowerCase().includes(q)
                    || r.notes.toLowerCase().includes(q);
            });

        res.json({
            success: true,
            data,
            pagination: { page: parseInt(page), limit: parseInt(limit), total },
        });
    } catch (error) {
        console.error('Patient records error:', error);
        res.json({ success: true, data: [], pagination: { page: 1, limit: 20, total: 0 } });
    }
});

// Add/update professional notes on a completed appointment
router.put('/patient-records/:id/notes', protect, async (req, res) => {
    try {
        const professional = await Professional.findOne({ user: req.user._id });
        if (!professional) return res.status(404).json({ success: false, message: 'Professional not found' });

        const apt = await Appointment.findOneAndUpdate(
            { _id: req.params.id, professional: professional._id },
            { $set: { professionalNotes: req.body.notes, prescription: req.body.prescription || [] } },
            { new: true }
        );

        if (!apt) return res.status(404).json({ success: false, message: 'Record not found' });

        res.json({ success: true, message: 'Notes saved', data: apt });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Settings
router.get('/settings', protect, async (req, res) => {
    res.json({ success: true, data: { notifications: { email: true, sms: true, inApp: true, jobAlerts: true }, privacy: { profileVisibility: 'public', showRatings: true } } });
});

// Change password
router.post('/change-password', protect, async (req, res) => {
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

// ─── Additional routes for full frontend compatibility ────────────────────────

// Profile password change (PUT /professionals/profile/password)
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

// Job-applications alias (frontend calls /job-applications instead of /applications)
router.get('/job-applications', protect, async (req, res) => {
    try {
        const JobApplication = require('../models/JobApplication');
        const professional = await Professional.findOne({ user: req.user._id });
        if (!professional) return res.json({ success: true, data: [] });

        const applications = await JobApplication.find({ professional: professional._id })
            .populate({
                path: 'job',
                populate: { path: 'hospital', select: 'hospitalName address' }
            })
            .sort({ createdAt: -1 });

        const data = applications.map(app => ({
            id: app._id,
            status: app.status,
            coverLetter: app.coverLetter,
            appliedDate: app.createdAt,
            reviewedAt: app.reviewedAt,
            reviewNotes: app.reviewNotes,
            offerDetails: app.offerDetails || null,
            job: {
                id: app.job?._id,
                title: app.job?.jobTitle || 'N/A',
                specialty: app.job?.department || '',
                location: [app.job?.hospital?.address?.city, app.job?.hospital?.address?.state].filter(Boolean).join(', ') || 'On-site',
                jobType: (app.job?.employmentType || 'full_time').replace(/_/g, '-'),
                hospitalName: app.job?.hospital?.hospitalName || '',
                compensation: {
                    type: app.job?.salaryRangeMin ? 'fixed' : 'negotiable',
                    amount: app.job?.salaryRangeMin
                }
            }
        }));

        res.json({ success: true, data });
    } catch (error) {
        console.error('Get job-applications error:', error);
        res.json({ success: true, data: [] });
    }
});

// Accept job offer (PUT /professionals/job-applications/:id/accept)
router.put('/job-applications/:id/accept', protect, async (req, res) => {
    try {
        const JobApplication = require('../models/JobApplication');
        const app = await JobApplication.findByIdAndUpdate(
            req.params.id,
            { status: 'accepted', acceptedAt: new Date() },
            { new: true }
        );
        if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
        res.json({ success: true, data: app, message: 'Offer accepted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Decline job offer (PUT /professionals/job-applications/:id/decline)
router.put('/job-applications/:id/decline', protect, async (req, res) => {
    try {
        const JobApplication = require('../models/JobApplication');
        const app = await JobApplication.findByIdAndUpdate(
            req.params.id,
            { status: 'declined', declinedAt: new Date(), declineReason: req.body.reason || '' },
            { new: true }
        );
        if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
        res.json({ success: true, data: app, message: 'Offer declined' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get approved/accepted jobs with full details (GET /professionals/approved-jobs)
router.get('/approved-jobs', protect, async (req, res) => {
    try {
        const JobApplication = require('../models/JobApplication');
        const professional = await Professional.findOne({ user: req.user._id });
        
        if (!professional) {
            return res.json({ 
                success: true, 
                data: [] 
            });
        }

        // Find all accepted job applications with full details
        const acceptedApplications = await JobApplication.find({ 
            professional: professional._id,
            status: 'accepted'
        })
        .populate({
            path: 'job',
            populate: {
                path: 'hospital',
                select: 'hospitalName registrationNumber phone email website address operatingHours emergencyServices'
            }
        })
        .sort({ updatedAt: -1 });

        // Format the data with all relevant information
        const approvedJobs = acceptedApplications.map(app => {
            const job = app.job;
            const hospital = job?.hospital;
            
            return {
                applicationId: app._id,
                applicationDate: app.createdAt,
                acceptedDate: app.updatedAt,
                reviewNotes: app.reviewNotes || '',
                
                // Onboarding details
                onboarding: app.onboarding || {},
                
                // Job details
                jobId: job?._id,
                jobTitle: job?.jobTitle || 'N/A',
                department: job?.department || '',
                jobDescription: job?.jobDescription || '',
                employmentType: job?.employmentType || 'full_time',
                experienceLevel: job?.experienceLevel || '',
                
                // Compensation
                salaryRangeMin: job?.salaryRangeMin || 0,
                salaryRangeMax: job?.salaryRangeMax || 0,
                salaryCurrency: job?.salaryCurrency || 'NGN',
                benefits: job?.benefits || [],
                
                // Hospital details
                hospitalId: hospital?._id,
                hospitalName: hospital?.hospitalName || '',
                hospitalRegistrationNumber: hospital?.registrationNumber || '',
                hospitalPhone: hospital?.phone || '',
                hospitalEmail: hospital?.email || '',
                hospitalWebsite: hospital?.website || '',
                
                // Hospital address
                address: {
                    street: hospital?.address?.street || '',
                    city: hospital?.address?.city || '',
                    state: hospital?.address?.state || '',
                    country: hospital?.address?.country || '',
                    zipCode: hospital?.address?.zipCode || '',
                    fullAddress: [
                        hospital?.address?.street,
                        hospital?.address?.city,
                        hospital?.address?.state,
                        hospital?.address?.zipCode,
                        hospital?.address?.country
                    ].filter(Boolean).join(', ')
                },
                
                // Operating hours
                operatingHours: hospital?.operatingHours || {},
                emergencyServices: hospital?.emergencyServices || false,
                
                // Job posting details
                applicationDeadline: job?.applicationDeadline || null,
                numberOfPositions: job?.numberOfPositions || 1,
                requiredQualifications: job?.requiredQualifications || [],
            };
        });

        res.json({ 
            success: true, 
            data: approvedJobs 
        });
    } catch (error) {
        console.error('Get approved jobs error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Payments list (GET /professionals/payments)
router.get('/payments', protect, async (req, res) => {
    try {
        const professional = await Professional.findOne({ user: req.user._id });
        if (!professional) return res.json({ success: true, data: [] });

        const completedApts = await Appointment.find({
            professional: professional._id,
            status: 'completed',
            paymentStatus: 'paid',
        })
            .populate({ path: 'client', populate: { path: 'user', select: 'firstName lastName' } })
            .populate('service', 'title')
            .sort({ completedAt: -1 });

        const data = completedApts.map(apt => {
            const gross = apt.consultationFee || 0;
            const fee = Math.round(gross * 0.10);
            return {
                _id: apt._id,
                date: apt.completedAt || apt.scheduledDate,
                patient: apt.client?.user ? `${apt.client.user.firstName} ${apt.client.user.lastName}`.trim() : 'Patient',
                service: apt.service?.title || apt.reasonForVisit || 'Consultation',
                grossAmount: gross,
                amount: gross,
                platformFee: fee,
                netAmount: gross - fee,
                status: 'completed',
                transactionId: apt.transactionId || '',
            };
        });

        res.json({ success: true, data });
    } catch (error) {
        console.error('Professional payments error:', error);
        res.json({ success: true, data: [] });
    }
});

module.exports = router;
