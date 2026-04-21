/**
 * All Services View
 * List all services across all professionals
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable, { Column } from '../components/DataTable';
import { servicesService } from '../services/servicesService';

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  duration: number;
  status: string;
  images: string[];
  rating: number;
  reviewCount: number;
  bookingCount: number;
  professional: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

const AllServices: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        page_size: pageSize,
      };
      
      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.status = statusFilter;

      const response = await servicesService.getAllServices(params);
      setServices(response.data || []);
      setTotal(response.pagination?.total || 0);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchQuery, statusFilter]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleViewProfessional = (professionalId: string) => {
    navigate(`/admin/professionals/${professionalId}`);
  };

  const columns: Column<Service>[] = [
    {
      key: 'title',
      label: 'Service Name',
      render: (service) => (
        <div className="flex items-center space-x-3">
          {service.images && service.images.length > 0 ? (
            <img
              src={`${process.env.REACT_APP_API_URL?.replace('/api/v1', '') || 'http://localhost:3001'}${service.images[0]}`}
              alt={service.title}
              className="w-12 h-12 rounded-lg object-cover"
              onError={(e) => {
                e.currentTarget.src = '/placeholder-service.png';
              }}
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900">{service.title}</div>
            <div className="text-sm text-gray-500">{service.category}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'professional',
      label: 'Professional',
      render: (service) => (
        <button
          onClick={() => handleViewProfessional(service.professional.id)}
          className="text-blue-600 hover:text-blue-800 hover:underline text-left"
        >
          <div className="font-medium">{service.professional.name}</div>
          <div className="text-sm text-gray-500">{service.professional.email}</div>
        </button>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      render: (service) => (
        <span className="font-medium text-gray-900">${service.price.toFixed(2)}</span>
      ),
    },
    {
      key: 'duration',
      label: 'Duration',
      render: (service) => (
        <span className="text-gray-700">{service.duration} min</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (service) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            service.status === 'active'
              ? 'bg-green-100 text-green-800'
              : service.status === 'inactive'
              ? 'bg-gray-100 text-gray-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
        </span>
      ),
    },
    {
      key: 'stats',
      label: 'Stats',
      render: (service) => (
        <div className="text-sm">
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-gray-700">{service.rating.toFixed(1)}</span>
            <span className="text-gray-500">({service.reviewCount})</span>
          </div>
          <div className="text-gray-500">{service.bookingCount} bookings</div>
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (service) => (
        <span className="text-sm text-gray-600">
          {new Date(service.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Services</h1>
          <p className="text-gray-600 mt-1">View and manage all services across all professionals</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Services Table */}
      <DataTable
        columns={columns}
        data={services}
        loading={loading}
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
