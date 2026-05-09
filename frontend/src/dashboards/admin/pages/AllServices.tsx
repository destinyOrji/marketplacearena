import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiToggleLeft, FiToggleRight, FiExternalLink } from 'react-icons/fi';
import DataTable, { Column } from '../components/DataTable';
import { authService } from '../services/authService';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://healthmarketarena.com/api';

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  duration: number;
  status: string;
  approvalNote?: string;
  images: string[];
  rating: number;
  reviewCount: number;
  bookingCount: number;
  professional: { id: string; name: string; email: string; type?: string } | null;
  createdAt: string;
}

const statusBadge: Record<string, string> = {
  active:   'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-700',
  pending:  'bg-yellow-100 text-yellow-800',
};

const AllServices: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [total, setTotal] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending'); // default to pending
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const h = () => ({ headers: { Authorization: `Bearer ${authService.getAccessToken()}` } });

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { page, page_size: pageSize };
      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.status = statusFilter;

      const res = await axios.get(`${API_BASE_URL}/admin/services`, { ...h(), params });
      setServices(res.data?.data || []);
      setTotal(res.data?.pagination?.total || 0);
      setPendingCount(res.data?.pendingCount || 0);
    } catch {
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchQuery, statusFilter]);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const handleApprove = async (id: string) => {
    setActionLoading(id + 'a');
    try {
      await axios.post(`${API_BASE_URL}/admin/services/${id}/approve`, {}, h());
      setServices(prev => prev.map(s => s.id === id ? { ...s, status: 'active' } : s));
      setPendingCount(c => Math.max(0, c - 1));
    } catch { alert('Failed to approve service.'); }
    finally { setActionLoading(null); }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt('Reason for rejection (optional):') || 'Does not meet platform standards';
    setActionLoading(id + 'r');
    try {
      await axios.post(`${API_BASE_URL}/admin/services/${id}/reject`, { reason }, h());
      setServices(prev => prev.map(s => s.id === id ? { ...s, status: 'inactive', approvalNote: reason } : s));
      setPendingCount(c => Math.max(0, c - 1));
    } catch { alert('Failed to reject service.'); }
    finally { setActionLoading(null); }
  };

  const handleToggle = async (id: string, currentStatus: string) => {
    const isActive = currentStatus !== 'active';
    setActionLoading(id + 't');
    try {
      // Find the professional id for this service
      const svc = services.find(s => s.id === id);
      if (svc?.professional?.id) {
        await axios.patch(
          `${API_BASE_URL}/admin/professionals/${svc.professional.id}/services/${id}`,
          { is_active: isActive },
          h()
        );
      }
      setServices(prev => prev.map(s => s.id === id ? { ...s, status: isActive ? 'active' : 'inactive' } : s));
    } catch { alert('Failed to update service status.'); }
    finally { setActionLoading(null); }
  };

  const columns: Column<Service>[] = [
    {
      key: 'title',
      label: 'Service',
      render: (s) => (
        <div className="flex items-center gap-3">
          {s.images?.[0] ? (
            <img src={`https://healthmarketarena.com${s.images[0]}`} alt={s.title}
              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
              onError={e => { e.currentTarget.style.display = 'none'; }} />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-lg">🏥</div>
          )}
          <div>
            <p className="font-medium text-gray-900">{s.title}</p>
            <p className="text-xs text-gray-400 capitalize">{s.category}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'professional',
      label: 'Provider',
      render: (s) => s.professional ? (
        <button
          onClick={() => {
            const path = s.professional?.type === 'gym-physio'
              ? `/admin/gym-physio/${s.professional.id}`
              : `/admin/professionals/${s.professional.id}`;
            navigate(path);
          }}
          className="text-left group"
        >
          <p className="text-sm font-medium text-blue-600 group-hover:underline flex items-center gap-1">
            {s.professional.name} <FiExternalLink className="h-3 w-3" />
          </p>
          <p className="text-xs text-gray-400">{s.professional.email}</p>
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${s.professional.type === 'gym-physio' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
            {s.professional.type === 'gym-physio' ? 'Gym/Physio' : 'Professional'}
          </span>
        </button>
      ) : <span className="text-gray-400 text-sm">—</span>,
    },
    {
      key: 'price',
      label: 'Price',
      render: (s) => <span className="font-medium text-gray-900">₦{s.price.toLocaleString()}</span>,
    },
    {
      key: 'duration',
      label: 'Duration',
      render: (s) => <span className="text-gray-600 text-sm">{s.duration} min</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (s) => (
        <div>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadge[s.status] || statusBadge.inactive}`}>
            {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
          </span>
          {s.approvalNote && s.status === 'inactive' && (
            <p className="text-xs text-red-500 mt-1 max-w-[140px] truncate" title={s.approvalNote}>
              {s.approvalNote}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Submitted',
      render: (s) => <span className="text-xs text-gray-500">{new Date(s.createdAt).toLocaleDateString()}</span>,
    },
    {
      key: 'id',
      label: 'Actions',
      render: (s) => {
        const busy = actionLoading?.startsWith(s.id);
        return (
          <div className="flex items-center gap-2">
            {s.status === 'pending' && (
              <>
                <button
                  onClick={() => handleApprove(s.id)}
                  disabled={!!busy}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <FiCheckCircle className="h-3.5 w-3.5" />
                  {actionLoading === s.id + 'a' ? '...' : 'Approve'}
                </button>
                <button
                  onClick={() => handleReject(s.id)}
                  disabled={!!busy}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  <FiXCircle className="h-3.5 w-3.5" />
                  {actionLoading === s.id + 'r' ? '...' : 'Reject'}
                </button>
              </>
            )}
            {s.status !== 'pending' && (
              <button
                onClick={() => handleToggle(s.id, s.status)}
                disabled={!!busy}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg disabled:opacity-50 ${
                  s.status === 'active'
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                }`}
              >
                {s.status === 'active'
                  ? <><FiToggleRight className="h-4 w-4" /> Deactivate</>
                  : <><FiToggleLeft className="h-4 w-4" /> Activate</>
                }
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-500 text-sm mt-0.5">Review and approve services before they go live to patients</p>
        </div>
        {pendingCount > 0 && (
          <span className="bg-yellow-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold animate-pulse">
            {pendingCount} pending approval
          </span>
        )}
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { value: 'pending', label: 'Pending', count: pendingCount },
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Rejected/Inactive' },
          { value: '', label: 'All' },
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => { setStatusFilter(tab.value); setPage(1); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              statusFilter === tab.value
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <input
          type="text"
          placeholder="Search by service name or description..."
          value={searchQuery}
          onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={services}
        loading={loading}
        emptyMessage={statusFilter === 'pending' ? 'No services pending approval 🎉' : 'No services found'}
        pagination={{
          currentPage: page,
          totalPages: Math.ceil(total / pageSize),
          pageSize,
          totalItems: total,
          onPageChange: setPage,
        }}
      />
    </div>
  );
};

export default AllServices;
