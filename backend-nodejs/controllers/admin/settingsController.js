/**
 * Admin Settings Controller
 * Handles admin user management and roles/permissions
 */
const User = require('../../models/User');
const Admin = require('../../models/Admin');
const bcrypt = require('bcryptjs');

// ─── Default permissions per role ────────────────────────────────────────────

const DEFAULT_PERMISSIONS = {
    super_admin: {
        users_view: true, users_edit: true, users_delete: true,
        professionals_view: true, professionals_verify: true,
        hospitals_view: true, hospitals_verify: true,
        ambulances_view: true, ambulances_verify: true,
        dashboard_view: true, settings_edit: true,
        blog_view: true, blog_edit: true, blog_delete: true
    },
    admin: {
        users_view: true, users_edit: true, users_delete: false,
        professionals_view: true, professionals_verify: true,
        hospitals_view: true, hospitals_verify: true,
        ambulances_view: true, ambulances_verify: true,
        dashboard_view: true, settings_edit: false,
        blog_view: true, blog_edit: true, blog_delete: false
    },
    moderator: {
        users_view: true, users_edit: false, users_delete: false,
        professionals_view: true, professionals_verify: false,
        hospitals_view: true, hospitals_verify: false,
        ambulances_view: true, ambulances_verify: false,
        dashboard_view: true, settings_edit: false,
        blog_view: true, blog_edit: false, blog_delete: false
    }
};

// ─── Admin Users ──────────────────────────────────────────────────────────────

/**
 * GET /admin/settings/admins
 * List all admin users (super_admin + admin + moderator)
 */
exports.getAdminUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $in: ['admin', 'super_admin'] } })
            .select('firstName lastName email role status isActive createdAt lastLogin')
            .sort({ createdAt: -1 });

        // Enrich with Admin profile data
        const adminProfiles = await Admin.find({
            user: { $in: users.map(u => u._id) }
        });

        const profileMap = {};
        adminProfiles.forEach(p => { profileMap[p.user.toString()] = p; });

        const data = users.map(u => {
            const profile = profileMap[u._id.toString()];
            return {
                id: u._id,
                first_name: u.firstName,
                last_name: u.lastName,
                email: u.email,
                role: profile ? profile.role : u.role,
                permissions: profile ? Object.fromEntries(profile.permissions) : {},
                is_active: profile ? profile.isActive : (u.status === 'active'),
                created_at: u.createdAt,
                last_login: profile ? profile.lastLogin : u.lastLogin
            };
        });

        res.json({ statuscode: 0, status: 'success', data });
    } catch (error) {
        console.error('Get admin users error:', error);
        res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
};

/**
 * POST /admin/settings/admins
 * Create a new admin user — super_admin only
 */
exports.createAdminUser = async (req, res) => {
    try {
        // Only super_admin can create admins
        if (req.admin.role !== 'super_admin') {
            return res.status(403).json({
                statuscode: 1, status: 'error',
                message: 'Only super admins can create admin users'
            });
        }

        const { email, password, firstName, lastName, role = 'admin', permissions } = req.body;

        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({
                statuscode: 1, status: 'error',
                message: 'Email, password, first name, and last name are required'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ statuscode: 1, status: 'error', message: 'Invalid email format' });
        }

        if (password.length < 8) {
            return res.status(400).json({
                statuscode: 1, status: 'error',
                message: 'Password must be at least 8 characters'
            });
        }

        if (!['admin', 'moderator'].includes(role)) {
            return res.status(400).json({
                statuscode: 1, status: 'error',
                message: 'Role must be admin or moderator (use super_admin role only via scripts)'
            });
        }

        const existing = await User.findOne({ email: email.toLowerCase().trim() });
        if (existing) {
            return res.status(409).json({
                statuscode: 1, status: 'error',
                message: 'A user with this email already exists'
            });
        }

        // Build permissions map — use custom if provided, otherwise defaults
        const permMap = new Map(
            Object.entries(permissions || DEFAULT_PERMISSIONS[role])
        );

        const user = new User({
            email,
            password,
            firstName,
            lastName,
            role,
            status: 'active',
            isActive: true,
            isStaff: true,
            emailVerified: true,
            isVerified: true
        });
        await user.save();

        const admin = new Admin({
            user: user._id,
            role,
            permissions: permMap,
            isActive: true
        });
        await admin.save();

        res.status(201).json({
            statuscode: 0,
            status: 'success',
            message: 'Admin user created successfully',
            data: {
                id: user._id,
                first_name: user.firstName,
                last_name: user.lastName,
                email: user.email,
                role: admin.role,
                permissions: Object.fromEntries(admin.permissions),
                is_active: admin.isActive,
                created_at: user.createdAt
            }
        });
    } catch (error) {
        console.error('Create admin user error:', error);
        res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
};

