/**
 * Emergency Bookings View
 * Display all emergency bookings with real-time status
 */
import React, { useState, useEffect } from 'react';
import { FiClock, FiUser } from 'react-icons/fi';
import DataTable, { Column } from '../../components/DataTable';
import { ambulanceService } from '../../services/ambulanceService';
import { EmergencyBooking } from '../../types';

const EmergencyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<EmergencyBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await ambulanceService.getEmergencyBookings({ status: statusFilter });
      setBookings(data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const columns: Column<EmergencyBooking>[] = [
    { key: 'booking_number', label: 'Booking #', sortable: true },
    { key: 'patient_name', label: 'Patient', sortable: true },
    { key: 'provider_name', label: 'Provider', sortable: true },
    { key: 'emergency_type', label: 'Emergency Type', sortable: true },
    {
      key: 'booking_date',
      label: 'Date',
      sortable: true,
      render: (booking) => new Date(booking.booking_date).toLocaleDateString()
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (booking) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(booking.status)}`}>
          {booking.status.replace('_', ' ').charAt(0).toUpperCase() + booking.status.slice(1)}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Emergency Bookings</h1>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={bookings}
        loading={loading}
        emptyMessage="No bookings found"
      />
    </div>
  );
};

export default EmergencyBookings;
