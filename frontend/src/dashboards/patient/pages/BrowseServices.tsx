import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout, ServiceCard } from '../components';
import { servicesApi } from '../services/api';
import { ServiceProvider, FilterOptions } from '../types';

type ViewMode = 'grid' | 'list';

const BrowseServices: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [services, setServices] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const pageSize = 12;
  
  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    type: [],
    specialty: [],
    location: '',
    minRating: 0,
    availability: false,
  });

  // Available filter options - only healthcare professionals (no gym-physio)
  const serviceTypes = ['doctor', 'hospital', 'ambulance'];
  const specialties = [
    'General Practice',
    'Cardiology',
    'Dermatology',
    'Pediatrics',
    'Orthopedics',
    'Neurology',
    'Psychiatry',
    'Gynecology',
    'Ophthalmology',
    'Dentistry',
    'Emergency Medicine',
    'Surgery',
    'Radiology',
    'Anesthesiology',
  ];

  // Fetch services with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchServices();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, filters, currentPage]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: currentPage,
        pageSize,
        search: searchQuery || undefined,
        type: filters.type.length > 0 ? filters.type.join(',') : undefined,
        specialty: filters.specialty.length > 0 ? filters.specialty.join(',') : undefined,
        location: filters.location || undefined,
        minRating: filters.minRating > 0 ? filters.minRating : undefined,
        availability: filters.availability || undefined,
      };

      const response = await servicesApi.getServices(params);
      const resData = response.data?.data ?? response.data ?? {};
      setServices(Array.isArray(resData.data) ? resData.data : Array.isArray(resData) ? resData : []);
      setTotalPages(resData.totalPages || 1);
      setTotalResults(resData.total || 0);
    } catch (err: any) {
      console.error('Error fetching services:', err);
      setError('Failed to load services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setCurrentPage(1);
    
    // Update URL params
    if (value) {
      searchParams.set('search', value);
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  const handleFilterChange = (filterType: keyof FilterOptions, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
    setCurrentPage(1);
  };

  const handleTypeToggle = (type: string) => {
    setFilters((prev) => ({
      ...prev,
      type: prev.type.includes(type)
        ? prev.type.filter((t) => t !== type)
        : [...prev.type, type],
    }));
    setCurrentPage(1);
  };

  const handleSpecialtyToggle = (specialty: string) => {
    setFilters((prev) => ({
      ...prev,
      specialty: prev.specialty.includes(specialty)
        ? prev.specialty.filter((s) => s !== specialty)
        : [...prev.specialty, specialty],
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      type: [],
      specialty: [],
      location: '',
      minRating: 0,
      availability: false,
    });
    setSearchQuery('');
    setCurrentPage(1);
    searchParams.delete('search');
    setSearchParams(searchParams);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookService = (serviceId: string) => {
    navigate(`/patient/book-consultation?providerId=${serviceId}`);
  };

  const handleViewDetails = (serviceId: string) => {
    navigate(`/patient/services/${serviceId}`);
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Browse Healthcare Professionals</h1>
        </div>
        <p className="text-sm sm:text-base text-gray-600 mt-2">
          Find doctors, hospitals, and emergency services for your healthcare needs
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-4 sm:mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by name, specialty, or location..."
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pl-10 sm:pl-12 pr-3 sm:pr-4 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
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

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex items-center flex-wrap gap-2 sm:gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span className="text-sm font-medium text-gray-700">Filters</span>
          </button>

          {(filters.type.length > 0 ||
            filters.specialty.length > 0 ||
            filters.location ||
            filters.minRating > 0 ||
            filters.availability) && (
            <button
              onClick={clearFilters}
              className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all
            </button>
          )}

          <span className="text-xs sm:text-sm text-gray-600">
            {totalResults} {totalResults === 1 ? 'result' : 'results'}
          </span>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 sm:gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 sm:p-2 rounded ${
              viewMode === 'grid'
                ? 'bg-white shadow-sm text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            aria-label="Grid view"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            className={`p-1.5 sm:p-2 rounded ${
              viewMode === 'list'
                ? 'bg-white shadow-sm text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            aria-label="List view"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filter Sidebar - desktop side panel, mobile full overlay */}
        {showFilters && (
          <>
            {/* Mobile overlay backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden" onClick={() => setShowFilters(false)} />
            <div className={`
              fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl overflow-y-auto
              lg:static lg:z-auto lg:w-64 lg:flex-shrink-0 lg:shadow-none
            `}>
              <div className="bg-white rounded-xl shadow-md p-6 lg:sticky lg:top-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                  <button onClick={() => setShowFilters(false)} className="lg:hidden text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                </div>

              {/* Service Type Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Service Type</h4>
                <div className="space-y-2">
                  {serviceTypes.map((type) => (
                    <label key={type} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.type.includes(type)}
                        onChange={() => handleTypeToggle(type)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">
                        {type}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Specialty Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Specialty</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {specialties.map((specialty) => (
                    <label key={specialty} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.specialty.includes(specialty)}
                        onChange={() => handleSpecialtyToggle(specialty)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{specialty}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Location Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Location</h4>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  placeholder="Enter location..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Minimum Rating</h4>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <label key={rating} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="rating"
                        checked={filters.minRating === rating}
                        onChange={() => handleFilterChange('minRating', rating)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 flex items-center text-sm text-gray-700">
                        {rating}
                        <svg
                          className="w-4 h-4 text-yellow-400 ml-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        & up
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Availability Filter */}
              <div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.availability}
                    onChange={(e) => handleFilterChange('availability', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Available Now</span>
                </label>
              </div>
            </div>
            </div>
          </>
        )}

        {/* Main Content */}
        <div className="flex-1">
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : services.length === 0 ? (
            /* Empty State */
            <div className="text-center py-20">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
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
              <p className="text-gray-500 text-lg font-medium">No services found</p>
              <p className="text-gray-400 text-sm mt-2">
                Try adjusting your search or filters
              </p>
              {(searchQuery || filters.type.length > 0 || filters.specialty.length > 0) && (
                <button
                  onClick={clearFilters}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Services Grid/List */}
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6'
                    : 'space-y-3 sm:space-y-4'
                }
              >
                {services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    provider={service}
                    viewMode={viewMode}
                    onBook={handleBookService}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 sm:mt-8 flex items-center justify-center gap-1 sm:gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">Prev</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        // Show first page, last page, current page, and pages around current
                        return (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        );
                      })
                      .map((page, index, array) => {
                        // Add ellipsis if there's a gap
                        const showEllipsisBefore = index > 0 && page - array[index - 1] > 1;

                        return (
                          <React.Fragment key={page}>
                            {showEllipsisBefore && (
                              <span className="px-1 sm:px-2 text-gray-500 text-sm">...</span>
                            )}
                            <button
                              onClick={() => handlePageChange(page)}
                              className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm ${
                                currentPage === page
                                  ? 'bg-blue-600 text-white'
                                  : 'border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        );
                      })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BrowseServices;
