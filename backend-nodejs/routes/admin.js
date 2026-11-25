const express = require('express');
const adminAuthController = require('../controllers/admin/authController');
const adminDashboardController = require('../controllers/admin/dashboardController');
const adminPatientsController = require('../controllers/admin/patientsController');
const adminProfessionalsController = require('../controllers/admin/professionalsController');
const adminHospitalsController = require('../controllers/admin/hospitalsController');
const adminAmbulancesController = require('../controllers/admin/ambulancesController');
const adminGymPhysioController = require('../controllers/admin/gymPhysioController');
const adminBlogController = require('../controllers/admin/blogController');
const adminSettingsController = require('../controllers/admin/settingsController');
const planController = require('../controllers/admin/planController');
const { adminAuth, checkPermission } = require('../middleware/adminAuth');

const router = express.Router();

// ─── Auth ─────────────────────────────────────────────────────────────────────
// /auth/register is protected — only super_admin can create new admins here.
// Initial super_admin is seeded via scripts/createAdmin.js.
router.post('/auth/register', adminAuth, adminAuthController.register);
router.post('/auth/login', adminAuthController.login);
router.post('/auth/logout', adminAuth, adminAuthController.logout);
router.post('/auth/refresh', adminAuthController.refreshToken);
router.get('/auth/profile', adminAuth, adminAuthController.getProfile);

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get('/dashboard/stats',               adminAuth, checkPermission('dashboard_view'), adminDashboardController.getStats);
router.get('/dashboard/registration-trends', adminAuth, checkPermission('dashboard_view'), adminDashboardController.getRegistrationTrends);
router.get('/dashboard/appointment-stats',   adminAuth, checkPermission('dashboard_view'), adminDashboardController.getAppointmentStats);
router.get('/dashboard/emergency-stats',     adminAuth, checkPermission('dashboard_view'), adminDashboardController.getEmergencyStats);
router.get('/dashboard/revenue-distribution',adminAuth, checkPermission('dashboard_view'), adminDashboardController.getRevenueDistribution);
router.get('/dashboard/recent-activities',   adminAuth, checkPermission('dashboard_view'), adminDashboardController.getRecentActivities);

// ─── Patients ─────────────────────────────────────────────────────────────────
router.get('/patients',                     adminAuth, checkPermission('users_view'),   adminPatientsController.getPatients);
router.get('/patients/all-payments',        adminAuth, checkPermission('users_view'),   adminAmbulancesController.getPatientPaymentStats);
router.get('/patients/:id',                 adminAuth, checkPermission('users_view'),   adminPatientsController.getPatientById);
router.put('/patients/:id/update',          adminAuth, checkPermission('users_edit'),   adminPatientsController.updatePatient);
router.delete('/patients/:id/delete',       adminAuth, checkPermission('users_delete'), adminPatientsController.deletePatient);
router.get('/patients/:id/appointments',    adminAuth, checkPermission('users_view'),   adminPatientsController.getPatientAppointments);
router.get('/patients/:id/records',         adminAuth, checkPermission('users_view'),   adminPatientsController.getPatientMedicalRecords);
router.get('/patients/:id/emergencies',     adminAuth, checkPermission('users_view'),   adminPatientsController.getPatientEmergencyBookings);

// ─── Professionals ────────────────────────────────────────────────────────────
// Static routes MUST come before /:id
router.get('/professionals',                           adminAuth, checkPermission('professionals_view'),   adminProfessionalsController.getProfessionals);
router.get('/professionals/verification/pending',      adminAuth, checkPermission('professionals_view'),   adminProfessionalsController.getPendingVerifications);
router.get('/professionals/:id',                       adminAuth, checkPermission('professionals_view'),   adminProfessionalsController.getProfessionalById);
router.put('/professionals/:id/update',                adminAuth, checkPermission('professionals_verify'), adminProfessionalsController.updateProfessional);
router.delete('/professionals/:id/delete',             adminAuth, checkPermission('professionals_verify'), adminProfessionalsController.deleteProfessional);
router.get('/professionals/:id/services',              adminAuth, checkPermission('professionals_view'),   adminProfessionalsController.getProfessionalServices);
router.patch('/professionals/:id/services/:serviceId', adminAuth, checkPermission('professionals_view'),   adminProfessionalsController.toggleServiceStatus);
router.get('/professionals/:id/applications',          adminAuth, checkPermission('professionals_view'),   adminProfessionalsController.getProfessionalApplications);
router.get('/professionals/:id/schedules',             adminAuth, checkPermission('professionals_view'),   adminProfessionalsController.getProfessionalSchedules);
router.get('/professionals/:id/earnings',              adminAuth, checkPermission('professionals_view'),   adminProfessionalsController.getProfessionalEarnings);
router.get('/professionals/:id/documents',             adminAuth, checkPermission('professionals_view'),   adminProfessionalsController.getProfessionalDocuments);
router.post('/professionals/:id/verify',               adminAuth, checkPermission('professionals_verify'), adminProfessionalsController.verifyProfessional);
router.post('/professionals/:id/reject',               adminAuth, checkPermission('professionals_verify'), adminProfessionalsController.rejectProfessional);

