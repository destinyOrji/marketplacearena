import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiCheckCircle, FiXCircle, FiTrash2, FiSearch } from 'react-icons/fi';
import { authService } from '../../services/authService';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://healthmarketarena.com/api';

const AllGymPhysio: React.FC = () => {
  const navigate = useNavigate();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [verFilter, setVerFilter] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const getHeaders = () => ({ headers: { Authorization: `Bearer ${authService.getAccessToken()}` } });

  useEffect(() => { fetchList(); }, []);

  const fetchList = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (verFilter === 'verified') params.verification_status = 'verified';
      if (verFilter === 'pending') params.verification_status = 'pending';
      const res = await axios.get(`${API_BASE_URL}/admin/gym-physio`, { ...getHeaders(), params });
      setList(res.data?.data || []);
    } catch { setList([]); }
    finally { setLoading(false); }
  };

  const handleVerify = async (id: string) => {
    setActionLoading(id + 'v');
    try {
      await axios.post(`${API_BASE_URL}/admin/gym-physio/${id}/verify`, {}, getHeaders());
      setList(prev => prev.map(p => (p._id || p.id) === id ? { ...p, isVerified: true } : p));
    } catch { alert('Failed to verify'); }
    finally { setActionLoading(null); }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt('Rejection reason:');
    if (!reason) return;
    setActionLoading(id + 'r');
    try {
      await axios.post(`${API_BASE_URL}/admin/gym-physio/${id}/reject`, { reason }, getHeaders());
      setList(prev => prev.map(p => (p._id || p.id) === id ? { ...p, isVerified: false } : p));
    } catch { alert('Failed to reject'); }
    finally { setActionLoading(null); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this provider?')) return;
    setActionLoading(id + 'd');
    try {
      await axios.delete(`${API_BASE_URL}/admin/gym-physio/${id}/delete`, getHeaders());
      setList(prev => prev.filter(p => (p._id || p.id) !== id));
    } catch { alert('Failed to delete'); }
    finally { setActionLoading(null); }
  };

  const filtered = list.filter(p => {
    const name = p.businessName || '';
    const matchSearch = !search || name.toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || p.businessType === typeFilter;
    const matchVer = !verFilter || (verFilter === 'verified' ? p.isVerified : !p.isVerified);
    return matchSearch && matchType && matchVer;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gym & Physiotherapy Providers</h1>
        <div className="flex gap-3">
          <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
            {filtered.length} providers
          </span>
          <button onClick={() => navigate('/admin/gym-physio/verification')}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm">
            Pending Verifications
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
          <input type="text" placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
          <option value="">All Types</option>
          <option value="gym">Gym</option>
          <option value="physiotherapy">Physiotherapy</option>
          <option value="both">Both</option>
        </select>
        <select value={verFilter} onChange={e => { setVerFilter(e.target.value); fetchList(); }}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
          <option value="">All Status</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">🏋️</p>
            <p className="text-gray-500">No gym/physio providers found</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Business', 'Type', 'Location', 'Contact', 'Rating', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((p: any) => {
                const id = p._id || p.id;
                return (
                  <tr key={id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{p.businessName || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{p.specialization || ''}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">{p.businessType || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{[p.city, p.state].filter(Boolean).join(', ') || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{p.phone || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      ⭐ {(p.averageRating || 0).toFixed(1)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${p.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {p.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => navigate(`/admin/gym-physio/${id}`)} className="text-blue-600 hover:text-blue-800" title="View">
                          <FiEye className="h-4 w-4" />
                        </button>
                        {!p.isVerified && (
                          <>
                            <button onClick={() => handleVerify(id)} disabled={!!actionLoading} className="text-green-600 hover:text-green-800" title="Verify">
                              <FiCheckCircle className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleReject(id)} disabled={!!actionLoading} className="text-red-600 hover:text-red-800" title="Reject">
                              <FiXCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button onClick={() => handleDelete(id)} disabled={!!actionLoading} className="text-red-600 hover:text-red-800" title="Delete">
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AllGymPhysio;
