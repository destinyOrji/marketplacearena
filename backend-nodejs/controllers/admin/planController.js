/**
 * Plan Controller
 *
 * All write operations (create / update / delete / assign / duplicate) are
 * restricted to super_admin. Read operations (list / get) are open to any
 * authenticated admin.
 *
 * Maps to the PHP planConfig class:
 *   savePlan        → createPlan + updatePlan (upsert)
 *   updatePlan      → updatePlan
 *   getPlan         → getPlan
 *   listPlans       → listPlans  (all, with filters)
 *   listActivePlans → listActivePlans (public-facing, marks isSubscribed)
 *   deletePlan      → deletePlan
 *   togglePlanStatus→ toggleStatus
 *   duplicatePlan   → duplicatePlan
 *   assignPlan      → assignPlan  (super_admin gives a plan to a user)
 *   setDefaultPlan  → setDefault
 *   getPlanOptions  → getPlanOptions
 *   mySubscription  → handled in subscriptions route
 */

const Plan         = require('../../models/Plan');
const Subscription = require('../../models/Subscription');
const User         = require('../../models/User');

// ─── Guard helper ─────────────────────────────────────────────────────────────

const requireSuperAdmin = (req, res) => {
    if (req.admin?.role !== 'super_admin') {
        res.status(403).json({ statuscode: 1, status: 'error', message: 'Only super admins can perform this action.' });
        return false;
    }
    return true;
};

// ─── Validate required fields ─────────────────────────────────────────────────

const REQUIRED = ['planName', 'regularPrice', 'billingInterval'];

const validateFields = (body) => {
    for (const field of REQUIRED) {
        if (body[field] === undefined || body[field] === '') {
            return `${field} is required`;
        }
    }
    return null;
};

// ─── Clear default flag ───────────────────────────────────────────────────────

const clearDefault = async () => {
    await Plan.updateMany({ isDefault: true }, { $set: { isDefault: false } });
};

// ─── CREATE ───────────────────────────────────────────────────────────────────

