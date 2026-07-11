/**
 * Admin — All Hospital Job Applications
 * Lists all applications across all hospitals.
 * "View Details" navigates to a full-page detail view (same layout as hospital).
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import axios from 'axios';
import { format } from 'date-fns';
import { FiFileText, FiSearch, FiRefreshCw } from 'react-icons/fi';

const API = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';
const BASE = (process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api').replace('/api', '');

const headers = () => ({ headers: { Authorization: `Bearer ${authService.getAccessToken()}` } });

const STATUS_STYLES: Record<string, string> = {
  pending:     'bg-yellow-100 text-yellow-800',
  reviewing:   'bg-blue-100 text-blue-800',
  shortlisted: 'bg-purple-100 text-purple-800',
  offered:     'bg-indigo-100 text-indigo-800',
  accepted:    'bg-green-100 text-green-800',
  rejected:    'bg-red-100 text-red-800',
  withdrawn:   'bg-gray-100 text-gray-800',
};

const fullUrl = (p: string) =>
  !p ? '' : p.startsWith('http') ? p : `${BASE}${p.startsWith('/') ? '' : '/'}${p}`;

/** Count documents attached to an application */
const docCount = (a: any): number => {
  const p = a.professional || {};
  let n = 0;
  if (p.resumeFile)      n++;
  if (p.licenseDocument) n++;
  if (p.profilePicture)  n++;
  if (Array.isArray(p.certifications)) n += p.certifications.filter((c: any) => c.certificateUrl).length;
  if (Array.isArray(a.attachments))    n += a.attachments.length;
  return n;
};

// ─────────────────────────────────────────────────────────────────────────────

const AllHospitalApplications: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch]             = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const hRes = await axios.get(`${API}/admin/hospitals?page_size=200`, headers());
      const hospitals: any[] = hRes.data?.data || [];
      const all: any[] = [];

      await Promise.allSettled(
        hospitals.slice(0, 50).map(async (hosp: any) => {
          try {
            const aRes = await axios.get(`${API}/admin/hospitals/${hosp.id}/applications`, headers());
            const apps: any[] = aRes.data?.data || [];
            apps.forEach(a => all.push({
              ...a,
              _hospitalName: hosp.hospitalName || '—',
              _hospitalId:   hosp.id,
            }));
          } catch { /* skip on error */ }
        })
      );

      all.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setApplications(all);
    } catch {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = applications.filter(a => {
    if (statusFilter && a.status !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    const name = a.professional?.user?.firstName
      ? `${a.professional.user.firstName} ${a.professional.user.lastName}`.toLowerCase()
      : '';
    return (
      name.includes(q) ||
      (a.job?.jobTitle || '').toLowerCase().includes(q) ||
      (a._hospitalName || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hospital Job Applications</h1>
          <p className="text-sm text-gray-500 mt-0.5">All applications across all hospitals</p>
        </div>
        <button onClick={fetchAll} disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
          <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-52">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, job or hospital..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Status</option>
          {['pending','reviewing','shortlisted','offered','accepted','rejected','withdrawn'].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <span className="text-sm text-gray-500 ml-auto">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <FiFileText className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium">No applications found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {['Professional', 'Type', 'Position', 'Hospital', 'Applied', 'Docs', 'Status', ''].map(col => (
                    <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((a: any, i: number) => {
                  const p    = a.professional || {};
                  const u    = p.user || {};
                  const name = u.firstName ? `${u.firstName} ${u.lastName}`.trim() : '—';
                  const type = p.professionalType || '—';
                  const job  = a.job?.jobTitle || '—';
                  const hosp = a._hospitalName || '—';
                  const hospId = a._hospitalId;
                  const appId  = a._id || a.id;
                  const applied = a.createdAt ? format(new Date(a.createdAt), 'MMM d, yyyy') : '—';
                  const docs  = docCount(a);
                  const status = a.status || 'pending';

                  return (
                    <tr key={i} className="hover:bg-gray-50">
                      {/* Professional */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          {p.profilePicture ? (
                            <img src={fullUrl(p.profilePicture)} alt={name}
                              className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-gray-200" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-xs font-bold">
                                {name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{name}</p>
                            <p className="text-xs text-gray-400">{u.email || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 capitalize whitespace-nowrap">{type}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800 whitespace-nowrap">{job}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => navigate(`/admin/hospitals/${hospId}`)}
                          className="text-sm text-blue-600 hover:underline whitespace-nowrap">{hosp}</button>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{applied}</td>
                      <td className="px-4 py-3">
                        {docs > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
                            <FiFileText className="h-3 w-3" /> {docs}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">None</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-700'}`}>
                          {status}
                        </span>
                      </td>
                      {/* View Details — full page, same as hospital */}
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => navigate(`/admin/hospitals/all-applications/${hospId}/${appId}`)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 whitespace-nowrap"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllHospitalApplications;
