import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiEye } from 'react-icons/fi';
import { authService } from '../../services/authService';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://healthmarketarena.com/api';

const GymPhysioVerification: React.FC = () => {
  const navigate = useNavigate();
  const [pendingProviders, setPendingProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${authService.getAccessToken()}` },
  });

  useEffect(() => {
    fetchPendingProviders();
  }, []);

  const fetchPendingProviders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/admin/gym-physio/verification/pending`, getHeaders());
      setPendingProviders(res.data?.data || []);
    } catch {
      setPendingProviders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string) => {
    setActionLoading(id + 'v');
    try {
      await axios.post(`${API_BASE_URL}/admin/gym-physio/${id}/verify`, {}, getHeaders());
      setPendingProviders(prev => prev.filter(p => (p._id || p.id) !== id));
    } catch {
      alert('Failed to verify provider.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt('Reason for rejection:');
    if (!reason) return;
    setActionLoading(id + 'r');
    try {
      await axios.post(`${API_BASE_URL}/admin/gym-physio/${id}/reject`, { reason }, getHeaders());
      setPendingProviders(prev => prev.filter(p => (p._id || p.id) !== id));
    } catch {
      alert('Failed to reject provider.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gym/Physio Verification</h1>
          <p className="text-sm text-gray-500 mt-1">Review and verify pending gym & physiotherapy providers</p>
        </div>
        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
          {pendingProviders.length} pending
        </span>
      </div>

      {pendingProviders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <FiCheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">All caught up!</p>
          <p className="text-gray-400 text-sm mt-1">No pending verifications at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingProviders.map((provider: any) => {
            const id = provider._id || provider.id;
            const user = provider.user || {};
            const name = provider.businessName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown';

            return (
              <div key={id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{user.email || '—'}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-sm">
                      <div>
                        <p className="text-gray-500">Type</p>
                        <p className="font-medium capitalize">{provider.businessType || '—'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Specialization</p>
                        <p className="font-medium">{provider.specialization || '—'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Location</p>
                        <p className="font-medium">{[provider.city, provider.state].filter(Boolean).join(', ') || '—'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Phone</p>
                        <p className="font-medium">{provider.phone || '—'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => navigate(`/admin/gym-physio/${id}`)}
                      className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                    >
                      <FiEye className="h-4 w-4" /> View
                    </button>
                    <button
                      onClick={() => handleVerify(id)}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      <FiCheckCircle className="h-4 w-4" />
                      {actionLoading === id + 'v' ? '...' : 'Verify'}
                    </button>
                    <button
                      onClick={() => handleReject(id)}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      <FiXCircle className="h-4 w-4" />
                      {actionLoading === id + 'r' ? '...' : 'Reject'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GymPhysioVerification;
