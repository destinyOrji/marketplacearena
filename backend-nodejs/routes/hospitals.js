const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Hospital = require('../models/Hospital');
const User = require('../models/User');

// Hospital dashboard stats
router.get('/dashboard-stats', protect, async (req, res) => {
    try {
        const Job = require('../models/Job');
        const JobApplication = require('../models/JobApplication');
        const hospital = await Hospital.findOne({ user: req.user._id });

        let activeVacancies = 0, totalVacancies = 0, totalApplications = 0, pendingApplications = 0;

        if (hospital) {
            activeVacancies = await Job.countDocuments({ hospital: hospital._id, status: 'active' });
            totalVacancies = await Job.countDocuments({ hospital: hospital._id });
            const jobs = await Job.find({ hospital: hospital._id }).select('_id');
            const jobIds = jobs.map(j => j._id);
            totalApplications = await JobApplication.countDocuments({ job: { $in: jobIds } });
            pendingApplications = await JobApplication.countDocuments({ job: { $in: jobIds }, status: 'pending' });
        }

        res.json({
            success: true,
            data: {
                totalBeds: hospital ? hospital.totalBeds : 0,
                availableBeds: hospital ? hospital.availableBeds : 0,
                icuBeds: hospital ? hospital.icuBeds : 0,
                totalPatients: hospital ? hospital.totalPatients : 0,
                totalAppointments: hospital ? hospital.totalAppointments : 0,
                averageRating: hospital ? hospital.averageRating : 0,
                totalReviews: hospital ? hospital.totalReviews : 0,
                isVerified: hospital ? hospital.isVerified : false,
                emergencyServices: hospital ? hospital.emergencyServices : false,
                activeVacancies,
                totalVacancies,
                totalApplications,
                pendingApplications,
                active_vacancies: activeVacancies,
                total_vacancies: totalVacancies,
                total_applications: totalApplications,
                pending_applications: pendingApplications,
            }
        });
    } catch (error) {
        console.error('Error fetching hospital stats:', error);
        res.json({ success: true, data: {} });
    }
});

