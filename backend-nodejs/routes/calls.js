/**
 * /api/calls
 *
 * Endpoints:
 *   POST /api/calls/room/:appointmentId   — get/create a Daily room for an appointment
 *   DELETE /api/calls/room/:appointmentId — delete the room after call ends
 *
 * When Party A joins first, the backend:
 *   1. Creates the Daily room
 *   2. Sends a call_started notification to Party B so they see a banner
 *
 * When Party B joins later (room already exists), no duplicate notification is sent.
 */

const express  = require('express');
const router   = express.Router();
const { protect }                     = require('../middleware/auth');
const { getOrCreateRoom, deleteRoom } = require('../services/dailyService');
const Appointment  = require('../models/Appointment');
const Notification = require('../models/Notification');
const User         = require('../models/User');

// ── Helper: resolve User._id from a Professional or Client populate ───────────
const resolveUserId = async (ref, model) => {
    if (!ref) return null;
    // Already populated with .user
    if (ref.user) return ref.user?._id?.toString() || ref.user?.toString();
    // Raw ObjectId — look up the profile to get user
    try {
        const M = require('../models/' + model);
        const doc = await M.findById(ref).select('user');
        return doc?.user?.toString() || null;
    } catch { return null; }
};

// ── POST /api/calls/room/:appointmentId ────────────────────────────────────────
router.post('/room/:appointmentId', protect, async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const callerId = req.user.id?.toString() || req.user._id?.toString();

        // ── Load appointment with both participants populated ────────────────
        const appt = await Appointment.findById(appointmentId)
            .populate({ path: 'professional', populate: { path: 'user', select: '_id firstName lastName' } })
            .populate({ path: 'client',       populate: { path: 'user', select: '_id firstName lastName' } });

        if (!appt) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        // ── Participant check ────────────────────────────────────────────────
        const profUserId   = appt.professional?.user?._id?.toString() || appt.professional?.user?.toString();
        const clientUserId = appt.client?.user?._id?.toString()        || appt.client?.user?.toString();

        const isParticipant = profUserId === callerId || clientUserId === callerId ||
            appt.professional?.toString() === callerId ||
            appt.client?.toString()        === callerId ||
            appt.user?.toString()          === callerId;

        if (!isParticipant) {
            return res.status(403).json({ success: false, message: 'Not a participant in this appointment' });
        }

        // ── Get or create Daily room ─────────────────────────────────────────
        // isNew = true means the room was just created (first caller)
        const { url, name, token, isNew } = await getOrCreateRoom(appointmentId);

        // ── Normalise call mode ──────────────────────────────────────────────
        const rawMode = appt.appointmentMode || appt.type || 'video_call';
        const callMode = rawMode === 'phone_call' ? 'phone_call' : 'video_call';
        const modeLabel = callMode === 'phone_call' ? 'Phone Call' : 'Video Call';
        const modeIcon  = callMode === 'phone_call' ? '📞' : '📹';

        // ── Notify the OTHER participant (only on first join) ────────────────
        if (isNew) {
            // Determine caller name and the other party's User._id
            const callerUser = await User.findById(callerId).select('firstName lastName role');
            const callerName = callerUser
                ? `${callerUser.firstName || ''} ${callerUser.lastName || ''}`.trim()
                : 'Your provider';

            // Other party = whichever userId is not the caller
            const otherUserId = callerId === profUserId ? clientUserId : profUserId;

            if (otherUserId) {
                // Determine the other party's dashboard path
                const otherUser = await User.findById(otherUserId).select('role');
                const dashPrefix = otherUser?.role === 'patient' || otherUser?.role === 'client'
                    ? 'patient'
                    : 'professional';

                await Notification.create({
                    user:    otherUserId,
                    title:   `${modeIcon} Incoming ${modeLabel}`,
                    message: `${callerName} has started the call and is waiting for you.`,
                    type:    'call_started',
                    data: {
                        appointmentId,
                        callMode,
                        callerName,
                        joinPath: `/${dashPrefix}/video-call/${appointmentId}`,
                    },
                    isRead: false,
                });
            }
        }

        return res.json({
            success: true,
            data: { roomUrl: url, roomName: name, token, callMode },
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
