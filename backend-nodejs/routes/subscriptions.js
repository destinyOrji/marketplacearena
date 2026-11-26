/**
 * Subscription Routes
 *
 * All plans come from the Plan collection (managed by super_admin).
 * No hardcoded plans remain.
 *
 * Free plans (isFree: true OR regularPrice: 0) are activated instantly
 * without any Paystack step.
 *
 * Client routes:  /api/subscriptions/*
 * Provider routes: /api/subscriptions/provider/* (providerRouter)
 */

const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');

const Plan         = require('../models/Plan');
const Subscription = require('../models/Subscription');
const User         = require('../models/User');
const Client       = require('../models/Client');
const { initializeTransaction, verifyTransaction } = require('../services/paystackService');
const { sendInvoiceEmail, sendReceiptEmail }        = require('../services/emailService');

// ─── Shared helpers ───────────────────────────────────────────────────────────

/**
 * Calculate end date from a Plan document.
 * Free / one_time plans get 100 years (effectively permanent).
 */
const calcEndDate = (plan, startDate = new Date()) => {
    const d = new Date(startDate);
    if (plan.isFree || plan.regularPrice === 0 || plan.billingInterval === 'one_time') {
        d.setFullYear(d.getFullYear() + 100);
    } else {
        d.setMonth(d.getMonth() + (plan.durationMonths || 1));
    }
    return d;
};

/**
 * Activate a subscription record immediately (no payment needed).
 */
const activateFree = async (subscription) => {
    subscription.status        = 'active';
    subscription.paymentStatus = 'completed';
    await subscription.save();
    return subscription;
};

/**
 * Find the active subscription for a user (checks planRef or legacy plan string).
 */
const findActiveSub = (userId, extraFilter = {}) =>
    Subscription.findOne({
        user: userId,
        status: 'active',
        paymentStatus: 'completed',
        endDate: { $gte: new Date() },
        ...extraFilter,
    }).sort({ createdAt: -1 });

// ─── CLIENT ROUTES ────────────────────────────────────────────────────────────

/**
 * GET /subscriptions/plans?eligibility=client
 * Returns active plans from DB for the given eligibility (default: all client-eligible plans).
 */
