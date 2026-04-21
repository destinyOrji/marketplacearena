const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Browse all job postings (from hospitals)
router.get('/', protect, async (req, res) => {
    try {
        const Hospital = require('../models/Hospital');
        // Return hospital vacancies as job postings
        const hospitals = await Hospital.find({ isVerified: true })
            .populate('user', 'firstName lastName email')
            .select('hospitalName departments services');

        // Transform to job posting format
        const jobs = hospitals.flatMap(hospital =>
            (hospital.departments || []).map((dept, i) => ({
                id: `${hospital._id}-${i}`,
                title: `${dept.name || 'Healthcare'} Professional`,
                description: `Join ${hospital.hospitalName} in the ${dept.name || 'healthcare'} department.`,
                specialty: dept.name || 'General',
                location: 'On-site',
                jobType: 'full-time',
                compensation: { type: 'negotiable' },
                postedDate: hospital.createdAt || new Date(),
                applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                hasApplied: false,
                hospitalName: hospital.hospitalName,
            }))
        );

        res.json({ success: true, data: jobs });
    } catch (error) {
        res.json({ success: true, data: [] });
    }
});

router.get('/:id', protect, async (req, res) => {
    res.json({ success: false, message: 'Job not found' });
});

router.post('/:id/apply', protect, async (req, res) => {
    res.json({ success: true, message: 'Application submitted successfully' });
});

module.exports = router;
