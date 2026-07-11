import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';
const h = () => ({ headers: { Authorization: `Bearer ${authService.getAccessToken()}` } });

const AllSchedules: React.FC = () => {
  const navigate = useNavigate();
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/professionals?page_size=100`, h());
      setProfessionals(res.data?.data || []);
    } catch { setProfessionals([]); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Professional Schedules</h1>
      <p className="text-gray-500 text-sm">Click a professional to view their schedule.</p>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? <div className="flex justify-center items-center h-48"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
          : professionals.length === 0 ? <div className="text-center py-16 text-gray-400">No professionals found</div>
          : <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50"><tr>{['Professional','Type','Specialization','Status','Action'].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {professionals.map((p: any, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.user ? `${p.user.firstName} ${p.user.lastName}`.trim() : '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 capitalize">{p.professionalType || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.specialization || '—'}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${p.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{p.isVerified ? 'Verified' : 'Pending'}</span></td>
                  <td className="px-6 py-4"><button onClick={() => navigate(`/admin/professionals/${p.id}/schedules`)} className="text-blue-600 hover:underline text-xs">View Schedule</button></td>
                </tr>
              ))}
            </tbody>
          </table>}
      </div>
    </div>
  );
};
export default AllSchedules;
