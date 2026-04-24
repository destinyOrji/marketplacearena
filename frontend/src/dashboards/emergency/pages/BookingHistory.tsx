import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import { toast } from 'react-toastify';

const BookingHistory: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/ambulance/bookings');
      setBookings(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  };

  const handleAction = async (id: string, action: 'accept' | 'complete' | 'cancel') => {
    try {
      await apiClient.put(`/ambulance/bookings/${id}/${action}`);
      toast.success(`Booking ${action}ed`);
      fetchBookings();
    } catch { toast.error(`Failed to ${action} booking`); }
  };

  const filtered = statusFilter === 'all' ? bookings : bookings.filter((b: any) => b.status === statusFilter);

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      active: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
          {bookings.length} total
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 flex gap-2 flex-wrap">
        {['all', 'pending', 'accepted', 'active', 'completed', 'cancelled'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${statusFilter === s ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-5xl mb-3">🚑</p>
          <p className="text-gray-600">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b: any, i: number) => (
            <div key={b._id || i} className={`bg-white rounded-xl shadow-sm border-l-4 p-5 ${b.status === 'pending' ? 'border-yellow-400' : b.status === 'completed' ? 'border-green-400' : b.status === 'cancelled' ? 'border-red-400' : 'border-blue-400'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">🚨</span>
                    <h3 className="font-semibold text-gray-900">{b.emergencyType || 'Emergency'}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(b.status)}`}>
                      {b.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium text-gray-700">Patient: </span>
                      {b.patient?.name || b.patientName || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Contact: </span>
                      {b.contactNumber || b.patient?.phone || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Date: </span>
                      {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="md:col-span-3">
                      <span className="font-medium text-gray-700">Location: </span>
                      {b.pickupLocation?.address || b.location || 'N/A'}
                    </div>
                  </div>
                </div>
                <div className="ml-4 flex flex-col gap-2">
                  {b.status === 'pending' && (
                    <>
                      <button onClick={() => handleAction(b._id, 'accept')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
                        Accept
                      </button>
                      <button onClick={() => handleAction(b._id, 'cancel')}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium">
                        Decline
                      </button>
                    </>
                  )}
                  {(b.status === 'accepted' || b.status === 'active') && (
                    <button onClick={() => handleAction(b._id, 'complete')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                      Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingHistory;
