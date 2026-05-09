import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { authService } from '../../services/authService';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://healthmarketarena.com/api';

const statusColor: Record<string, string> = {
  scheduled:  'bg-blue-100 text-blue-800',
  confirmed:  'bg-indigo-100 text-indigo-800',
  completed:  'bg-green-100 text-green-800',
  cancelled:  'bg-red-100 text-red-800',
  no_show:    'bg-orange-100 text-orange-800',
  in_progress:'bg-purple-100 text-purple-800',
};

const GymPhysioAppointments: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [providerName, setProviderName] = useState('');

  const h = () => ({ headers: { Authorization: `Bearer ${authService.getAccessToken()}` } });

  useEffect(() => { if (id) fetchData(); }, [id, statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [provRes, apptRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/admin/gym-physio/${id}`, h()),
        axios.get(`${API_BASE_URL}/admin/gym-physio/${id}/appointments`, {
          ...h(),
          params: statusFilter ? { status: statusFilter } : {},
        }),
      ]);
      const p = provRes.data?.data || {};
      setProviderName(p.businessName || `${p.user?.firstName || ''} ${p.user?.lastName || ''}`.trim() || 'Provider');
      setAppointments(apptRes.data?.data || []);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = statusFilter
    ? appointments.filter(a => a.status === statusFilter)
    : appointments;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate(`/admin/gym-physio/${id}`)} className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-1">
            <FiChevronLeft className="h-4 w-4" /> Back to {providerName}
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-sm text-gray-500 mt-0.5">{providerName}</p>
        </div>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          {filtered.length} appointments
        </span>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Status:</label>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All</option>
          <option value="scheduled">Scheduled</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no_show">No Show</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-5xl mb-3">📅</p>
          <p className="text-gray-500">No appointments found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Patient', 'Service', 'Date', 'Time', 'Type', 'Payment', 'Status'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((apt: any, i: number) => {
                const patient = apt.patient || apt.client || {};
                const svc = apt.service || {};
                const sc = statusColor[apt.status] || 'bg-gray-100 text-gray-700';
                const payColor = apt.payment?.status === 'paid' ? 'text-green-600' : 'text-yellow-600';
                return (
                  <tr key={apt._id || apt.id || i} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{patient.name || 'Patient'}</p>
                      <p className="text-xs text-gray-400">{patient.email || ''}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{svc.title || apt.appointmentType || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {apt.date || apt.scheduledDate ? new Date(apt.date || apt.scheduledDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{apt.time || apt.scheduledTime || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                      {(apt.type || apt.appointmentMode || '').replace(/_/g, ' ') || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${payColor}`}>
                        {apt.payment?.status || apt.paymentStatus || 'pending'}
                      </span>
                      {apt.payment?.amount > 0 && (
                        <p className="text-xs text-gray-400">₦{apt.payment.amount.toLocaleString()}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${sc}`}>
                        {(apt.status || '').replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GymPhysioAppointments;
