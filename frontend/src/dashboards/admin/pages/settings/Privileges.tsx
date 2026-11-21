/**
 * Privileges Management Page
 * Super-admin can create, edit, and delete privilege definitions.
 * Each privilege is a named menu item with optional submenu and function keys.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiChevronDown, FiChevronRight, FiShield } from 'react-icons/fi';
import privilegesService from '../../services/privilegesService';
import { Privilege, PrivilegeSubmenu } from '../../types/privileges';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const hasRealSubmenu = (sub: Privilege['submenu']): sub is PrivilegeSubmenu[] =>
  Array.isArray(sub) && !(sub.length === 1 && (sub as any)[0] === '0');

// ─── Submenu row editor ───────────────────────────────────────────────────────

interface SubmenuRowProps {
  row: PrivilegeSubmenu;
  index: number;
  onChange: (index: number, row: PrivilegeSubmenu) => void;
  onRemove: (index: number) => void;
}

const SubmenuRow: React.FC<SubmenuRowProps> = ({ row, index, onChange, onRemove }) => {
  const [fnInput, setFnInput] = useState('');

  const addFn = () => {
    const v = fnInput.trim();
    if (v && !row.function.includes(v)) {
      onChange(index, { ...row, function: [...row.function, v] });
    }
    setFnInput('');
  };

  const removeFn = (fn: string) =>
    onChange(index, { ...row, function: row.function.filter(f => f !== fn) });

  return (
    <div className="border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={row.name}
          onChange={e => onChange(index, { ...row, name: e.target.value })}
          placeholder="Sub-menu name"
          className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          value={row.page}
          onChange={e => onChange(index, { ...row, page: e.target.value })}
          placeholder="page (e.g. /admin/patients)"
          className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md"
        >
          <FiX className="h-4 w-4" />
        </button>
      </div>

      {/* Function keys */}
      <div className="flex flex-wrap gap-1 items-center">
        {row.function.map(fn => (
          <span
            key={fn}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full"
          >
            {fn}
            <button type="button" onClick={() => removeFn(fn)} className="hover:text-red-600">
              <FiX className="h-3 w-3" />
            </button>
          </span>
        ))}
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={fnInput}
            onChange={e => setFnInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFn())}
            placeholder="add function key…"
            className="px-2 py-0.5 text-xs border border-dashed border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 w-36"
          />
          <button
            type="button"
            onClick={addFn}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            + add
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Privilege form modal ─────────────────────────────────────────────────────

interface PrivilegeFormData {
  name: string;
  page: string;
  icon: string;
  function: string[];
  submenu: PrivilegeSubmenu[];
  hasSubmenu: boolean;
}

const EMPTY_FORM: PrivilegeFormData = {
  name: '', page: '', icon: '', function: [], submenu: [], hasSubmenu: false
};

interface PrivilegeModalProps {
  initial?: Privilege | null;
  onClose: () => void;
  onSave: (data: PrivilegeFormData) => Promise<void>;
}

