/**
 * All Hospitals Page
 * Display paginated table of all hospitals with search and filters
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEdit, FiTrash2, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import DataTable, { Column } from '../../components/DataTable';
import { Modal, Button } from '../../components';
import { hospitalService } from '../../services/hospitalService';
import { Hospital } from '../../types';

const AllHospitals: React.FC = () => {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [facilityTypeFilter, setFacilityTypeFilter] = useState('');
  const [verificationStatusFilter, setVerificationStatusFilter] = useState<'pending' | 'verified' | 'rejected' | ''>('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 20,
    totalItems: 0
  });
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; hospital: Hospital | null }>({
    show: false,
    hospital: null
  });
  const [verifyModal, setVerifyModal] = useState<{ show: boolean; hospital: Hospital | null }>({
    show: false,
    hospital: null
  });
  const [rejectModal, setRejectModal] = useState<{ show: boolean; hospital: Hospital | null; reason: string }>({
    show: false,
    hospital: null,
    reason: ''
  });

  useEffect(() => {
    fetchHospitals();
  }, [pagination.currentPage, searchQuery, facilityTypeFilter, verificationStatusFilter]);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const response = await hospitalService.getHospitals({
        page: pagination.currentPage,
        page_size: pagination.pageSize,
        search: searchQuery,
        facility_type: facilityTypeFilter,
        verification_status: verificationStatusFilter
      });

      setHospitals(response.data);
      setPagination({
        currentPage: response.pagination.page,
        totalPages: response.pagination.total_pages,
        pageSize: response.pagination.page_size,
        totalItems: response.pagination.total
      });
    } catch (error) {
      console.error('Failed to fetch hospitals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPagination({ ...pagination, currentPage: 1 });
  };

  const handleFacilityTypeFilterChange = (type: string) => {
    setFacilityTypeFilter(type);
    setPagination({ ...pagination, currentPage: 1 });
  };

  const handleVerificationStatusFilterChange = (status: 'pending' | 'verified' | 'rejected' | '') => {
    setVerificationStatusFilter(status);
    setPagination({ ...pagination, currentPage: 1 });
  };

  const handleView = (hospital: Hospital) => {
    navigate(`/admin/hospitals/${hospital.id}`);
  };

  const handleEdit = (hospital: Hospital) => {
    navigate(`/admin/hospitals/${hospital.id}/edit`);
  };

  const handleDeleteClick = (hospital: Hospital) => {
    setDeleteModal({ show: true, hospital });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.hospital) return;

    try {
      await hospitalService.deleteHospital(deleteModal.hospital.id);
      setDeleteModal({ show: false, hospital: null });
      fetchHospitals();
    } catch (error) {
      console.error('Failed to delete hospital:', error);
      alert('Failed to delete hospital. Please try again.');
    }
  };

  const handleVerifyClick = (hospital: Hospital) => {
    setVerifyModal({ show: true, hospital });
  };

  const handleVerifyConfirm = async () => {
    if (!verifyModal.hospital) return;

    try {
      await hospitalService.verifyHospital(verifyModal.hospital.id);
      setVerifyModal({ show: false, hospital: null });
      fetchHospitals();
    } catch (error) {
      console.error('Failed to verify hospital:', error);
      alert('Failed to verify hospital. Please try again.');
    }
  };

  const handleRejectClick = (hospital: Hospital) => {
    setRejectModal({ show: true, hospital, reason: '' });
  };

  const handleRejectConfirm = async () => {
    if (!rejectModal.hospital || !rejectModal.reason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }

    try {
      await hospitalService.rejectHospital(rejectModal.hospital.id, rejectModal.reason);
      setRejectModal({ show: false, hospital: null, reason: '' });
      fetchHospitals();
    } catch (error) {
      console.error('Failed to reject hospital:', error);
      alert('Failed to reject hospital. Please try again.');
    }
  };

  const columns: Column<Hospital>[] = [
    {
      key: 'id',
      label: 'Hospital ID',
      sortable: true
    },
    {
      key: 'hospital_name',
      label: 'Hospital Name',
      sortable: true
    },
    {
      key: 'facility_type',
      label: 'Facility Type',
      sortable: true
    },
    {
      key: 'city',
      label: 'Location',
      sortable: true,
      render: (hospital) => `${hospital.city}, ${hospital.state}`
    },
    {
      key: 'registration_number',
      label: 'Registration Number',
      sortable: false
    },
    {
      key: 'verification_status',
      label: 'Verification Status',
      sortable: true,
      render: (hospital) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            hospital.verification_status === 'verified'
              ? 'bg-green-100 text-green-800'
              : hospital.verification_status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {hospital.verification_status.charAt(0).toUpperCase() + hospital.verification_status.slice(1)}
        </span>
      )
    }
  ];

  const renderActions = (hospital: Hospital) => (
    <div className="flex space-x-2">
      <button
        onClick={() => handleView(hospital)}
        className="text-blue-600 hover:text-blue-800"
        title="View"
      >
        <FiEye className="h-5 w-5" />
      </button>
      <button
        onClick={() => handleEdit(hospital)}
        className="text-green-600 hover:text-green-800"
        title="Edit"
      >
        <FiEdit className="h-5 w-5" />
      </button>
      {hospital.verification_status === 'pending' && (
        <>
          <button
            onClick={() => handleVerifyClick(hospital)}
            className="text-green-600 hover:text-green-800"
            title="Verify"
          >
            <FiCheckCircle className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleRejectClick(hospital)}
            className="text-red-600 hover:text-red-800"
            title="Reject"
          >
            <FiXCircle className="h-5 w-5" />
          </button>
        </>
      )}
      <button
        onClick={() => handleDeleteClick(hospital)}
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
        <h1 className="text-2xl font-bold text-gray-900">All Hospitals</h1>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Facility Type
            </label>
            <select
              value={facilityTypeFilter}
              onChange={(e) => handleFacilityTypeFilterChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="General Hospital">General Hospital</option>
              <option value="Specialty Hospital">Specialty Hospital</option>
              <option value="Clinic">Clinic</option>
              <option value="Diagnostic Center">Diagnostic Center</option>
              <option value="Rehabilitation Center">Rehabilitation Center</option>
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
        data={hospitals}
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
        emptyMessage="No hospitals found"
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.show}
        onClose={() => setDeleteModal({ show: false, hospital: null })}
        title="Delete Hospital"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete hospital{' '}
            <strong>{deleteModal.hospital?.hospital_name}</strong>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setDeleteModal({ show: false, hospital: null })}
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
        onClose={() => setVerifyModal({ show: false, hospital: null })}
        title="Verify Hospital"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to verify hospital{' '}
            <strong>{verifyModal.hospital?.hospital_name}</strong>
            ?
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setVerifyModal({ show: false, hospital: null })}
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
        onClose={() => setRejectModal({ show: false, hospital: null, reason: '' })}
        title="Reject Hospital"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Please provide a reason for rejecting hospital{' '}
            <strong>{rejectModal.hospital?.hospital_name}</strong>
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
              onClick={() => setRejectModal({ show: false, hospital: null, reason: '' })}
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

export default AllHospitals;
