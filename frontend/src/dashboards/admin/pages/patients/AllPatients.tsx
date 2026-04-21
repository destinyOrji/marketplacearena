/**
 * All Patients Page
 * Display paginated table of all patients with search and filters
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEdit, FiTrash2 } from 'react-icons/fi';
import DataTable, { Column } from '../../components/DataTable';
import { Modal, Button } from '../../components';
import { patientService } from '../../services/patientService';
import { Patient } from '../../types';

const AllPatients: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | ''>('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 20,
    totalItems: 0
  });
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; patient: Patient | null }>({
    show: false,
    patient: null
  });

  useEffect(() => {
    fetchPatients();
  }, [pagination.currentPage, searchQuery, statusFilter]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await patientService.getPatients({
        page: pagination.currentPage,
        page_size: pagination.pageSize,
        search: searchQuery,
        status: statusFilter
      });

      setPatients(response.data);
      setPagination({
        currentPage: response.pagination.page,
        totalPages: response.pagination.total_pages,
        pageSize: response.pagination.page_size,
        totalItems: response.pagination.total_count
      });
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPagination({ ...pagination, currentPage: 1 });
  };

  const handleStatusFilterChange = (status: 'active' | 'inactive' | '') => {
    setStatusFilter(status);
    setPagination({ ...pagination, currentPage: 1 });
  };

  const handleView = (patient: Patient) => {
    navigate(`/admin/patients/${patient.id}`);
  };

  const handleEdit = (patient: Patient) => {
    navigate(`/admin/patients/${patient.id}/edit`);
  };

  const handleDeleteClick = (patient: Patient) => {
    setDeleteModal({ show: true, patient });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.patient) return;

    try {
      await patientService.deletePatient(deleteModal.patient.id);
      setDeleteModal({ show: false, patient: null });
      fetchPatients();
    } catch (error) {
      console.error('Failed to delete patient:', error);
      alert('Failed to delete patient. Please try again.');
    }
  };

  const columns: Column<Patient>[] = [
    {
      key: 'id',
      label: 'Patient ID',
      sortable: true
    },
    {
      key: 'first_name',
      label: 'Name',
      sortable: true,
      render: (patient) => `${patient.first_name} ${patient.last_name}`
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true
    },
    {
      key: 'phone',
      label: 'Phone',
      sortable: false
    },
    {
      key: 'created_at',
      label: 'Registration Date',
      sortable: true,
      render: (patient) => new Date(patient.created_at).toLocaleDateString()
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: true,
      render: (patient) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            patient.is_active
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {patient.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  const renderActions = (patient: Patient) => (
    <div className="flex space-x-2">
      <button
        onClick={() => handleView(patient)}
        className="text-blue-600 hover:text-blue-800"
        title="View"
      >
        <FiEye className="h-5 w-5" />
      </button>
      <button
        onClick={() => handleEdit(patient)}
        className="text-green-600 hover:text-green-800"
        title="Edit"
      >
        <FiEdit className="h-5 w-5" />
      </button>
      <button
        onClick={() => handleDeleteClick(patient)}
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
        <h1 className="text-2xl font-bold text-gray-900">All Patients</h1>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value as 'active' | 'inactive' | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={patients}
        searchable={true}
        searchPlaceholder="Search by name or email..."
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
        emptyMessage="No patients found"
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.show}
        onClose={() => setDeleteModal({ show: false, patient: null })}
        title="Delete Patient"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete patient{' '}
            <strong>
              {deleteModal.patient?.first_name} {deleteModal.patient?.last_name}
            </strong>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setDeleteModal({ show: false, patient: null })}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AllPatients;
