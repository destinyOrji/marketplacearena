import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';
const h = () => ({ headers: { Authorization: `Bearer ${authService.getAccessToken()}` } });

const statusColor: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800', accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800', reviewed: 'bg-blue-100 text-blue-800',
};

const AllApplications: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const JobApplication = require; // use axios directly
      const res = await axios.get(`${API}/jobs/applications?page_size=100`, h());
      setApplications(res.data?.data || []);
    } catch {
      // fallback: get from professionals
      try {
        const pRes = await axios.get(`${API}/admin/professionals?page_size=50`, h());
        const profs = pRes.data?.data || [];
        const all: any[] = [];
        await Promise.allSettled(profs.slice(0, 20).map(async (p: any) => {
          const aRes = await axios.get(`${API}/admin/professionals/${p.id}/applications`, h());
          (aRes.data?.data || []).forEach((a: any) => all.push({ ...a, professionalName: p.user ? `${p.user.firstName} ${p.user.lastName}`.trim() : '—', professionalId: p.id }));
        }));
        setApplications(all);
      } catch { setApplications([]); }
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">All Job Applications</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? <div className="flex justify-center items-center h-48"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
          : applications.length === 0 ? <div className="text-center py-16 text-gray-400">No applications found</div>
          : <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50"><tr>{['Professional','Position','Hospital','Applied','Status'].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {applications.map((a: any, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4"><button onClick={() => a.professionalId && navigate(`/admin/professionals/${a.professionalId}`)} className="text-blue-600 hover:underline text-sm font-medium">{a.professionalName || a.professional?.user?.firstName || '—'}</button></td>
                  <td className="px-6 py-4 text-sm text-gray-700">{a.job?.jobTitle || a.vacancy_title || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{a.job?.hospital?.hospitalName || a.hospital_name || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '—'}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor[a.status] || 'bg-gray-100 text-gray-700'}`}>{a.status || '—'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>}
      </div>
    </div>
  );
};
export default AllApplications;
