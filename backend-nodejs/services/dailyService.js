/**
 * Daily.co Room Service
 *
 * Creates and manages Daily.co video/audio rooms for appointments.
 *
 * Required .env:
 *   DAILY_API_KEY — from dashboard.daily.co → Developers → API Key
 */

const axios = require('axios');

const DAILY_API = 'https://api.daily.co/v1';

const getClient = () => {
    const key = process.env.DAILY_API_KEY;
    if (!key) throw new Error('DAILY_API_KEY is not set in environment variables');
    return axios.create({
        baseURL: DAILY_API,
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        timeout: 10000,
    });
};

/**
 * Get or create a Daily room for an appointment.
 * Room name is deterministic: hma-{appointmentId}
 * So both patient and provider calling separately get the same room.
 *
 * @param {string} appointmentId
 * @param {number} expiryHours  - room auto-deletes after this many hours (default 24)
 * @returns {{ url: string, name: string, token: string }}
 */
const getOrCreateRoom = async (appointmentId, expiryHours = 24) => {
    const client  = getClient();
    const name    = `hma-${appointmentId}`;
    const expiry  = Math.floor(Date.now() / 1000) + expiryHours * 3600;

    // Try to fetch existing room first
    try {
        const existing = await client.get(`/rooms/${name}`);
        const token    = await createMeetingToken(name, expiry);
        return { url: existing.data.url, name, token, isNew: false };
    } catch (err) {
        // 404 means room doesn't exist yet — create it
        if (err.response?.status !== 404) throw err;
    }

    // Create room
    const res = await client.post('/rooms', {
        name,
        privacy: 'private',          // only people with a token can join
        properties: {
            exp:                  expiry,
            enable_chat:          false,
            enable_screenshare:   false,
            start_video_off:      false,
            start_audio_off:      false,
            max_participants:     2,
            lang:                 'en',
            // Minimal UI — we draw our own
            enable_prejoin_ui:    false,
            enable_network_ui:    false,
            enable_noise_cancellation_ui: false,
        },
    });

    const token = await createMeetingToken(name, expiry);
    return { url: res.data.url, name, token, isNew: true };
};

/**
 * Create a short-lived meeting token for a room.
 * Token grants entry and expires with the room.
 */
const createMeetingToken = async (roomName, exp) => {
    const client = getClient();
    const res    = await client.post('/meeting-tokens', {
        properties: {
            room_name:   roomName,
            exp,
            is_owner:    false,
            enable_recording: false,
        },
    });
    return res.data.token;
};

/**
 * Delete a Daily room (call after appointment ends to save quota).
 */
const deleteRoom = async (appointmentId) => {
    try {
        const client = getClient();
        await client.delete(`/rooms/hma-${appointmentId}`);
    } catch {
        // Non-fatal — room may already be expired
    }
};

module.exports = { getOrCreateRoom, deleteRoom };
