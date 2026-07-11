import React, { useState, useEffect, useCallback } from 'react';
import { FiShield, FiUsers, FiInfo, FiCheck } from 'react-icons/fi';
import { settingsService } from '../../services/settingsService';
import { Role, AvailablePermission } from '../../types';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

// ─── Permission group chip ───────────────────────────────────────────────────

const PermChip: React.FC<{ label: string }> = ({ label }) => (
  <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
    {label}
  </span>
);

// ─── Role card ────────────────────────────────────────────────────────────────

interface RoleCardProps {
  role: Role;
  allPermissions: AvailablePermission[];
}

const ROLE_COLOURS: Record<string, { bg: string; border: string; icon: string; badge: string }> = {
  super_admin: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    icon: 'text-purple-600',
    badge: 'bg-purple-100 text-purple-800'
  },
  admin: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-800'
  },
  moderator: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-800'
  }
};

const RoleCard: React.FC<RoleCardProps> = ({ role, allPermissions }) => {
  const [expanded, setExpanded] = useState(false);
  const colours = ROLE_COLOURS[role.id] || ROLE_COLOURS.admin;

  // Build a map of label → key for display
  const permLabelMap = allPermissions.reduce<Record<string, string>>((acc, p) => {
    acc[p.key] = p.label;
    return acc;
  }, {});

  const groupedPerms = allPermissions.reduce<Record<string, { key: string; label: string; granted: boolean }[]>>(
    (acc, p) => {
      if (!acc[p.group]) acc[p.group] = [];
      acc[p.group].push({ key: p.key, label: p.label, granted: role.permissions.includes(p.key) });
      return acc;
    },
    {}
  );

  const grantedCount = role.permissions.length;
  const totalCount = allPermissions.length;

  return (
    <div className={`border rounded-xl p-5 space-y-3 ${colours.bg} ${colours.border}`}>
      {/* Title row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg bg-white shadow-sm`}>
            <FiShield className={`h-5 w-5 ${colours.icon}`} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900">{role.name}</h3>
              {role.isSystem && (
                <span className="px-1.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                  System
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-0.5">{role.description}</p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${colours.badge}`}>
          {role.id === 'super_admin' ? 'All access' : `${grantedCount} / ${totalCount} perms`}
        </span>
      </div>

      {/* Permission summary / toggle */}
      {role.id !== 'super_admin' && (
        <>
          <button
            onClick={() => setExpanded(v => !v)}
            className="text-xs font-medium text-blue-600 hover:underline"
          >
            {expanded ? 'Hide permissions' : 'Show permissions'}
          </button>

          {expanded && (
            <div className="space-y-3 pt-1">
              {Object.entries(groupedPerms).map(([group, items]) => (
                <div key={group}>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{group}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {items.map(item => (
                      <div key={item.key} className={`flex items-center space-x-2 text-sm ${item.granted ? 'text-gray-800' : 'text-gray-400'}`}>
                        <FiCheck className={`h-3.5 w-3.5 flex-shrink-0 ${item.granted ? 'text-green-500' : 'text-gray-300'}`} />
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!expanded && (
            <div className="flex flex-wrap gap-1.5">
              {role.permissions.slice(0, 6).map(key => (
                <PermChip key={key} label={permLabelMap[key] || key} />
              ))}
              {role.permissions.length > 6 && (
                <span className="text-xs text-gray-500 self-center">
                  +{role.permissions.length - 6} more
                </span>
              )}
            </div>
          )}
        </>
      )}

      {role.id === 'super_admin' && (
        <p className="text-sm text-purple-700">
          Super Admins have unrestricted access to every feature in the platform.
        </p>
      )}

      {/* Assigned admins link */}
      <div className="flex items-center space-x-1.5 text-xs text-gray-500 pt-1 border-t border-white/60">
        <FiUsers className="h-3.5 w-3.5" />
        <span>Assign this role when creating an admin user</span>
      </div>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

const RolesPermissions: React.FC = () => {
  const { admin: currentAdmin } = useAdminAuth();
  const isSuperAdmin = currentAdmin?.role === 'super_admin';

  const [roles, setRoles] = useState<Role[]>([]);
  const [availablePerms, setAvailablePerms] = useState<AvailablePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [rolesData, permsData] = await Promise.all([
        settingsService.getRoles(),
        settingsService.getAvailablePermissions()
      ]);
      setRoles(rolesData);
      setAvailablePerms(permsData);
    } catch {
      setError('Failed to load roles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold text-gray-900">Roles & Permissions</h2>
        <p className="text-sm text-gray-500 mt-1">
          These are the built-in system roles. Assign a role when creating an admin user — or customise
          individual permissions directly on the <span className="font-medium">Admin Users</span> tab.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {/* Info banner */}
      <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <FiInfo className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">How roles work</p>
          <p>
            Each admin user is assigned a base role that defines their default permissions. Super Admins
            can override individual permissions per user from the <strong>Admin Users</strong> tab using the
            shield icon.
          </p>
        </div>
      </div>

      {/* Role cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roles.map(role => (
          <RoleCard key={role.id} role={role} allPermissions={availablePerms} />
        ))}
      </div>

      {/* Permission reference table */}
      {availablePerms.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">All Available Permissions</h3>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permission</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Super Admin</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Moderator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {availablePerms.map(perm => {
                  const superAdminRole = roles.find(r => r.id === 'super_admin');
                  const adminRole = roles.find(r => r.id === 'admin');
                  const moderatorRole = roles.find(r => r.id === 'moderator');

                  const hasPerm = (role: Role | undefined) =>
                    role?.id === 'super_admin' || role?.permissions.includes(perm.key);

                  return (
                    <tr key={perm.key} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{perm.label}</div>
                        <div className="text-xs text-gray-400 font-mono">{perm.key}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{perm.group}</td>
                      <td className="px-4 py-3 text-center">
                        <FiCheck className="h-4 w-4 text-green-500 mx-auto" />
                      </td>
                      <td className="px-4 py-3 text-center">
                        {hasPerm(adminRole)
                          ? <FiCheck className="h-4 w-4 text-green-500 mx-auto" />
                          : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {hasPerm(moderatorRole)
                          ? <FiCheck className="h-4 w-4 text-green-500 mx-auto" />
                          : <span className="text-gray-300">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesPermissions;
