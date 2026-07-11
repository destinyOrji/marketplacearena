import React, { useState, useEffect, useCallback } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiShield, FiToggleLeft, FiToggleRight, FiX, FiCheck } from 'react-icons/fi';
import { settingsService } from '../../services/settingsService';
import { AdminUser, AvailablePermission } from '../../types';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

// ─── Tiny reusable primitives (avoids importing missing component paths) ────────

const Badge: React.FC<{ active: boolean }> = ({ active }) => (
  <span
    className={`px-2 py-1 text-xs font-medium rounded-full ${
      active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}
  >
    {active ? 'Active' : 'Inactive'}
  </span>
);

const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const colours: Record<string, string> = {
    super_admin: 'bg-purple-100 text-purple-800',
    admin: 'bg-blue-100 text-blue-800',
    moderator: 'bg-yellow-100 text-yellow-800'
  };
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colours[role] || 'bg-gray-100 text-gray-800'}`}>
      {role.replace('_', ' ')}
    </span>
  );
};

// ─── Permission editor modal ─────────────────────────────────────────────────

interface PermissionModalProps {
  admin: AdminUser;
  availablePermissions: AvailablePermission[];
  onClose: () => void;
  onSave: (adminId: string, permissions: Record<string, boolean>) => Promise<void>;
}

