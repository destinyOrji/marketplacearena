import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import axios from 'axios';

const API = process.env.REACT_APP_API_BASE_URL || 'https://healthmarketarena.com/api';
const h = () => ({ headers: { Authorization: `Bearer ${authService.getAccessToken()}` } });

const AllHospitalSubscriptions: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const hRes = await axios.get(`${API}/admin/hospitals?page_size=100`, h());
      const hospitals = hRes.data?.data || [];
      const all: any[] = [];
      await Promise.allSettled(hospitals.slice(0, 30).map(async (hosp: any) => {
        const sRes = await axios.get(`${API}/admin/hospitals/${hosp.id}/subscription`, h());
        const sub = sRes.data?.data;
        all.push({ hospitalId: hosp.id, hospitalName: hosp.hospitalName || '—', subscription: sub });
      }));
      setRows(all);
    } catch { setRows([]); }
    finally { setLoading(false); }
  };

  const statusColor: Record<string, string> = {
    active: 'bg-green-100 text-green-800', expired: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Hospital Subscriptions</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? <div className="flex justify-center items-center h-48"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
          : rows.length === 0 ? <div className="text-center py-16 text-gray-400">No hospitals found</div>
          : <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50"><tr>{['Hospital','Plan','Amount','Start','End','Status'].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((r, i) => {
                const s = r.subscription;
                return (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4"><button onClick={() => navigate(`/admin/hospitals/${r.hospitalId}`)} className="text-blue-600 hover:underline text-sm font-medium">{r.hospitalName}</button></td>
                    <td className="px-6 py-4 text-sm text-gray-700">{s?.plan_name || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{s?.amount ? `₦${s.amount.toLocaleString()}` : '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{s?.start_date ? new Date(s.start_date).toLocaleDateString() : '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{s?.end_date ? new Date(s.end_date).toLocaleDateString() : '—'}</td>
                    <td className="px-6 py-4">
                      {s ? <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor[s.status] || 'bg-gray-100 text-gray-700'}`}>{s.status}</span>
                        : <span className="text-xs text-gray-400">No subscription</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>}
      </div>
    </div>
  );
};
export default AllHospitalSubscriptions;
