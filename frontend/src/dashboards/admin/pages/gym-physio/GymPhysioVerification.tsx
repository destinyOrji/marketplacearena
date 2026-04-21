import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GymPhysioVerification: React.FC = () => {
  const navigate = useNavigate();
  const [pendingProviders, setPendingProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingProviders();
  }, []);

  const fetchPendingProviders = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await adminApi.getPendingGymPhysioVerifications();
      // setPendingProviders(response.data);
      setPendingProviders([]);
    } catch (error) {
      console.error('Failed to fetch pending verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string) => {
    try {
      // await adminApi.verifyGymPhysio(id);
      fetchPendingProviders();
    } catch (error) {
      console.error('Failed to verify:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      // await adminApi.rejectGymPhysio(id, reason);
      fetchPendingProviders();
    } catch (error) {
      console.error('Failed to reject:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Pending Verifications</h1>
        <button
          onClick={() => navigate('/admin/gym-physio')}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Back to All Providers
        </button>
      </div>

      {pendingProviders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-gray-600">No pending verifications</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {pendingProviders.map((provider) => (
            <div key={provider.id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{provider.businessName}</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Business Type</p>
                      <p className="font-medium capitalize">{provider.businessType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Specialization</p>
                      <p className="font-medium">{provider.specialization}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium">{provider.city}, {provider.state}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{provider.phone}</p>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3 ml-6">
                  <button
                    onClick={() => navigate(`/admin/gym-physio/${provider.id}`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleVerify(provider.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Verify
                  </button>
                  <button
                    onClick={() => handleReject(provider.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Reject
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

export default GymPhysioVerification;
