import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import axios from 'axios';

const API = process.env.REACT_APP_API_BASE_URL || 'https://healthmarketarena.com/api';
const h = () => ({ headers: { Authorization: `Bearer ${authService.getAccessToken()}` } });

const AllFleet: React.FC = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const pRes = await axios.get(`${API}/admin/ambulances?page_size=100`, h());
      const providers = pRes.data?.data || [];
      const all: any[] = [];
      await Promise.allSettled(providers.slice(0, 30).map(async (p: any) => {
        const vRes = await axios.get(`${API}/admin/ambulances/${p.id}/vehicles`, h());
        (vRes.data?.data || []).forEach((v: any) => all.push({
          ...v,
          providerName: p.serviceName || '—',
          providerId: p.id,
        }));
      }));
      setVehicles(all);
    } catch { setVehicles([]); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Fleet Management</h1>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">{vehicles.length} vehicles</span>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? <div className="flex justify-center items-center h-48"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
          : vehicles.length === 0 ? <div className="text-center py-16"><p className="text-5xl mb-3">🚑</p><p className="text-gray-400">No vehicles registered yet</p></div>
          : <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50"><tr>{['Provider','Vehicle #','Type','Model','Year','Available','Status'].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {vehicles.map((v: any, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4"><button onClick={() => navigate(`/admin/ambulances/${v.providerId}/fleet`)} className="text-blue-600 hover:underline text-sm font-medium">{v.providerName}</button></td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-700">{v.vehicleNumber || v.vehicle_number || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{v.vehicleType || v.vehicle_type || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{v.model || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{v.year || '—'}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${(v.isAvailable || v.is_available) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{(v.isAvailable || v.is_available) ? 'Yes' : 'No'}</span></td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${v.status === 'active' ? 'bg-green-100 text-green-800' : v.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>{v.status || 'active'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>}
      </div>
    </div>
  );
};
export default AllFleet;