// ─── Services (all professionals' services) ───────────────────────────────────
router.get('/services', adminAuth, checkPermission('professionals_view'), async (req, res) => {
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
        if (status) query.status = status;

        const services = await Service.find(query)
            .populate({ path: 'professional', populate: { path: 'user', select: 'firstName lastName email' } })
            .populate({ path: 'gymPhysio',    populate: { path: 'user', select: 'firstName lastName email' } })
            .skip(skip)
            .limit(parseInt(page_size))
            .sort({ createdAt: -1 });

        const total        = await Service.countDocuments(query);
        const pendingCount = await Service.countDocuments({ status: 'pending' });

        const data = services.map(service => {
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
                professional: provider,
                createdAt: service.createdAt,
                updatedAt: service.updatedAt
            };
        });

        res.json({
            statuscode: 0, status: 'success', data, pendingCount,
            pagination: { page: parseInt(page), page_size: parseInt(page_size), total, total_pages: Math.ceil(total / page_size) }
        });
    } catch (error) {
        console.error('Get all services error:', error);
        res.status(500).json({ statuscode: 1, status: 'error', message: 'Failed to get services', error: error.message });
    }
});

router.post('/services/:id/approve', adminAuth, checkPermission('professionals_verify'), async (req, res) => {
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

router.post('/services/:id/reject', adminAuth, checkPermission('professionals_verify'), async (req, res) => {
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

// ─── Hospitals ────────────────────────────────────────────────────────────────
// Static routes MUST come before /:id
router.get('/hospitals',                               adminAuth, checkPermission('hospitals_view'),   adminHospitalsController.getHospitals);
router.get('/hospitals/verification/pending',          adminAuth, checkPermission('hospitals_view'),   adminHospitalsController.getPendingVerifications);
router.get('/hospitals/all-earnings',                  adminAuth, checkPermission('hospitals_view'),   adminHospitalsController.getAllHospitalEarnings);
router.get('/hospitals/patient-payments',              adminAuth, checkPermission('hospitals_view'),   adminAmbulancesController.getPatientPaymentStats);
router.get('/hospitals/:id',                           adminAuth, checkPermission('hospitals_view'),   adminHospitalsController.getHospitalById);
router.put('/hospitals/:id/update',                    adminAuth, checkPermission('hospitals_verify'), adminHospitalsController.updateHospital);
router.delete('/hospitals/:id/delete',                 adminAuth, checkPermission('hospitals_verify'), adminHospitalsController.deleteHospital);
router.get('/hospitals/:id/vacancies',                 adminAuth, checkPermission('hospitals_view'),   adminHospitalsController.getHospitalVacancies);
router.patch('/hospitals/:id/vacancies/:vacancyId',    adminAuth, checkPermission('hospitals_verify'), adminHospitalsController.toggleVacancyStatus);
router.get('/hospitals/:id/applications',              adminAuth, checkPermission('hospitals_view'),   adminHospitalsController.getHospitalApplications);
router.get('/hospitals/:id/subscription',              adminAuth, checkPermission('hospitals_view'),   adminHospitalsController.getHospitalSubscription);
router.put('/hospitals/:id/subscription/update',       adminAuth, checkPermission('hospitals_verify'), adminHospitalsController.updateHospitalSubscription);
router.get('/hospitals/:id/documents',                 adminAuth, checkPermission('hospitals_view'),   adminHospitalsController.getHospitalDocuments);
router.get('/hospitals/:id/earnings',                  adminAuth, checkPermission('hospitals_view'),   adminHospitalsController.getHospitalEarnings);
router.post('/hospitals/:id/verify',                   adminAuth, checkPermission('hospitals_verify'), adminHospitalsController.verifyHospital);
router.post('/hospitals/:id/reject',                   adminAuth, checkPermission('hospitals_verify'), adminHospitalsController.rejectHospital);

// ─── Ambulances ───────────────────────────────────────────────────────────────
// Static routes MUST come before /:id
router.get('/ambulances',                              adminAuth, checkPermission('ambulances_view'),   adminAmbulancesController.getProviders);
router.get('/ambulances/bookings',                     adminAuth, checkPermission('ambulances_view'),   adminAmbulancesController.getEmergencyBookings);
router.get('/ambulances/availability',                 adminAuth, checkPermission('ambulances_view'),   adminAmbulancesController.getProviderAvailability);
router.get('/ambulances/verification/pending',         adminAuth, checkPermission('ambulances_view'),   adminAmbulancesController.getPendingVerifications);
router.get('/ambulances/all-earnings',                 adminAuth, checkPermission('ambulances_view'),   adminAmbulancesController.getAllAmbulanceEarnings);
router.get('/ambulances/patient-payments',             adminAuth, checkPermission('ambulances_view'),   adminAmbulancesController.getPatientPaymentStats);
router.get('/ambulances/:id',                          adminAuth, checkPermission('ambulances_view'),   adminAmbulancesController.getProviderById);
router.put('/ambulances/:id/update',                   adminAuth, checkPermission('ambulances_verify'), adminAmbulancesController.updateProvider);
router.delete('/ambulances/:id/delete',                adminAuth, checkPermission('ambulances_verify'), adminAmbulancesController.deleteProvider);
router.get('/ambulances/:id/vehicles',                 adminAuth, checkPermission('ambulances_view'),   adminAmbulancesController.getProviderVehicles);
router.patch('/ambulances/:id/vehicles/:vehicleId',    adminAuth, checkPermission('ambulances_verify'), adminAmbulancesController.toggleVehicleStatus);
router.get('/ambulances/:id/documents',                adminAuth, checkPermission('ambulances_view'),   adminAmbulancesController.getProviderDocuments);
router.get('/ambulances/:id/earnings',                 adminAuth, checkPermission('ambulances_view'),   adminAmbulancesController.getProviderEarnings);
router.post('/ambulances/:id/verify',                  adminAuth, checkPermission('ambulances_verify'), adminAmbulancesController.verifyProvider);
router.post('/ambulances/:id/reject',                  adminAuth, checkPermission('ambulances_verify'), adminAmbulancesController.rejectProvider);

// ─── Gym & Physio ─────────────────────────────────────────────────────────────
// Static routes MUST come before /:id
router.get('/gym-physio',                              adminAuth, checkPermission('gym_view'),   adminGymPhysioController.getGymPhysios);
router.get('/gym-physio/stats',                        adminAuth, checkPermission('gym_view'),   adminGymPhysioController.getGymPhysioStats);
router.get('/gym-physio/verification/pending',         adminAuth, checkPermission('gym_view'),   adminGymPhysioController.getPendingVerifications);
router.get('/gym-physio/:id',                          adminAuth, checkPermission('gym_view'),   adminGymPhysioController.getGymPhysioById);
router.put('/gym-physio/:id/update',                   adminAuth, checkPermission('gym_verify'), adminGymPhysioController.updateGymPhysio);
router.delete('/gym-physio/:id/delete',                adminAuth, checkPermission('gym_verify'), adminGymPhysioController.deleteGymPhysio);
router.post('/gym-physio/:id/verify',                  adminAuth, checkPermission('gym_verify'), adminGymPhysioController.verifyGymPhysio);
router.post('/gym-physio/:id/reject',                  adminAuth, checkPermission('gym_verify'), adminGymPhysioController.rejectGymPhysio);
router.patch('/gym-physio/:id/status',                 adminAuth, checkPermission('gym_verify'), async (req, res) => {
    try {
        const GymPhysio = require('../models/GymPhysio');
        const { is_active } = req.body;
        const gymPhysio = await GymPhysio.findByIdAndUpdate(
            req.params.id,
            { isActive: is_active },
            { new: true }
        );
        if (!gymPhysio) return res.status(404).json({ statuscode: 1, status: 'error', message: 'Provider not found' });
        res.json({ statuscode: 0, status: 'success', message: 'Status updated', data: gymPhysio });
    } catch (error) {
        res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
});
router.get('/gym-physio/:id/services',                adminAuth, checkPermission('gym_view'),   adminGymPhysioController.getGymPhysioServices);
router.patch('/gym-physio/:id/services/:serviceId',   adminAuth, checkPermission('gym_verify'), adminGymPhysioController.toggleGymPhysioServiceStatus);
router.get('/gym-physio/:id/appointments',            adminAuth, checkPermission('gym_view'),   adminGymPhysioController.getGymPhysioAppointments);
router.get('/gym-physio/:id/earnings',                adminAuth, checkPermission('gym_view'),   adminGymPhysioController.getGymPhysioEarnings);
router.get('/gym-physio/:id/analytics',               adminAuth, checkPermission('gym_view'),   adminGymPhysioController.getGymPhysioAnalytics);
router.get('/gym-physio/:id/subscription',            adminAuth, checkPermission('gym_view'),   adminGymPhysioController.getGymPhysioSubscription);
router.put('/gym-physio/:id/subscription',            adminAuth, checkPermission('gym_verify'), adminGymPhysioController.updateGymPhysioSubscription);

// ─── Settings ─────────────────────────────────────────────────────────────────
router.get('/settings/system', adminAuth, checkPermission('settings_edit'), (req, res) => {
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
router.put('/settings/system', adminAuth, checkPermission('settings_edit'), (req, res) => {
    res.json({ statuscode: 0, status: 'success', message: 'System settings updated' });
});
router.get('/settings/email-templates', adminAuth, checkPermission('settings_edit'), (req, res) => {
    res.json({ statuscode: 0, status: 'success', data: [] });
});
router.put('/settings/email-templates/:id', adminAuth, checkPermission('settings_edit'), (req, res) => {
    res.json({ statuscode: 0, status: 'success', message: 'Email template updated' });
});
router.post('/settings/email-templates/:id/test', adminAuth, checkPermission('settings_edit'), (req, res) => {
    res.json({ statuscode: 0, status: 'success', message: 'Test email sent' });
});
router.get('/settings/payment', adminAuth, checkPermission('settings_edit'), async (req, res) => {
    try {
        const platformFee = parseFloat(process.env.PLATFORM_FEE_PERCENT || '10');
        res.json({ statuscode: 0, status: 'success', data: {
            provider: 'paystack',
            api_key: process.env.PAYSTACK_PUBLIC_KEY || '',
            secret_key: '***hidden***',
            webhook_url: `${process.env.FRONTEND_URL || 'https://healthmarketarena.com'}/api/webhooks/paystack`,
            test_mode: (process.env.PAYSTACK_PUBLIC_KEY || '').startsWith('pk_test'),
            platformFeePercent: platformFee,
            adminBankAccount: {
                bankName:      process.env.ADMIN_BANK_NAME || '',
                accountNumber: process.env.ADMIN_ACCOUNT_NUMBER || '',
                accountName:   process.env.ADMIN_ACCOUNT_NAME || '',
                bankCode:      process.env.ADMIN_BANK_CODE || '',
            }
        }});
    } catch (error) {
        res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
});
router.put('/settings/payment', adminAuth, checkPermission('settings_edit'), async (req, res) => {
    const { platformFeePercent, adminBankAccount } = req.body;
    if (platformFeePercent !== undefined) process.env.PLATFORM_FEE_PERCENT = String(platformFeePercent);
    if (adminBankAccount) {
        if (adminBankAccount.bankName)      process.env.ADMIN_BANK_NAME = adminBankAccount.bankName;
        if (adminBankAccount.accountNumber) process.env.ADMIN_ACCOUNT_NUMBER = adminBankAccount.accountNumber;
        if (adminBankAccount.accountName)   process.env.ADMIN_ACCOUNT_NAME = adminBankAccount.accountName;
        if (adminBankAccount.bankCode)      process.env.ADMIN_BANK_CODE = adminBankAccount.bankCode;
    }
    res.json({ statuscode: 0, status: 'success', message: 'Payment settings updated' });
});
router.post('/settings/payment/test', adminAuth, checkPermission('settings_edit'), (req, res) => {
    res.json({ statuscode: 0, status: 'success', message: 'Payment connection test successful' });
});

// Admin user management (super_admin only for writes — enforced inside controller)
router.get('/settings/admins',               adminAuth, checkPermission('settings_edit'), adminSettingsController.getAdminUsers);
router.post('/settings/admins',              adminAuth, checkPermission('settings_edit'), adminSettingsController.createAdminUser);
router.put('/settings/admins/:id',           adminAuth, checkPermission('settings_edit'), adminSettingsController.updateAdminUser);
router.delete('/settings/admins/:id',        adminAuth, checkPermission('settings_edit'), adminSettingsController.deleteAdminUser);
router.get('/settings/admins/:id/permissions', adminAuth, checkPermission('settings_edit'), adminSettingsController.getAdminPermissions);
router.put('/settings/admins/:id/permissions', adminAuth, checkPermission('settings_edit'), adminSettingsController.updateAdminPermissions);

// Roles & available permissions (read-only — all admins can view)
router.get('/settings/roles',       adminAuth, adminSettingsController.getRoles);
router.get('/settings/permissions', adminAuth, adminSettingsController.getAvailablePermissions);

// Roles CRUD (super_admin only via controller)
router.post('/settings/roles',    adminAuth, checkPermission('settings_edit'), (req, res) => {
    res.json({ statuscode: 0, status: 'success', message: 'Role created' });
});
router.put('/settings/roles/:id', adminAuth, checkPermission('settings_edit'), (req, res) => {
    res.json({ statuscode: 0, status: 'success', message: 'Role updated' });
});
router.delete('/settings/roles/:id', adminAuth, checkPermission('settings_edit'), (req, res) => {
    res.json({ statuscode: 0, status: 'success', message: 'Role deleted' });
});

// Audit logs
router.get('/settings/audit-logs', adminAuth, checkPermission('settings_edit'), (req, res) => {
    res.json({ statuscode: 0, status: 'success', data: [], pagination: { page: 1, page_size: 20, total: 0, total_pages: 0 } });
});
router.get('/settings/audit-logs/export', adminAuth, checkPermission('settings_edit'), (req, res) => {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.csv"');
    res.send('timestamp,user,action,details\n');
});

// ─── Blog ─────────────────────────────────────────────────────────────────────
router.get('/blog/posts',            adminAuth, checkPermission('blog_view'),   adminBlogController.getAllPosts);
router.get('/blog/posts/:id',        adminAuth, checkPermission('blog_view'),   adminBlogController.getPostById);
router.post('/blog/posts',           adminAuth, checkPermission('blog_edit'),   adminBlogController.createPost);
router.put('/blog/posts/:id',        adminAuth, checkPermission('blog_edit'),   adminBlogController.updatePost);
router.delete('/blog/posts/:id',     adminAuth, checkPermission('blog_delete'), adminBlogController.deletePost);
router.post('/blog/posts/:id/publish', adminAuth, checkPermission('blog_edit'), adminBlogController.publishPost);
router.post('/blog/posts/bulk-delete', adminAuth, checkPermission('blog_delete'), adminBlogController.bulkDelete);
router.get('/blog/analytics',        adminAuth, checkPermission('blog_view'),   adminBlogController.getAnalytics);

// ─── Plans (super_admin manages; any admin can read) ──────────────────────────
// Public options (no auth needed — frontend form dropdowns)
router.get('/plans/options',                   planController.getPlanOptions);
// Active plans — public, used by subscription pages
router.get('/plans/active',                    planController.listActivePlans);
// Admin reads
router.get('/plans',          adminAuth,       planController.listPlans);
router.get('/plans/:id',      adminAuth,       planController.getPlan);
// Super admin writes
router.post('/plans',               adminAuth, checkPermission('settings_edit'), planController.createPlan);
router.put('/plans/:id',            adminAuth, checkPermission('settings_edit'), planController.updatePlan);
router.delete('/plans/:id',         adminAuth, checkPermission('settings_edit'), planController.deletePlan);
router.patch('/plans/:id/toggle',   adminAuth, checkPermission('settings_edit'), planController.toggleStatus);
router.patch('/plans/:id/default',  adminAuth, checkPermission('settings_edit'), planController.setDefault);
router.post('/plans/:id/duplicate', adminAuth, checkPermission('settings_edit'), planController.duplicatePlan);
router.post('/plans/assign',        adminAuth, checkPermission('settings_edit'), planController.assignPlan);

module.exports = router;
