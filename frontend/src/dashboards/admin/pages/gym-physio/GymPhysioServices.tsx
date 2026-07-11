import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { authService } from '../../services/authService';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';

const GymPhysioServices: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [providerName, setProviderName] = useState('');

  const h = () => ({ headers: { Authorization: `Bearer ${authService.getAccessToken()}` } });

  useEffect(() => { if (id) fetchData(); }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [provRes, svcRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/admin/gym-physio/${id}`, h()),
        axios.get(`${API_BASE_URL}/admin/gym-physio/${id}/services`, h()),
      ]);
      const p = provRes.data?.data || {};
      setProviderName(p.businessName || `${p.user?.firstName || ''} ${p.user?.lastName || ''}`.trim() || 'Provider');
      setServices(svcRes.data?.data || []);
    } catch {
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (serviceId: string, currentStatus: string) => {
    setActionLoading(serviceId);
    try {
      const isActive = currentStatus !== 'active';
      await axios.patch(`${API_BASE_URL}/admin/gym-physio/${id}/services/${serviceId}`, { is_active: isActive }, h());
      setServices(prev => prev.map(s =>
        (s._id || s.id) === serviceId ? { ...s, status: isActive ? 'active' : 'inactive' } : s
      ));
    } catch {
      alert('Failed to update service status.');
    } finally {
      setActionLoading(null);
    }
  };

  const categoryColor: Record<string, string> = {
    fitness: 'bg-orange-100 text-orange-700',
    physiotherapy: 'bg-blue-100 text-blue-700',
    yoga: 'bg-purple-100 text-purple-700',
    massage: 'bg-pink-100 text-pink-700',
    nutrition: 'bg-green-100 text-green-700',
    therapy: 'bg-teal-100 text-teal-700',
    other: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate(`/admin/gym-physio/${id}`)} className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-1">
            <FiChevronLeft className="h-4 w-4" /> Back to {providerName}
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-sm text-gray-500 mt-0.5">{providerName}</p>
        </div>
        <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
          {services.length} services
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600" />
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-5xl mb-3">🏋️</p>
          <p className="text-gray-500">No services found for this provider.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Service', 'Category', 'Price', 'Duration', 'Bookings', 'Rating', 'Status', 'Action'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {services.map((svc: any) => {
                const sid = svc._id || svc.id;
                const cat = svc.category || 'other';
                const isActive = svc.status === 'active';
                return (
                  <tr key={sid} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{svc.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{svc.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${categoryColor[cat] || categoryColor.other}`}>
                        {cat}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">₦{(svc.price || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{svc.duration || '—'} min</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{svc.bookingCount ?? 0}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">⭐ {(svc.rating || 0).toFixed(1)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggle(sid, svc.status)}
                        disabled={actionLoading === sid}
                        className={`flex items-center gap-1 text-sm font-medium ${isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'} disabled:opacity-50`}
                      >
                        {isActive ? <FiXCircle className="h-5 w-5" /> : <FiCheckCircle className="h-5 w-5" />}
                        {actionLoading === sid ? '...' : isActive ? 'Deactivate' : 'Activate'}
                      </button>
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

export default GymPhysioServices;
