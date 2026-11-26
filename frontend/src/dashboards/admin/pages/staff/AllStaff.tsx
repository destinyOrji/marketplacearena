/**
 * Admin — All Staff Page
 * Shows all platform users grouped by role.
 * Tabs: All | Professionals | Hospitals | Ambulances | Gym & Physio | Patients
 * Features: search, status filter, pagination, role badge, verified badge.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStaff, StaffUser } from '../../services/staffService';

const ROLE_TABS = [
  { key: '',           label: 'All',          color: 'bg-gray-100 text-gray-800' },
  { key: 'professional', label: 'Professionals', color: 'bg-blue-100 text-blue-800' },
  { key: 'hospital',     label: 'Hospitals',     color: 'bg-green-100 text-green-800' },
  { key: 'ambulance',    label: 'Ambulances',     color: 'bg-red-100 text-red-800' },
  { key: 'gym-physio',   label: 'Gym & Physio',   color: 'bg-purple-100 text-purple-800' },
  { key: 'patient',      label: 'Patients',       color: 'bg-amber-100 text-amber-800' },
];

const ROLE_LABELS: Record<string, string> = {
  professional: 'Professional',
  hospital:     'Hospital',
  ambulance:    'Ambulance',
  'gym-physio': 'Gym & Physio',
  patient:      'Patient',
  client:       'Patient',
};

const ROLE_COLORS: Record<string, string> = {
  professional: 'bg-blue-100 text-blue-800',
  hospital:     'bg-green-100 text-green-800',
  ambulance:    'bg-red-100 text-red-800',
  'gym-physio': 'bg-purple-100 text-purple-800',
  patient:      'bg-amber-100 text-amber-800',
  client:       'bg-amber-100 text-amber-800',
};

const AllStaff: React.FC = () => {
  const navigate = useNavigate();

  const [activeRole, setActiveRole] = useState('');
  const [search,     setSearch]     = useState('');
  const [status,     setStatus]     = useState('');
  const [users,      setUsers]      = useState<StaffUser[]>([]);
  const [counts,     setCounts]     = useState<Record<string, number>>({});
  const [loading,    setLoading]    = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, total_pages: 1, page_size: 20 });

  const fetchStaff = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await getStaff({
        role:      activeRole || undefined,
        search:    search     || undefined,
        status:    status     || undefined,
        page,
        page_size: 20,
      });
      setUsers(res.data);
      setCounts(res.counts || {});
      setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to load staff:', err);
    } finally {
      setLoading(false);
    }
  }, [activeRole, search, status]);

  useEffect(() => { fetchStaff(1); }, [activeRole, search, status]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getDetailPath = (u: StaffUser) => {
    switch (u.role) {
      case 'professional': return `/admin/professionals/${u.id}`;
      case 'hospital':     return `/admin/hospitals/${u.id}`;
      case 'ambulance':    return `/admin/ambulances/${u.id}`;
      case 'gym-physio':   return `/admin/gym-physio/${u.id}`;
      default:             return `/admin/patients/${u.id}`;
    }
  };

  const getProfileName = (u: StaffUser) => {
    if (u.profile?.name) return u.profile.name;
    if (u.profile?.professionalType) return u.profile.professionalType;
    return '—';
  };

  const totalAll = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Staff</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            View and manage all platform users by role
          </p>
        </div>
        <div className="flex gap-2">
          {/* Status filter */}
          <select
            value={status}
            onChange={e => { setStatus(e.target.value); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Role Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 flex overflow-x-auto">
          {ROLE_TABS.map(tab => {
            const count = tab.key === '' ? totalAll : (counts[tab.key] ?? 0);
            const active = activeRole === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => { setActiveRole(tab.key); }}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex-shrink-0 ${
                  active
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${active ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-gray-100">
          <input
            type="search"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="font-medium">No users found</p>
            <p className="text-sm mt-1">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {['Name / Email', 'Role', 'Profile Info', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">

                    {/* Name / Email */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm flex-shrink-0">
                          {u.firstName?.[0]?.toUpperCase()}{u.lastName?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{u.firstName} {u.lastName}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-700'}`}>
                        {ROLE_LABELS[u.role] || u.role}
                      </span>
                      {u.profile?.isHospitalStaff && (
                        <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-700 font-medium">
                          Hospital Staff
                        </span>
                      )}
                    </td>

                    {/* Profile Info */}
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-900 capitalize">{getProfileName(u)}</p>
                      {u.profile?.phone && <p className="text-xs text-gray-500 mt-0.5">{u.profile.phone}</p>}
                      {u.profile?.hospitalDepartment && <p className="text-xs text-gray-400">{u.profile.hospitalDepartment}</p>}
                      {u.profile?.isVerified !== undefined && (
                        <span className={`mt-0.5 inline-flex items-center text-xs font-medium ${u.profile.isVerified ? 'text-green-600' : 'text-amber-600'}`}>
                          {u.profile.isVerified ? '✓ Verified' : '⏳ Unverified'}
                        </span>
                      )}
                    </td>

                    {/* Account Status */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                        u.status === 'active'    ? 'bg-green-100 text-green-800' :
                        u.status === 'suspended' ? 'bg-red-100 text-red-700'    :
                                                    'bg-gray-100 text-gray-600'
                      }`}>
                        {u.status}
                      </span>
                      {!u.emailVerified && (
                        <p className="text-xs text-amber-600 mt-0.5">Email unverified</p>
                      )}
                    </td>

                    {/* Joined */}
                    <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <button
                        onClick={() => navigate(getDetailPath(u))}
                        className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        View Profile →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.total_pages} &bull; {pagination.total} total
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fetchStaff(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
              >
                ← Prev
              </button>
              <button
                onClick={() => fetchStaff(pagination.page + 1)}
                disabled={pagination.page >= pagination.total_pages}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllStaff;
