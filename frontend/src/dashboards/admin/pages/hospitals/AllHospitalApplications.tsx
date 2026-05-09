import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import axios from 'axios';

const API = process.env.REACT_APP_API_BASE_URL || 'https://healthmarketarena.com/api';
const h = () => ({ headers: { Authorization: `Bearer ${authService.getAccessToken()}` } });

const statusColor: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800', accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800', reviewed: 'bg-blue-100 text-blue-800',
};

const AllHospitalApplications: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const hRes = await axios.get(`${API}/admin/hospitals?page_size=100`, h());
      const hospitals = hRes.data?.data || [];
      const all: any[] = [];
      await Promise.allSettled(hospitals.slice(0, 20).map(async (hosp: any) => {
        const aRes = await axios.get(`${API}/admin/hospitals/${hosp.id}/applications`, h());
        (aRes.data?.data || []).forEach((a: any) => all.push({
          ...a,
          hospitalName: hosp.hospitalName || '—',
          hospitalId: hosp.id,
        }));
      }));
      setApplications(all);
    } catch { setApplications([]); }
    finally { setLoading(false); }
  };

  const filtered = statusFilter ? applications.filter(a => a.status === statusFilter) : applications;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Hospital Job Applications</h1>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex gap-4">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md text-sm">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
        <span className="text-sm text-gray-500 self-center">{filtered.length} applications</span>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? <div className="flex justify-center items-center h-48"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
          : filtered.length === 0 ? <div className="text-center py-16 text-gray-400">No applications found</div>
          : <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50"><tr>{['Hospital','Professional','Position','Applied','Status'].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((a: any, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4"><button onClick={() => navigate(`/admin/hospitals/${a.hospitalId}`)} className="text-blue-600 hover:underline text-sm font-medium">{a.hospitalName}</button></td>
                  <td className="px-6 py-4 text-sm text-gray-700">{a.professional_name || a.professional?.user?.firstName || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{a.vacancy_title || a.job?.jobTitle || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{a.applied_date || a.createdAt ? new Date(a.applied_date || a.createdAt).toLocaleDateString() : '—'}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor[a.status] || 'bg-gray-100 text-gray-700'}`}>{a.status || '—'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>}
      </div>
    </div>
  );
};
export default AllHospitalApplications;
