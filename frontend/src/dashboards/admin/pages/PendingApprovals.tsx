/**
 * Pending Approvals — unified view of all providers awaiting admin approval
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiEye, FiUser, FiActivity, FiTruck } from 'react-icons/fi';
import { authService } from '../services/authService';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://healthmarketarena.com/api';

type ProviderType = 'professional' | 'hospital' | 'ambulance' | 'gym-physio';

interface PendingItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  type: ProviderType;
  subType?: string;       // professionalType / hospitalType / businessType
  location?: string;
  registeredAt: string;
}

const typeConfig: Record<ProviderType, { label: string; color: string; icon: React.ReactNode; detailPath: string }> = {
  professional: { label: 'Professional', color: 'bg-blue-100 text-blue-800', icon: <FiUser className="h-4 w-4" />, detailPath: '/admin/professionals' },
  hospital:     { label: 'Hospital',     color: 'bg-purple-100 text-purple-800', icon: <FiActivity className="h-4 w-4" />, detailPath: '/admin/hospitals' },
  ambulance:    { label: 'Ambulance',    color: 'bg-red-100 text-red-800', icon: <FiTruck className="h-4 w-4" />, detailPath: '/admin/ambulances' },
  'gym-physio': { label: 'Gym/Physio',  color: 'bg-orange-100 text-orange-800', icon: <FiActivity className="h-4 w-4" />, detailPath: '/admin/gym-physio' },
};

const PendingApprovals: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<ProviderType | ''>('');

  const h = () => ({ headers: { Authorization: `Bearer ${authService.getAccessToken()}` } });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [profRes, hospRes, ambRes, gymRes] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/admin/professionals/verification/pending`, h()),
        axios.get(`${API_BASE_URL}/admin/hospitals/verification/pending`, h()),
        axios.get(`${API_BASE_URL}/admin/ambulances/verification/pending`, h()),
        axios.get(`${API_BASE_URL}/admin/gym-physio/verification/pending`, h()),
      ]);

      const all: PendingItem[] = [];

      if (profRes.status === 'fulfilled') {
        (profRes.value.data?.data || []).forEach((p: any) => {
          all.push({
            id: p.id || p._id,
            name: p.user ? `${p.user.firstName} ${p.user.lastName}`.trim() : 'Professional',
            email: p.user?.email || '',
            phone: p.phone || '',
            type: 'professional',
            subType: p.professionalType,
            location: [p.city, p.state].filter(Boolean).join(', '),
            registeredAt: p.createdAt,
          });
        });
      }

      if (hospRes.status === 'fulfilled') {
        (hospRes.value.data?.data || []).forEach((h: any) => {
          all.push({
            id: h.id || h._id,
            name: h.hospitalName || 'Hospital',
            email: h.email || h.user?.email || '',
            phone: h.phone || '',
            type: 'hospital',
            subType: h.hospitalType,
            location: h.address?.city || '',
            registeredAt: h.createdAt,
          });
        });
      }

      if (ambRes.status === 'fulfilled') {
        (ambRes.value.data?.data || []).forEach((a: any) => {
          all.push({
            id: a.id || a._id,
            name: a.serviceName || 'Ambulance Provider',
            email: a.email || a.user?.email || '',
            phone: a.phone || a.emergencyNumber || '',
            type: 'ambulance',
            subType: a.serviceType,
            location: a.baseAddress?.city || '',
            registeredAt: a.createdAt,
          });
        });
      }

      if (gymRes.status === 'fulfilled') {
        (gymRes.value.data?.data || []).forEach((g: any) => {
          all.push({
            id: g.id || g._id,
            name: g.businessName || 'Gym/Physio',
            email: g.user?.email || '',
            phone: g.phone || '',
            type: 'gym-physio',
            subType: g.businessType,
            location: [g.city, g.state].filter(Boolean).join(', '),
            registeredAt: g.createdAt,
          });
        });
      }

      // Sort newest first
      all.sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());
      setItems(all);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (item: PendingItem) => {
    setActionLoading(item.id + 'a');
    try {
      const endpointMap: Record<ProviderType, string> = {
        professional: `professionals/${item.id}/verify`,
        hospital:     `hospitals/${item.id}/verify`,
        ambulance:    `ambulances/${item.id}/verify`,
        'gym-physio': `gym-physio/${item.id}/verify`,
      };
      await axios.post(`${API_BASE_URL}/admin/${endpointMap[item.type]}`, {}, h());
      setItems(prev => prev.filter(i => i.id !== item.id));
    } catch { alert('Failed to approve. Please try again.'); }
    finally { setActionLoading(null); }
  };

  const handleReject = async (item: PendingItem) => {
    const reason = window.prompt(`Reason for rejecting "${item.name}":`);
    if (!reason) return;
    setActionLoading(item.id + 'r');
    try {
      const endpointMap: Record<ProviderType, string> = {
        professional: `professionals/${item.id}/reject`,
        hospital:     `hospitals/${item.id}/reject`,
        ambulance:    `ambulances/${item.id}/reject`,
        'gym-physio': `gym-physio/${item.id}/reject`,
      };
      await axios.post(`${API_BASE_URL}/admin/${endpointMap[item.type]}`, { reason }, h());
      setItems(prev => prev.filter(i => i.id !== item.id));
    } catch { alert('Failed to reject. Please try again.'); }
    finally { setActionLoading(null); }
  };

  const filtered = typeFilter ? items.filter(i => i.type === typeFilter) : items;

  const counts = items.reduce((acc, i) => {
    acc[i.type] = (acc[i.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Review and approve providers who have completed registration
          </p>
        </div>
        {items.length > 0 && (
          <span className="bg-yellow-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold">
            {items.length} pending
          </span>
        )}
      </div>

      {/* Type filter tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: '', label: 'All', count: items.length },
          { value: 'professional', label: 'Professionals', count: counts.professional || 0 },
          { value: 'hospital', label: 'Hospitals', count: counts.hospital || 0 },
          { value: 'ambulance', label: 'Ambulances', count: counts.ambulance || 0 },
          { value: 'gym-physio', label: 'Gym/Physio', count: counts['gym-physio'] || 0 },
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => setTypeFilter(tab.value as ProviderType | '')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
              typeFilter === tab.value
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${typeFilter === tab.value ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <FiCheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium text-lg">All caught up!</p>
          <p className="text-gray-400 text-sm mt-1">No pending approvals at this time.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => {
            const cfg = typeConfig[item.type];
            const busy = actionLoading?.startsWith(item.id);
            return (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-lg">
                      {item.name[0]?.toUpperCase()}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                          {cfg.icon} {cfg.label}
                        </span>
                        {item.subType && (
                          <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-0.5 rounded-full">
                            {item.subType}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-sm text-gray-500">
                        {item.email && <span>✉ {item.email}</span>}
                        {item.phone && <span>📞 {item.phone}</span>}
                        {item.location && <span>📍 {item.location}</span>}
                        <span>🕐 Registered {new Date(item.registeredAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => navigate(`${cfg.detailPath}/${item.id}`)}
                      className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200"
                    >
                      <FiEye className="h-4 w-4" /> View
                    </button>
                    <button
                      onClick={() => handleApprove(item)}
                      disabled={!!busy}
                      className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      <FiCheckCircle className="h-4 w-4" />
                      {actionLoading === item.id + 'a' ? '...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(item)}
                      disabled={!!busy}
                      className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      <FiXCircle className="h-4 w-4" />
                      {actionLoading === item.id + 'r' ? '...' : 'Reject'}
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

export default PendingApprovals;
