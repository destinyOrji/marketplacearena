import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import axios from 'axios';

const API = process.env.REACT_APP_API_BASE_URL || 'https://healthmarketarena.com/api';
const h = () => ({ headers: { Authorization: `Bearer ${authService.getAccessToken()}` } });

const AllEmergencyBookings: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      // Use the ambulance bookings endpoint which has all emergency bookings
      const res = await axios.get(`${API}/admin/ambulances/bookings?page_size=100`, h());
      setBookings(res.data?.data || []);
    } catch { setBookings([]); }
    finally { setLoading(false); }
  };

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800', accepted: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">All Emergency Bookings</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? <div className="flex justify-center items-center h-48"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
          : bookings.length === 0 ? <div className="text-center py-16"><p className="text-5xl mb-3">🚑</p><p className="text-gray-400">No emergency bookings yet</p></div>
          : <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50"><tr>{['Patient','Provider','Emergency Type','Date','Status'].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {bookings.map((b: any, i) => {
                const patientName = b.client?.user ? `${b.client.user.firstName} ${b.client.user.lastName}`.trim() : '—';
                return (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{patientName}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{b.provider?.serviceName || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{b.emergencyType || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{b.createdAt ? new Date(b.createdAt).toLocaleDateString() : '—'}</td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor[b.status] || 'bg-gray-100 text-gray-700'}`}>{b.status || '—'}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>}
      </div>
    </div>
  );
};
export default AllEmergencyBookings;
