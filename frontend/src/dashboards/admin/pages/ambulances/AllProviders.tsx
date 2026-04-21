/**
 * All Ambulance Providers Page
 * Display paginated table of all ambulance providers with search and filters
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEdit, FiTrash2, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import DataTable, { Column } from '../../components/DataTable';
import { Modal, Button } from '../../components';
import { ambulanceService } from '../../services/ambulanceService';
import { AmbulanceProvider } from '../../types';

const AllProviders: React.FC = () => {
  const navigate = useNavigate();
  const [providers, setProviders] = useState<AmbulanceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('');
  const [verificationStatusFilter, setVerificationStatusFilter] = useState<'pending' | 'verified' | 'rejected' | ''>('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 20,
    totalItems: 0
  });
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; provider: AmbulanceProvider | null }>({
    show: false,
    provider: null
  });
  const [verifyModal, setVerifyModal] = useState<{ show: boolean; provider: AmbulanceProvider | null }>({
    show: false,
    provider: null
  });
  const [rejectModal, setRejectModal] = useState<{ show: boolean; provider: AmbulanceProvider | null; reason: string }>({
    show: false,
    provider: null,
    reason: ''
  });

  useEffect(() => {
    fetchProviders();
  }, [pagination.currentPage, searchQuery, serviceTypeFilter, verificationStatusFilter]);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const response = await ambulanceService.getProviders({
        page: pagination.currentPage,
        page_size: pagination.pageSize,
        search: searchQuery,
        service_type: serviceTypeFilter,
        verification_status: verificationStatusFilter
      });

      setProviders(response.data);
      setPagination({
        currentPage: response.pagination.page,
        totalPages: response.pagination.total_pages,
        pageSize: response.pagination.page_size,
        totalItems: response.pagination.total
      });
    } catch (error) {
      console.error('Failed to fetch providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPagination({ ...pagination, currentPage: 1 });
  };

  const handleServiceTypeFilterChange = (type: string) => {
    setServiceTypeFilter(type);
    setPagination({ ...pagination, currentPage: 1 });
  };

  const handleVerificationStatusFilterChange = (status: 'pending' | 'verified' | 'rejected' | '') => {
    setVerificationStatusFilter(status);
    setPagination({ ...pagination, currentPage: 1 });
  };

  const handleView = (provider: AmbulanceProvider) => {
    navigate(`/admin/ambulances/${provider.id}`);
  };

  const handleEdit = (provider: AmbulanceProvider) => {
    navigate(`/admin/ambulances/${provider.id}/edit`);
  };

  const handleDeleteClick = (provider: AmbulanceProvider) => {
    setDeleteModal({ show: true, provider });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.provider) return;

    try {
      await ambulanceService.deleteProvider(deleteModal.provider.id);
      setDeleteModal({ show: false, provider: null });
      fetchProviders();
    } catch (error) {
      console.error('Failed to delete provider:', error);
      alert('Failed to delete provider. Please try again.');
    }
  };

  const handleVerifyClick = (provider: AmbulanceProvider) => {
    setVerifyModal({ show: true, provider });
  };

  const handleVerifyConfirm = async () => {
    if (!verifyModal.provider) return;

    try {
      await ambulanceService.verifyProvider(verifyModal.provider.id);
      setVerifyModal({ show: false, provider: null });
      fetchProviders();
    } catch (error) {
      console.error('Failed to verify provider:', error);
      alert('Failed to verify provider. Please try again.');
    }
  };

  const handleRejectClick = (provider: AmbulanceProvider) => {
    setRejectModal({ show: true, provider, reason: '' });
  };

  const handleRejectConfirm = async () => {
    if (!rejectModal.provider || !rejectModal.reason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }

    try {
      await ambulanceService.rejectProvider(rejectModal.provider.id, rejectModal.reason);
      setRejectModal({ show: false, provider: null, reason: '' });
      fetchProviders();
    } catch (error) {
      console.error('Failed to reject provider:', error);
      alert('Failed to reject provider. Please try again.');
    }
  };

  const columns: Column<AmbulanceProvider>[] = [
    {
      key: 'id',
      label: 'Provider ID',
      sortable: true
    },
    {
      key: 'provider_name',
      label: 'Provider Name',
      sortable: true
    },
    {
      key: 'service_type',
      label: 'Service Type',
      sortable: true
    },
    {
      key: 'city',
      label: 'Location',
      sortable: true,
      render: (provider) => `${provider.city}, ${provider.state}`
    },
    {
      key: 'is_online',
      label: 'Availability',
      sortable: true,
      render: (provider) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            provider.is_online
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {provider.is_online ? 'Online' : 'Offline'}
        </span>
      )
    },
    {
      key: 'verification_status',
      label: 'Verification Status',
      sortable: true,
      render: (provider) => {
        const status = provider.verification_status || 'pending';
        return (
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${
              status === 'verified'
                ? 'bg-green-100 text-green-800'
                : status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      }
    }
  ];

  const renderActions = (provider: AmbulanceProvider) => (
    <div className="flex space-x-2">
      <button
        onClick={() => handleView(provider)}
        className="text-blue-600 hover:text-blue-800"
        title="View"
      >
        <FiEye className="h-5 w-5" />
      </button>
      <button
        onClick={() => handleEdit(provider)}
        className="text-green-600 hover:text-green-800"
        title="Edit"
      >
        <FiEdit className="h-5 w-5" />
      </button>
      {provider.verification_status === 'pending' && (
        <>
          <button
            onClick={() => handleVerifyClick(provider)}
            className="text-green-600 hover:text-green-800"
            title="Verify"
          >
            <FiCheckCircle className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleRejectClick(provider)}
            className="text-red-600 hover:text-red-800"
            title="Reject"
          >
            <FiXCircle className="h-5 w-5" />
          </button>
        </>
      )}
      <button
        onClick={() => handleDeleteClick(provider)}
        className="text-red-600 hover:text-red-800"
        title="Delete"
      >
        <FiTrash2 className="h-5 w-5" />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">All Ambulance Providers</h1>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Type
            </label>
            <select
              value={serviceTypeFilter}
              onChange={(e) => handleServiceTypeFilterChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="Basic Life Support">Basic Life Support</option>
              <option value="Advanced Life Support">Advanced Life Support</option>
              <option value="Air Ambulance">Air Ambulance</option>
              <option value="Patient Transport">Patient Transport</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verification Status
            </label>
            <select
              value={verificationStatusFilter}
              onChange={(e) => handleVerificationStatusFilterChange(e.target.value as 'pending' | 'verified' | 'rejected' | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={providers}
        searchable={true}
        searchPlaceholder="Search by name, email, or registration number..."
        onSearch={handleSearch}
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          pageSize: pagination.pageSize,
          totalItems: pagination.totalItems,
          onPageChange: (page) => setPagination({ ...pagination, currentPage: page })
        }}
        actions={renderActions}
        loading={loading}
        emptyMessage="No ambulance providers found"
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.show}
        onClose={() => setDeleteModal({ show: false, provider: null })}
        title="Delete Provider"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete provider{' '}
            <strong>{deleteModal.provider?.provider_name}</strong>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setDeleteModal({ show: false, provider: null })}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Verify Confirmation Modal */}
      <Modal
        isOpen={verifyModal.show}
        onClose={() => setVerifyModal({ show: false, provider: null })}
        title="Verify Provider"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to verify provider{' '}
            <strong>{verifyModal.provider?.provider_name}</strong>
            ?
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setVerifyModal({ show: false, provider: null })}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleVerifyConfirm}>
              Verify
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Confirmation Modal */}
      <Modal
        isOpen={rejectModal.show}
        onClose={() => setRejectModal({ show: false, provider: null, reason: '' })}
        title="Reject Provider"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Please provide a reason for rejecting provider{' '}
            <strong>{rejectModal.provider?.provider_name}</strong>
            :
          </p>
          <textarea
            value={rejectModal.reason}
            onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Enter rejection reason..."
          />
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setRejectModal({ show: false, provider: null, reason: '' })}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleRejectConfirm}>
              Reject
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AllProviders;
