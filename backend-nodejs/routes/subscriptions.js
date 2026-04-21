const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Subscription = require('../models/Subscription');
const Client = require('../models/Client');
const User = require('../models/User');

// Get subscription plans
router.get('/plans', async (req, res) => {
    try {
        const plans = Subscription.getPlans();
        res.json({ success: true, data: plans });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get current user subscription
router.get('/my-subscription', protect, async (req, res) => {
    try {
        const subscription = await Subscription.findOne({
            user: req.user._id,
            status: 'active'
        }).sort({ createdAt: -1 });

        if (!subscription) {
            return res.json({ 
                success: true, 
                data: null,
                message: 'No active subscription found'
            });
        }

        res.json({ success: true, data: subscription });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Check subscription status
router.get('/status', protect, async (req, res) => {
    try {
        const subscription = await Subscription.findOne({
            user: req.user._id,
            status: 'active',
            paymentStatus: 'completed',
            endDate: { $gte: new Date() }
        });

        const hasActiveSubscription = subscription ? subscription.isActive() : false;

        res.json({ 
            success: true, 
            data: {
                hasActiveSubscription,
                subscription: subscription || null,
                daysRemaining: subscription ? 
                    Math.ceil((subscription.endDate - new Date()) / (1000 * 60 * 60 * 24)) : 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create subscription
router.post('/subscribe', protect, async (req, res) => {
    try {
        const { plan } = req.body;

        if (!['monthly', '6-months', 'yearly'].includes(plan)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid subscription plan' 
            });
        }

        // Get client
        const client = await Client.findOne({ user: req.user._id });
        if (!client) {
            return res.status(404).json({ 
                success: false, 
                message: 'Client profile not found' 
            });
        }

        // Check for existing active subscription
        const existingSubscription = await Subscription.findOne({
            user: req.user._id,
            status: 'active',
            endDate: { $gte: new Date() }
        });

        if (existingSubscription && existingSubscription.isActive()) {
            return res.status(400).json({ 
                success: false, 
                message: 'You already have an active subscription' 
            });
        }

        // Get plan details
        const plans = {
            'monthly': 1000,
            '6-months': 4000,
            'yearly': 8000
        };

        const amount = plans[plan];
        const startDate = new Date();
        const endDate = Subscription.calculateEndDate(startDate, plan);

        // Create subscription
        const subscription = await Subscription.create({
            client: client._id,
            user: req.user._id,
            plan,
            amount,
            startDate,
            endDate,
            status: 'pending',
            paymentStatus: 'pending'
        });

        res.status(201).json({ 
            success: true, 
            data: subscription,
            message: 'Subscription created. Please complete payment to activate.'
        });
    } catch (error) {
        console.error('Subscription creation error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Complete payment (simulate payment for now)
router.post('/complete-payment/:subscriptionId', protect, async (req, res) => {
    try {
        const { paymentReference } = req.body;
        
        const subscription = await Subscription.findOne({
            _id: req.params.subscriptionId,
            user: req.user._id
        });

        if (!subscription) {
            return res.status(404).json({ 
                success: false, 
                message: 'Subscription not found' 
            });
        }

        // Update subscription
        subscription.status = 'active';
        subscription.paymentStatus = 'completed';
        subscription.paymentReference = paymentReference || `PAY-${Date.now()}`;
        await subscription.save();

        res.json({ 
            success: true, 
            data: subscription,
            message: 'Payment completed successfully. Your subscription is now active!'
        });
    } catch (error) {
        console.error('Payment completion error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Cancel subscription
router.post('/cancel/:subscriptionId', protect, async (req, res) => {
    try {
        const { reason } = req.body;
        
        const subscription = await Subscription.findOne({
            _id: req.params.subscriptionId,
            user: req.user._id
        });

        if (!subscription) {
            return res.status(404).json({ 
                success: false, 
                message: 'Subscription not found' 
            });
        }

        subscription.status = 'cancelled';
        subscription.cancelledAt = new Date();
        subscription.cancelReason = reason;
        subscription.autoRenew = false;
        await subscription.save();

        res.json({ 
            success: true, 
            data: subscription,
            message: 'Subscription cancelled successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get subscription history
router.get('/history', protect, async (req, res) => {
    try {
        const subscriptions = await Subscription.find({
            user: req.user._id
        }).sort({ createdAt: -1 });

        res.json({ success: true, data: subscriptions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Toggle auto-renew
router.put('/auto-renew/:subscriptionId', protect, async (req, res) => {
    try {
        const { autoRenew } = req.body;
        
        const subscription = await Subscription.findOne({
            _id: req.params.subscriptionId,
            user: req.user._id
        });

        if (!subscription) {
            return res.status(404).json({ 
                success: false, 
                message: 'Subscription not found' 
            });
        }

        subscription.autoRenew = autoRenew;
        await subscription.save();

        res.json({ 
            success: true, 
            data: subscription,
            message: `Auto-renew ${autoRenew ? 'enabled' : 'disabled'} successfully`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
