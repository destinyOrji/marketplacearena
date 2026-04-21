// My Services Page - Manage service listings

import React, { useState, useEffect, useMemo } from 'react';
import { Service } from '../types';
import { servicesApi, profileApi } from '../services/api';
import ServiceCard from '../components/ServiceCard';
import ServiceFormModal from '../components/ServiceFormModal';
import { toast } from 'react-toastify';
import { useDebounce } from '../utils/hooks';

const MyServices: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  // Fetch services on mount
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await servicesApi.getServices();
      setServices(data);
    } catch (error) {
      toast.error('Failed to load services');
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search services
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch = 
        service.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        service.category.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || service.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [services, debouncedSearchQuery, statusFilter]);

  const handleEdit = (id: string) => {
    const service = services.find(s => s.id === id);
    if (service) {
      setEditingService(service);
      setModalMode('edit');
      setShowModal(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return;
    }

    try {
      await servicesApi.deleteService(id);
      setServices(services.filter(s => s.id !== id));
      toast.success('Service deleted successfully');
    } catch (error) {
      toast.error('Failed to delete service');
      console.error('Error deleting service:', error);
    }
  };

  const handleToggleStatus = async (id: string) => {
    const service = services.find(s => s.id === id);
    if (!service) return;

    const newStatus = service.status === 'active' ? 'inactive' : 'active';

    try {
      const updated = await servicesApi.updateService(id, { status: newStatus });
      setServices(services.map(s => s.id === id ? updated : s));
      toast.success(`Service ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      toast.error('Failed to update service status');
      console.error('Error toggling service status:', error);
    }
  };

  const handleCreateService = () => {
    setEditingService(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleSubmitService = async (data: Partial<Service>, images: File[]) => {
    try {
      console.log('=== Service Submission ===');
      console.log('Form data:', data);
      console.log('Images to upload:', images.length);
      
      // Upload images first if there are any
      let imageUrls: string[] = [];
      if (images && images.length > 0) {
        console.log('Uploading images...');
        const uploadPromises = images.map(async (image) => {
          try {
            console.log('Uploading image:', image.name);
            const url = await profileApi.uploadPhoto(image);
            console.log('Image uploaded, URL:', url);
            return url;
          } catch (error) {
            console.error('Error uploading image:', error);
            return null;
          }
        });
        
        const uploadedUrls = await Promise.all(uploadPromises);
        imageUrls = uploadedUrls.filter((url): url is string => url !== null && url !== '');
        console.log('All images uploaded:', imageUrls);
      }
      
      // Add uploaded image URLs to service data
      const serviceData = {
        ...data,
        images: imageUrls.length > 0 ? imageUrls : data.images || []
      };
      
      console.log('Final service data:', serviceData);
      
      if (modalMode === 'create') {
        const newService = await servicesApi.createService(serviceData);
        console.log('Service created:', newService);
        setServices([...services, newService]);
        toast.success('Service created successfully');
      } else if (editingService) {
        const updated = await servicesApi.updateService(editingService.id, serviceData);
        setServices(services.map(s => s.id === editingService.id ? updated : s));
        toast.success('Service updated successfully');
      }
      setShowModal(false);
      setEditingService(null);
    } catch (error: any) {
      console.error('Service submission error:', error);
      throw new Error(error.response?.data?.message || 'Failed to save service');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingService(null);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Services</h1>
        <p className="text-gray-600">Manage your service listings and advertisements</p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <label htmlFor="services-search" className="sr-only">Search services</label>
              <input
                id="services-search"
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Search services by title, description, or category"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Status Filter */}
          <div className="w-full lg:w-48">
            <label htmlFor="status-filter" className="sr-only">Filter by status</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Filter services by status"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2" role="group" aria-label="View mode toggle">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${
                viewMode === 'grid'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              aria-label="Grid view"
              aria-pressed={viewMode === 'grid'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${
                viewMode === 'list'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              aria-label="List view"
              aria-pressed={viewMode === 'list'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Create Service Button */}
          <button
            onClick={handleCreateService}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Service
          </button>
        </div>
      </div>

      {/* Services List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || statusFilter !== 'all' ? 'No services found' : 'No services yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Create your first service to start receiving bookings'}
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <button
              onClick={handleCreateService}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Service
            </button>
          )}
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}

      {/* Results Count */}
      {!loading && filteredServices.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-600">
          Showing {filteredServices.length} of {services.length} service{services.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Service Form Modal */}
      <ServiceFormModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmitService}
        service={editingService}
        mode={modalMode}
      />
    </div>
  );
};

export default MyServices;
