/**
 * Plan Model
 *
 * Stores subscription plan definitions created by super_admin.
 * Plans are linked to Subscription documents via plan._id (planRef).
 *
 * eligibility controls which user roles can subscribe to a plan:
 *   'all'          → everyone (patients AND providers)
 *   'client'       → patients/clients only
 *   'professional' → healthcare professionals only
 *   'hospital'     → hospitals only
 *   'ambulance'    → ambulance providers only
 *   'gym-physio'   → gym/physio providers only
 *
 * features is a flexible map so new capabilities can be added without
 * schema migrations. The frontend reads whatever keys are present.
 */
const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
    {
        // ── Identity ──────────────────────────────────────────────────────────
        planName: { type: String, required: true, unique: true, trim: true },
        description: { type: String, default: '' },

        // ── Pricing ───────────────────────────────────────────────────────────
        regularPrice: { type: Number, required: true, min: 0 },
        promotionalPrice: { type: Number, default: 0, min: 0 },
        currency: { type: String, default: 'NGN' },

        // ── Billing ────────────────────────────────────────────��──────────────
        billingInterval: {
            type: String,
            enum: ['monthly', '6-months', 'yearly', 'one_time'],
            required: true,
        },
        durationMonths: { type: Number, default: 1 },   // derived but stored for quick access
        trialPeriodDays: { type: Number, default: 0 },

        // ── Availability ──────────────────────────────────────────────────────
        status: {
            type: String,
            enum: ['active', 'inactive', 'draft'],
            default: 'draft',
        },
        isDefault: { type: Boolean, default: false },   // only one plan can be default at a time
        eligibility: {
            type: String,
            // which user roles may subscribe
            enum: ['all', 'client', 'professional', 'hospital', 'ambulance', 'gym-physio'],
            default: 'all',
        },

        // ── Limits & allowances ───────────────────────────────────────────────
        // Job / vacancy posting (hospitals)
        maxJobPostings: { type: Number, default: -1 },   // -1 = unlimited

        // Service listing (professionals, gym, ambulance)
        maxServices: { type: Number, default: -1 },

        // Appointment booking (patients)
        maxAppointmentsPerMonth: { type: Number, default: -1 },

        // General storage (MB)
        storageAllowanceMB: { type: Number, default: 0 },

        // ── Feature flags ─────────────────────────────────────────────────────
        // Flexible map: key → boolean.  Any feature can be added here without
        // touching the schema (e.g. { canPostVacancy: true, canViewAnalytics: true })
        features: {
            type: Map,
            of: Boolean,
            default: {},
        },

        // ── Reset / credits ───────────────────────────────────────────────────
        resetPolicy: {
            type: String,
            enum: ['reset_every_billing_cycle', 'no_expiry', 'manual_allocation'],
            default: 'reset_every_billing_cycle',
        },
        unusedCreditsPolicy: {
            type: String,
            enum: ['expire_at_cycle_end', 'rollover_to_next_cycle'],
            default: 'expire_at_cycle_end',
        },
        limitAction: {
            type: String,
            enum: ['block', 'warn_only'],
            default: 'warn_only',
        },

        // ── Meta ──────────────────────────────────────────────────────────────
        sortOrder: { type: Number, default: 0 },        // for display ordering on the frontend
        popular: { type: Boolean, default: false },     // highlights a plan as "most popular"
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
planSchema.index({ status: 1, eligibility: 1 });
planSchema.index({ isDefault: 1 });

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Derive durationMonths from billingInterval before saving.
 */
planSchema.pre('save', function (next) {
    const map = { monthly: 1, '6-months': 6, yearly: 12, one_time: 0 };
    this.durationMonths = map[this.billingInterval] ?? 1;
    next();
});

/**
 * effectivePrice — returns promotionalPrice if set, otherwise regularPrice.
 */
planSchema.virtual('effectivePrice').get(function () {
    return this.promotionalPrice > 0 ? this.promotionalPrice : this.regularPrice;
});

/**
 * toPublic — the shape returned to frontend consumers.
 */
planSchema.methods.toPublic = function (subscribedPlanId = null) {
    const obj = this.toObject({ virtuals: true });
    return {
        id:                    obj._id,
        planName:              obj.planName,
        description:           obj.description,
        regularPrice:          obj.regularPrice,
        promotionalPrice:      obj.promotionalPrice,
        effectivePrice:        obj.effectivePrice,
        currency:              obj.currency,
        billingInterval:       obj.billingInterval,
        durationMonths:        obj.durationMonths,
        trialPeriodDays:       obj.trialPeriodDays,
        status:                obj.status,
        isDefault:             obj.isDefault,
        eligibility:           obj.eligibility,
        maxJobPostings:        obj.maxJobPostings,
        maxServices:           obj.maxServices,
        maxAppointmentsPerMonth: obj.maxAppointmentsPerMonth,
        storageAllowanceMB:    obj.storageAllowanceMB,
        features:              Object.fromEntries(obj.features || []),
        resetPolicy:           obj.resetPolicy,
        unusedCreditsPolicy:   obj.unusedCreditsPolicy,
        limitAction:           obj.limitAction,
        sortOrder:             obj.sortOrder,
        popular:               obj.popular,
        isSubscribed:          subscribedPlanId
                                   ? String(obj._id) === String(subscribedPlanId)
                                   : false,
        createdAt:             obj.createdAt,
        updatedAt:             obj.updatedAt,
    };
};

module.exports = mongoose.model('Plan', planSchema);