// Get hospital profile
router.get('/profile', protect, async (req, res) => {
    try {
        const hospital = await Hospital.findOne({ user: req.user._id }).populate('user', '-password');
        if (!hospital) {
            return res.status(404).json({ success: false, message: 'Hospital profile not found' });
        }
        res.json({ success: true, data: hospital });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update hospital profile
router.put('/profile/update', protect, async (req, res) => {
    try {
        const hospital = await Hospital.findOneAndUpdate(
            { user: req.user._id },
            { $set: req.body },
            { new: true }
        );
        
        if (!hospital) {
            return res.status(404).json({ success: false, message: 'Hospital not found' });
        }
        
        res.json({ success: true, data: hospital, message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Vacancies Management (alias for jobs)
router.get('/vacancies', protect, async (req, res) => {
    try {
        const Job = require('../models/Job');
        const hospital = await Hospital.findOne({ user: req.user._id });
        
        if (!hospital) {
            return res.json({ 
                statuscode: 0,
                status: 'success',
                data: { vacancies: [], pagination: { total: 0, page: 1, page_size: 10, total_pages: 0 } }
            });
        }

        const { page = 1, page_size = 10, status, department, search } = req.query;
        const skip = (page - 1) * page_size;

        let query = { hospital: hospital._id };
        if (status) query.status = status;
        if (department) query.department = department;
        if (search) {
            query.$or = [
                { jobTitle: { $regex: search, $options: 'i' } },
                { department: { $regex: search, $options: 'i' } }
            ];
        }

        const vacancies = await Job.find(query)
            .skip(skip)
            .limit(parseInt(page_size))
            .sort({ createdAt: -1 });

        const total = await Job.countDocuments(query);

        res.json({ 
            statuscode: 0,
            status: 'success',
            data: { 
                vacancies, 
                pagination: { 
                    total, 
                    page: parseInt(page), 
                    page_size: parseInt(page_size), 
                    total_pages: Math.ceil(total / page_size) 
                } 
            }
        });
    } catch (error) {
        console.error('Error fetching vacancies:', error);
        res.status(500).json({ 
            statuscode: 1,
            status: 'error',
            message: error.message 
        });
    }
});

router.post('/vacancies/create/', protect, async (req, res) => {
    try {
        const Job = require('../models/Job');
        const Notification = require('../models/Notification');
        const Professional = require('../models/Professional');
        const hospital = await Hospital.findOne({ user: req.user._id }).populate('user', 'firstName lastName');
        
        if (!hospital) {
            return res.status(404).json({ statuscode: 1, status: 'error', message: 'Hospital profile not found' });
        }

        // Map frontend snake_case fields to model camelCase
        const jobData = {
            hospital: hospital._id,
            jobTitle: req.body.jobTitle || req.body.job_title,
            department: req.body.department,
            jobDescription: req.body.jobDescription || req.body.job_description,
            requiredQualifications: req.body.requiredQualifications || req.body.required_qualifications || [],
            experienceLevel: req.body.experienceLevel || req.body.experience_level || 'mid',
            minimumExperienceYears: req.body.minimumExperienceYears || req.body.minimum_experience_years || 0,
            employmentType: req.body.employmentType || req.body.employment_type || 'full_time',
            salaryRangeMin: req.body.salaryRangeMin || req.body.salary_range_min,
            salaryRangeMax: req.body.salaryRangeMax || req.body.salary_range_max,
            salaryCurrency: req.body.salaryCurrency || req.body.salary_currency || 'NGN',
            benefits: req.body.benefits || [],
            numberOfPositions: req.body.numberOfPositions || req.body.number_of_positions || 1,
            applicationDeadline: req.body.applicationDeadline || req.body.application_deadline,
            status: req.body.status || 'draft',
        };

        const job = await Job.create(jobData);

        // If status is active, notify all professionals
        if (job.status === 'active') {
            const professionals = await Professional.find({}).populate('user', '_id');
            const notifications = professionals
                .filter(p => p.user)
                .map(p => ({
                    user: p.user._id,
                    title: 'New Job Vacancy',
                    message: `${hospital.hospitalName} posted a new vacancy: ${job.jobTitle} (${job.department})`,
                    type: 'job_posted',
                    data: { jobId: job._id, hospitalId: hospital._id }
                }));
            if (notifications.length > 0) {
                await Notification.insertMany(notifications);
            }
        }

        res.status(201).json({ statuscode: 0, status: 'success', data: job, message: 'Vacancy created successfully' });
    } catch (error) {
        console.error('Error creating vacancy:', error);
        res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
});

router.get('/vacancies/:id', protect, async (req, res) => {
    try {
        const Job = require('../models/Job');
        const hospital = await Hospital.findOne({ user: req.user._id });
        
        if (!hospital) {
            return res.status(404).json({ 
                statuscode: 1,
                status: 'error',
                message: 'Hospital profile not found' 
            });
        }

        const vacancy = await Job.findOne({ _id: req.params.id, hospital: hospital._id });

        if (!vacancy) {
            return res.status(404).json({ 
                statuscode: 1,
                status: 'error',
                message: 'Vacancy not found' 
            });
        }

        res.json({ 
            statuscode: 0,
            status: 'success',
            data: vacancy 
        });
    } catch (error) {
        console.error('Error fetching vacancy:', error);
        res.status(500).json({ 
            statuscode: 1,
            status: 'error',
            message: error.message 
        });
    }
});

router.post('/vacancies/create', protect, async (req, res) => {
    try {
        const Job = require('../models/Job');
        const hospital = await Hospital.findOne({ user: req.user._id });
        
        if (!hospital) {
            return res.status(404).json({ 
                statuscode: 1,
                status: 'error',
                message: 'Hospital profile not found' 
            });
        }

        const jobData = {
            hospital: hospital._id,
            ...req.body
        };

        const vacancy = await Job.create(jobData);
        res.status(201).json({ 
            statuscode: 0,
            status: 'success',
            data: vacancy, 
            message: 'Vacancy created successfully' 
        });
    } catch (error) {
        console.error('Error creating vacancy:', error);
        res.status(500).json({ 
            statuscode: 1,
            status: 'error',
            message: error.message 
        });
    }
});

router.put('/vacancies/:id/update', protect, async (req, res) => {
    try {
        const Job = require('../models/Job');
        const hospital = await Hospital.findOne({ user: req.user._id });
        
        if (!hospital) {
            return res.status(404).json({ 
                statuscode: 1,
                status: 'error',
                message: 'Hospital not found' 
            });
        }

        const vacancy = await Job.findOneAndUpdate(
            { _id: req.params.id, hospital: hospital._id },
            { $set: req.body },
            { new: true }
        );

        if (!vacancy) {
            return res.status(404).json({ 
                statuscode: 1,
                status: 'error',
                message: 'Vacancy not found' 
            });
        }

        res.json({ 
            statuscode: 0,
            status: 'success',
            data: vacancy, 
            message: 'Vacancy updated successfully' 
        });
    } catch (error) {
        console.error('Error updating vacancy:', error);
        res.status(500).json({ 
            statuscode: 1,
            status: 'error',
            message: error.message 
        });
    }
});

router.patch('/vacancies/:id/status', protect, async (req, res) => {
    try {
        const Job = require('../models/Job');
        const hospital = await Hospital.findOne({ user: req.user._id });
        
        if (!hospital) {
            return res.status(404).json({ 
                statuscode: 1,
                status: 'error',
                message: 'Hospital not found' 
            });
        }

        const vacancy = await Job.findOneAndUpdate(
            { _id: req.params.id, hospital: hospital._id },
            { $set: { status: req.body.status } },
            { new: true }
        );

        if (!vacancy) {
            return res.status(404).json({ 
                statuscode: 1,
                status: 'error',
                message: 'Vacancy not found' 
            });
        }

        res.json({ 
            statuscode: 0,
            status: 'success',
            data: vacancy, 
            message: 'Vacancy status updated successfully' 
        });
    } catch (error) {
        console.error('Error updating vacancy status:', error);
        res.status(500).json({ 
            statuscode: 1,
            status: 'error',
            message: error.message 
        });
    }
});

router.delete('/vacancies/:id/delete', protect, async (req, res) => {
    try {
        const Job = require('../models/Job');
        const hospital = await Hospital.findOne({ user: req.user._id });
        
        if (!hospital) {
            return res.status(404).json({ 
                statuscode: 1,
                status: 'error',
                message: 'Hospital not found' 
            });
        }

        const vacancy = await Job.findOneAndDelete({ 
            _id: req.params.id, 
            hospital: hospital._id 
        });

        if (!vacancy) {
            return res.status(404).json({ 
                statuscode: 1,
                status: 'error',
                message: 'Vacancy not found' 
            });
        }

        res.json({ 
            statuscode: 0,
            status: 'success',
            message: 'Vacancy deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting vacancy:', error);
        res.status(500).json({ 
            statuscode: 1,
            status: 'error',
            message: error.message 
        });
    }
});

router.get('/vacancies/:id/applications', protect, async (req, res) => {
    try {
        const Job = require('../models/Job');
        const JobApplication = require('../models/JobApplication');
        const hospital = await Hospital.findOne({ user: req.user._id });
        
        if (!hospital) {
            return res.status(404).json({ 
                statuscode: 1,
                status: 'error',
                message: 'Hospital not found' 
            });
        }

        const vacancy = await Job.findOne({ _id: req.params.id, hospital: hospital._id });
        if (!vacancy) {
            return res.status(404).json({ 
                statuscode: 1,
                status: 'error',
                message: 'Vacancy not found' 
            });
        }

        const { status } = req.query;
        let query = { job: vacancy._id };
        if (status) query.status = status;

        const applications = await JobApplication.find(query)
            .populate({
                path: 'professional',
                populate: {
                    path: 'user',
                    select: 'firstName lastName email'
                }
            })
            .sort({ createdAt: -1 });

        res.json({ 
            statuscode: 0,
            status: 'success',
            data: {
                vacancy_id: vacancy._id,
                job_title: vacancy.jobTitle,
                applications,
                total_count: applications.length
            }
        });
    } catch (error) {
        console.error('Error fetching vacancy applications:', error);
        res.status(500).json({ 
            statuscode: 1,
            status: 'error',
            message: error.message 
        });
    }
});

router.get('/vacancies/:id/stats', protect, async (req, res) => {
    try {
        const Job = require('../models/Job');
        const JobApplication = require('../models/JobApplication');
        const hospital = await Hospital.findOne({ user: req.user._id });
        
        if (!hospital) {
            return res.status(404).json({ 
                statuscode: 1,
                status: 'error',
                message: 'Hospital not found' 
            });
        }

        const vacancy = await Job.findOne({ _id: req.params.id, hospital: hospital._id });
        if (!vacancy) {
            return res.status(404).json({ 
                statuscode: 1,
                status: 'error',
                message: 'Vacancy not found' 
            });
        }

        const applications = await JobApplication.find({ job: vacancy._id });
        const stats = {
            total_applications: applications.length,
            pending: applications.filter(a => a.status === 'pending').length,
            reviewed: applications.filter(a => a.status === 'reviewed').length,
            accepted: applications.filter(a => a.status === 'accepted').length,
            rejected: applications.filter(a => a.status === 'rejected').length,
            views: vacancy.views || 0
        };

        res.json({ 
            statuscode: 0,
            status: 'success',
            data: stats 
        });
    } catch (error) {
        console.error('Error fetching vacancy stats:', error);
        res.status(500).json({ 
            statuscode: 1,
            status: 'error',
            message: error.message 
        });
    }
});

// Job Postings Management (legacy support)
router.get('/jobs', protect, async (req, res) => {
    try {
        const Job = require('../models/Job');
        const hospital = await Hospital.findOne({ user: req.user._id });
        
        if (!hospital) {
            return res.json({ success: true, data: [] });
        }

        const jobs = await Job.find({ hospital: hospital._id })
            .sort({ createdAt: -1 });

        res.json({ success: true, data: jobs });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.json({ success: true, data: [] });
    }
});

router.post('/jobs/create', protect, async (req, res) => {
    try {
        const Job = require('../models/Job');
        const hospital = await Hospital.findOne({ user: req.user._id });
        
        if (!hospital) {
            return res.status(404).json({ success: false, message: 'Hospital profile not found' });
        }

        const jobData = {
            hospital: hospital._id,
            ...req.body
        };

        const job = await Job.create(jobData);
        res.status(201).json({ 
            success: true, 
            data: job, 
            message: 'Job posted successfully' 
        });
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/jobs/:id/update', protect, async (req, res) => {
    try {
        const Job = require('../models/Job');
        const hospital = await Hospital.findOne({ user: req.user._id });
        
        if (!hospital) {
            return res.status(404).json({ success: false, message: 'Hospital not found' });
        }

        const job = await Job.findOneAndUpdate(
            { _id: req.params.id, hospital: hospital._id },
            { $set: req.body },
            { new: true }
        );

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        res.json({ success: true, data: job, message: 'Job updated successfully' });
    } catch (error) {
        console.error('Error updating job:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/jobs/:id/delete', protect, async (req, res) => {
    try {
        const Job = require('../models/Job');
        const hospital = await Hospital.findOne({ user: req.user._id });
        
        if (!hospital) {
            return res.status(404).json({ success: false, message: 'Hospital not found' });
        }

        const job = await Job.findOneAndDelete({ 
            _id: req.params.id, 
            hospital: hospital._id 
        });

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        res.json({ success: true, message: 'Job deleted successfully' });
    } catch (error) {
        console.error('Error deleting job:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Applications Management
router.get('/applications', protect, async (req, res) => {
    try {
        const JobApplication = require('../models/JobApplication');
        const Job = require('../models/Job');
        const hospital = await Hospital.findOne({ user: req.user._id });
        
        if (!hospital) {
            return res.json({ success: true, data: [] });
        }

        // Get all jobs for this hospital
        const jobs = await Job.find({ hospital: hospital._id });
        const jobIds = jobs.map(j => j._id);

        // Get applications for these jobs
        const applications = await JobApplication.find({ job: { $in: jobIds } })
            .populate({
                path: 'professional',
                populate: {
                    path: 'user',
                    select: 'firstName lastName email'
                }
            })
            .populate('job')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: applications });
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.json({ success: true, data: [] });
    }
});

router.put('/applications/:id/accept', protect, async (req, res) => {
    try {
        const JobApplication = require('../models/JobApplication');
        
        const application = await JobApplication.findByIdAndUpdate(
            req.params.id,
            { status: 'accepted' },
            { new: true }
        );

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        res.json({ 
            success: true, 
            data: application,
            message: 'Application accepted successfully' 
        });
    } catch (error) {
        console.error('Error accepting application:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/applications/:id/reject', protect, async (req, res) => {
    try {
        const JobApplication = require('../models/JobApplication');
        
        const application = await JobApplication.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected' },
            { new: true }
        );

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        res.json({ 
            success: true, 
            data: application,
            message: 'Application rejected' 
        });
    } catch (error) {
        console.error('Error rejecting application:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Appointments
router.get('/appointments', protect, async (req, res) => {
    try {
        const Appointment = require('../models/Appointment');
        const hospital = await Hospital.findOne({ user: req.user._id });
        
        if (!hospital) {
            return res.json({ success: true, data: [] });
        }

        const appointments = await Appointment.find({ hospital: hospital._id })
            .populate({
                path: 'client',
                populate: {
                    path: 'user',
                    select: 'firstName lastName email'
                }
            })
            .populate({
                path: 'professional',
                populate: {
                    path: 'user',
                    select: 'firstName lastName email'
                }
            })
            .sort({ scheduledDate: -1 });

        res.json({ success: true, data: appointments });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.json({ success: true, data: [] });
    }
});

// Departments Management
router.get('/departments', protect, async (req, res) => {
    try {
        const hospital = await Hospital.findOne({ user: req.user._id });
        
        if (!hospital) {
            return res.json({ success: true, data: [] });
        }

        res.json({ success: true, data: hospital.departments || [] });
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.json({ success: true, data: [] });
    }
});

router.post('/departments/add', protect, async (req, res) => {
    try {
        const hospital = await Hospital.findOne({ user: req.user._id });
        
        if (!hospital) {
            return res.status(404).json({ success: false, message: 'Hospital not found' });
        }

        hospital.departments.push(req.body);
        await hospital.save();

        res.status(201).json({ 
            success: true, 
            data: hospital.departments,
            message: 'Department added successfully' 
        });
    } catch (error) {
        console.error('Error adding department:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Services Management
router.get('/services', protect, async (req, res) => {
    try {
        const hospital = await Hospital.findOne({ user: req.user._id });
        
        if (!hospital) {
            return res.json({ success: true, data: [] });
        }

        res.json({ success: true, data: hospital.services || [] });
    } catch (error) {
        console.error('Error fetching services:', error);
        res.json({ success: true, data: [] });
    }
});

router.post('/services/add', protect, async (req, res) => {
    try {
        const hospital = await Hospital.findOne({ user: req.user._id });
        
        if (!hospital) {
            return res.status(404).json({ success: false, message: 'Hospital not found' });
        }

        hospital.services.push(req.body);
        await hospital.save();

        res.status(201).json({ 
            success: true, 
            data: hospital.services,
            message: 'Service added successfully' 
        });
    } catch (error) {
        console.error('Error adding service:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Settings
router.get('/settings', protect, async (req, res) => {
    try {
        const hospital = await Hospital.findOne({ user: req.user._id });
        
        if (!hospital) {
            return res.status(404).json({ success: false, message: 'Hospital not found' });
        }

        res.json({ 
            success: true, 
            data: {
                operatingHours: hospital.operatingHours || {},
                emergencyServices: hospital.emergencyServices || false,
                acceptedInsurance: hospital.acceptedInsurance || [],
                paymentMethods: hospital.paymentMethods || []
            }
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/settings/update', protect, async (req, res) => {
    try {
        const hospital = await Hospital.findOneAndUpdate(
            { user: req.user._id },
            { $set: req.body },
            { new: true }
        );

        if (!hospital) {
            return res.status(404).json({ success: false, message: 'Hospital not found' });
        }

        res.json({ 
            success: true, 
            data: hospital,
            message: 'Settings updated successfully' 
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ success: false, message: error.message });
    }
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
