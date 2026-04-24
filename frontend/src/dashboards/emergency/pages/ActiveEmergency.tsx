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
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Active Emergency</h1>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-gray-600">Live</span>
        </div>
      </div>

      {active.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-5xl mb-3">✅</p>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Emergencies</h3>
          <p className="text-gray-500 text-sm">You're all clear. New emergencies will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {active.map((b: any) => (
            <div key={b._id || b.id} className="bg-white rounded-xl shadow-sm border-l-4 border-red-500 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🚨</span>
                    <h3 className="text-lg font-bold text-gray-900">{b.emergencyType || 'Emergency'}</h3>
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium animate-pulse">
                      {b.status?.toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                    <div>
                      <p className="font-medium text-gray-700">Patient</p>
                      <p>{b.patient?.name || b.patientName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Contact</p>
                      <p>{b.contactNumber || b.patient?.phone || 'N/A'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="font-medium text-gray-700">Pickup Location</p>
                      <p>{b.pickupLocation?.address || b.location || 'N/A'}</p>
                    </div>
                    {b.patientCondition && (
                      <div className="md:col-span-2">
                        <p className="font-medium text-gray-700">Condition</p>
                        <p>{b.patientCondition}</p>
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={() => handleComplete(b._id || b.id)}
                  className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
                  Mark Complete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveEmergency;
