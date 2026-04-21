/**
 * Hospital Applications View
 * Display all applications received for hospital vacancies
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiUser, FiMail } from 'react-icons/fi';
import DataTable, { Column } from '../../components/DataTable';
import { hospitalService } from '../../services/hospitalService';
import { HospitalApplication } from '../../types';

const HospitalApplications: React.FC = () => {
  const { hospitalId } = useParams<{ hospitalId: string }>();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<HospitalApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (hospitalId) {
      fetchApplications();
    }
  }, [hospitalId, statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await hospitalService.getHospitalApplications(hospitalId!, {
        status: statusFilter
      });
      setApplications(data);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns: Column<HospitalApplication>[] = [
    {
      key: 'id',
      label: 'Application ID',
      sortable: true
    },
    {
      key: 'professional_name',
      label: 'Professional Name',
      sortable: true
    },
    {
      key: 'professional_email',
      label: 'Email',
      sortable: false
    },
    {
      key: 'professional_type',
      label: 'Professional Type',
      sortable: true
    },
    {
      key: 'vacancy_title',
      label: 'Position',
      sortable: true
    },
    {
      key: 'applied_date',
      label: 'Applied Date',
      sortable: true,
      render: (application) => new Date(application.applied_date).toLocaleDateString()
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (application) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(application.status)}`}>
          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/admin/hospitals/${hospitalId}`)}
            className="text-gray-600 hover:text-gray-900"
          >
            <FiChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Hospital Applications</h1>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <DataTable
        columns={columns}
        data={applications}
        searchable={false}
        loading={loading}
        emptyMessage="No applications found"
      />
    </div>
  );
};

export default HospitalApplications;
