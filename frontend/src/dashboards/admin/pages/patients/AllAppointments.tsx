import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import axios from 'axios';

const API = process.env.REACT_APP_API_BASE_URL || 'https://healthmarketarena.com/api';
const h = () => ({ headers: { Authorization: `Bearer ${authService.getAccessToken()}` } });

const statusColor: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800', confirmed: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800',
};

const AllAppointments: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { fetch(); }, [statusFilter]);

  const fetch = async () => {
    setLoading(true);
    try {
      const params: any = { page: 1, page_size: 100 };
      if (statusFilter) params.status = statusFilter;
      // Get all patients then their appointments
      const pRes = await axios.get(`${API}/admin/patients?page_size=200`, h());
      const patients = pRes.data?.data || [];
      const all: any[] = [];
      await Promise.allSettled(patients.slice(0, 30).map(async (p: any) => {
        const aRes = await axios.get(`${API}/admin/patients/${p.id}/appointments`, h());
        (aRes.data?.data || []).forEach((a: any) => all.push({ ...a, patientName: `${p.firstName || ''} ${p.lastName || ''}`.trim(), patientId: p.id }));
      }));
      all.sort((a, b) => new Date(b.scheduledDate || b.date || 0).getTime() - new Date(a.scheduledDate || a.date || 0).getTime());
      setAppointments(statusFilter ? all.filter(a => a.status === statusFilter) : all);
    } catch { setAppointments([]); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">All Patient Appointments</h1>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex gap-4">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md text-sm">
          <option value="">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? <div className="flex justify-center items-center h-48"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
          : appointments.length === 0 ? <div className="text-center py-16 text-gray-400">No appointments found</div>
          : <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50"><tr>{['Patient','Date','Time','Type','Status','Action'].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {appointments.map((a: any, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4"><button onClick={() => navigate(`/admin/patients/${a.patientId}`)} className="text-blue-600 hover:underline text-sm font-medium">{a.patientName || '—'}</button></td>
                  <td className="px-6 py-4 text-sm text-gray-700">{a.scheduledDate || a.date ? new Date(a.scheduledDate || a.date).toLocaleDateString() : '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{a.scheduledTime || a.time || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 capitalize">{(a.appointmentMode || a.type || '').replace(/_/g, ' ') || '—'}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor[a.status] || 'bg-gray-100 text-gray-700'}`}>{a.status || '—'}</span></td>
                  <td className="px-6 py-4"><button onClick={() => navigate(`/admin/patients/${a.patientId}`)} className="text-blue-600 hover:underline text-xs">View Patient</button></td>
                </tr>
              ))}
            </tbody>
          </table>}
      </div>
    </div>
  );
};
export default AllAppointments;
