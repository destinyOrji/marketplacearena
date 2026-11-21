/**
 * Assign Privileges Page
 * Super-admin selects an admin user, picks which privileges to assign,
 * ticks allowed functions / sub-menu items, and saves.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { FiCheck, FiX, FiChevronDown, FiChevronRight, FiShield, FiUser, FiTrash2 } from 'react-icons/fi';
import privilegesService from '../../services/privilegesService';
import { settingsService } from '../../services/settingsService';
import { Privilege, PrivilegeSubmenu, AssignedMenuItem } from '../../types/privileges';
import { AdminUser } from '../../types';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const hasRealSubmenu = (sub: Privilege['submenu']): sub is PrivilegeSubmenu[] =>
  Array.isArray(sub) && !(sub.length === 1 && (sub as any)[0] === '0');

// ─── Privilege selector row ───────────────────────────────────────────────────

interface PrivilegeSelectorRowProps {
  priv: Privilege;
  selected: boolean;
  selectedFunctions: string[];
  selectedSubmenu: PrivilegeSubmenu[];
  onToggle: (priv: Privilege, checked: boolean) => void;
  onToggleFunction: (priv: Privilege, fn: string, checked: boolean) => void;
  onToggleSubmenu: (priv: Privilege, sub: PrivilegeSubmenu, checked: boolean) => void;
  onToggleSubFunction: (priv: Privilege, subName: string, fn: string, checked: boolean) => void;
}

const PrivilegeSelectorRow: React.FC<PrivilegeSelectorRowProps> = ({
  priv, selected, selectedFunctions, selectedSubmenu,
  onToggle, onToggleFunction, onToggleSubmenu, onToggleSubFunction
}) => {
  const [expanded, setExpanded] = useState(false);
  const realSub = hasRealSubmenu(priv.submenu);

  return (
    <div className={`border rounded-lg overflow-hidden transition-colors ${selected ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'}`}>
      {/* Main row */}
      <div className="flex items-center gap-3 p-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={e => onToggle(priv, e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono shrink-0">
          {priv.icon}
        </span>
        <span className="text-sm font-medium text-gray-900 flex-1">{priv.name}</span>
        {priv.page && (
          <span className="text-xs text-gray-400 font-mono hidden sm:inline">{priv.page}</span>
        )}
        {/* Expand button when has children */}
        {selected && (realSub || priv.function.length > 0) && (
          <button
            type="button"
            onClick={() => setExpanded(v => !v)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            {expanded
              ? <FiChevronDown className="h-4 w-4" />
              : <FiChevronRight className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Expanded: function keys (no submenu) */}
      {selected && expanded && !realSub && priv.function.length > 0 && (
        <div className="px-10 pb-3 space-y-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Functions</p>
          <div className="flex flex-wrap gap-2">
            {priv.function.map(fn => (
              <label key={fn} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedFunctions.includes(fn)}
                  onChange={e => onToggleFunction(priv, fn, e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600"
                />
                <span className="text-xs text-gray-700 font-mono">{fn}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Expanded: sub-menu items */}
      {selected && expanded && realSub && (
        <div className="px-10 pb-3 space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Sub-menu items</p>
          {(priv.submenu as PrivilegeSubmenu[]).map((sub, i) => {
            const subSelected = selectedSubmenu.some(s => s.name === sub.name);
            const subSelObj = selectedSubmenu.find(s => s.name === sub.name);

            return (
              <div key={i} className={`border rounded-md p-2 ${subSelected ? 'border-blue-200 bg-white' : 'border-gray-100 bg-gray-50'}`}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={subSelected}
                    onChange={e => onToggleSubmenu(priv, sub, e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600"
                  />
                  <span className="text-sm text-gray-800">{sub.name}</span>
                  {sub.page && (
                    <span className="text-xs text-gray-400 font-mono">{sub.page}</span>
                  )}
                </label>

                {/* Sub-function keys */}
                {subSelected && sub.function.length > 0 && (
                  <div className="ml-6 mt-2 flex flex-wrap gap-2">
                    {sub.function.map(fn => (
                      <label key={fn} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!(subSelObj?.function.includes(fn))}
                          onChange={e => onToggleSubFunction(priv, sub.name, fn, e.target.checked)}
                          className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600"
                        />
                        <span className="text-xs text-gray-700 font-mono">{fn}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

const AssignPrivilegesPage: React.FC = () => {
  const { admin: currentAdmin } = useAdminAuth();
  const isSuperAdmin = currentAdmin?.role === 'super_admin';

  const [adminUsers, setAdminUsers]       = useState<AdminUser[]>([]);
  const [privileges, setPrivileges]       = useState<Privilege[]>([]);
  const [selectedUser, setSelectedUser]   = useState<AdminUser | null>(null);
  const [existingMenu, setExistingMenu]   = useState<AssignedMenuItem[]>([]);
  const [loadingUsers, setLoadingUsers]   = useState(true);
  const [loadingPrivs, setLoadingPrivs]   = useState(true);
  const [loadingMenu, setLoadingMenu]     = useState(false);
  const [saving, setSaving]               = useState(false);
  const [revoking, setRevoking]           = useState(false);
  const [successMsg, setSuccessMsg]       = useState('');
  const [errorMsg, setErrorMsg]           = useState('');

  // Selection state: privilege_id → { functions: string[], submenu: PrivilegeSubmenu[] }
  const [selections, setSelections] = useState<Record<number, { functions: string[]; submenu: PrivilegeSubmenu[] }>>({});

  // ── Load admin users + privileges ─────────────────────────────────────────
  useEffect(() => {
    settingsService.getAdminUsers()
      .then(users => setAdminUsers(users.filter(u => u.role !== 'super_admin')))
      .catch(() => setErrorMsg('Failed to load admin users'))
      .finally(() => setLoadingUsers(false));

    privilegesService.getPrivileges({ limit: 100 })
      .then(res => setPrivileges(res.data))
      .catch(() => setErrorMsg('Failed to load privileges'))
      .finally(() => setLoadingPrivs(false));
  }, []);

  // ── When a user is selected, load their current menu ──────────────────────
  const handleSelectUser = useCallback(async (user: AdminUser) => {
    setSelectedUser(user);
    setSelections({});
    setExistingMenu([]);
    setLoadingMenu(true);
    setErrorMsg('');
    try {
      const menu = await privilegesService.getAssignedPrivileges(String(user.id));
      setExistingMenu(menu);

      // Populate selections from existing menu
      const init: Record<number, { functions: string[]; submenu: PrivilegeSubmenu[] }> = {};
      menu.forEach(item => {
        const realSub = Array.isArray(item.submenu) &&
          !(item.submenu.length === 1 && (item.submenu as any)[0] === '0');
        init[item.privilege_id] = {
          functions: item.function || [],
          submenu:   realSub ? (item.submenu as PrivilegeSubmenu[]) : []
        };
      });
      setSelections(init);
    } catch {
      // user may have no menu yet — that's fine
    } finally {
      setLoadingMenu(false);
    }
  }, []);

  // ── Selection handlers ────────────────────────────────────────────────────

  const togglePrivilege = (priv: Privilege, checked: boolean) => {
    setSelections(prev => {
      if (!checked) {
        const next = { ...prev };
        delete next[priv.privilege_id];
        return next;
      }
      return { ...prev, [priv.privilege_id]: { functions: [], submenu: [] } };
    });
  };

  const toggleFunction = (priv: Privilege, fn: string, checked: boolean) => {
    setSelections(prev => {
      const cur = prev[priv.privilege_id] || { functions: [], submenu: [] };
      return {
        ...prev,
        [priv.privilege_id]: {
          ...cur,
          functions: checked
            ? [...cur.functions, fn]
            : cur.functions.filter(f => f !== fn)
        }
      };
    });
  };

  const toggleSubmenu = (priv: Privilege, sub: PrivilegeSubmenu, checked: boolean) => {
    setSelections(prev => {
      const cur = prev[priv.privilege_id] || { functions: [], submenu: [] };
      return {
        ...prev,
        [priv.privilege_id]: {
          ...cur,
          submenu: checked
            ? [...cur.submenu, { name: sub.name, page: sub.page, function: [] }]
            : cur.submenu.filter(s => s.name !== sub.name)
        }
      };
    });
  };

  const toggleSubFunction = (priv: Privilege, subName: string, fn: string, checked: boolean) => {
    setSelections(prev => {
      const cur = prev[priv.privilege_id] || { functions: [], submenu: [] };
      const updatedSub = cur.submenu.map(s => {
        if (s.name !== subName) return s;
        return {
          ...s,
          function: checked
            ? [...s.function, fn]
            : s.function.filter(f => f !== fn)
        };
      });
      return { ...prev, [priv.privilege_id]: { ...cur, submenu: updatedSub } };
    });
  };

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!selectedUser) return;
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const privilegesToAssign: AssignedMenuItem[] = Object.entries(selections).map(([pid, sel]) => {
        const privDef = privileges.find(p => p.privilege_id === parseInt(pid));
        return {
          privilege_id: parseInt(pid),
          name:         privDef?.name     || '',
          icon:         privDef?.icon     || '',
          page:         privDef?.page     || '',
          function:     sel.functions,
          submenu:      sel.submenu.length > 0 ? sel.submenu : ['0']
        } as AssignedMenuItem;
      });

      const action = existingMenu.length > 0 ? 'update' : 'assign';
      await privilegesService.assignPrivileges({
        admin_user_id: String(selectedUser.id),
        action,
        privileges:    privilegesToAssign
      });

      setSuccessMsg('Privileges saved successfully');
      // Refresh existing menu
      const updated = await privilegesService.getAssignedPrivileges(String(selectedUser.id));
      setExistingMenu(updated);
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.message || 'Failed to save privileges');
    } finally {
      setSaving(false);
    }
  };

  // ── Revoke all ────────────────────────────────────────────────────────────

  const handleRevoke = async () => {
    if (!selectedUser) return;
    if (!window.confirm(`Remove ALL privileges from ${selectedUser.first_name} ${selectedUser.last_name}?`)) return;
    setRevoking(true);
    try {
      await privilegesService.revokeAllPrivileges(String(selectedUser.id));
      setSelections({});
      setExistingMenu([]);
      setSuccessMsg('All privileges revoked');
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.message || 'Failed to revoke privileges');
    } finally {
      setRevoking(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
        Only super admins can assign privileges to other admin users.
      </div>
    );
  }

  const isLoading = loadingUsers || loadingPrivs;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <FiShield className="h-5 w-5 text-blue-600" />
          Assign Privileges
        </h2>
        <p className="text-sm text-gray-500">
          Select an admin user then choose which privileges and functions they can access.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
          <FiCheck className="h-4 w-4" /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{errorMsg}</div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Left: user list */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b bg-gray-50">
                <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FiUser className="h-4 w-4" /> Admin Users
                </h3>
              </div>
              <div className="divide-y divide-gray-100 max-h-[480px] overflow-y-auto">
                {adminUsers.length === 0 ? (
                  <p className="p-4 text-sm text-gray-500 text-center">No admin users found</p>
                ) : (
                  adminUsers.map(user => (
                    <button
                      key={String(user.id)}
                      onClick={() => handleSelectUser(user)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                        selectedUser?.id === user.id ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                      <div className="mt-0.5">
                        <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded capitalize">
                          {user.role}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right: privilege selector */}
          <div className="lg:col-span-2">
            {!selectedUser ? (
              <div className="flex items-center justify-center h-48 bg-white border border-dashed border-gray-300 rounded-xl">
                <p className="text-sm text-gray-400">← Select an admin user to manage their privileges</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* User header + revoke */}
                <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedUser.first_name} {selectedUser.last_name}
                    </div>
                    <div className="text-xs text-gray-500">{selectedUser.email}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {Object.keys(selections).length} privilege{Object.keys(selections).length !== 1 ? 's' : ''} selected
                    </span>
                    {existingMenu.length > 0 && (
                      <button
                        onClick={handleRevoke}
                        disabled={revoking}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
                      >
                        <FiTrash2 className="h-3.5 w-3.5" />
                        {revoking ? 'Revoking…' : 'Revoke all'}
                      </button>
                    )}
                  </div>
                </div>

                {loadingMenu ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                  </div>
                ) : (
                  <>
                    {/* Privilege rows */}
                    <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                      {privileges.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-6">
                          No privileges defined yet. Create some in the Privileges tab first.
                        </p>
                      ) : (
                        privileges.map(priv => (
                          <PrivilegeSelectorRow
                            key={priv._id}
                            priv={priv}
                            selected={priv.privilege_id in selections}
                            selectedFunctions={selections[priv.privilege_id]?.functions || []}
                            selectedSubmenu={selections[priv.privilege_id]?.submenu || []}
                            onToggle={togglePrivilege}
                            onToggleFunction={toggleFunction}
                            onToggleSubmenu={toggleSubmenu}
                            onToggleSubFunction={toggleSubFunction}
                          />
                        ))
                      )}
                    </div>

                    {/* Save button */}
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={handleSave}
                        disabled={saving || Object.keys(selections).length === 0}
                        className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            Saving…
                          </>
                        ) : (
                          <>
                            <FiCheck className="h-4 w-4" />
                            Save Privileges
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignPrivilegesPage;
