const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Subscription = require('../models/Subscription');
const Client = require('../models/Client');
const User = require('../models/User');
const { initializeTransaction, verifyTransaction } = require('../services/paystackService');

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

        // Get or auto-create client profile
        let client = await Client.findOne({ user: req.user._id });
        if (!client) {
            // Auto-create a minimal client profile from the user record
            const user = await User.findById(req.user._id);
            client = await Client.create({
                user: req.user._id,
                phone: user.phone || '0000000000',
                address: {
                    city: user.city || '',
                    state: user.state || '',
                    country: user.country || 'Nigeria',
                }
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

// Initialize Paystack payment for a subscription
router.post('/initialize-payment/:subscriptionId', protect, async (req, res) => {
    try {
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

        if (subscription.paymentStatus === 'completed') {
            return res.status(400).json({ 
                success: false, 
                message: 'Payment already completed for this subscription' 
            });
        }

        // Get user email
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Generate a unique reference
        const reference = `SUB-${subscription._id}-${Date.now()}`;

        const paystackResponse = await initializeTransaction(
            user.email,
            subscription.amount,
            reference,
            { subscriptionId: subscription._id.toString() }
        );

        if (!paystackResponse.status) {
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to initialize payment with Paystack' 
            });
        }

        // Save the reference so we can verify later
        subscription.paymentReference = reference;
        await subscription.save();

        res.json({ 
            success: true, 
            data: {
                authorizationUrl: paystackResponse.data.authorization_url,
                accessCode: paystackResponse.data.access_code,
                reference: paystackResponse.data.reference,
                subscriptionId: subscription._id,
            },
            message: 'Payment initialized. Redirect user to authorization URL.'
        });
    } catch (error) {
        console.error('Payment initialization error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Verify Paystack payment after user completes checkout
router.post('/verify-payment/:reference', async (req, res) => {
    try {
        const { reference } = req.params;

        // Verify with Paystack
        const paystackResponse = await verifyTransaction(reference);

        if (!paystackResponse.status || paystackResponse.data.status !== 'success') {
            return res.status(400).json({ 
                success: false, 
                message: 'Payment verification failed. Transaction was not successful.' 
            });
        }

        const subscriptionId = paystackResponse.data.metadata?.subscriptionId;
        if (!subscriptionId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid payment metadata — subscription ID missing' 
            });
        }

        const subscription = await Subscription.findOne({
            _id: subscriptionId
        });

        if (!subscription) {
            return res.status(404).json({ 
                success: false, 
                message: 'Subscription not found' 
            });
        }

        // Idempotency: don't double-activate
        if (subscription.paymentStatus === 'completed') {
            return res.json({ 
                success: true, 
                data: subscription,
                message: 'Subscription already active.' 
            });
        }

        // Activate subscription
        subscription.status = 'active';
        subscription.paymentStatus = 'completed';
        subscription.paymentReference = reference;
        await subscription.save();

        // Notify patient that subscription is active
        const Notification = require('../models/Notification');
        await Notification.create({
            user: subscription.user,
            title: 'Subscription Activated',
            message: `Your ${subscription.plan} subscription has been activated. You now have full access to book appointments and emergency services.`,
            type: 'payment',
            data: { subscriptionId: subscription._id, plan: subscription.plan, endDate: subscription.endDate }
        }).catch(() => {});

        res.json({ 
            success: true, 
            data: subscription,
            message: 'Payment verified. Your subscription is now active!'
        });
    } catch (error) {
        console.error('Payment verification error:', error);
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

// ─── Provider Subscription Routes (Hospital, Gym-Physio, Ambulance) ───────────
// These are separate from patient subscriptions

const providerRouter = express.Router();

const PROVIDER_PLANS = {
    hospital: [
        { id: 'hospital-monthly',  name: 'Monthly',   duration: 'monthly',   price: 15000, durationMonths: 1,  jobPostings: 5,   features: ['5 job postings/month', 'Application management', 'Candidate messaging', 'Basic analytics'] },
        { id: 'hospital-6months',  name: '6 Months',  duration: '6-months',  price: 75000, durationMonths: 6,  jobPostings: 30,  features: ['30 job postings', 'Priority listing', 'Advanced analytics', 'Email support', 'Save ₦15,000'], popular: true },
        { id: 'hospital-yearly',   name: 'Yearly',    duration: 'yearly',    price: 120000, durationMonths: 12, jobPostings: -1, features: ['Unlimited job postings', 'Featured listings', 'Dedicated support', 'Custom reports', 'Save ₦60,000'] },
    ],
    'gym-physio': [
        { id: 'gym-monthly',  name: 'Monthly',  duration: 'monthly',  price: 5000,  durationMonths: 1,  features: ['List your services', 'Accept bookings', 'Client management', 'Basic analytics'] },
        { id: 'gym-6months', name: '6 Months', duration: '6-months', price: 25000, durationMonths: 6,  features: ['All Monthly features', 'Priority listing', 'Advanced analytics', 'Save ₦5,000'], popular: true },
        { id: 'gym-yearly',  name: 'Yearly',   duration: 'yearly',   price: 40000, durationMonths: 12, features: ['All features', 'Featured placement', 'Dedicated support', 'Save ₦20,000'] },
    ],
    ambulance: [
        { id: 'amb-monthly',  name: 'Monthly',  duration: 'monthly',  price: 8000,  durationMonths: 1,  features: ['List your service', 'Emergency bookings', 'Fleet management', 'Basic analytics'] },
        { id: 'amb-6months', name: '6 Months', duration: '6-months', price: 40000, durationMonths: 6,  features: ['All Monthly features', 'Priority dispatch', 'Advanced analytics', 'Save ₦8,000'], popular: true },
        { id: 'amb-yearly',  name: 'Yearly',   duration: 'yearly',   price: 65000, durationMonths: 12, features: ['All features', 'Featured listing', 'Dedicated support', 'Save ₦31,000'] },
    ],
};

// GET /subscriptions/provider/plans?role=hospital
providerRouter.get('/plans', async (req, res) => {
    const { role } = req.query;
    const plans = PROVIDER_PLANS[role] || [];
    res.json({ success: true, data: plans });
});

// GET /subscriptions/provider/status — check if provider has active subscription
providerRouter.get('/status', protect, async (req, res) => {
    try {
        const sub = await Subscription.findOne({
            user: req.user._id,
            providerType: req.user.role,
            status: 'active',
            paymentStatus: 'completed',
            endDate: { $gte: new Date() }
        });
        res.json({
            success: true,
            data: {
                hasActiveSubscription: !!sub,
                subscription: sub || null,
                daysRemaining: sub ? Math.ceil((sub.endDate - new Date()) / 86400000) : 0,
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /subscriptions/provider/subscribe
providerRouter.post('/subscribe', protect, async (req, res) => {
    try {
        const { planId } = req.body;
        const role = req.user.role; // hospital | gym-physio | ambulance

        const allPlans = PROVIDER_PLANS[role] || [];
        const plan = allPlans.find(p => p.id === planId);
        if (!plan) return res.status(400).json({ success: false, message: 'Invalid plan' });

        // Check existing active subscription
        const existing = await Subscription.findOne({
            user: req.user._id,
            providerType: role,
            status: 'active',
            endDate: { $gte: new Date() }
        });
        if (existing) return res.status(400).json({ success: false, message: 'You already have an active subscription' });

        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + plan.durationMonths);

        const subscription = await Subscription.create({
            user: req.user._id,
            providerType: role,
            plan: plan.id,
            planName: plan.name,
            amount: plan.price,
            startDate,
            endDate,
            status: 'pending',
            paymentStatus: 'pending',
        });

        res.status(201).json({ success: true, data: subscription });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /subscriptions/provider/initialize-payment/:subscriptionId
providerRouter.post('/initialize-payment/:subscriptionId', protect, async (req, res) => {
    try {
        const subscription = await Subscription.findOne({ _id: req.params.subscriptionId, user: req.user._id });
        if (!subscription) return res.status(404).json({ success: false, message: 'Subscription not found' });
        if (subscription.paymentStatus === 'completed') return res.status(400).json({ success: false, message: 'Already paid' });

        const user = await User.findById(req.user._id);
        if (!user?.email) return res.status(400).json({ success: false, message: 'User email required' });

        const reference = `PSUB-${req.user.role.toUpperCase()}-${subscription._id}-${Date.now()}`;

        const paystackResponse = await initializeTransaction(
            user.email,
            subscription.amount,
            reference,
            { subscriptionId: subscription._id.toString(), providerType: req.user.role },
            `${process.env.FRONTEND_URL}/provider-payment/verify`
        );

        if (!paystackResponse.status) {
            return res.status(500).json({ success: false, message: 'Failed to initialize payment' });
        }

        subscription.paymentReference = reference;
        await subscription.save();

        res.json({
            success: true,
            data: {
                authorizationUrl: paystackResponse.data.authorization_url,
                reference: paystackResponse.data.reference,
                subscriptionId: subscription._id,
            }
        });
    } catch (error) {
        console.error('Provider subscription payment error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /subscriptions/provider/verify-payment/:reference
providerRouter.post('/verify-payment/:reference', async (req, res) => {
    try {
        const paystackResponse = await verifyTransaction(req.params.reference);
        if (!paystackResponse.status || paystackResponse.data.status !== 'success') {
            return res.status(400).json({ success: false, message: 'Payment verification failed' });
        }

        const subscriptionId = paystackResponse.data.metadata?.subscriptionId;
        const subscription = await Subscription.findOne({ _id: subscriptionId });
        if (!subscription) return res.status(404).json({ success: false, message: 'Subscription not found' });

        if (subscription.paymentStatus === 'completed') {
            return res.json({ success: true, data: subscription, message: 'Already active' });
        }

        subscription.status = 'active';
        subscription.paymentStatus = 'completed';
        subscription.paymentReference = req.params.reference;
        await subscription.save();

        // Notify provider
        const Notification = require('../models/Notification');
        await Notification.create({
            user: subscription.user,
            title: 'Subscription Activated',
            message: `Your ${subscription.planName || subscription.plan} subscription is now active. You can now list services and accept bookings.`,
            type: 'payment',
            data: { subscriptionId: subscription._id, plan: subscription.plan, endDate: subscription.endDate }
        }).catch(() => {});

        res.json({ success: true, data: subscription, message: 'Subscription activated!' });
    } catch (error) {
        console.error('Provider payment verification error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports.providerRouter = providerRouter;
