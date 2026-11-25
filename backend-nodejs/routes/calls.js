/**
 * /api/calls
 *
 * Endpoints:
 *   POST /api/calls/room/:appointmentId   — get/create a Daily room for an appointment
 *   DELETE /api/calls/room/:appointmentId — delete the room after call ends
 *
 * Both patient and provider call the same POST endpoint.
 * They receive the same room URL + a fresh meeting token.
 */

const express  = require('express');
const router   = express.Router();
const { protect }         = require('../middleware/auth');
const { getOrCreateRoom, deleteRoom } = require('../services/dailyService');
const Appointment = require('../models/Appointment');

// ── POST /api/calls/room/:appointmentId ────────────────────────────────────────
router.post('/room/:appointmentId', protect, async (req, res) => {
    try {
        const { appointmentId } = req.params;

        // Verify the requesting user is a participant in this appointment
        const appt = await Appointment.findById(appointmentId)
            .populate('professional', 'user')
            .populate('client',       'user');

        if (!appt) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        const userId = req.user.id || req.user._id;

        const isParticipant =
            appt.professional?.user?.toString() === userId.toString() ||
            appt.professional?.toString()        === userId.toString() ||
            appt.client?.user?.toString()         === userId.toString() ||
            appt.client?.toString()               === userId.toString() ||
            appt.user?.toString()                 === userId.toString();

        if (!isParticipant) {
            return res.status(403).json({ success: false, message: 'Not a participant in this appointment' });
        }

        const { url, name, token } = await getOrCreateRoom(appointmentId);

        return res.json({
            success: true,
            data: {
                roomUrl:    url,
                roomName:   name,
                token,
                // mode hint (video_call vs phone_call) so the front-end knows what to render
                callMode: appt.type || appt.appointmentMode || 'video_call',
            },
        });
    } catch (err) {
        console.error('calls/room error:', err.message);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// ── DELETE /api/calls/room/:appointmentId ──────────────────────────────────────
router.delete('/room/:appointmentId', protect, async (req, res) => {
    try {
        await deleteRoom(req.params.appointmentId);
        return res.json({ success: true });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
