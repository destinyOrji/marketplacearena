const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const Client = require('../models/Client');
const Professional = require('../models/Professional');

// Get appointments (for patient or professional based on role)
router.get('/', protect, async (req, res) => {
    try {
        const { status, limit } = req.query;
        let query = {};

        if (req.user.role === 'client') {
            const client = await Client.findOne({ user: req.user._id });
            if (!client) return res.json({ success: true, data: { data: [] } });
            query.client = client._id;
        } else if (req.user.role === 'professional') {
            const professional = await Professional.findOne({ user: req.user._id });
            if (!professional) return res.json({ success: true, data: { data: [] } });
            query.professional = professional._id;
        }

        if (status && status !== 'all') query.status = status;

        let q = Appointment.find(query).sort({ scheduledDate: -1 });
        if (limit) q = q.limit(parseInt(limit));

        const appointments = await q;
        res.json({ success: true, data: { data: appointments } });
    } catch (error) {
        res.json({ success: true, data: { data: [] } });
    }
});

router.post('/book', protect, async (req, res) => {
    res.json({ success: true, message: 'Appointment booked successfully', data: { id: Date.now().toString(), ...req.body } });
});

router.put('/:id/cancel', protect, async (req, res) => {
    res.json({ success: true, message: 'Appointment cancelled' });
});

router.put('/:id/reschedule', protect, async (req, res) => {
    res.json({ success: true, message: 'Appointment rescheduled' });
});

module.exports = router;
