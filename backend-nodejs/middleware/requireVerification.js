/**
 * requireVerification middleware
 * Blocks unverified providers from using protected endpoints.
 * Applied to professional, hospital, ambulance, gym-physio routes.
 * Clients (patients) are exempt — they just need a subscription.
 */
const Professional = require('../models/Professional');
const Hospital     = require('../models/Hospital');
const Ambulance    = require('../models/Ambulance');
const GymPhysio    = require('../models/GymPhysio');

// Routes that are always accessible even without verification
const EXEMPT_PATHS = [
    '/profile',
    '/profile/update',
    '/dashboard-stats',
    '/upload-photo',
    '/documents/upload',
    '/change-password',
    '/settings',
    '/settings/update',
    '/bank-account',
    '/subscription',
    '/subscribe',
];

const isExempt = (path) => EXEMPT_PATHS.some(e => path.endsWith(e) || path.includes(e));

exports.requireVerification = async (req, res, next) => {
    // Only apply to provider roles
    const providerRoles = ['professional', 'hospital', 'ambulance', 'gym-physio'];
    if (!providerRoles.includes(req.user?.role)) return next();

    // Allow profile/settings endpoints always
    if (isExempt(req.path)) return next();

    try {
        let isVerified = false;

        if (req.user.role === 'professional') {
            const p = await Professional.findOne({ user: req.user._id }).select('isVerified');
            isVerified = p?.isVerified || false;
        } else if (req.user.role === 'hospital') {
            const h = await Hospital.findOne({ user: req.user._id }).select('isVerified');
            isVerified = h?.isVerified || false;
        } else if (req.user.role === 'ambulance') {
            const a = await Ambulance.findOne({ user: req.user._id }).select('isVerified');
            isVerified = a?.isVerified || false;
        } else if (req.user.role === 'gym-physio') {
            const g = await GymPhysio.findOne({ user: req.user._id }).select('isVerified');
            isVerified = g?.isVerified || false;
        }

        if (!isVerified) {
            return res.status(403).json({
                success: false,
                message: 'Your account is pending verification by admin. You will be notified once approved.',
                code: 'PENDING_VERIFICATION'
            });
        }

        next();
    } catch (error) {
        // Fail open — don't block if DB check fails
        console.error('requireVerification error:', error.message);
        next();
    }
};
