import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import axios from 'axios';

const API = process.env.REACT_APP_API_BASE_URL || 'https://healthmarketarena.com/api';
const h = () => ({ headers: { Authorization: `Bearer ${authService.getAccessToken()}` } });

const AllHospitalEarnings: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>({ hospitals: [], totalRevenue: 0, totalFees: 0, netRevenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/hospitals/all-earnings`, h());
      setData(res.data?.data || { hospitals: [], totalRevenue: 0, totalFees: 0, netRevenue: 0 });
    } catch {
      // fallback: fan-out
      try {
        const pRes = await axios.get(`${API}/admin/hospitals?page_size=100`, h());
        const hospitals = pRes.data?.data || [];
        const rows: any[] = [];
        await Promise.allSettled(hospitals.slice(0, 30).map(async (h_: any) => {
          const eRes = await axios.get(`${API}/admin/hospitals/${h_.id}/earnings`, h());
          const d = eRes.data?.data || {};
          rows.push({
            id: h_.id,
            name: h_.hospitalName || '—',
            type: h_.hospitalType || '—',
            totalRevenue: d.totalSubscriptionRevenue || 0,
            platformFees: d.platformFees || 0,
            netRevenue: d.netRevenue || 0,
            totalVacancies: d.totalVacancies || 0,
            totalApplications: d.totalApplications || 0,
          });
        }));
        rows.sort((a, b) => b.totalRevenue - a.totalRevenue);
        const totalRevenue = rows.reduce((s, r) => s + r.totalRevenue, 0);
        const totalFees = rows.reduce((s, r) => s + r.platformFees, 0);
        setData({ hospitals: rows, totalRevenue, totalFees, netRevenue: totalRevenue - totalFees });
      } catch { setData({ hospitals: [], totalRevenue: 0, totalFees: 0, netRevenue: 0 }); }
    } finally {
      setLoading(false);
    }
  };

  const rows: any[] = data.hospitals || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Hospital Earnings</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          ['Total Revenue', `₦${(data.totalRevenue || 0).toLocaleString()}`, 'bg-blue-600'],
          ['Net to Hospitals', `₦${(data.netRevenue || 0).toLocaleString()}`, 'bg-green-600'],
          ['Platform Fees (10%)', `₦${(data.totalFees || 0).toLocaleString()}`, 'bg-orange-600'],
        ].map(([label, value, color]) => (
          <div key={label} className={`${color} text-white rounded-xl p-5`}>
            <p className="text-sm opacity-80">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">🏥</p>
            <p>No earnings data available</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Hospital', 'Type', 'Vacancies', 'Applications', 'Revenue', 'Platform Fee', 'Net'].map(col => (
                  <th key={col} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((r: any, i: number) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <button
                      onClick={() => navigate(`/admin/hospitals/${r.id}`)}
                      className="text-blue-600 hover:underline text-sm font-medium"
                    >
                      {r.name}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 capitalize">{r.type || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{r.totalVacancies || 0}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{r.totalApplications || 0}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">₦{(r.totalRevenue || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-orange-600">₦{(r.platformFees || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm font-medium text-green-600">₦{(r.netRevenue || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-200">
              <tr>
                <td className="px-6 py-3 text-sm font-bold text-gray-900" colSpan={4}>Totals</td>
                <td className="px-6 py-3 text-sm font-bold text-gray-900">₦{(data.totalRevenue || 0).toLocaleString()}</td>
                <td className="px-6 py-3 text-sm font-bold text-orange-600">₦{(data.totalFees || 0).toLocaleString()}</td>
                <td className="px-6 py-3 text-sm font-bold text-green-600">₦{(data.netRevenue || 0).toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
};

export default AllHospitalEarnings;
