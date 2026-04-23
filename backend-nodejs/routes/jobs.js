const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const Professional = require('../models/Professional');
const Notification = require('../models/Notification');

// Browse all active job postings
router.get('/', protect, async (req, res) => {
    try {
        const { page = 1, limit = 20, search, department, experienceLevel, employmentType } = req.query;
        const skip = (page - 1) * limit;

        let query = { status: 'active' };
        if (department) query.department = { $regex: department, $options: 'i' };
        if (experienceLevel) query.experienceLevel = experienceLevel;
        if (employmentType) query.employmentType = employmentType;
        if (search) {
            query.$or = [
                { jobTitle: { $regex: search, $options: 'i' } },
                { department: { $regex: search, $options: 'i' } },
                { jobDescription: { $regex: search, $options: 'i' } }
            ];
        }

        const jobs = await Job.find(query)
            .populate({ path: 'hospital', populate: { path: 'user', select: 'firstName lastName' } })
            .sort({ publishedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Job.countDocuments(query);

        // Check which jobs the professional has applied to
        let appliedJobIds = [];
        if (req.user.role === 'professional') {
            const professional = await Professional.findOne({ user: req.user._id });
            if (professional) {
                const applications = await JobApplication.find({ professional: professional._id }).select('job');
                appliedJobIds = applications.map(a => a.job.toString());
            }
        }

        const data = jobs.map(job => ({
            id: job._id,
            jobTitle: job.jobTitle,
            department: job.department,
            jobDescription: job.jobDescription,
            experienceLevel: job.experienceLevel,
            minimumExperienceYears: job.minimumExperienceYears,
            employmentType: job.employmentType,
            salaryRangeMin: job.salaryRangeMin,
            salaryRangeMax: job.salaryRangeMax,
            salaryCurrency: job.salaryCurrency,
            benefits: job.benefits,
            numberOfPositions: job.numberOfPositions,
            applicationDeadline: job.applicationDeadline,
            publishedAt: job.publishedAt,
            hospital: {
                id: job.hospital?._id,
                name: job.hospital?.hospitalName,
                city: job.hospital?.address?.city,
                state: job.hospital?.address?.state,
            },
            hasApplied: appliedJobIds.includes(job._id.toString()),
        }));

        res.json({ success: true, data, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
    } catch (error) {
        console.error('Browse jobs error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get single job
router.get('/:id', protect, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate({ path: 'hospital', populate: { path: 'user', select: 'firstName lastName email' } });

        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

        // Increment views
        await Job.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

        let hasApplied = false;
        if (req.user.role === 'professional') {
            const professional = await Professional.findOne({ user: req.user._id });
            if (professional) {
                const application = await JobApplication.findOne({ job: job._id, professional: professional._id });
                hasApplied = !!application;
            }
        }

        res.json({ success: true, data: { ...job.toObject(), hasApplied } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Apply to a job
router.post('/:id/apply', protect, async (req, res) => {
    try {
        if (req.user.role !== 'professional') {
            return res.status(403).json({ success: false, message: 'Only professionals can apply to jobs' });
        }

        const job = await Job.findById(req.params.id)
            .populate({ path: 'hospital', populate: { path: 'user', select: '_id' } });

        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
        if (job.status !== 'active') return res.status(400).json({ success: false, message: 'This job is no longer accepting applications' });

        let professional = await Professional.findOne({ user: req.user._id });
        if (!professional) {
            professional = await Professional.create({ user: req.user._id, professionalType: 'other' });
        }

        // Check duplicate
        const existing = await JobApplication.findOne({ job: job._id, professional: professional._id });
        if (existing) return res.status(400).json({ success: false, message: 'You have already applied to this job' });

        const application = await JobApplication.create({
            job: job._id,
            professional: professional._id,
            coverLetter: req.body.coverLetter || '',
            status: 'pending'
        });

        // Notify hospital
        if (job.hospital?.user?._id) {
            await Notification.create({
                user: job.hospital.user._id,
                title: 'New Job Application',
                message: `${req.user.firstName} ${req.user.lastName} applied for ${job.jobTitle}`,
                type: 'application_received',
                data: { jobId: job._id, applicationId: application._id }
            });
        }

        res.status(201).json({ success: true, data: application, message: 'Application submitted successfully!' });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'You have already applied to this job' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get my applications (for professionals)
router.get('/my/applications', protect, async (req, res) => {
    try {
        const professional = await Professional.findOne({ user: req.user._id });
        if (!professional) return res.json({ success: true, data: [] });

        const applications = await JobApplication.find({ professional: professional._id })
            .populate({ path: 'job', populate: { path: 'hospital', select: 'hospitalName address' } })
            .sort({ createdAt: -1 });

        res.json({ success: true, data: applications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
