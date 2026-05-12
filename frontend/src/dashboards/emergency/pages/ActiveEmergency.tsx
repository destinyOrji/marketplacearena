import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import { toast } from 'react-toastify';

const ActiveEmergency: React.FC = () => {
  const [active, setActive] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActive();
    const interval = setInterval(fetchActive, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchActive = async () => {
    try {
      const res = await apiClient.get('/ambulance/bookings?status=active');
      const data = res.data?.data || [];
      setActive(Array.isArray(data) ? data.filter((b: any) => b.status === 'active' || b.status === 'pending') : []);
    } catch { }
    finally { setLoading(false); }
  };

  const handleComplete = async (id: string) => {
    try {
      await apiClient.put(`/ambulance/bookings/${id}/complete`);
      toast.success('Emergency marked as completed');
      fetchActive();
    } catch { toast.error('Failed to update status'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow-sm">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Active Emergencies</h1>
          <p className="text-gray-600 mt-1">Monitor and manage ongoing emergency requests</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-green-700">Live Updates</span>
        </div>
      </div>

      {active.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-green-100 rounded-full">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Emergencies</h3>
          <p className="text-gray-500 text-sm">You're all clear. New emergency requests will appear here in real-time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {active.map((b: any) => (
            <div key={b._id || b.id} className="bg-white rounded-xl shadow-sm border-l-4 border-red-500 p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{b.emergencyType || 'Emergency Request'}</h3>
                      <span className="inline-flex items-center px-2.5 py-1 bg-red-100 text-red-800 text-xs rounded-full font-semibold uppercase mt-1 animate-pulse">
                        {b.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Patient Name</p>
                      <p className="text-sm font-medium text-gray-900">{b.patient?.name || b.patientName || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Contact Number</p>
                      <p className="text-sm font-medium text-gray-900">{b.contactNumber || b.patient?.phone || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 md:col-span-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Pickup Location</p>
                      <p className="text-sm font-medium text-gray-900">{b.pickupLocation?.address || b.location || 'N/A'}</p>
                    </div>
                    {b.patientCondition && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 md:col-span-2">
                        <p className="text-xs font-semibold text-yellow-700 uppercase mb-1">Patient Condition</p>
                        <p className="text-sm font-medium text-gray-900">{b.patientCondition}</p>
                      </div>
                    )}
                    {b.notes && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:col-span-2">
                        <p className="text-xs font-semibold text-blue-700 uppercase mb-1">Additional Notes</p>
                        <p className="text-sm font-medium text-gray-900">{b.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex lg:flex-col gap-2">
                  <button onClick={() => handleComplete(b._id || b.id)}
                    className="flex-1 lg:flex-none px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Complete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveEmergency;
