/**
 * Patient Emergency Bookings View
 * Display all emergency bookings for a specific patient
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiAlertCircle } from 'react-icons/fi';
import DataTable, { Column } from '../../components/DataTable';
import { Modal } from '../../components';
import { patientService } from '../../services/patientService';
import { PatientEmergencyBooking } from '../../types';

const PatientEmergencyBookings: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<PatientEmergencyBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailModal, setDetailModal] = useState<{ show: boolean; booking: PatientEmergencyBooking | null }>({
    show: false,
    booking: null
  });

  useEffect(() => {
    if (patientId) {
      fetchEmergencyBookings();
    }
  }, [patientId]);

  const fetchEmergencyBookings = async () => {
    try {
      setLoading(true);
      const data = await patientService.getPatientEmergencyBookings(patientId!);
      setBookings(data);
    } catch (error) {
      console.error('Failed to fetch emergency bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (booking: PatientEmergencyBooking) => {
    setDetailModal({ show: true, booking });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns: Column<PatientEmergencyBooking>[] = [
    {
      key: 'id',
      label: 'Booking ID',
      sortable: true
    },
    {
      key: 'booking_date',
      label: 'Date',
      sortable: true,
      render: (booking) => new Date(booking.booking_date).toLocaleString()
    },
    {
      key: 'emergency_type',
      label: 'Emergency Type',
      sortable: true,
      render: (booking) => (
        <div className="flex items-center">
          <FiAlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="font-medium">{booking.emergency_type}</span>
        </div>
      )
    },
    {
      key: 'ambulance_provider',
      label: 'Ambulance Provider',
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (booking) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
          {booking.status.replace('_', ' ').toUpperCase()}
        </span>
      )
    },
    {
      key: 'pickup_location',
      label: 'Pickup Location',
      sortable: false,
      render: (booking) => (
        <div className="max-w-xs truncate" title={booking.pickup_location}>
          {booking.pickup_location}
        </div>
      )
    }
  ];

  const renderActions = (booking: PatientEmergencyBooking) => (
    <button
      onClick={() => handleViewDetails(booking)}
      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
    >
      View Details
    </button>
  );

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
          <h1 className="text-2xl font-bold text-gray-900">Emergency Bookings</h1>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={bookings}
        searchable={false}
        actions={renderActions}
        loading={loading}
        emptyMessage="No emergency bookings found for this patient"
      />

      {/* Detail Modal */}
      <Modal
        isOpen={detailModal.show}
        onClose={() => setDetailModal({ show: false, booking: null })}
        title="Emergency Booking Details"
      >
        {detailModal.booking && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Booking ID</p>
                <p className="text-base text-gray-900">{detailModal.booking.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(detailModal.booking.status)}`}>
                  {detailModal.booking.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Emergency Type</p>
              <p className="text-base text-gray-900">{detailModal.booking.emergency_type}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Ambulance Provider</p>
              <p className="text-base text-gray-900">{detailModal.booking.ambulance_provider}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Booking Date</p>
              <p className="text-base text-gray-900">
                {new Date(detailModal.booking.booking_date).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pickup Location</p>
              <div className="flex items-start mt-1">
                {/* Icon removed - not available in Feather Icons */}
                <p className="text-base text-gray-900">{detailModal.booking.pickup_location}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Destination</p>
              <div className="flex items-start mt-1">
                {/* Icon removed - not available in Feather Icons */}
                <p className="text-base text-gray-900">{detailModal.booking.destination}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Created At</p>
              <p className="text-base text-gray-900">
                {new Date(detailModal.booking.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PatientEmergencyBookings;
