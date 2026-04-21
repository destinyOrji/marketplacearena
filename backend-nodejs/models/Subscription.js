const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    plan: {
        type: String,
        enum: ['monthly', '6-months', 'yearly'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'cancelled', 'pending'],
        default: 'pending'
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    paymentReference: {
        type: String
    },
    autoRenew: {
        type: Boolean,
        default: false
    },
    cancelledAt: {
        type: Date
    },
    cancelReason: {
        type: String
    }
}, {
    timestamps: true
});

// Index for efficient queries
subscriptionSchema.index({ client: 1, status: 1 });
subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ endDate: 1, status: 1 });

// Method to check if subscription is active
subscriptionSchema.methods.isActive = function() {
    return this.status === 'active' && 
           this.paymentStatus === 'completed' && 
           new Date() <= this.endDate;
};

// Static method to get subscription plans
subscriptionSchema.statics.getPlans = function() {
    return [
        {
            id: 'monthly',
            name: 'Monthly Plan',
            duration: '1 Month',
            price: 1000,
            currency: 'NGN',
            features: [
                'Book unlimited appointments',
                'Access emergency services',
                'View medical records',
                'Priority customer support'
            ]
        },
        {
            id: '6-months',
            name: '6 Months Plan',
            duration: '6 Months',
            price: 4000,
            currency: 'NGN',
            savings: 2000,
            features: [
                'Book unlimited appointments',
                'Access emergency services',
                'View medical records',
                'Priority customer support',
                'Save ₦2,000'
            ],
            popular: true
        },
        {
            id: 'yearly',
            name: 'Yearly Plan',
            duration: '1 Year',
            price: 8000,
            currency: 'NGN',
            savings: 4000,
            features: [
                'Book unlimited appointments',
                'Access emergency services',
                'View medical records',
                'Priority customer support',
                'Save ₦4,000',
                'Best value'
            ]
        }
    ];
};

// Calculate end date based on plan
subscriptionSchema.statics.calculateEndDate = function(startDate, plan) {
    const date = new Date(startDate);
    
    switch(plan) {
        case 'monthly':
            date.setMonth(date.getMonth() + 1);
            break;
        case '6-months':
            date.setMonth(date.getMonth() + 6);
            break;
        case 'yearly':
            date.setFullYear(date.getFullYear() + 1);
            break;
    }
    
    return date;
};

module.exports = mongoose.model('Subscription', subscriptionSchema);
