/**
 * Emergency Bookings View
 */
import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';

const statusColor: Record<string, string> = {
  pending:     'bg-yellow-100 text-yellow-800',
  accepted:    'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed:   'bg-green-100 text-green-800',
  cancelled:   'bg-red-100 text-red-800',
};

const EmergencyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [total, setTotal] = useState(0);

  const h = () => ({ headers: { Authorization: `Bearer ${authService.getAccessToken()}` } });

  useEffect(() => { fetchBookings(); }, [statusFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params: any = { page: 1, page_size: 50 };
      if (statusFilter) params.status = statusFilter;
      const res = await axios.get(`${API_BASE_URL}/admin/ambulances/bookings`, { ...h(), params });
      const data = res.data?.data || [];
      setBookings(Array.isArray(data) ? data : []);
      setTotal(res.data?.pagination?.total || data.length);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Normalize a booking — backend returns MongoDB doc with populated client/provider
  const normalize = (b: any) => ({
    id: b._id || b.id,
    bookingNumber: b.bookingNumber || b._id?.slice(-6).toUpperCase() || '—',
    patientName: b.client?.user
      ? `${b.client.user.firstName} ${b.client.user.lastName}`.trim()
      : b.patientName || '—',
    patientPhone: b.contactNumber || b.client?.phone || '—',
    providerName: b.provider?.serviceName || b.providerName || '—',
    emergencyType: b.emergencyType || '—',
    pickupAddress: b.pickupLocation?.address || '—',
    status: b.status || 'pending',
    createdAt: b.createdAt || b.booking_date,
  });

  const rows = bookings.map(normalize);
  const filtered = statusFilter ? rows.filter(r => r.status === statusFilter) : rows;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Emergency Bookings</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total bookings</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Status:</label>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button onClick={fetchBookings} className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">🚑</p>
            <p className="text-gray-500 font-medium">No emergency bookings found</p>
            <p className="text-gray-400 text-sm mt-1">
              {statusFilter ? `No ${statusFilter} bookings` : 'Emergency bookings will appear here when patients request ambulances'}
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Booking #', 'Patient', 'Provider', 'Emergency Type', 'Pickup', 'Date', 'Status'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(b => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono text-gray-700">{b.bookingNumber}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{b.patientName}</p>
                    <p className="text-xs text-gray-400">{b.patientPhone}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{b.providerName}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{b.emergencyType}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-[160px] truncate" title={b.pickupAddress}>{b.pickupAddress}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor[b.status] || 'bg-gray-100 text-gray-700'}`}>
                      {b.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default EmergencyBookings;