const PermissionModal: React.FC<PermissionModalProps> = ({ admin, availablePermissions, onClose, onSave }) => {
  const [perms, setPerms] = useState<Record<string, boolean>>({ ...admin.permissions });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Group permissions by category
  const groups = availablePermissions.reduce<Record<string, AvailablePermission[]>>((acc, p) => {
    if (!acc[p.group]) acc[p.group] = [];
    acc[p.group].push(p);
    return acc;
  }, {});

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await onSave(String(admin.id), perms);
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Edit Permissions</h2>
            <p className="text-sm text-gray-500">{admin.first_name} {admin.last_name} — {admin.email}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <FiX className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-4 flex-1 space-y-6">
          {Object.entries(groups).map(([group, items]) => (
            <div key={group}>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">{group}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {items.map(perm => (
                  <label key={perm.key} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!perms[perm.key]}
                      onChange={e => setPerms(prev => ({ ...prev, [perm.key]: e.target.checked }))}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{perm.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-between">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex space-x-3 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Permissions'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Create admin modal ───────────────────────────────────────────────────────

interface CreateAdminModalProps {
  availablePermissions: AvailablePermission[];
  onClose: () => void;
  onCreate: (data: {
    email: string; password: string; firstName: string; lastName: string;
    role: string; permissions: Record<string, boolean>;
  }) => Promise<void>;
}

const CreateAdminModal: React.FC<CreateAdminModalProps> = ({ availablePermissions, onClose, onCreate }) => {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', role: 'admin'
  });
  const [customPerms, setCustomPerms] = useState(false);
  const [perms, setPerms] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const DEFAULT_ROLE_PERMS: Record<string, Record<string, boolean>> = {
    admin: {
      dashboard_view: true, users_view: true, users_edit: true, users_delete: false,
      professionals_view: true, professionals_verify: true,
      hospitals_view: true, hospitals_verify: true,
      ambulances_view: true, ambulances_verify: true,
      blog_view: true, blog_edit: true, blog_delete: false, settings_edit: false
    },
    moderator: {
      dashboard_view: true, users_view: true, users_edit: false, users_delete: false,
      professionals_view: true, professionals_verify: false,
      hospitals_view: true, hospitals_verify: false,
      ambulances_view: true, ambulances_verify: false,
      blog_view: true, blog_edit: false, blog_delete: false, settings_edit: false
    }
  };

  const handleRoleChange = (role: string) => {
    setForm(prev => ({ ...prev, role }));
    if (!customPerms) {
      setPerms(DEFAULT_ROLE_PERMS[role] || {});
    }
  };

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError('All fields are required');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const permissions = customPerms ? perms : (DEFAULT_ROLE_PERMS[form.role] || {});
      await onCreate({ ...form, permissions });
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to create admin user');
    } finally {
      setSaving(false);
    }
  };

  const groups = availablePermissions.reduce<Record<string, AvailablePermission[]>>((acc, p) => {
    if (!acc[p.group]) acc[p.group] = [];
    acc[p.group].push(p);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Create Admin User</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <FiX className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-4 flex-1 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                value={form.firstName}
                onChange={e => setForm(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="First name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                value={form.lastName}
                onChange={e => setForm(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Last name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Min. 8 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={form.role}
              onChange={e => handleRoleChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="admin">Admin — can manage and verify</option>
              <option value="moderator">Moderator — read-only access</option>
            </select>
          </div>

          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={customPerms}
                onChange={e => {
                  setCustomPerms(e.target.checked);
                  if (e.target.checked) setPerms(DEFAULT_ROLE_PERMS[form.role] || {});
                }}
                className="h-4 w-4 rounded border-gray-300 text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">Customise permissions</span>
            </label>
          </div>

          {customPerms && availablePermissions.length > 0 && (
            <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
              {Object.entries(groups).map(([group, items]) => (
                <div key={group}>
                  <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">{group}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {items.map(perm => (
                      <label key={perm.key} className="flex items-center space-x-2 p-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!perms[perm.key]}
                          onChange={e => setPerms(prev => ({ ...prev, [perm.key]: e.target.checked }))}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600"
                        />
                        <span className="text-sm text-gray-700">{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Creating…' : 'Create Admin'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Confirm modal ────────────────────────────────────────────────────────────

interface ConfirmModalProps {
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title, message, confirmLabel = 'Confirm', danger = false, onConfirm, onClose
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = async () => {
    setLoading(true);
    setError('');
    try {
      await onConfirm();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <div className="text-sm text-gray-600">{message}</div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handle}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 ${
              danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main AdminUsers page ─────────────────────────────────────────────────────

const AdminUsers: React.FC = () => {
  const { admin: currentAdmin } = useAdminAuth();
  const isSuperAdmin = currentAdmin?.role === 'super_admin';

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [availablePerms, setAvailablePerms] = useState<AvailablePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal state
  const [createModal, setCreateModal] = useState(false);
  const [permModal, setPermModal] = useState<AdminUser | null>(null);
  const [deleteModal, setDeleteModal] = useState<AdminUser | null>(null);
  const [toggleModal, setToggleModal] = useState<AdminUser | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [usersData, permsData] = await Promise.all([
        settingsService.getAdminUsers(),
        settingsService.getAvailablePermissions()
      ]);
      setUsers(usersData);
      setAvailablePerms(permsData);
    } catch (e: any) {
      setErrorMsg('Failed to load admin users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleCreate = async (data: {
    email: string; password: string; firstName: string; lastName: string;
    role: string; permissions: Record<string, boolean>;
  }) => {
    await settingsService.createAdminUser(data);
    showSuccess('Admin user created successfully');
    await fetchData();
  };

  const handleToggleActive = async (user: AdminUser) => {
    await settingsService.updateAdminUser(String(user.id), { is_active: !user.is_active });
    showSuccess(`Admin ${user.is_active ? 'deactivated' : 'activated'} successfully`);
    await fetchData();
  };

  const handleDelete = async (user: AdminUser) => {
    await settingsService.deleteAdminUser(String(user.id));
    showSuccess('Admin user deactivated');
    await fetchData();
  };

  const handleSavePermissions = async (adminId: string, permissions: Record<string, boolean>) => {
    await settingsService.updateAdminPermissions(adminId, permissions);
    showSuccess('Permissions updated successfully');
    await fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Admin Users</h2>
          <p className="text-sm text-gray-500">{users.length} admin account{users.length !== 1 ? 's' : ''}</p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={() => setCreateModal(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <FiPlus className="h-4 w-4 mr-2" />
            Add Admin
          </button>
        )}
      </div>

      {!isSuperAdmin && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          You have read-only access to this section. Only super admins can create or modify admin accounts.
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center space-x-2">
          <FiCheck className="h-4 w-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{errorMsg}</div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                {isSuperAdmin && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={isSuperAdmin ? 6 : 5} className="px-6 py-10 text-center text-sm text-gray-500">
                    No admin users found
                  </td>
                </tr>
              ) : (
                users.map(user => {
                  const isSelf = currentAdmin?.id === String(user.id);
                  return (
                    <tr key={String(user.id)} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                          {isSelf && (
                            <span className="ml-2 text-xs text-gray-400">(you)</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge active={user.is_active} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.last_login
                          ? new Date(user.last_login).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '—'}
                      </td>
                      {isSuperAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {/* Toggle active */}
                            {!isSelf && (
                              <button
                                onClick={() => setToggleModal(user)}
                                title={user.is_active ? 'Deactivate' : 'Activate'}
                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600"
                              >
                                {user.is_active
                                  ? <FiToggleRight className="h-5 w-5 text-green-600" />
                                  : <FiToggleLeft className="h-5 w-5 text-gray-400" />}
                              </button>
                            )}
                            {/* Edit permissions */}
                            <button
                              onClick={() => setPermModal(user)}
                              title="Edit permissions"
                              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600"
                            >
                              <FiShield className="h-4 w-4" />
                            </button>
                            {/* Delete */}
                            {!isSelf && user.role !== 'super_admin' && (
                              <button
                                onClick={() => setDeleteModal(user)}
                                title="Deactivate user"
                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600"
                              >
                                <FiTrash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {createModal && (
        <CreateAdminModal
          availablePermissions={availablePerms}
          onClose={() => setCreateModal(false)}
          onCreate={handleCreate}
        />
      )}

      {permModal && (
        <PermissionModal
          admin={permModal}
          availablePermissions={availablePerms}
          onClose={() => setPermModal(null)}
          onSave={handleSavePermissions}
        />
      )}

      {toggleModal && (
        <ConfirmModal
          title={toggleModal.is_active ? 'Deactivate Admin' : 'Activate Admin'}
          message={
            <>
              {toggleModal.is_active ? 'Deactivate' : 'Activate'} admin{' '}
              <strong>{toggleModal.first_name} {toggleModal.last_name}</strong>?
              {toggleModal.is_active && ' They will no longer be able to log in.'}
            </>
          }
          confirmLabel={toggleModal.is_active ? 'Deactivate' : 'Activate'}
          danger={toggleModal.is_active}
          onConfirm={() => handleToggleActive(toggleModal)}
          onClose={() => setToggleModal(null)}
        />
      )}

      {deleteModal && (
        <ConfirmModal
          title="Deactivate Admin User"
          message={
            <>
              Deactivate <strong>{deleteModal.first_name} {deleteModal.last_name}</strong>?
              They will no longer be able to access the admin panel.
            </>
          }
          confirmLabel="Deactivate"
          danger
          onConfirm={() => handleDelete(deleteModal)}
          onClose={() => setDeleteModal(null)}
        />
      )}
    </div>
  );
};

export default AdminUsers;
