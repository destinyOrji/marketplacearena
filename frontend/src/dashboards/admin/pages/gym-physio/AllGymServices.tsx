import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import axios from 'axios';

const API = process.env.REACT_APP_API_BASE_URL || 'https://healthmarketarena.com/api';
const h = () => ({ headers: { Authorization: `Bearer ${authService.getAccessToken()}` } });

const AllGymServices: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const pRes = await axios.get(`${API}/admin/gym-physio?page_size=100`, h());
      const providers = pRes.data?.data || [];
      const all: any[] = [];
      await Promise.allSettled(providers.slice(0, 30).map(async (p: any) => {
        const sRes = await axios.get(`${API}/admin/gym-physio/${p._id || p.id}/services`, h());
        (sRes.data?.data || []).forEach((s: any) => all.push({ ...s, providerName: p.businessName || '—', providerId: p._id || p.id }));
      }));
      setServices(all);
    } catch { setServices([]); }
    finally { setLoading(false); }
  };

  const statusColor: Record<string, string> = { active: 'bg-green-100 text-green-800', inactive: 'bg-gray-100 text-gray-600', pending: 'bg-yellow-100 text-yellow-800' };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Gym & Physio Services</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? <div className="flex justify-center items-center h-48"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
          : services.length === 0 ? <div className="text-center py-16 text-gray-400">No services found</div>
          : <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50"><tr>{['Provider','Service','Category','Price','Duration','Bookings','Status'].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {services.map((s: any, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4"><button onClick={() => navigate(`/admin/gym-physio/${s.providerId}/services`)} className="text-blue-600 hover:underline text-sm font-medium">{s.providerName}</button></td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.title || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 capitalize">{s.category || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">₦{(s.price || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{s.duration || '—'} min</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{s.bookingCount || 0}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor[s.status] || 'bg-gray-100 text-gray-600'}`}>{s.status || '—'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>}
      </div>
    </div>
  );
};
export default AllGymServices;
