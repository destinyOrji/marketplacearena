import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface GymPhysio {
  id: string;
  businessName: string;
  businessType: string;
  specialization: string;
  phone: string;
  city: string;
  state: string;
  isVerified: boolean;
  averageRating: number;
  totalBookings: number;
  createdAt: string;
}

const AllGymPhysio: React.FC = () => {
  const navigate = useNavigate();
  const [gymPhysios, setGymPhysios] = useState<GymPhysio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [businessTypeFilter, setBusinessTypeFilter] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('');

  useEffect(() => {
    fetchGymPhysios();
  }, [searchQuery, businessTypeFilter, verificationFilter]);

  const fetchGymPhysios = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await adminApi.getGymPhysios({ search: searchQuery, businessType: businessTypeFilter, verified: verificationFilter });
      // setGymPhysios(response.data);
      setGymPhysios([]);
    } catch (error) {
      console.error('Failed to fetch gym/physio providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (id: string) => {
    navigate(`/admin/gym-physio/${id}`);
  };

  const handleVerify = async (id: string) => {
    try {
      // await adminApi.verifyGymPhysio(id);
      fetchGymPhysios();
    } catch (error) {
      console.error('Failed to verify:', error);
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
        <h1 className="text-3xl font-bold text-gray-900">Gym & Physiotherapy Providers</h1>
        <button
          onClick={() => navigate('/admin/gym-physio/verification')}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
        >
          Pending Verifications
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search by name, phone, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          />
          <select
            value={businessTypeFilter}
            onChange={(e) => setBusinessTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Business Types</option>
            <option value="gym">Gym</option>
            <option value="physiotherapy">Physiotherapy</option>
            <option value="both">Both</option>
          </select>
          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Statuses</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {gymPhysios.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-gray-600">No gym/physio providers found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {gymPhysios.map((provider) => (
                <tr key={provider.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{provider.businessName}</div>
                    <div className="text-sm text-gray-500">{provider.specialization}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap capitalize">{provider.businessType}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{provider.city}, {provider.state}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="ml-1">{provider.averageRating.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      provider.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {provider.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleView(provider.id)}
                      className="text-blue-600 hover:text-blue-700 mr-3"
                    >
                      View
                    </button>
                    {!provider.isVerified && (
                      <button
                        onClick={() => handleVerify(provider.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        Verify
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllGymPhysio;
