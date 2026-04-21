const Subscription = require('../models/Subscription');

/**
 * Middleware to check if user has an active subscription
 * Use this on routes that require subscription (booking, emergency services)
 */
const requireSubscription = async (req, res, next) => {
    try {
        // Skip subscription check for non-client roles
        if (req.user.role !== 'client') {
            return next();
        }

        // Check for active subscription
        const subscription = await Subscription.findOne({
            user: req.user._id,
            status: 'active',
            paymentStatus: 'completed',
            endDate: { $gte: new Date() }
        });

        if (!subscription || !subscription.isActive()) {
            return res.status(403).json({
                success: false,
                message: 'Active subscription required to access this feature',
                code: 'SUBSCRIPTION_REQUIRED',
                data: {
                    hasSubscription: false,
                    redirectTo: '/patient/subscription'
                }
            });
        }

        // Attach subscription to request for use in route handlers
        req.subscription = subscription;
        next();
    } catch (error) {
        console.error('Subscription check error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking subscription status'
        });
    }
};

/**
 * Middleware to check subscription but don't block access
 * Just adds subscription info to request
 */
const checkSubscription = async (req, res, next) => {
    try {
        if (req.user.role === 'client') {
            const subscription = await Subscription.findOne({
                user: req.user._id,
                status: 'active',
                paymentStatus: 'completed',
                endDate: { $gte: new Date() }
            });

            req.hasSubscription = subscription ? subscription.isActive() : false;
            req.subscription = subscription || null;
        }
        next();
    } catch (error) {
        console.error('Subscription check error:', error);
        next();
    }
};

module.exports = {
    requireSubscription,
    checkSubscription
};
