// My Services Page — redesigned

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

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await servicesApi.getServices();
      setServices(data);
    } catch {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesSearch =
        s.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [services, debouncedSearchQuery, statusFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: services.length,
    active: services.filter(s => s.status === 'active').length,
    pending: services.filter(s => s.status === 'pending').length,
    totalBookings: services.reduce((sum, s) => sum + (s.bookingCount || 0), 0),
  }), [services]);

  const handleEdit = (id: string) => {
    const service = services.find(s => s.id === id);
    if (service) { setEditingService(service); setModalMode('edit'); setShowModal(true); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this service? This cannot be undone.')) return;
    try {
      await servicesApi.deleteService(id);
      setServices(services.filter(s => s.id !== id));
      toast.success('Service deleted');
    } catch { toast.error('Failed to delete service'); }
  };

  const handleToggleStatus = async (id: string) => {
    const service = services.find(s => s.id === id);
    if (!service) return;
    const newStatus = service.status === 'active' ? 'inactive' : 'active';
    try {
      const updated = await servicesApi.updateService(id, { status: newStatus });
      setServices(services.map(s => s.id === id ? updated : s));
      toast.success(`Service ${newStatus === 'active' ? 'activated' : 'paused'}`);
    } catch { toast.error('Failed to update service'); }
  };

  const handleSubmitService = async (data: Partial<Service>, images: File[]) => {
    try {
      let imageUrls: string[] = [];
      if (images.length > 0) {
        const uploads = await Promise.all(images.map(img => profileApi.uploadPhoto(img).catch(() => null)));
        imageUrls = uploads.filter((u): u is string => !!u);
      }
      const serviceData = { ...data, images: imageUrls.length > 0 ? imageUrls : data.images || [] };

      if (modalMode === 'create') {
        const newService = await servicesApi.createService(serviceData);
        setServices([...services, newService]);
        toast.success('Service created — pending admin approval');
      } else if (editingService) {
        const updated = await servicesApi.updateService(editingService.id, serviceData);
        setServices(services.map(s => s.id === editingService.id ? updated : s));
        toast.success('Service updated');
      }
      setShowModal(false);
      setEditingService(null);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to save service');
    }
  };

  const STATUS_TABS = [
    { value: 'all',      label: 'All',     count: stats.total },
    { value: 'active',   label: 'Active',  count: stats.active },
    { value: 'pending',  label: 'Pending', count: stats.pending },
    { value: 'inactive', label: 'Paused',  count: services.filter(s => s.status === 'inactive').length },
  ] as const;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Services</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your service listings and pricing</p>
        </div>
        <button onClick={() => { setEditingService(null); setModalMode('create'); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Service
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Services', value: stats.total, icon: '📋', color: 'bg-blue-50 text-blue-600' },
          { label: 'Active',         value: stats.active, icon: '✅', color: 'bg-green-50 text-green-600' },
          { label: 'Pending Review', value: stats.pending, icon: '⏳', color: 'bg-amber-50 text-amber-600' },
          { label: 'Total Bookings', value: stats.totalBookings, icon: '📅', color: 'bg-purple-50 text-purple-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-200 p-4">
            <div className={`w-9 h-9 rounded-xl ${stat.color} flex items-center justify-center text-lg mb-2`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Status tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {STATUS_TABS.map(tab => (
            <button key={tab.value} onClick={() => setStatusFilter(tab.value)}
              className={`flex-shrink-0 px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                statusFilter === tab.value
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}>
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                  statusFilter === tab.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Search + view toggle */}
        <div className="p-4 flex gap-3 items-center">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search services..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            <button onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              aria-label="Grid view">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              aria-label="List view">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Services */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            {searchQuery || statusFilter !== 'all' ? 'No services found' : 'No services yet'}
          </h3>
          <p className="text-sm text-gray-500 mb-5">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Create your first service to start receiving bookings'}
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <button onClick={() => { setEditingService(null); setModalMode('create'); setShowModal(true); }}
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
              Create Your First Service
            </button>
          )}
        </div>
      ) : (
        <>
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
            : 'space-y-4'}>
            {filteredServices.map(service => (
              <ServiceCard key={service.id} service={service}
                onEdit={handleEdit} onDelete={handleDelete} onToggleStatus={handleToggleStatus} />
            ))}
          </div>
          <p className="text-center text-sm text-gray-400">
            Showing {filteredServices.length} of {services.length} service{services.length !== 1 ? 's' : ''}
          </p>
        </>
      )}

      <ServiceFormModal isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingService(null); }}
        onSubmit={handleSubmitService}
        service={editingService}
        mode={modalMode} />
    </div>
  );
};

export default MyServices;
