import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import axios from 'axios';

const API = process.env.REACT_APP_API_BASE_URL || 'https://healthmarketarena.com/api';
const h = () => ({ headers: { Authorization: `Bearer ${authService.getAccessToken()}` } });

const AllGymEarnings: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const pRes = await axios.get(`${API}/admin/gym-physio?page_size=100`, h());
      const providers = pRes.data?.data || [];
      const all: any[] = [];
      await Promise.allSettled(providers.slice(0, 30).map(async (p: any) => {
        const eRes = await axios.get(`${API}/admin/gym-physio/${p._id || p.id}/earnings`, h());
        const d = eRes.data?.data || {};
        all.push({
          id: p._id || p.id,
          name: p.businessName || '—',
          type: p.businessType || '—',
          totalEarnings: d.totalEarnings || 0,
          platformFees: d.platformFees || 0,
          netEarnings: d.netEarnings || 0,
          completedAppointments: d.completedAppointments || 0,
        });
      }));
      all.sort((a, b) => b.totalEarnings - a.totalEarnings);
      setRows(all);
    } catch { setRows([]); }
    finally { setLoading(false); }
  };

  const total = rows.reduce((s, r) => s + r.totalEarnings, 0);
  const net = rows.reduce((s, r) => s + r.netEarnings, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Gym & Physio Earnings</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[['Total Revenue', `₦${total.toLocaleString()}`, 'bg-blue-600'], ['Net to Providers', `₦${net.toLocaleString()}`, 'bg-green-600'], ['Platform Fees', `₦${(total - net).toLocaleString()}`, 'bg-orange-600']].map(([label, value, color]) => (
          <div key={label} className={`${color} text-white rounded-xl p-5`}>
            <p className="text-sm opacity-80">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? <div className="flex justify-center items-center h-48"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
          : rows.length === 0 ? <div className="text-center py-16 text-gray-400">No earnings data</div>
          : <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50"><tr>{['Provider','Type','Sessions','Total','Platform Fee','Net'].map(col => <th key={col} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{col}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4"><button onClick={() => navigate(`/admin/gym-physio/${r.id}/earnings`)} className="text-blue-600 hover:underline text-sm font-medium">{r.name}</button></td>
                  <td className="px-6 py-4 text-sm text-gray-600 capitalize">{r.type}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{r.completedAppointments}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">₦{r.totalEarnings.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-orange-600">₦{r.platformFees.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm font-medium text-green-600">₦{r.netEarnings.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>}
      </div>
    </div>
  );
};
export default AllGymEarnings;
