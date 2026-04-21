const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        enum: ['super_admin', 'admin', 'moderator'],
        default: 'admin'
    },
    permissions: {
        type: Map,
        of: Boolean,
        default: {
            'users_view': true,
            'users_edit': false,
            'users_delete': false,
            'professionals_view': true,
            'professionals_verify': false,
            'hospitals_view': true,
            'hospitals_verify': false,
            'ambulances_view': true,
            'ambulances_verify': false,
            'dashboard_view': true,
            'settings_edit': false
        }
    },
    lastLogin: Date,
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes
adminSchema.index({ user: 1 });
adminSchema.index({ role: 1 });

module.exports = mongoose.model('Admin', adminSchema);