/**
 * PUT /admin/settings/admins/:id
 * Update an admin user (role, permissions, active status) — super_admin only
 */
exports.updateAdminUser = async (req, res) => {
    try {
        if (req.admin.role !== 'super_admin') {
            return res.status(403).json({
                statuscode: 1, status: 'error',
                message: 'Only super admins can update admin users'
            });
        }

        const { id } = req.params;
        const { role, permissions, is_active, firstName, lastName } = req.body;

        // Prevent super_admin from deactivating/editing themselves
        if (req.user._id.toString() === id) {
            return res.status(400).json({
                statuscode: 1, status: 'error',
                message: 'You cannot modify your own admin account'
            });
        }

        const user = await User.findById(id);
        if (!user || !['admin', 'super_admin'].includes(user.role)) {
            return res.status(404).json({ statuscode: 1, status: 'error', message: 'Admin user not found' });
        }

        const admin = await Admin.findOne({ user: id });
        if (!admin) {
            return res.status(404).json({ statuscode: 1, status: 'error', message: 'Admin profile not found' });
        }

        // Apply updates
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (role && ['admin', 'moderator'].includes(role)) {
            user.role = role;
            admin.role = role;
        }
        if (permissions) {
            admin.permissions = new Map(Object.entries(permissions));
        }
        if (typeof is_active === 'boolean') {
            admin.isActive = is_active;
            user.isActive = is_active;
            user.status = is_active ? 'active' : 'inactive';
        }

        await user.save();
        await admin.save();

        res.json({
            statuscode: 0,
            status: 'success',
            message: 'Admin user updated successfully',
            data: {
                id: user._id,
                first_name: user.firstName,
                last_name: user.lastName,
                email: user.email,
                role: admin.role,
                permissions: Object.fromEntries(admin.permissions),
                is_active: admin.isActive
            }
        });
    } catch (error) {
        console.error('Update admin user error:', error);
        res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
};

/**
 * DELETE /admin/settings/admins/:id
 * Deactivate (soft-delete) an admin user — super_admin only
 */
exports.deleteAdminUser = async (req, res) => {
    try {
        if (req.admin.role !== 'super_admin') {
            return res.status(403).json({
                statuscode: 1, status: 'error',
                message: 'Only super admins can delete admin users'
            });
        }

        const { id } = req.params;

        if (req.user._id.toString() === id) {
            return res.status(400).json({
                statuscode: 1, status: 'error',
                message: 'You cannot delete your own account'
            });
        }

        const user = await User.findById(id);
        if (!user || !['admin', 'super_admin'].includes(user.role)) {
            return res.status(404).json({ statuscode: 1, status: 'error', message: 'Admin user not found' });
        }

        const admin = await Admin.findOne({ user: id });

        // Soft-delete: deactivate both records
        user.isActive = false;
        user.status = 'inactive';
        await user.save();

        if (admin) {
            admin.isActive = false;
            await admin.save();
        }

        res.json({ statuscode: 0, status: 'success', message: 'Admin user deactivated successfully' });
    } catch (error) {
        console.error('Delete admin user error:', error);
        res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
};

// ─── Roles & Permissions ─────────────────────────────────────────────────────

// All available permissions in the system
const ALL_PERMISSIONS = [
    { key: 'dashboard_view',        label: 'View Dashboard',            group: 'Dashboard' },
    { key: 'users_view',            label: 'View Patients',             group: 'Patients' },
    { key: 'users_edit',            label: 'Edit Patients',             group: 'Patients' },
    { key: 'users_delete',          label: 'Delete Patients',           group: 'Patients' },
    { key: 'professionals_view',    label: 'View Professionals',        group: 'Professionals' },
    { key: 'professionals_verify',  label: 'Verify Professionals',      group: 'Professionals' },
    { key: 'hospitals_view',        label: 'View Hospitals',            group: 'Hospitals' },
    { key: 'hospitals_verify',      label: 'Verify Hospitals',          group: 'Hospitals' },
    { key: 'ambulances_view',       label: 'View Ambulances',           group: 'Ambulances' },
    { key: 'ambulances_verify',     label: 'Verify Ambulances',         group: 'Ambulances' },
    { key: 'blog_view',             label: 'View Blog Posts',           group: 'Blog' },
    { key: 'blog_edit',             label: 'Create/Edit Blog Posts',    group: 'Blog' },
    { key: 'blog_delete',           label: 'Delete Blog Posts',         group: 'Blog' },
    { key: 'settings_edit',         label: 'Manage Settings',           group: 'Settings' }
];

/**
 * GET /admin/settings/permissions
 * Return the full list of available permissions
 */
exports.getAvailablePermissions = async (req, res) => {
    res.json({ statuscode: 0, status: 'success', data: ALL_PERMISSIONS });
};

/**
 * GET /admin/settings/roles
 * Return the built-in roles with their default permission sets
 */
exports.getRoles = async (req, res) => {
    const roles = [
        {
            id: 'super_admin',
            name: 'Super Admin',
            description: 'Full unrestricted access to all platform features',
            isSystem: true,
            permissions: Object.keys(DEFAULT_PERMISSIONS.super_admin)
                .filter(k => DEFAULT_PERMISSIONS.super_admin[k])
        },
        {
            id: 'admin',
            name: 'Admin',
            description: 'Standard admin — can manage resources and verify providers',
            isSystem: true,
            permissions: Object.keys(DEFAULT_PERMISSIONS.admin)
                .filter(k => DEFAULT_PERMISSIONS.admin[k])
        },
        {
            id: 'moderator',
            name: 'Moderator',
            description: 'Read-only access, can view but not verify or edit',
            isSystem: true,
            permissions: Object.keys(DEFAULT_PERMISSIONS.moderator)
                .filter(k => DEFAULT_PERMISSIONS.moderator[k])
        }
    ];

    res.json({ statuscode: 0, status: 'success', data: roles });
};

/**
 * GET /admin/settings/admins/:id/permissions
 * Get a specific admin's custom permissions
 */
exports.getAdminPermissions = async (req, res) => {
    try {
        const admin = await Admin.findOne({ user: req.params.id });
        if (!admin) {
            return res.status(404).json({ statuscode: 1, status: 'error', message: 'Admin not found' });
        }
        res.json({
            statuscode: 0, status: 'success',
            data: Object.fromEntries(admin.permissions)
        });
    } catch (error) {
        res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
};

/**
 * PUT /admin/settings/admins/:id/permissions
 * Update a specific admin's permissions — super_admin only
 */
exports.updateAdminPermissions = async (req, res) => {
    try {
        if (req.admin.role !== 'super_admin') {
            return res.status(403).json({
                statuscode: 1, status: 'error',
                message: 'Only super admins can update permissions'
            });
        }

        const { permissions } = req.body;
        if (!permissions || typeof permissions !== 'object') {
            return res.status(400).json({ statuscode: 1, status: 'error', message: 'permissions object is required' });
        }

        const admin = await Admin.findOne({ user: req.params.id });
        if (!admin) {
            return res.status(404).json({ statuscode: 1, status: 'error', message: 'Admin not found' });
        }

        admin.permissions = new Map(Object.entries(permissions));
        await admin.save();

        res.json({
            statuscode: 0, status: 'success',
            message: 'Permissions updated successfully',
            data: Object.fromEntries(admin.permissions)
        });
    } catch (error) {
        res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
};
