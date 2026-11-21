const mongoose = require('mongoose');

/**
 * Privilege Model
 * Defines a named menu item that can be assigned to admin users.
 * Each privilege has optional sub-menu items and function-level permissions.
 */

const submenuSchema = new mongoose.Schema({
    name:     { type: String, required: true, trim: true },
    page:     { type: String, default: '', trim: true },
    function: { type: [String], default: [] }
}, { _id: false });

const privilegeSchema = new mongoose.Schema({
    privilege_id: {
        type: Number,
        unique: true
    },
    name: {
        type: String,
        required: [true, 'Privilege name is required'],
        trim: true,
        minlength: [3, 'Name must be at least 3 characters']
    },
    page: {
        type: String,
        default: '',
        trim: true
    },
    icon: {
        type: String,
        required: [true, 'Icon is required'],
        trim: true
    },
    // Top-level functions (used when submenu is ["0"] / no submenu)
    function: {
        type: [String],
        default: []
    },
    // ["0"] means no submenu; otherwise an array of submenu objects
    submenu: {
        type: mongoose.Schema.Types.Mixed,
        default: ['0']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Auto-increment privilege_id before saving
privilegeSchema.pre('save', async function (next) {
    if (this.isNew) {
        const last = await this.constructor
            .findOne({}, { privilege_id: 1 })
            .sort({ privilege_id: -1 })
            .lean();
        this.privilege_id = last ? last.privilege_id + 1 : 1;
    }
    next();
});

privilegeSchema.index({ privilege_id: 1 });
privilegeSchema.index({ name: 1 });

module.exports = mongoose.model('Privilege', privilegeSchema);
