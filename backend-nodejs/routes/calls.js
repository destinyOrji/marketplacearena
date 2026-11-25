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

        const userId = req.user.id?.toString() || req.user._id?.toString();

        const isParticipant =
            // Professional: populated object has .user pointing to User._id
            appt.professional?.user?.toString() === userId ||
            // Professional: not populated (raw ObjectId matches professional profile id)
            appt.professional?.toString()        === userId ||
            // Client: populated object has .user pointing to User._id
            appt.client?.user?.toString()         === userId ||
            // Client: not populated (raw ObjectId)
            appt.client?.toString()               === userId ||
            // Fallback: direct user field on appointment
            appt.user?.toString()                 === userId;

        // If strict check fails, do a looser check by re-querying with full population
        let verified = isParticipant;
        if (!verified) {
            const apptFull = await Appointment.findById(appointmentId)
                .populate({ path: 'professional', populate: { path: 'user', select: '_id' } })
                .populate({ path: 'client',       populate: { path: 'user', select: '_id' } });
            verified =
                apptFull?.professional?.user?._id?.toString() === userId ||
                apptFull?.client?.user?._id?.toString()        === userId;
        }

        if (!verified) {
            return res.status(403).json({ success: false, message: 'Not a participant in this appointment' });
        }

        const { url, name, token } = await getOrCreateRoom(appointmentId);

        // Normalise callMode — model field is appointmentMode
        const rawMode = appt.appointmentMode || appt.type || 'video_call';
        const callMode = rawMode === 'phone_call' ? 'phone_call' : 'video_call';

        return res.json({
            success: true,
            data: {
                roomUrl:    url,
                roomName:   name,
                token,
                callMode,
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
