/**
 * Patient Appointments View
 * Display all appointments for a specific patient with filtering
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import DataTable, { Column } from '../../components/DataTable';
import { Button } from '../../components';
import { patientService } from '../../services/patientService';
import { PatientAppointment } from '../../types';

const PatientAppointments: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (patientId) {
      fetchAppointments();
    }
  }, [patientId, statusFilter, startDate, endDate]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await patientService.getPatientAppointments(patientId!, {
        status: statusFilter,
        start_date: startDate,
        end_date: endDate
      });
      setAppointments(data);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns: Column<PatientAppointment>[] = [
    {
      key: 'id',
      label: 'Appointment ID',
      sortable: true
    },
    {
      key: 'professional_name',
      label: 'Professional',
      sortable: true,
      render: (appointment) => (
        <div>
          <p className="font-medium">{appointment.professional_name}</p>
          <p className="text-sm text-gray-500">{appointment.professional_type}</p>
        </div>
      )
    },
    {
      key: 'appointment_date',
      label: 'Date & Time',
      sortable: true,
      render: (appointment) => (
        <div>
          <p className="font-medium">{new Date(appointment.appointment_date).toLocaleDateString()}</p>
          <p className="text-sm text-gray-500">{appointment.appointment_time}</p>
        </div>
      )
    },
    {
      key: 'service_type',
      label: 'Service Type',
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (appointment) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
          {appointment.status}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Booked On',
      sortable: true,
      render: (appointment) => new Date(appointment.created_at).toLocaleDateString()
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/admin/patients/${patientId}`)}
            className="text-gray-600 hover:text-gray-900"
          >
            <FiChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Patient Appointments</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={appointments}
        searchable={false}
        loading={loading}
        emptyMessage="No appointments found for this patient"
      />
    </div>
  );
};

export default PatientAppointments;