const PrivilegeModal: React.FC<PrivilegeModalProps> = ({ initial, onClose, onSave }) => {
  const [form, setForm] = useState<PrivilegeFormData>(() => {
    if (!initial) return EMPTY_FORM;
    const sub = hasRealSubmenu(initial.submenu)
      ? (initial.submenu as PrivilegeSubmenu[])
      : [];
    return {
      name: initial.name,
      page: initial.page,
      icon: initial.icon,
      function: [...initial.function],
      submenu: sub,
      hasSubmenu: sub.length > 0
    };
  });

  const [fnInput, setFnInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const addFn = () => {
    const v = fnInput.trim();
    if (v && !form.function.includes(v)) {
      setForm(f => ({ ...f, function: [...f.function, v] }));
    }
    setFnInput('');
  };

  const removeFn = (fn: string) =>
    setForm(f => ({ ...f, function: f.function.filter(x => x !== fn) }));

  const addSubmenuRow = () =>
    setForm(f => ({
      ...f,
      submenu: [...f.submenu, { name: '', page: '', function: [] }]
    }));

  const updateSubmenuRow = (i: number, row: PrivilegeSubmenu) =>
    setForm(f => {
      const updated = [...f.submenu];
      updated[i] = row;
      return { ...f, submenu: updated };
    });

  const removeSubmenuRow = (i: number) =>
    setForm(f => ({ ...f, submenu: f.submenu.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    if (!form.name.trim() || form.name.trim().length < 3) {
      setError('Name must be at least 3 characters');
      return;
    }
    if (!form.icon.trim()) {
      setError('Icon is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave(form);
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to save privilege');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {initial ? 'Edit Privilege' : 'Create Privilege'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <FiX className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-4 flex-1 space-y-4">
          {/* Name + Icon */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Patient Management"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.icon}
                onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                placeholder="e.g. FiUsers  or  users"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Page */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Page / Route</label>
            <input
              type="text"
              value={form.page}
              onChange={e => setForm(f => ({ ...f, page: e.target.value }))}
              placeholder="e.g. /admin/patients  (leave blank for parent menus)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Has submenu toggle */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.hasSubmenu}
                onChange={e => setForm(f => ({ ...f, hasSubmenu: e.target.checked, submenu: [] }))}
                className="h-4 w-4 rounded border-gray-300 text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">This privilege has sub-menu items</span>
            </label>
            <p className="text-xs text-gray-400 mt-0.5 ml-6">
              When enabled, functions are defined per sub-menu item. Top-level function keys are cleared.
            </p>
          </div>

          {/* Function keys — only shown when no submenu */}
          {!form.hasSubmenu && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Function Keys</label>
              <div className="flex flex-wrap gap-1 items-center min-h-[32px] p-2 border border-gray-200 rounded-lg bg-gray-50">
                {form.function.map(fn => (
                  <span
                    key={fn}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {fn}
                    <button type="button" onClick={() => removeFn(fn)} className="hover:text-red-600">
                      <FiX className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={fnInput}
                    onChange={e => setFnInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFn())}
                    placeholder="type a key and press Enter…"
                    className="px-2 py-0.5 text-xs border border-dashed border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 w-48"
                  />
                  <button
                    type="button"
                    onClick={addFn}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    + add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sub-menu rows */}
          {form.hasSubmenu && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Sub-menu Items</label>
                <button
                  type="button"
                  onClick={addSubmenuRow}
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  <FiPlus className="h-3.5 w-3.5" /> Add row
                </button>
              </div>
              {form.submenu.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-2">No sub-menu items yet — click "Add row" to start.</p>
              ) : (
                <div className="space-y-2">
                  {form.submenu.map((row, i) => (
                    <SubmenuRow
                      key={i}
                      row={row}
                      index={i}
                      onChange={updateSubmenuRow}
                      onRemove={removeSubmenuRow}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end gap-3">
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
            {saving ? 'Saving…' : initial ? 'Update Privilege' : 'Create Privilege'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Confirm delete modal ─────────────────────────────────────────────────────

interface ConfirmDeleteProps {
  name: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

const ConfirmDelete: React.FC<ConfirmDeleteProps> = ({ name, onConfirm, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Delete Privilege</h2>
        <p className="text-sm text-gray-600">
          Delete <strong>{name}</strong>? This will remove it from the privilege list.
          Admins who already have it assigned will keep it in their menu until reassigned.
        </p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handle}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Privilege row ────────────────────────────────────────────────────────────

interface PrivilegeRowProps {
  priv: Privilege;
  isSuperAdmin: boolean;
  onEdit: (p: Privilege) => void;
  onDelete: (p: Privilege) => void;
}

const PrivilegeRow: React.FC<PrivilegeRowProps> = ({ priv, isSuperAdmin, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const realSub = hasRealSubmenu(priv.submenu);

  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-4 py-3 whitespace-nowrap">
          <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
            #{priv.privilege_id}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-mono">{priv.icon}</span>
            <span className="text-sm font-medium text-gray-900">{priv.name}</span>
            {realSub && (
              <button
                onClick={() => setExpanded(v => !v)}
                className="ml-1 text-gray-400 hover:text-gray-600"
                title="Toggle sub-menu"
              >
                {expanded
                  ? <FiChevronDown className="h-3.5 w-3.5" />
                  : <FiChevronRight className="h-3.5 w-3.5" />}
              </button>
            )}
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-500 font-mono">{priv.page || '—'}</td>
        <td className="px-4 py-3">
          {realSub ? (
            <span className="text-xs text-gray-400 italic">{(priv.submenu as PrivilegeSubmenu[]).length} sub-items</span>
          ) : priv.function.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {priv.function.map(fn => (
                <span key={fn} className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">{fn}</span>
              ))}
            </div>
          ) : (
            <span className="text-xs text-gray-400">—</span>
          )}
        </td>
        {isSuperAdmin && (
          <td className="px-4 py-3 whitespace-nowrap text-right">
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => onEdit(priv)}
                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                title="Edit"
              >
                <FiEdit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(priv)}
                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                title="Delete"
              >
                <FiTrash2 className="h-4 w-4" />
              </button>
            </div>
          </td>
        )}
      </tr>
      {/* Expanded sub-menu rows */}
      {expanded && realSub && (priv.submenu as PrivilegeSubmenu[]).map((sub, i) => (
        <tr key={i} className="bg-gray-50 border-t border-gray-100">
          <td className="px-4 py-2 pl-10" colSpan={1}>
            <span className="text-xs text-gray-400">↳</span>
          </td>
          <td className="px-4 py-2 pl-6 text-sm text-gray-700">{sub.name}</td>
          <td className="px-4 py-2 text-sm text-gray-500 font-mono">{sub.page || '—'}</td>
          <td className="px-4 py-2">
            <div className="flex flex-wrap gap-1">
              {sub.function.map(fn => (
                <span key={fn} className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">{fn}</span>
              ))}
            </div>
          </td>
          {isSuperAdmin && <td />}
        </tr>
      ))}
    </>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

const PrivilegesPage: React.FC = () => {
  const { admin } = useAdminAuth();
  const isSuperAdmin = admin?.role === 'super_admin';

  const [privileges, setPrivileges] = useState<Privilege[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState<Privilege | null>(null);
  const [deleteModal, setDeleteModal] = useState<Privilege | null>(null);

  const fetchPrivileges = useCallback(async () => {
    setLoading(true);
    try {
      const res = await privilegesService.getPrivileges({ limit: 100, search });
      setPrivileges(res.data);
    } catch {
      setErrorMsg('Failed to load privileges');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchPrivileges(); }, [fetchPrivileges]);

  const flash = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleCreate = async (form: PrivilegeFormData) => {
    await privilegesService.createPrivilege({
      name:     form.name,
      page:     form.page,
      icon:     form.icon,
      function: form.hasSubmenu ? [] : form.function,
      submenu:  form.hasSubmenu && form.submenu.length > 0 ? form.submenu : ['0']
    });
    flash('Privilege created');
    await fetchPrivileges();
  };

  const handleEdit = async (form: PrivilegeFormData) => {
    if (!editModal) return;
    await privilegesService.updatePrivilege(editModal.privilege_id, {
      name:     form.name,
      page:     form.page,
      icon:     form.icon,
      function: form.hasSubmenu ? [] : form.function,
      submenu:  form.hasSubmenu && form.submenu.length > 0 ? form.submenu : ['0']
    });
    flash('Privilege updated');
    await fetchPrivileges();
  };

  const handleDelete = async (priv: Privilege) => {
    await privilegesService.deletePrivilege(priv.privilege_id);
    flash('Privilege deleted');
    await fetchPrivileges();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <FiShield className="h-5 w-5 text-blue-600" />
            Privileges
          </h2>
          <p className="text-sm text-gray-500">
            Define the menu items and function keys that can be assigned to admin users.
          </p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={() => setCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shrink-0"
          >
            <FiPlus className="h-4 w-4" />
            New Privilege
          </button>
        )}
      </div>

      {!isSuperAdmin && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          You have read-only access. Only super admins can create or modify privileges.
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
          <FiCheck className="h-4 w-4" /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{errorMsg}</div>
      )}

      {/* Search */}
      <div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search privileges…"
          className="w-full sm:w-72 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Functions / Sub-items</th>
                  {isSuperAdmin && (
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {privileges.length === 0 ? (
                  <tr>
                    <td colSpan={isSuperAdmin ? 5 : 4} className="px-4 py-10 text-center text-sm text-gray-500">
                      {search ? 'No privileges match your search.' : 'No privileges defined yet.'}
                    </td>
                  </tr>
                ) : (
                  privileges.map(priv => (
                    <PrivilegeRow
                      key={priv._id}
                      priv={priv}
                      isSuperAdmin={isSuperAdmin}
                      onEdit={setEditModal}
                      onDelete={setDeleteModal}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {createModal && (
        <PrivilegeModal
          onClose={() => setCreateModal(false)}
          onSave={handleCreate}
        />
      )}
      {editModal && (
        <PrivilegeModal
          initial={editModal}
          onClose={() => setEditModal(null)}
          onSave={handleEdit}
        />
      )}
      {deleteModal && (
        <ConfirmDelete
          name={deleteModal.name}
          onConfirm={() => handleDelete(deleteModal)}
          onClose={() => setDeleteModal(null)}
        />
      )}
    </div>
  );
};

// re-export PrivilegeFormData so AssignPrivilege can reuse the type
export type { PrivilegeFormData };
export default PrivilegesPage;
