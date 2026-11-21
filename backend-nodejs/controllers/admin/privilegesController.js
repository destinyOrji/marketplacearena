/**
 * Admin Privileges Controller
 * CRUD for privilege definitions + assign/update/get assigned privileges per admin user
 */
const Privilege = require('../../models/Privilege');
const Admin = require('../../models/Admin');
const User = require('../../models/User');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const hasSubmenu = (submenu) =>
    Array.isArray(submenu) &&
    submenu.length > 0 &&
    !(submenu.length === 1 && submenu[0] === '0');

// ─── CRUD: Privileges ─────────────────────────────────────────────────────────

/**
 * GET /api/admin/privileges
 * List all privileges with search + pagination
 */
exports.getPrivileges = async (req, res) => {
    try {
        const maxLimit = 100;
        const page   = Math.max(1, parseInt(req.query.page  || '1'));
        const limit  = Math.min(maxLimit, Math.max(1, parseInt(req.query.limit || '20')));
        const search = (req.query.search || '').trim();

        const filter = { isActive: true };
        if (search) {
            const pattern = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filter.$or = [
                { name:     { $regex: pattern, $options: 'i' } },
                { page:     { $regex: pattern, $options: 'i' } },
                { function: { $regex: pattern, $options: 'i' } }
            ];
        }

        const [privileges, total] = await Promise.all([
            Privilege.find(filter)
                .sort({ privilege_id: 1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Privilege.countDocuments(filter)
        ]);

        return res.json({
            statuscode: 0,
            status: 'success',
            data: privileges,
            pagination: {
                current_page:       page,
                per_page:           limit,
                max_limit_allowed:  maxLimit,
                total_records:      total,
                total_pages:        Math.ceil(total / limit),
                has_next:           page < Math.ceil(total / limit),
                has_previous:       page > 1
            },
            message: 'Privileges retrieved successfully'
        });
    } catch (error) {
        console.error('getPrivileges error:', error);
        return res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
};

/**
 * GET /api/admin/privileges/:privilege_id
 * Get a single privilege by privilege_id
 */
exports.getPrivilege = async (req, res) => {
    try {
        const privilege = await Privilege.findOne({
            privilege_id: parseInt(req.params.privilege_id)
        }).lean();

        if (!privilege) {
            return res.status(404).json({
                statuscode: 1, status: 'error', message: 'Privilege not found'
            });
        }

        return res.json({ statuscode: 0, status: 'success', data: privilege });
    } catch (error) {
        console.error('getPrivilege error:', error);
        return res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
};

/**
 * POST /api/admin/privileges
 * Create a new privilege — super_admin only
 */
exports.createPrivilege = async (req, res) => {
    try {
        if (req.admin.role !== 'super_admin') {
            return res.status(403).json({
                statuscode: 1, status: 'error',
                message: 'Only super admins can create privileges'
            });
        }

        const { name, page = '', icon, function: functions = [], submenu = ['0'] } = req.body;

        if (!name || name.trim().length < 3) {
            return res.status(400).json({
                statuscode: 1, status: 'error',
                message: 'Name is required and must be at least 3 characters'
            });
        }
        if (!icon || icon.trim().length < 1) {
            return res.status(400).json({
                statuscode: 1, status: 'error', message: 'Icon is required'
            });
        }

        // Duplicate name check
        const existing = await Privilege.findOne({
            name: { $regex: `^${name.trim()}$`, $options: 'i' }
        });
        if (existing) {
            return res.status(400).json({
                statuscode: 1, status: 'error',
                message: 'A privilege with this name already exists'
            });
        }

        // Normalise submenu
        const normalizedSubmenu = hasSubmenu(submenu) ? submenu : ['0'];
        // If submenu exists, functions on the top-level are cleared (submenu items carry their own)
        const normalizedFunctions = hasSubmenu(normalizedSubmenu) ? [] : (Array.isArray(functions) ? functions : []);

        const privilege = await Privilege.create({
            name:     name.trim(),
            page:     page.trim(),
            icon:     icon.trim(),
            function: normalizedFunctions,
            submenu:  normalizedSubmenu
        });

        return res.status(201).json({
            statuscode: 0, status: 'success',
            data: privilege,
            message: 'Privilege created successfully'
        });
    } catch (error) {
        console.error('createPrivilege error:', error);
        return res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
};

/**
 * PUT /api/admin/privileges/:privilege_id
 * Update a privilege — super_admin only
 */
exports.updatePrivilege = async (req, res) => {
    try {
        if (req.admin.role !== 'super_admin') {
            return res.status(403).json({
                statuscode: 1, status: 'error',
                message: 'Only super admins can update privileges'
            });
        }

        const privilege = await Privilege.findOne({
            privilege_id: parseInt(req.params.privilege_id)
        });
        if (!privilege) {
            return res.status(404).json({
                statuscode: 1, status: 'error', message: 'Privilege not found'
            });
        }

        const { name, page, icon, function: functions, submenu } = req.body;

        if (name !== undefined) {
            if (name.trim().length < 3) {
                return res.status(400).json({
                    statuscode: 1, status: 'error',
                    message: 'Name must be at least 3 characters'
                });
            }
            // Check duplicate (excluding self)
            const dup = await Privilege.findOne({
                name: { $regex: `^${name.trim()}$`, $options: 'i' },
                privilege_id: { $ne: privilege.privilege_id }
            });
            if (dup) {
                return res.status(400).json({
                    statuscode: 1, status: 'error',
                    message: 'Another privilege with this name already exists'
                });
            }
            privilege.name = name.trim();
        }
        if (page      !== undefined) privilege.page = page.trim();
        if (icon      !== undefined) privilege.icon = icon.trim();

        if (submenu !== undefined) {
            const normalizedSubmenu = hasSubmenu(submenu) ? submenu : ['0'];
            privilege.submenu = normalizedSubmenu;
            // If submenu is real, top-level functions are cleared
            if (hasSubmenu(normalizedSubmenu)) {
                privilege.function = [];
            } else if (functions !== undefined) {
                privilege.function = Array.isArray(functions) ? functions : [];
            }
        } else if (functions !== undefined) {
            privilege.function = Array.isArray(functions) ? functions : [];
        }

        await privilege.save();

        return res.json({
            statuscode: 0, status: 'success',
            data: privilege,
            message: 'Privilege updated successfully'
        });
    } catch (error) {
        console.error('updatePrivilege error:', error);
        return res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
};

/**
 * DELETE /api/admin/privileges/:privilege_id
 * Soft-delete a privilege — super_admin only
 */
exports.deletePrivilege = async (req, res) => {
    try {
        if (req.admin.role !== 'super_admin') {
            return res.status(403).json({
                statuscode: 1, status: 'error',
                message: 'Only super admins can delete privileges'
            });
        }

        const privilege = await Privilege.findOne({
            privilege_id: parseInt(req.params.privilege_id)
        });
        if (!privilege) {
            return res.status(404).json({
                statuscode: 1, status: 'error', message: 'Privilege not found'
            });
        }

        privilege.isActive = false;
        await privilege.save();

        return res.json({
            statuscode: 0, status: 'success',
            message: 'Privilege deleted successfully'
        });
    } catch (error) {
        console.error('deletePrivilege error:', error);
        return res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
};

// ─── Assign / Update privileges for an admin user ─────────────────────────────

/**
 * POST /api/admin/privileges/assign
 * Assign or fully replace the menu array on an admin user.
 * Body: { admin_user_id, action: "assign"|"update", privileges: [...] }
 *
 * "assign"  → fails if user already has a menu (use update instead)
 * "update"  → merges: adds new, updates changed, removes unchecked
 */
exports.assignPrivilege = async (req, res) => {
    try {
        if (req.admin.role !== 'super_admin') {
            return res.status(403).json({
                statuscode: 1, status: 'error',
                message: 'Only super admins can assign privileges'
            });
        }

        const { admin_user_id, action, privileges } = req.body;

        if (!admin_user_id) {
            return res.status(400).json({
                statuscode: 1, status: 'error', message: 'admin_user_id is required'
            });
        }
        if (!['assign', 'update'].includes(action)) {
            return res.status(400).json({
                statuscode: 1, status: 'error',
                message: 'action must be "assign" or "update"'
            });
        }
        if (!Array.isArray(privileges) || privileges.length === 0) {
            return res.status(400).json({
                statuscode: 1, status: 'error', message: 'privileges array is required'
            });
        }

        // Verify target admin exists
        const targetAdmin = await Admin.findOne({ user: admin_user_id });
        if (!targetAdmin) {
            return res.status(404).json({
                statuscode: 1, status: 'error', message: 'Admin user not found'
            });
        }

        // Build the menu array from incoming privileges
        const buildMenu = (privs) => privs.map(priv => {
            const menuItem = {
                privilege_id: parseInt(priv.privilege_id),
                name:         priv.name     || '',
                icon:         priv.icon     || '',
                page:         priv.page     || '',
                function:     Array.isArray(priv.function) ? priv.function : [],
                submenu:      ['0']
            };

            if (hasSubmenu(priv.submenu)) {
                menuItem.submenu = priv.submenu.map(sub => ({
                    name:     sub.name     || '',
                    page:     sub.page     || '',
                    function: Array.isArray(sub.function) ? sub.function : []
                }));
                menuItem.function = []; // submenu items carry their own functions
            }

            return menuItem;
        });

        // ── ASSIGN ────────────────────────────────────────────────────────────
        if (action === 'assign') {
            if (targetAdmin.menu && targetAdmin.menu.length > 0) {
                return res.status(400).json({
                    statuscode: 1, status: 'error',
                    message: 'Privileges already assigned to this user. Use action "update" instead.'
                });
            }
            targetAdmin.menu = buildMenu(privileges);
            await targetAdmin.save();

            return res.json({
                statuscode: 0, status: 'success',
                data: targetAdmin.menu,
                message: 'Privileges assigned successfully'
            });
        }

        // ── UPDATE ────────────────────────────────────────────────────────────
        const incomingMenu = buildMenu(privileges);
        const existingMenu = targetAdmin.menu || [];

        // Build maps keyed by privilege_id
        const existingMap = {};
        existingMenu.forEach(item => { existingMap[item.privilege_id] = item; });

        const incomingMap = {};
        incomingMenu.forEach(item => { incomingMap[item.privilege_id] = item; });

        // Remove privileges not present in incoming
        Object.keys(existingMap).forEach(id => {
            if (!incomingMap[id]) delete existingMap[id];
        });

        // Add new / update changed privileges
        Object.entries(incomingMap).forEach(([id, incomingPriv]) => {
            if (!existingMap[id]) {
                // New — add directly
                existingMap[id] = incomingPriv;
                return;
            }

            const existingPriv = existingMap[id];
            existingPriv.function = incomingPriv.function;

            if (hasSubmenu(incomingPriv.submenu)) {
                // Merge submenus keyed by name
                const existingSubMap = {};
                if (hasSubmenu(existingPriv.submenu)) {
                    existingPriv.submenu.forEach(s => { existingSubMap[s.name] = s; });
                }

                const incomingSubMap = {};
                incomingPriv.submenu.forEach(s => { incomingSubMap[s.name] = s; });

                // Remove unchecked submenus
                Object.keys(existingSubMap).forEach(name => {
                    if (!incomingSubMap[name]) delete existingSubMap[name];
                });

                // Add / update submenus
                Object.entries(incomingSubMap).forEach(([name, sub]) => {
                    existingSubMap[name] = sub;
                });

                existingPriv.submenu  = Object.values(existingSubMap);
                existingPriv.function = [];
            } else {
                existingPriv.submenu = ['0'];
            }

            existingMap[id] = existingPriv;
        });

        targetAdmin.menu = Object.values(existingMap);
        await targetAdmin.save();

        return res.json({
            statuscode: 0, status: 'success',
            data: targetAdmin.menu,
            message: 'Privileges updated successfully'
        });
    } catch (error) {
        console.error('assignPrivilege error:', error);
        return res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
};

/**
 * GET /api/admin/privileges/assigned/:admin_user_id
 * Get the menu (assigned privileges) for a specific admin user
 */
exports.getAssignedPrivilege = async (req, res) => {
    try {
        const { admin_user_id } = req.params;

        const targetAdmin = await Admin.findOne({ user: admin_user_id }).lean();
        if (!targetAdmin) {
            return res.status(404).json({
                statuscode: 1, status: 'error', message: 'Admin user not found'
            });
        }

        return res.json({
            statuscode: 0, status: 'success',
            data: targetAdmin.menu || [],
            message: 'Assigned privileges retrieved successfully'
        });
    } catch (error) {
        console.error('getAssignedPrivilege error:', error);
        return res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
};

/**
 * DELETE /api/admin/privileges/assigned/:admin_user_id
 * Remove ALL assigned privileges from an admin user — super_admin only
 */
exports.revokeAllPrivileges = async (req, res) => {
    try {
        if (req.admin.role !== 'super_admin') {
            return res.status(403).json({
                statuscode: 1, status: 'error',
                message: 'Only super admins can revoke privileges'
            });
        }

        const targetAdmin = await Admin.findOne({ user: req.params.admin_user_id });
        if (!targetAdmin) {
            return res.status(404).json({
                statuscode: 1, status: 'error', message: 'Admin user not found'
            });
        }

        targetAdmin.menu = [];
        await targetAdmin.save();

        return res.json({
            statuscode: 0, status: 'success',
            message: 'All privileges revoked successfully'
        });
    } catch (error) {
        console.error('revokeAllPrivileges error:', error);
        return res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
};
