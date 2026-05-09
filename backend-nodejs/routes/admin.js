const express = require('express');
const adminAuthController = require('../controllers/admin/authController');
const adminDashboardController = require('../controllers/admin/dashboardController');
const adminPatientsController = require('../controllers/admin/patientsController');
const adminProfessionalsController = require('../controllers/admin/professionalsController');
const adminHospitalsController = require('../controllers/admin/hospitalsController');
const adminAmbulancesController = require('../controllers/admin/ambulancesController');
const adminGymPhysioController = require('../controllers/admin/gymPhysioController');
const { adminAuth } = require('../middleware/adminAuth');

const router = express.Router();

// Admin Authentication Routes
router.post('/auth/register', adminAuthController.register);
router.post('/auth/login', adminAuthController.login);
router.post('/auth/logout', adminAuth, adminAuthController.logout);
router.post('/auth/refresh', adminAuthController.refreshToken);
router.get('/auth/profile', adminAuth, adminAuthController.getProfile);

// Dashboard Routes
router.get('/dashboard/stats', adminAuth, adminDashboardController.getStats);
router.get('/dashboard/registration-trends', adminAuth, adminDashboardController.getRegistrationTrends);
router.get('/dashboard/appointment-stats', adminAuth, adminDashboardController.getAppointmentStats);
router.get('/dashboard/emergency-stats', adminAuth, adminDashboardController.getEmergencyStats);
router.get('/dashboard/revenue-distribution', adminAuth, adminDashboardController.getRevenueDistribution);
router.get('/dashboard/recent-activities', adminAuth, adminDashboardController.getRecentActivities);

// Patients Management Routes
router.get('/patients', adminAuth, adminPatientsController.getPatients);
router.get('/patients/:id', adminAuth, adminPatientsController.getPatientById);
router.put('/patients/:id/update', adminAuth, adminPatientsController.updatePatient);
router.delete('/patients/:id/delete', adminAuth, adminPatientsController.deletePatient);
router.get('/patients/:id/appointments', adminAuth, adminPatientsController.getPatientAppointments);
router.get('/patients/:id/records', adminAuth, adminPatientsController.getPatientMedicalRecords);
router.get('/patients/:id/emergencies', adminAuth, adminPatientsController.getPatientEmergencyBookings);

// Professionals Management Routes
router.get('/professionals', adminAuth, adminProfessionalsController.getProfessionals);
// Static routes MUST come before /:id
router.get('/professionals/verification/pending', adminAuth, adminProfessionalsController.getPendingVerifications);
router.get('/professionals/:id', adminAuth, adminProfessionalsController.getProfessionalById);
router.put('/professionals/:id/update', adminAuth, adminProfessionalsController.updateProfessional);
router.delete('/professionals/:id/delete', adminAuth, adminProfessionalsController.deleteProfessional);
router.get('/professionals/:id/services', adminAuth, adminProfessionalsController.getProfessionalServices);
router.patch('/professionals/:id/services/:serviceId', adminAuth, adminProfessionalsController.toggleServiceStatus);
router.get('/professionals/:id/applications', adminAuth, adminProfessionalsController.getProfessionalApplications);
router.get('/professionals/:id/schedules', adminAuth, adminProfessionalsController.getProfessionalSchedules);
router.get('/professionals/:id/earnings', adminAuth, adminProfessionalsController.getProfessionalEarnings);
router.get('/professionals/:id/documents', adminAuth, adminProfessionalsController.getProfessionalDocuments);
router.post('/professionals/:id/verify', adminAuth, adminProfessionalsController.verifyProfessional);
router.post('/professionals/:id/reject', adminAuth, adminProfessionalsController.rejectProfessional);

