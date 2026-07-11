import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';
const h = () => ({ headers: { Authorization: `Bearer ${authService.getAccessToken()}` } });

const statusColor: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800', confirmed: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800',
};

const AllGymAppointments: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { fetchAll(); }, [statusFilter]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const pRes = await axios.get(`${API}/admin/gym-physio?page_size=100`, h());
      const providers = pRes.data?.data || [];
      const all: any[] = [];
      await Promise.allSettled(providers.slice(0, 30).map(async (p: any) => {
        const params: any = {};
        if (statusFilter) params.status = statusFilter;
        const aRes = await axios.get(`${API}/admin/gym-physio/${p._id || p.id}/appointments`, { ...h(), params });
        (aRes.data?.data || []).forEach((a: any) => all.push({ ...a, providerName: p.businessName || '—', providerId: p._id || p.id }));
      }));
      all.sort((a, b) => new Date(b.date || b.scheduledDate || 0).getTime() - new Date(a.date || a.scheduledDate || 0).getTime());
      setAppointments(all);
    } catch { setAppointments([]); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Gym & Physio Appointments</h1>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex gap-4">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md text-sm">
          <option value="">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <span className="text-sm text-gray-500 self-center">{appointments.length} appointments</span>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? <div className="flex justify-center items-center h-48"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
          : appointments.length === 0 ? <div className="text-center py-16 text-gray-400">No appointments found</div>
          : <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50"><tr>{['Provider','Patient','Service','Date','Time','Payment','Status'].map(col => <th key={col} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{col}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {appointments.map((a: any, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4"><button onClick={() => navigate(`/admin/gym-physio/${a.providerId}/appointments`)} className="text-blue-600 hover:underline text-sm font-medium">{a.providerName}</button></td>
                  <td className="px-6 py-4 text-sm text-gray-700">{a.patient?.name || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{a.service?.title || a.appointmentType || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{(a.date || a.scheduledDate) ? new Date(a.date || a.scheduledDate).toLocaleDateString() : '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{a.time || a.scheduledTime || '—'}</td>
                  <td className="px-6 py-4 text-sm"><span className={`font-medium ${a.payment?.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>{a.payment?.status || 'pending'}</span></td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor[a.status] || 'bg-gray-100 text-gray-700'}`}>{a.status || '—'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>}
      </div>
    </div>
  );
};
export default AllGymAppointments;