router.get('/plans', async (req, res) => {
    try {
        const { eligibility } = req.query;
        const filter = { status: 'active' };
        if (eligibility) filter.eligibility = { $in: [eligibility, 'all'] };
        else             filter.eligibility = { $in: ['client', 'all'] };

        const plans = await Plan.find(filter).sort({ sortOrder: 1, regularPrice: 1 });
        res.json({ success: true, data: plans.map(p => p.toPublic()) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * GET /subscriptions/my-subscription
 */
router.get('/my-subscription', protect, async (req, res) => {
    try {
        const sub = await Subscription.findOne({
            user: req.user._id, status: 'active'
        }).sort({ createdAt: -1 }).populate('planRef');

        res.json({ success: true, data: sub || null });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * GET /subscriptions/status
 * Returns { hasActiveSubscription, subscription, daysRemaining, plan }
 */
router.get('/status', protect, async (req, res) => {
    try {
        const sub = await findActiveSub(req.user._id);
        const hasActive = !!sub;

        let planData = null;
        if (sub?.planRef) {
            const plan = await Plan.findById(sub.planRef);
            if (plan) planData = plan.toPublic(sub.planRef);
        }

        res.json({
            success: true,
            data: {
                hasActiveSubscription: hasActive,
                subscription:  sub || null,
                plan:          planData,
                daysRemaining: sub ? Math.max(0, Math.ceil((sub.endDate - new Date()) / 86400000)) : 0,
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * POST /subscriptions/subscribe
 * Body: { planId }  — planId is the Plan._id (ObjectId)
 *
 * Free plans → activated immediately, returns { isFree: true }
 * Paid plans → returns pending subscription, caller must call initialize-payment
 */
router.post('/subscribe', protect, async (req, res) => {
    try {
        const { planId } = req.body;
        if (!planId) return res.status(400).json({ success: false, message: 'planId is required' });

        const plan = await Plan.findOne({ _id: planId, status: 'active' });
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found or inactive' });

        // Eligibility check
        if (!['all', 'client'].includes(plan.eligibility)) {
            return res.status(400).json({ success: false, message: 'This plan is not available for patient accounts' });
        }

        // Block duplicate active subscription
        const existing = await findActiveSub(req.user._id);
        if (existing) {
            return res.status(400).json({ success: false, message: 'You already have an active subscription' });
        }

        // Auto-create Client profile if missing
        let client = await Client.findOne({ user: req.user._id });
        if (!client) {
            const user = await User.findById(req.user._id);
            client = await Client.create({
                user: req.user._id,
                phone: user.phone || '0000000000',
                address: { city: user.city || '', state: user.state || '', country: 'Nigeria' }
            });
        }

        const isFree = plan.isFree || plan.effectivePrice === 0;
        const startDate = new Date();
        const endDate   = calcEndDate(plan, startDate);

        const subscription = await Subscription.create({
            client:        client._id,
            user:          req.user._id,
            planRef:       plan._id,
            plan:          plan.planName,
            planName:      plan.planName,
            providerType:  'client',
            amount:        isFree ? 0 : plan.effectivePrice,
            currency:      plan.currency,
            startDate,
            endDate,
            status:        isFree ? 'active'  : 'pending',
            paymentStatus: isFree ? 'completed' : 'pending',
        });

        if (isFree) {
            return res.status(201).json({
                success: true,
                data: subscription,
                isFree: true,
                message: 'Free plan activated successfully.',
            });
        }

        res.status(201).json({
            success: true,
            data: subscription,
            isFree: false,
            message: 'Subscription created. Please complete payment to activate.',
        });
    } catch (error) {
        console.error('Subscribe error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * POST /subscriptions/initialize-payment/:subscriptionId
 * Only called for paid subscriptions (isFree ones are already active).
 */
router.post('/initialize-payment/:subscriptionId', protect, async (req, res) => {
    try {
        const subscription = await Subscription.findOne({
            _id: req.params.subscriptionId, user: req.user._id
        });
        if (!subscription) return res.status(404).json({ success: false, message: 'Subscription not found' });
        if (subscription.paymentStatus === 'completed') {
            return res.status(400).json({ success: false, message: 'Payment already completed' });
        }

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const reference = `SUB-${subscription._id}-${Date.now()}`;

        const paystackResponse = await initializeTransaction(
            user.email,
            subscription.amount,
            reference,
            { subscriptionId: subscription._id.toString() }
        );

        if (!paystackResponse.status) {
            return res.status(500).json({ success: false, message: 'Failed to initialize payment with Paystack' });
        }

        subscription.paymentReference = reference;
        await subscription.save();

        sendInvoiceEmail(user.email, {
            firstName:     user.firstName || user.email.split('@')[0],
            invoiceNumber: `INV-${subscription._id.toString().slice(-8).toUpperCase()}`,
            description:   `${subscription.planName} — Health Market Arena`,
            amount:        subscription.amount,
            currency:      subscription.currency || 'NGN',
            billingInterval: subscription.plan,
            dueDate:       new Date(Date.now() + 24 * 60 * 60 * 1000),
            paymentUrl:    paystackResponse.data.authorization_url,
        }).catch(err => console.error('Invoice email failed:', err.message));

        res.json({
            success: true,
            data: {
                authorizationUrl: paystackResponse.data.authorization_url,
                accessCode:       paystackResponse.data.access_code,
                reference:        paystackResponse.data.reference,
                subscriptionId:   subscription._id,
            },
        });
    } catch (error) {
        console.error('Payment init error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * POST /subscriptions/verify-payment/:reference
 */
router.post('/verify-payment/:reference', async (req, res) => {
    try {
        const { reference } = req.params;
        const paystackResponse = await verifyTransaction(reference);

        if (!paystackResponse.status || paystackResponse.data.status !== 'success') {
            return res.status(400).json({ success: false, message: 'Payment verification failed.' });
        }

        const subscriptionId = paystackResponse.data.metadata?.subscriptionId;
        if (!subscriptionId) {
            return res.status(400).json({ success: false, message: 'Invalid payment metadata' });
        }

        const subscription = await Subscription.findById(subscriptionId);
        if (!subscription) return res.status(404).json({ success: false, message: 'Subscription not found' });

        if (subscription.paymentStatus === 'completed') {
            return res.json({ success: true, data: subscription, message: 'Already active.' });
        }

        subscription.status        = 'active';
        subscription.paymentStatus = 'completed';
        subscription.paymentReference = reference;
        await subscription.save();

        const Notification = require('../models/Notification');
        await Notification.create({
            user:    subscription.user,
            title:   'Subscription Activated',
            message: `Your ${subscription.planName} plan is now active.`,
            type:    'payment',
            data:    { subscriptionId: subscription._id, endDate: subscription.endDate },
        }).catch(() => {});

        const paidUser = await User.findById(subscription.user).select('email firstName').catch(() => null);
        if (paidUser) {
            sendReceiptEmail(paidUser.email, {
                firstName:           paidUser.firstName || paidUser.email.split('@')[0],
                receiptNumber:       `RCP-${subscription._id.toString().slice(-8).toUpperCase()}`,
                description:         `${subscription.planName} — Health Market Arena`,
                amount:              subscription.amount,
                currency:            subscription.currency || 'NGN',
                billingInterval:     subscription.plan,
                paidAt:              new Date(),
                paymentReference:    reference,
                subscriptionEndDate: subscription.endDate,
            }).catch(err => console.error('Receipt email failed:', err.message));
        }

        res.json({ success: true, data: subscription, message: 'Payment verified. Subscription is now active!' });
    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * POST /subscriptions/cancel/:subscriptionId
 */
router.post('/cancel/:subscriptionId', protect, async (req, res) => {
    try {
        const subscription = await Subscription.findOne({
            _id: req.params.subscriptionId, user: req.user._id
        });
        if (!subscription) return res.status(404).json({ success: false, message: 'Subscription not found' });

        subscription.status       = 'cancelled';
        subscription.cancelledAt  = new Date();
        subscription.cancelReason = req.body.reason || '';
        subscription.autoRenew    = false;
        await subscription.save();

        res.json({ success: true, data: subscription, message: 'Subscription cancelled.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * GET /subscriptions/history
 */
router.get('/history', protect, async (req, res) => {
    try {
        const subs = await Subscription.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, data: subs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * PUT /subscriptions/auto-renew/:subscriptionId
 */
router.put('/auto-renew/:subscriptionId', protect, async (req, res) => {
    try {
        const subscription = await Subscription.findOne({
            _id: req.params.subscriptionId, user: req.user._id
        });
        if (!subscription) return res.status(404).json({ success: false, message: 'Subscription not found' });

        subscription.autoRenew = !!req.body.autoRenew;
        await subscription.save();
        res.json({ success: true, data: subscription, message: `Auto-renew ${subscription.autoRenew ? 'enabled' : 'disabled'}.` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;

// ─── PROVIDER ROUTER ─────────────────────────────────────────────────────────
// All provider plans (professional, hospital, ambulance, gym-physio)
// come exclusively from the Plan collection. No hardcoded fallback.

const providerRouter = express.Router();

/**
 * GET /subscriptions/provider/plans?role=professional
 * Returns active plans from DB matching the role eligibility.
 */
providerRouter.get('/plans', async (req, res) => {
    try {
        const { role } = req.query;
        if (!role) return res.json({ success: true, data: [] });

        const plans = await Plan.find({
            status: 'active',
            eligibility: { $in: [role, 'all'] },
        }).sort({ sortOrder: 1, regularPrice: 1 });

        res.json({ success: true, data: plans.map(p => p.toPublic()), source: 'db' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * GET /subscriptions/provider/status
 */
providerRouter.get('/status', protect, async (req, res) => {
    try {
        const sub = await findActiveSub(req.user._id, { providerType: req.user.role });

        let planData = null;
        if (sub?.planRef) {
            const plan = await Plan.findById(sub.planRef);
            if (plan) planData = plan.toPublic(sub.planRef);
        }

        res.json({
            success: true,
            data: {
                hasActiveSubscription: !!sub,
                subscription:  sub || null,
                plan:          planData,
                daysRemaining: sub ? Math.max(0, Math.ceil((sub.endDate - new Date()) / 86400000)) : 0,
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * POST /subscriptions/provider/subscribe
 * Body: { planId }  — always a Plan._id from the DB.
 *
 * Free plans → activated instantly, isFree: true in response.
 * Paid plans → pending, caller must call initialize-payment.
 */
providerRouter.post('/subscribe', protect, async (req, res) => {
    try {
        const { planId } = req.body;
        const role = req.user.role;

        if (!planId) return res.status(400).json({ success: false, message: 'planId is required' });

        const plan = await Plan.findOne({ _id: planId, status: 'active' });
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found or inactive' });

        // Eligibility check
        if (plan.eligibility !== 'all' && plan.eligibility !== role) {
            return res.status(400).json({ success: false, message: `This plan is not available for ${role} accounts` });
        }

        // Block duplicate active subscription
        const existing = await findActiveSub(req.user._id, { providerType: role });
        if (existing) return res.status(400).json({ success: false, message: 'You already have an active subscription' });

        const isFree    = plan.isFree || plan.effectivePrice === 0;
        const startDate = new Date();
        const endDate   = calcEndDate(plan, startDate);

        const subscription = await Subscription.create({
            user:          req.user._id,
            planRef:       plan._id,
            plan:          plan.planName,
            planName:      plan.planName,
            providerType:  role,
            amount:        isFree ? 0 : plan.effectivePrice,
            currency:      plan.currency,
            startDate,
            endDate,
            status:        isFree ? 'active'    : 'pending',
            paymentStatus: isFree ? 'completed' : 'pending',
        });

        if (isFree) {
            return res.status(201).json({
                success: true,
                data: subscription,
                isFree: true,
                message: 'Free plan activated successfully.',
            });
        }

        res.status(201).json({ success: true, data: subscription, isFree: false });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * POST /subscriptions/provider/initialize-payment/:subscriptionId
 */
providerRouter.post('/initialize-payment/:subscriptionId', protect, async (req, res) => {
    try {
        const subscription = await Subscription.findOne({
            _id: req.params.subscriptionId, user: req.user._id
        });
        if (!subscription)                            return res.status(404).json({ success: false, message: 'Subscription not found' });
        if (subscription.paymentStatus === 'completed') return res.status(400).json({ success: false, message: 'Already paid' });

        const user = await User.findById(req.user._id);
        if (!user?.email) return res.status(400).json({ success: false, message: 'User email required' });

        const reference = `PSUB-${req.user.role.toUpperCase()}-${subscription._id}-${Date.now()}`;

        // Build role-specific callback URL so Paystack returns to the right dashboard
        const roleCallbackPaths = {
            hospital:   '/hospital/subscription',
            ambulance:  '/ambulance/subscription',
            gym_physio: '/gym-physio/subscription',
            'gym-physio': '/gym-physio/subscription',
            professional: '/professional/subscription',
        };
        const callbackPath = roleCallbackPaths[req.user.role] || '/provider-payment/verify';
        const callbackUrl  = `${process.env.FRONTEND_URL}${callbackPath}?reference=${reference}&status=success`;

        const paystackResponse = await initializeTransaction(
            user.email,
            subscription.amount,
            reference,
            { subscriptionId: subscription._id.toString(), providerType: req.user.role },
            callbackUrl
        );

        if (!paystackResponse.status) {
            return res.status(500).json({ success: false, message: 'Failed to initialize payment' });
        }

        subscription.paymentReference = reference;
        await subscription.save();

        sendInvoiceEmail(user.email, {
            firstName:     user.firstName || user.email.split('@')[0],
            invoiceNumber: `INV-${subscription._id.toString().slice(-8).toUpperCase()}`,
            description:   `${subscription.planName} — Health Market Arena`,
            amount:        subscription.amount,
            currency:      subscription.currency || 'NGN',
            billingInterval: subscription.plan,
            dueDate:       new Date(Date.now() + 24 * 60 * 60 * 1000),
            paymentUrl:    paystackResponse.data.authorization_url,
        }).catch(err => console.error('Invoice email failed (provider):', err.message));

        res.json({
            success: true,
            data: {
                authorizationUrl: paystackResponse.data.authorization_url,
                reference:        paystackResponse.data.reference,
                subscriptionId:   subscription._id,
            }
        });
    } catch (error) {
        console.error('Provider payment init error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * POST /subscriptions/provider/verify-payment/:reference
 */
providerRouter.post('/verify-payment/:reference', async (req, res) => {
    try {
        const paystackResponse = await verifyTransaction(req.params.reference);
        if (!paystackResponse.status || paystackResponse.data.status !== 'success') {
            return res.status(400).json({ success: false, message: 'Payment verification failed' });
        }

        const subscriptionId = paystackResponse.data.metadata?.subscriptionId;
        const subscription   = await Subscription.findById(subscriptionId);
        if (!subscription) return res.status(404).json({ success: false, message: 'Subscription not found' });

        if (subscription.paymentStatus === 'completed') {
            return res.json({ success: true, data: subscription, message: 'Already active' });
        }

        subscription.status        = 'active';
        subscription.paymentStatus = 'completed';
        subscription.paymentReference = req.params.reference;
        await subscription.save();

        const Notification = require('../models/Notification');
        await Notification.create({
            user:    subscription.user,
            title:   'Subscription Activated',
            message: `Your ${subscription.planName} plan is now active.`,
            type:    'payment',
            data:    { subscriptionId: subscription._id, endDate: subscription.endDate },
        }).catch(() => {});

        const paidUser = await User.findById(subscription.user).select('email firstName').catch(() => null);
        if (paidUser) {
            sendReceiptEmail(paidUser.email, {
                firstName:           paidUser.firstName || paidUser.email.split('@')[0],
                receiptNumber:       `RCP-${subscription._id.toString().slice(-8).toUpperCase()}`,
                description:         `${subscription.planName} — Health Market Arena`,
                amount:              subscription.amount,
                currency:            subscription.currency || 'NGN',
                billingInterval:     subscription.plan,
                paidAt:              new Date(),
                paymentReference:    req.params.reference,
                subscriptionEndDate: subscription.endDate,
            }).catch(err => console.error('Receipt email failed (provider):', err.message));
        }

        res.json({ success: true, data: subscription, message: 'Subscription activated!' });
    } catch (error) {
        console.error('Provider verify payment error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports.providerRouter = providerRouter;
