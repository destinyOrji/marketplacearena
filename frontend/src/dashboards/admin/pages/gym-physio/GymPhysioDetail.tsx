import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';

const GymPhysioDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${authService.getAccessToken()}` },
  });

  useEffect(() => {
    if (id) fetchProvider();
  }, [id]);

  const fetchProvider = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API_BASE_URL}/admin/gym-physio/${id}`, getHeaders());
      setProvider(res.data?.data || null);
    } catch (err: any) {
      setError('Failed to load provider details.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!window.confirm('Verify this gym/physio provider?')) return;
    setActionLoading('verify');
    try {
      await axios.post(`${API_BASE_URL}/admin/gym-physio/${id}/verify`, {}, getHeaders());
      setProvider((prev: any) => ({ ...prev, isVerified: true }));
    } catch {
      alert('Failed to verify provider.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    const reason = window.prompt('Reason for rejection:');
    if (!reason) return;
    setActionLoading('reject');
    try {
      await axios.post(`${API_BASE_URL}/admin/gym-physio/${id}/reject`, { reason }, getHeaders());
      setProvider((prev: any) => ({ ...prev, isVerified: false }));
    } catch {
      alert('Failed to reject provider.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this provider? This cannot be undone.')) return;
    setActionLoading('delete');
    try {
      await axios.delete(`${API_BASE_URL}/admin/gym-physio/${id}/delete`, getHeaders());
      navigate('/admin/gym-physio');
    } catch {
      alert('Failed to delete provider.');
      setActionLoading(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );

  if (error || !provider) return (
    <div className="text-center py-12">
      <p className="text-red-500 mb-4">{error || 'Provider not found'}</p>
      <button onClick={() => navigate('/admin/gym-physio')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        Back to List
      </button>
    </div>
  );

  const user = provider.user || {};
  const name = provider.businessName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate('/admin/gym-physio')} className="text-sm text-blue-600 hover:underline mb-1 flex items-center gap-1">
            ← Back to Gym/Physio
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${provider.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {provider.isVerified ? 'Verified' : 'Pending Verification'}
          </span>
        </div>
        <div className="flex gap-2">
          {!provider.isVerified && (
            <button onClick={handleVerify} disabled={!!actionLoading} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm">
              {actionLoading === 'verify' ? 'Verifying...' : 'Verify'}
            </button>
          )}
          {provider.isVerified && (
            <button onClick={handleReject} disabled={!!actionLoading} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 text-sm">
              {actionLoading === 'reject' ? 'Rejecting...' : 'Revoke'}
            </button>
          )}
          {!provider.isVerified && (
            <button onClick={handleReject} disabled={!!actionLoading} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm">
              Reject
            </button>
          )}
          <button onClick={handleDelete} disabled={!!actionLoading} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 text-sm">
            {actionLoading === 'delete' ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ['Business Name', provider.businessName || '—'],
                ['Business Type', provider.businessType || '—'],
                ['Specialization', provider.specialization || '—'],
                ['Years in Business', provider.yearsInBusiness ?? '—'],
                ['License Number', provider.licenseNumber || '—'],
                ['Member Since', provider.createdAt ? new Date(provider.createdAt).toLocaleDateString() : '—'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-gray-500">{label}</p>
                  <p className="font-medium text-gray-900 capitalize">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ['Phone', provider.phone || user.phone || '—'],
                ['Email', user.email || '—'],
                ['City', provider.city || '—'],
                ['State', provider.state || '—'],
                ['Country', provider.country || '—'],
                ['Address', provider.address || '—'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-gray-500">{label}</p>
                  <p className="font-medium text-gray-900">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {provider.bio && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">About</h2>
              <p className="text-sm text-gray-700">{provider.bio}</p>
            </div>
          )}
        </div>

        {/* Stats sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => navigate(`/admin/gym-physio/${id}/services`)}
                className="w-full text-left px-4 py-3 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 font-medium text-sm transition-colors"
              >
                🏋️ View Services
              </button>
              <button
                onClick={() => navigate(`/admin/gym-physio/${id}/appointments`)}
                className="w-full text-left px-4 py-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-sm transition-colors"
              >
                📅 View Appointments
              </button>
              <button
                onClick={() => navigate(`/admin/gym-physio/${id}/earnings`)}
                className="w-full text-left px-4 py-3 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 font-medium text-sm transition-colors"
              >
                💰 View Earnings
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>
            <div className="space-y-4">
              {[
                ['Total Bookings', provider.totalBookings ?? 0],
                ['Completed Bookings', provider.completedBookings ?? 0],
                ['Average Rating', `${provider.averageRating ?? 0} / 5`],
                ['Total Reviews', provider.totalReviews ?? 0],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="text-lg font-bold text-gray-900">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`font-medium ${user.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                  {user.status || 'active'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Available</span>
                <span className={`font-medium ${provider.isAvailable ? 'text-green-600' : 'text-gray-500'}`}>
                  {provider.isAvailable ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Verified</span>
                <span className={`font-medium ${provider.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                  {provider.isVerified ? 'Yes' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymPhysioDetail;
