/**
 * All Professionals Page
 * Display paginated table of all professionals with search and filters
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEdit, FiTrash2, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import DataTable, { Column } from '../../components/DataTable';
import { Modal, Button } from '../../components';
import { professionalService } from '../../services/professionalService';
import { Professional } from '../../types';

const AllProfessionals: React.FC = () => {
  const navigate = useNavigate();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [professionalTypeFilter, setProfessionalTypeFilter] = useState('');
  const [verificationStatusFilter, setVerificationStatusFilter] = useState<'pending' | 'verified' | 'rejected' | ''>('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 20,
    totalItems: 0
  });
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; professional: Professional | null }>({
    show: false,
    professional: null
  });
  const [verifyModal, setVerifyModal] = useState<{ show: boolean; professional: Professional | null }>({
    show: false,
    professional: null
  });
  const [rejectModal, setRejectModal] = useState<{ show: boolean; professional: Professional | null; reason: string }>({
    show: false,
    professional: null,
    reason: ''
  });

  useEffect(() => {
    fetchProfessionals();
  }, [pagination.currentPage, searchQuery, professionalTypeFilter, verificationStatusFilter]);

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      const response = await professionalService.getProfessionals({
        page: pagination.currentPage,
        page_size: pagination.pageSize,
        search: searchQuery,
        professional_type: professionalTypeFilter,
        verification_status: verificationStatusFilter
      });

      setProfessionals(response.data);
      setPagination({
        currentPage: response.pagination.page,
        totalPages: response.pagination.total_pages,
        pageSize: response.pagination.page_size,
        totalItems: response.pagination.total
      });
    } catch (error) {
      console.error('Failed to fetch professionals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPagination({ ...pagination, currentPage: 1 });
  };

  const handleProfessionalTypeFilterChange = (type: string) => {
    setProfessionalTypeFilter(type);
    setPagination({ ...pagination, currentPage: 1 });
  };

  const handleVerificationStatusFilterChange = (status: 'pending' | 'verified' | 'rejected' | '') => {
    setVerificationStatusFilter(status);
    setPagination({ ...pagination, currentPage: 1 });
  };

  const handleView = (professional: Professional) => {
    navigate(`/admin/professionals/${professional.id}`);
  };

  const handleEdit = (professional: Professional) => {
    navigate(`/admin/professionals/${professional.id}/edit`);
  };

  const handleDeleteClick = (professional: Professional) => {
    setDeleteModal({ show: true, professional });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.professional) return;

    try {
      await professionalService.deleteProfessional(deleteModal.professional.id);
      setDeleteModal({ show: false, professional: null });
      fetchProfessionals();
    } catch (error) {
      console.error('Failed to delete professional:', error);
      alert('Failed to delete professional. Please try again.');
    }
  };

  const handleVerifyClick = (professional: Professional) => {
    setVerifyModal({ show: true, professional });
  };

  const handleVerifyConfirm = async () => {
    if (!verifyModal.professional) return;

    try {
      await professionalService.verifyProfessional(verifyModal.professional.id);
      setVerifyModal({ show: false, professional: null });
      fetchProfessionals();
    } catch (error) {
      console.error('Failed to verify professional:', error);
      alert('Failed to verify professional. Please try again.');
    }
  };

  const handleRejectClick = (professional: Professional) => {
    setRejectModal({ show: true, professional, reason: '' });
  };

  const handleRejectConfirm = async () => {
    if (!rejectModal.professional || !rejectModal.reason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }

    try {
      await professionalService.rejectProfessional(rejectModal.professional.id, rejectModal.reason);
      setRejectModal({ show: false, professional: null, reason: '' });
      fetchProfessionals();
    } catch (error) {
      console.error('Failed to reject professional:', error);
      alert('Failed to reject professional. Please try again.');
    }
  };

  const columns: Column<Professional>[] = [
    {
      key: 'id',
      label: 'Professional ID',
      sortable: true
    },
    {
      key: 'user',
      label: 'Name',
      sortable: true,
      render: (professional) => `${professional.user?.firstName || ''} ${professional.user?.lastName || ''}`
    },
    {
      key: 'professional_type',
      label: 'Type',
      sortable: true
    },
    {
      key: 'specialization',
      label: 'Specialization',
      sortable: true
    },
    {
      key: 'license_number',
      label: 'License Number',
      sortable: false
    },
    {
      key: 'verification_status',
      label: 'Verification Status',
      sortable: true,
      render: (professional) => {
        const isVerified = professional.isVerified || professional.verification_status === 'verified';
        const status = isVerified ? 'verified' : 'pending';
        
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

  const renderActions = (professional: Professional) => (
    <div className="flex space-x-2">
      <button
        onClick={() => handleView(professional)}
        className="text-blue-600 hover:text-blue-800"
        title="View"
      >
        <FiEye className="h-5 w-5" />
      </button>
      <button
        onClick={() => handleEdit(professional)}
        className="text-green-600 hover:text-green-800"
        title="Edit"
      >
        <FiEdit className="h-5 w-5" />
      </button>
      {professional.verification_status === 'pending' && (
        <>
          <button
            onClick={() => handleVerifyClick(professional)}
            className="text-green-600 hover:text-green-800"
            title="Verify"
          >
            <FiCheckCircle className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleRejectClick(professional)}
            className="text-red-600 hover:text-red-800"
            title="Reject"
          >
            <FiXCircle className="h-5 w-5" />
          </button>
        </>
      )}
      <button
        onClick={() => handleDeleteClick(professional)}
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
        <h1 className="text-2xl font-bold text-gray-900">All Professionals</h1>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Professional Type
            </label>
            <select
              value={professionalTypeFilter}
              onChange={(e) => handleProfessionalTypeFilterChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="Doctor">Doctor</option>
              <option value="Nurse">Nurse</option>
              <option value="Therapist">Therapist</option>
              <option value="Pharmacist">Pharmacist</option>
              <option value="Lab Technician">Lab Technician</option>
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
        data={professionals}
        searchable={true}
        searchPlaceholder="Search by name, email, or license number..."
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
        emptyMessage="No professionals found"
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.show}
        onClose={() => setDeleteModal({ show: false, professional: null })}
        title="Delete Professional"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete professional{' '}
            <strong>
              {deleteModal.professional?.first_name} {deleteModal.professional?.last_name}
            </strong>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setDeleteModal({ show: false, professional: null })}
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
        onClose={() => setVerifyModal({ show: false, professional: null })}
        title="Verify Professional"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to verify professional{' '}
            <strong>
              {verifyModal.professional?.first_name} {verifyModal.professional?.last_name}
            </strong>
            ?
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setVerifyModal({ show: false, professional: null })}
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
        onClose={() => setRejectModal({ show: false, professional: null, reason: '' })}
        title="Reject Professional"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Please provide a reason for rejecting professional{' '}
            <strong>
              {rejectModal.professional?.first_name} {rejectModal.professional?.last_name}
            </strong>
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
              onClick={() => setRejectModal({ show: false, professional: null, reason: '' })}
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

export default AllProfessionals;