// Services Management Routes (All services across all professionals)
router.get('/services', adminAuth, async (req, res) => {
    try {
        const Service = require('../models/Service');
        const { page = 1, page_size = 10, search, status } = req.query;
        const skip = (page - 1) * page_size;

        let query = {};
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        if (status) {
            query.status = status;
        }

        const services = await Service.find(query)
            .populate({
                path: 'professional',
                populate: { path: 'user', select: 'firstName lastName email' }
            })
            .populate({
                path: 'gymPhysio',
                populate: { path: 'user', select: 'firstName lastName email' }
            })
            .skip(skip)
            .limit(parseInt(page_size))
            .sort({ createdAt: -1 });

        const total = await Service.countDocuments(query);
        const pendingCount = await Service.countDocuments({ status: 'pending' });

        const data = services.map(service => {
            // Determine provider (professional or gym-physio)
            let provider = null;
            if (service.professional) {
                provider = {
                    id: service.professional._id,
                    name: service.professional.user
                        ? `${service.professional.user.firstName} ${service.professional.user.lastName}`.trim()
                        : 'Professional',
                    email: service.professional.user?.email,
                    type: 'professional'
                };
            } else if (service.gymPhysio) {
                provider = {
                    id: service.gymPhysio._id,
                    name: service.gymPhysio.businessName || (service.gymPhysio.user
                        ? `${service.gymPhysio.user.firstName} ${service.gymPhysio.user.lastName}`.trim()
                        : 'Gym/Physio'),
                    email: service.gymPhysio.user?.email,
                    type: 'gym-physio'
                };
            }

            return {
                id: service._id,
                title: service.title,
                description: service.description,
                category: service.category,
                price: service.price,
                duration: service.duration,
                status: service.status,
                approvalNote: service.approvalNote || '',
                images: service.images,
                rating: service.rating,
                reviewCount: service.reviewCount,
                bookingCount: service.bookingCount,
                professional: provider,  // keep field name for backward compat
                createdAt: service.createdAt,
                updatedAt: service.updatedAt
            };
        });

        res.json({
            statuscode: 0,
            status: 'success',
            data,
            pendingCount,
            pagination: {
                page: parseInt(page),
                page_size: parseInt(page_size),
                total,
                total_pages: Math.ceil(total / page_size)
            }
        });
    } catch (error) {
        console.error('Get all services error:', error);
        res.status(500).json({ statuscode: 1, status: 'error', message: 'Failed to get services', error: error.message });
    }
});

