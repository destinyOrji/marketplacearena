const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

router.get('/', (req, res) => {
    res.json({ message: 'Users routes' });
});

// Notifications - return empty array (no errors in frontend)
router.get('/notifications', protect, (req, res) => {
    res.json({
        success: true,
        data: []
    });
});

router.put('/notifications/:id/read', protect, (req, res) => {
    res.json({ success: true, message: 'Notification marked as read' });
});

router.put('/notifications/read-all', protect, (req, res) => {
    res.json({ success: true, message: 'All notifications marked as read' });
});

module.exports = router;
