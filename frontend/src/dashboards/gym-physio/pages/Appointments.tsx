import React, { useEffect, useState } from 'react';
import { getAppointments, confirmAppointment, cancelAppointment, completeAppointment } from '../services/api';
import { toast } from 'react-toastify';

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await getAppointments();
      setAppointments(Array.isArray(data) ? data : []);
    } catch { toast.error('Failed to load appointments'); }
    finally { setLoading(false); }
  };

  const handleAction = async (id: string, action: 'confirm' | 'cancel' | 'complete') => {
    setActionLoading(id + action);
    try {
      if (action === 'confirm') await confirmAppointment(id);
      else if (action === 'cancel') await cancelAppointment(id);
      else await completeAppointment(id);
      toast.success(`Appointment ${action}ed`);
      fetchAppointments();
    } catch { toast.error(`Failed to ${action} appointment`); }
    finally { setActionLoading(null); }
  };

  const filtered = statusFilter === 'all' ? appointments : appointments.filter((a: any) => a.status === statusFilter);

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      completed: 'bg-green-100 text-green-800',
      confirmed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      scheduled: 'bg-indigo-100 text-indigo-800',
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
          {appointments.length} total
        </span>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex gap-2 flex-wrap">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${statusFilter === s ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-5xl mb-3">📅</p>
          <p className="text-gray-600">No appointments found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Client', 'Service', 'Date', 'Time', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((apt: any) => {
                const id = apt._id || apt.id;
                const clientName = apt.client?.user ? `${apt.client.user.firstName} ${apt.client.user.lastName}` : apt.client?.name || 'Client';
                const serviceName = apt.service?.title || apt.serviceName || 'Service';
                const date = apt.scheduledDate || apt.date;
                const time = apt.scheduledTime || apt.time || '';
                return (
                  <tr key={id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{clientName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{serviceName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{date ? new Date(date).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{time}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(apt.status)}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {apt.status === 'pending' && (
                          <button onClick={() => handleAction(id, 'confirm')} disabled={!!actionLoading}
                            className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50">
                            Confirm
                          </button>
                        )}
                        {apt.status === 'confirmed' && (
                          <button onClick={() => handleAction(id, 'complete')} disabled={!!actionLoading}
                            className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50">
                            Complete
                          </button>
                        )}
                        {['pending', 'confirmed'].includes(apt.status) && (
                          <button onClick={() => handleAction(id, 'cancel')} disabled={!!actionLoading}
                            className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200 disabled:opacity-50">
                            Cancel
                          </button>
                        )}
                      </div>
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

export default Appointments;