// Approve a service
router.post('/services/:id/approve', adminAuth, async (req, res) => {
    try {
        const Service = require('../models/Service');
        const service = await Service.findByIdAndUpdate(
            req.params.id,
            { status: 'active', approvedBy: req.user._id, approvedAt: new Date(), approvalNote: '' },
            { new: true }
        );
        if (!service) return res.status(404).json({ statuscode: 1, status: 'error', message: 'Service not found' });
        res.json({ statuscode: 0, status: 'success', message: 'Service approved and is now live', data: service });
    } catch (error) {
        res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
});

// Reject a service
router.post('/services/:id/reject', adminAuth, async (req, res) => {
    try {
        const Service = require('../models/Service');
        const { reason } = req.body;
        const service = await Service.findByIdAndUpdate(
            req.params.id,
            { status: 'inactive', approvalNote: reason || 'Rejected by admin' },
            { new: true }
        );
        if (!service) return res.status(404).json({ statuscode: 1, status: 'error', message: 'Service not found' });
        res.json({ statuscode: 0, status: 'success', message: 'Service rejected', data: service });
    } catch (error) {
        res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
});
// Hospitals Management Routes
router.get('/hospitals', adminAuth, adminHospitalsController.getHospitals);
// Static routes MUST come before /:id
router.get('/hospitals/verification/pending', adminAuth, adminHospitalsController.getPendingVerifications);
router.get('/hospitals/:id', adminAuth, adminHospitalsController.getHospitalById);
router.put('/hospitals/:id/update', adminAuth, adminHospitalsController.updateHospital);
router.delete('/hospitals/:id/delete', adminAuth, adminHospitalsController.deleteHospital);
router.get('/hospitals/:id/vacancies', adminAuth, adminHospitalsController.getHospitalVacancies);
router.patch('/hospitals/:id/vacancies/:vacancyId', adminAuth, adminHospitalsController.toggleVacancyStatus);
router.get('/hospitals/:id/applications', adminAuth, adminHospitalsController.getHospitalApplications);
router.get('/hospitals/:id/subscription', adminAuth, adminHospitalsController.getHospitalSubscription);
router.put('/hospitals/:id/subscription/update', adminAuth, adminHospitalsController.updateHospitalSubscription);
router.get('/hospitals/:id/documents', adminAuth, adminHospitalsController.getHospitalDocuments);
router.post('/hospitals/:id/verify', adminAuth, adminHospitalsController.verifyHospital);
router.post('/hospitals/:id/reject', adminAuth, adminHospitalsController.rejectHospital);

// Ambulances Management Routes
router.get('/ambulances', adminAuth, adminAmbulancesController.getProviders);
// Static routes MUST come before /:id to avoid being matched as IDs
router.get('/ambulances/bookings', adminAuth, adminAmbulancesController.getEmergencyBookings);
router.get('/ambulances/availability', adminAuth, adminAmbulancesController.getProviderAvailability);
router.get('/ambulances/verification/pending', adminAuth, adminAmbulancesController.getPendingVerifications);
router.get('/ambulances/:id', adminAuth, adminAmbulancesController.getProviderById);
router.put('/ambulances/:id/update', adminAuth, adminAmbulancesController.updateProvider);
router.delete('/ambulances/:id/delete', adminAuth, adminAmbulancesController.deleteProvider);
router.get('/ambulances/:id/vehicles', adminAuth, adminAmbulancesController.getProviderVehicles);
router.patch('/ambulances/:id/vehicles/:vehicleId', adminAuth, adminAmbulancesController.toggleVehicleStatus);
router.get('/ambulances/:id/documents', adminAuth, adminAmbulancesController.getProviderDocuments);
router.post('/ambulances/:id/verify', adminAuth, adminAmbulancesController.verifyProvider);
router.post('/ambulances/:id/reject', adminAuth, adminAmbulancesController.rejectProvider);

// Gym & Physio Management Routes
router.get('/gym-physio', adminAuth, adminGymPhysioController.getGymPhysios);
router.get('/gym-physio/verification/pending', adminAuth, adminGymPhysioController.getPendingVerifications);
router.get('/gym-physio/:id', adminAuth, adminGymPhysioController.getGymPhysioById);
router.put('/gym-physio/:id/update', adminAuth, adminGymPhysioController.updateGymPhysio);
router.delete('/gym-physio/:id/delete', adminAuth, adminGymPhysioController.deleteGymPhysio);
router.post('/gym-physio/:id/verify', adminAuth, adminGymPhysioController.verifyGymPhysio);
router.post('/gym-physio/:id/reject', adminAuth, adminGymPhysioController.rejectGymPhysio);
router.get('/gym-physio/:id/services', adminAuth, adminGymPhysioController.getGymPhysioServices);
router.patch('/gym-physio/:id/services/:serviceId', adminAuth, adminGymPhysioController.toggleGymPhysioServiceStatus);
router.get('/gym-physio/:id/appointments', adminAuth, adminGymPhysioController.getGymPhysioAppointments);
router.get('/gym-physio/:id/earnings', adminAuth, adminGymPhysioController.getGymPhysioEarnings);

// ─── Settings Routes (stubs — return sensible defaults) ───────────────────────
router.get('/settings/system', adminAuth, (req, res) => {
    res.json({ statuscode: 0, status: 'success', data: {
        platform_name: 'Health Market Arena',
        support_email: 'support@healthmarketarena.com',
        support_phone: '+234 000 000 0000',
        maintenance_mode: false,
        registration_enabled: true,
        max_upload_size_mb: 5,
        session_timeout_minutes: 60
    }});
});
router.put('/settings/system', adminAuth, (req, res) => {
    res.json({ statuscode: 0, status: 'success', message: 'System settings updated' });
});
router.get('/settings/email-templates', adminAuth, (req, res) => {
    res.json({ statuscode: 0, status: 'success', data: [] });
});
router.put('/settings/email-templates/:id', adminAuth, (req, res) => {
    res.json({ statuscode: 0, status: 'success', message: 'Email template updated' });
});
router.get('/settings/payment', adminAuth, (req, res) => {
    res.json({ statuscode: 0, status: 'success', data: {
        provider: 'paystack',
        api_key: process.env.PAYSTACK_PUBLIC_KEY || '',
        secret_key: '***hidden***',
        webhook_url: `${process.env.FRONTEND_URL || 'https://healthmarketarena.com'}/api/webhooks/paystack`,
        test_mode: (process.env.PAYSTACK_PUBLIC_KEY || '').startsWith('pk_test')
    }});
});
router.put('/settings/payment', adminAuth, (req, res) => {
    res.json({ statuscode: 0, status: 'success', message: 'Payment settings updated' });
});
router.get('/settings/admins', adminAuth, async (req, res) => {
    try {
        const User = require('../models/User');
        const admins = await User.find({ role: { $in: ['admin', 'super_admin'] } })
            .select('firstName lastName email role status createdAt lastLogin')
            .sort({ createdAt: -1 });
        const data = admins.map(a => ({
            id: a._id,
            first_name: a.firstName,
            last_name: a.lastName,
            email: a.email,
            role: a.role,
            is_active: a.status === 'active',
            created_at: a.createdAt,
            last_login: a.lastLogin
        }));
        res.json({ statuscode: 0, status: 'success', data });
    } catch (error) {
        res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
});
router.post('/settings/admins', adminAuth, async (req, res) => {
    res.json({ statuscode: 0, status: 'success', message: 'Admin user created' });
});
router.delete('/settings/admins/:id', adminAuth, async (req, res) => {
    res.json({ statuscode: 0, status: 'success', message: 'Admin user deleted' });
});
router.get('/settings/roles', adminAuth, (req, res) => {
    res.json({ statuscode: 0, status: 'success', data: [
        { id: 1, name: 'super_admin', description: 'Full platform access', permissions: ['*'] },
        { id: 2, name: 'admin', description: 'Standard admin access', permissions: ['read', 'write'] },
        { id: 3, name: 'moderator', description: 'Content moderation', permissions: ['read'] }
    ]});
});
router.get('/settings/audit-logs', adminAuth, (req, res) => {
    res.json({ statuscode: 0, status: 'success', data: [], pagination: { page: 1, page_size: 20, total: 0, total_pages: 0 } });
});

module.exports = router;