exports.createPlan = async (req, res) => {
    try {
        if (!requireSuperAdmin(req, res)) return;

        const err = validateFields(req.body);
        if (err) return res.status(400).json({ statuscode: 1, status: 'error', message: err });

        const existing = await Plan.findOne({ planName: req.body.planName.trim() });
        if (existing) {
            return res.status(409).json({ statuscode: 1, status: 'error', message: 'A plan with this name already exists.' });
        }

        const {
            planName, description, regularPrice, promotionalPrice, currency,
            billingInterval, trialPeriodDays, status, isDefault, eligibility,
            maxJobPostings, maxServices, maxAppointmentsPerMonth, storageAllowanceMB,
            features, resetPolicy, unusedCreditsPolicy, limitAction,
            sortOrder, popular,
        } = req.body;

        if (isDefault) await clearDefault();

        const plan = await Plan.create({
            planName:            planName.trim(),
            description:         description || '',
            regularPrice:        Number(regularPrice),
            promotionalPrice:    Number(promotionalPrice) || 0,
            currency:            currency || 'NGN',
            billingInterval,
            trialPeriodDays:     Number(trialPeriodDays) || 0,
            status:              status || 'draft',
            isDefault:           Boolean(isDefault),
            eligibility:         eligibility || 'all',
            maxJobPostings:      maxJobPostings !== undefined ? Number(maxJobPostings) : -1,
            maxServices:         maxServices !== undefined ? Number(maxServices) : -1,
            maxAppointmentsPerMonth: maxAppointmentsPerMonth !== undefined ? Number(maxAppointmentsPerMonth) : -1,
            storageAllowanceMB:  Number(storageAllowanceMB) || 0,
            features:            features && typeof features === 'object' ? new Map(Object.entries(features)) : new Map(),
            resetPolicy:         resetPolicy || 'reset_every_billing_cycle',
            unusedCreditsPolicy: unusedCreditsPolicy || 'expire_at_cycle_end',
            limitAction:         limitAction || 'warn_only',
            sortOrder:           Number(sortOrder) || 0,
            popular:             Boolean(popular),
            createdBy:           req.user._id,
            updatedBy:           req.user._id,
        });

        res.status(201).json({
            statuscode: 0, status: 'success',
            message: 'Plan created successfully.',
            data: plan.toPublic(),
        });
    } catch (error) {
        console.error('createPlan error:', error);
        res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
};

// ─── UPDATE ───────────────────────────────────────────────────────────────────

exports.updatePlan = async (req, res) => {
    try {
        if (!requireSuperAdmin(req, res)) return;

        const plan = await Plan.findById(req.params.id);
        if (!plan) return res.status(404).json({ statuscode: 1, status: 'error', message: 'Plan not found.' });

        const err = validateFields(req.body);
        if (err) return res.status(400).json({ statuscode: 1, status: 'error', message: err });

        // If name changed, check for duplicate
        if (req.body.planName && req.body.planName.trim() !== plan.planName) {
            const dup = await Plan.findOne({ planName: req.body.planName.trim(), _id: { $ne: plan._id } });
            if (dup) return res.status(409).json({ statuscode: 1, status: 'error', message: 'A plan with this name already exists.' });
        }

        const fields = req.body;

        if (fields.isDefault) await clearDefault();

        const updates = {
            planName:            (fields.planName || plan.planName).trim(),
            description:         fields.description !== undefined ? fields.description : plan.description,
            regularPrice:        fields.regularPrice !== undefined ? Number(fields.regularPrice) : plan.regularPrice,
            promotionalPrice:    fields.promotionalPrice !== undefined ? Number(fields.promotionalPrice) : plan.promotionalPrice,
            currency:            fields.currency || plan.currency,
            billingInterval:     fields.billingInterval || plan.billingInterval,
            trialPeriodDays:     fields.trialPeriodDays !== undefined ? Number(fields.trialPeriodDays) : plan.trialPeriodDays,
            status:              fields.status || plan.status,
            isDefault:           fields.isDefault !== undefined ? Boolean(fields.isDefault) : plan.isDefault,
            eligibility:         fields.eligibility || plan.eligibility,
            maxJobPostings:      fields.maxJobPostings !== undefined ? Number(fields.maxJobPostings) : plan.maxJobPostings,
            maxServices:         fields.maxServices !== undefined ? Number(fields.maxServices) : plan.maxServices,
            maxAppointmentsPerMonth: fields.maxAppointmentsPerMonth !== undefined ? Number(fields.maxAppointmentsPerMonth) : plan.maxAppointmentsPerMonth,
            storageAllowanceMB:  fields.storageAllowanceMB !== undefined ? Number(fields.storageAllowanceMB) : plan.storageAllowanceMB,
            features:            fields.features && typeof fields.features === 'object'
                                     ? new Map(Object.entries(fields.features))
                                     : plan.features,
            resetPolicy:         fields.resetPolicy || plan.resetPolicy,
            unusedCreditsPolicy: fields.unusedCreditsPolicy || plan.unusedCreditsPolicy,
            limitAction:         fields.limitAction || plan.limitAction,
            sortOrder:           fields.sortOrder !== undefined ? Number(fields.sortOrder) : plan.sortOrder,
            popular:             fields.popular !== undefined ? Boolean(fields.popular) : plan.popular,
            updatedBy:           req.user._id,
        };

        Object.assign(plan, updates);
        await plan.save();

        res.json({
            statuscode: 0, status: 'success',
            message: 'Plan updated successfully.',
            data: plan.toPublic(),
        });
    } catch (error) {
        console.error('updatePlan error:', error);
        res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
};

// ─── GET ONE ──────────────────────────────────────────────────────────────────

exports.getPlan = async (req, res) => {
    try {
        const plan = await Plan.findById(req.params.id);
        if (!plan) return res.status(404).json({ statuscode: 1, status: 'error', message: 'Plan not found.' });
        res.json({ statuscode: 0, status: 'success', data: plan.toPublic() });
    } catch (error) {
        res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
};

// ─── LIST ALL (admin) ─────────────────────────────────────────────────────────

exports.listPlans = async (req, res) => {
    try {
        const filter = {};
        if (req.query.status)      filter.status      = req.query.status;
        if (req.query.eligibility) filter.eligibility = req.query.eligibility;
        if (req.query.billing)     filter.billingInterval = req.query.billing;

        const plans = await Plan.find(filter).sort({ sortOrder: 1, createdAt: -1 });
        res.json({
            statuscode: 0, status: 'success',
            data: plans.map(p => p.toPublic()),
            total: plans.length,
        });
    } catch (error) {
        res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
};

// ─── LIST ACTIVE (public-facing — users see this) ─────────────────────────────

exports.listActivePlans = async (req, res) => {
    try {
        const { eligibility, userId } = req.query;

        const filter = { status: 'active' };
        if (eligibility) filter.eligibility = { $in: [eligibility, 'all'] };

        const plans = await Plan.find(filter).sort({ sortOrder: 1, regularPrice: 1 });
        if (!plans.length) {
            return res.json({ statuscode: 0, status: 'success', data: [], total: 0 });
        }

        // Mark which plan the calling user is currently subscribed to
        let subscribedPlanId = null;
        if (userId) {
            const sub = await Subscription.findOne({
                user: userId,
                status: 'active',
                paymentStatus: 'completed',
                endDate: { $gte: new Date() },
            });
            if (sub?.planRef) subscribedPlanId = sub.planRef;
        }

        res.json({
            statuscode: 0, status: 'success',
            data: plans.map(p => p.toPublic(subscribedPlanId)),
            total: plans.length,
        });
    } catch (error) {
        res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────

exports.deletePlan = async (req, res) => {
    try {
        if (!requireSuperAdmin(req, res)) return;

        const plan = await Plan.findById(req.params.id);
        if (!plan) return res.status(404).json({ statuscode: 1, status: 'error', message: 'Plan not found.' });

        if (plan.status === 'active') {
            return res.status(400).json({ statuscode: 1, status: 'error', message: 'Cannot delete an active plan. Set it to inactive first.' });
        }
        if (plan.isDefault) {
            return res.status(400).json({ statuscode: 1, status: 'error', message: 'Cannot delete the default plan. Set another plan as default first.' });
        }

        // Check if any active subscriptions reference this plan
        const inUse = await Subscription.countDocuments({ planRef: plan._id, status: 'active' });
        if (inUse > 0) {
            return res.status(400).json({
                statuscode: 1, status: 'error',
                message: `Cannot delete — ${inUse} active subscription(s) are on this plan.`,
            });
        }

        await plan.deleteOne();
        res.json({ statuscode: 0, status: 'success', message: 'Plan deleted successfully.' });
    } catch (error) {
        res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
};

// ─── TOGGLE STATUS ────────────────────────────────────────────────────────────

exports.toggleStatus = async (req, res) => {
    try {
        if (!requireSuperAdmin(req, res)) return;

        const plan = await Plan.findById(req.params.id);
        if (!plan) return res.status(404).json({ statuscode: 1, status: 'error', message: 'Plan not found.' });

        plan.status = plan.status === 'active' ? 'inactive' : 'active';
        plan.updatedBy = req.user._id;
        await plan.save();

        res.json({
            statuscode: 0, status: 'success',
            message: `Plan is now ${plan.status}.`,
            data: { id: plan._id, status: plan.status },
        });
    } catch (error) {
        res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
};

// ─── SET DEFAULT ──────────────────────────────────────────────────────────────

exports.setDefault = async (req, res) => {
    try {
        if (!requireSuperAdmin(req, res)) return;

        const plan = await Plan.findById(req.params.id);
        if (!plan) return res.status(404).json({ statuscode: 1, status: 'error', message: 'Plan not found.' });
        if (plan.status !== 'active') {
            return res.status(400).json({ statuscode: 1, status: 'error', message: 'Only an active plan can be the default.' });
        }

        await clearDefault();
        plan.isDefault = true;
        plan.updatedBy = req.user._id;
        await plan.save();

        res.json({
            statuscode: 0, status: 'success',
            message: `${plan.planName} is now the default plan.`,
            data: plan.toPublic(),
        });
    } catch (error) {
        res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
};

// ─── DUPLICATE ────────────────────────────────────────────────────────────────

exports.duplicatePlan = async (req, res) => {
    try {
        if (!requireSuperAdmin(req, res)) return;

        const { newPlanName } = req.body;
        if (!newPlanName) return res.status(400).json({ statuscode: 1, status: 'error', message: 'newPlanName is required.' });

        const source = await Plan.findById(req.params.id);
        if (!source) return res.status(404).json({ statuscode: 1, status: 'error', message: 'Source plan not found.' });

        const dup = await Plan.findOne({ planName: newPlanName.trim() });
        if (dup) return res.status(409).json({ statuscode: 1, status: 'error', message: 'A plan with this name already exists.' });

        const copy = source.toObject();
        delete copy._id;
        copy.planName  = newPlanName.trim();
        copy.status    = 'draft';
        copy.isDefault = false;
        copy.createdBy = req.user._id;
        copy.updatedBy = req.user._id;
        delete copy.createdAt;
        delete copy.updatedAt;

        const newPlan = await Plan.create(copy);

        res.status(201).json({
            statuscode: 0, status: 'success',
            message: 'Plan duplicated as draft.',
            data: newPlan.toPublic(),
        });
    } catch (error) {
        res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
};

// ─── ASSIGN PLAN TO USER (manual, no payment) ─────────────────────────────────

exports.assignPlan = async (req, res) => {
    try {
        if (!requireSuperAdmin(req, res)) return;

        const { targetUserId, planId, reason } = req.body;
        if (!targetUserId) return res.status(400).json({ statuscode: 1, status: 'error', message: 'targetUserId is required.' });
        if (!planId)       return res.status(400).json({ statuscode: 1, status: 'error', message: 'planId is required.' });
        if (!reason)       return res.status(400).json({ statuscode: 1, status: 'error', message: 'reason is required (kept in audit log).' });

        const [plan, user] = await Promise.all([
            Plan.findById(planId),
            User.findById(targetUserId),
        ]);
        if (!plan) return res.status(404).json({ statuscode: 1, status: 'error', message: 'Plan not found.' });
        if (!user) return res.status(404).json({ statuscode: 1, status: 'error', message: 'User not found.' });
        if (plan.status !== 'active') {
            return res.status(400).json({ statuscode: 1, status: 'error', message: 'Only an active plan can be assigned.' });
        }

        // Cancel any existing active subscription for this user
        await Subscription.updateMany(
            { user: user._id, status: 'active' },
            { $set: { status: 'cancelled', cancelledAt: new Date(), cancelReason: `Superseded by manual assignment: ${reason}` } }
        );

        const startDate = new Date();
        const endDate   = new Date(startDate);
        if (plan.durationMonths > 0) {
            endDate.setMonth(endDate.getMonth() + plan.durationMonths);
        } else {
            endDate.setFullYear(endDate.getFullYear() + 100); // one_time = effectively permanent
        }

        const subscription = await Subscription.create({
            user:            user._id,
            planRef:         plan._id,
            plan:            plan.planName,
            planName:        plan.planName,
            providerType:    user.role,
            amount:          plan.effectivePrice,
            status:          'active',
            paymentStatus:   'completed',
            paymentReference: `MANUAL-${req.user._id}-${Date.now()}`,
            startDate,
            endDate,
            assignedBy:      req.user._id,
            assignReason:    reason,
        });

        res.status(201).json({
            statuscode: 0, status: 'success',
            message: `Plan "${plan.planName}" assigned to ${user.email}.`,
            data: { subscription: subscription._id, plan: plan.toPublic(), user: { id: user._id, email: user.email, role: user.role } },
        });
    } catch (error) {
        console.error('assignPlan error:', error);
        res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
};

// ─── PLAN OPTIONS (dropdown values for the form) ──────────────────────────────

exports.getPlanOptions = (_req, res) => {
    res.json({
        statuscode: 0, status: 'success',
        data: {
            billingInterval:      ['monthly', '6-months', 'yearly', 'one_time'],
            status:               ['active', 'inactive', 'draft'],
            eligibility:          ['all', 'client', 'professional', 'hospital', 'ambulance', 'gym-physio'],
            resetPolicy:          ['reset_every_billing_cycle', 'no_expiry', 'manual_allocation'],
            unusedCreditsPolicy:  ['expire_at_cycle_end', 'rollover_to_next_cycle'],
            limitAction:          ['block', 'warn_only'],
            suggestedFeatures: [
                { key: 'canPostVacancy',      label: 'Post Vacancies' },
                { key: 'canCreateService',    label: 'Create Services' },
                { key: 'canBookAppointment',  label: 'Book Appointments' },
                { key: 'canAccessEmergency',  label: 'Emergency Services' },
                { key: 'canViewAnalytics',    label: 'View Analytics' },
                { key: 'canViewMedicalRecords', label: 'Medical Records' },
                { key: 'canManageFleet',      label: 'Fleet Management' },
                { key: 'priorityListing',     label: 'Priority Listing' },
                { key: 'dedicatedSupport',    label: 'Dedicated Support' },
            ],
        },
    });
};
