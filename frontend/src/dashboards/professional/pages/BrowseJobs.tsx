// Browse Jobs Page - View and search job postings

import React, { useState, useEffect } from 'react';
import { JobPosting } from '../types';
import { jobsApi } from '../services/api';
import JobCard from '../components/JobCard';
import JobDetailsModal from '../components/JobDetailsModal';
import JobApplicationModal from '../components/JobApplicationModal';
import { toast } from 'react-toastify';
import { useDebounce } from '../utils/hooks';

const BrowseJobs: React.FC = () => {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [filters, setFilters] = useState({
    specialty: '',
    location: '',
    jobType: '',
    dateRange: '',
  });
  const [sortBy, setSortBy] = useState<'date' | 'compensation' | 'relevance'>('date');
  const jobsPerPage = 20;
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await jobsApi.getJobs();
      setJobs(data);
    } catch (error) {
      toast.error('Failed to load jobs');
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (id: string) => {
    const job = jobs.find((j) => j.id === id);
    if (job) {
      setSelectedJob(job);
      setShowApplicationModal(true);
    }
  };

  const handleViewDetails = (id: string) => {
    const job = jobs.find((j) => j.id === id);
    if (job) {
      setSelectedJob(job);
      setShowDetailsModal(true);
    }
  };

  const handleSubmitApplication = async (data: { coverLetter: string; attachments: File[] }) => {
    if (!selectedJob) return;

    try {
      await jobsApi.applyForJob(selectedJob.id, {
        coverLetter: data.coverLetter,
        attachments: data.attachments,
      });
      
      // Update job status to applied
      setJobs(jobs.map((job) =>
        job.id === selectedJob.id ? { ...job, hasApplied: true } : job
      ));
      
      toast.success('Application submitted successfully!');
      setShowApplicationModal(false);
      setSelectedJob(null);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to submit application');
    }
  };

  const handleApplyFromDetails = () => {
    setShowDetailsModal(false);
    setShowApplicationModal(true);
  };

  // Filter and search jobs
  const filteredJobs = React.useMemo(() => {
    let result = [...jobs];

    // Search filter
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      result = result.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.description.toLowerCase().includes(query) ||
          job.specialty.toLowerCase().includes(query) ||
          job.location.toLowerCase().includes(query)
      );
    }

    // Specialty filter
    if (filters.specialty) {
      result = result.filter((job) => job.specialty === filters.specialty);
    }

    // Location filter
    if (filters.location) {
      result = result.filter((job) =>
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Job type filter
    if (filters.jobType) {
      result = result.filter((job) => job.jobType === filters.jobType);
    }

    // Date range filter
    if (filters.dateRange) {
      const now = new Date();
      const daysAgo = parseInt(filters.dateRange);
      const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      result = result.filter((job) => new Date(job.postedDate) >= cutoffDate);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
        case 'compensation':
          const aComp = a.compensation.amount || 0;
          const bComp = b.compensation.amount || 0;
          return bComp - aComp;
        case 'relevance':
          // Simple relevance: prioritize jobs not applied to
          if (a.hasApplied !== b.hasApplied) {
            return a.hasApplied ? 1 : -1;
          }
          return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [jobs, debouncedSearchQuery, filters, sortBy]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const clearFilters = () => {
    setFilters({
      specialty: '',
      location: '',
      jobType: '',
      dateRange: '',
    });
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Get unique specialties and locations for filter options
  const specialties = Array.from(new Set(jobs.map((job) => job.specialty)));
  const locations = Array.from(new Set(jobs.map((job) => job.location)));

  // Pagination
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Browse Jobs</h1>
        <p className="text-gray-600">Find and apply for job opportunities that match your expertise</p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        {/* Search and Sort */}
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <label htmlFor="jobs-search" className="sr-only">Search jobs</label>
              <input
                id="jobs-search"
                type="text"
                placeholder="Search jobs by title, description, specialty, or location..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Search jobs by title, description, specialty, or location"
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

          {/* Sort */}
          <div className="w-full lg:w-48">
            <label htmlFor="jobs-sort" className="sr-only">Sort jobs</label>
            <select
              id="jobs-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Sort jobs by date, compensation, or relevance"
            >
              <option value="date">Sort by Date</option>
              <option value="compensation">Sort by Compensation</option>
              <option value="relevance">Sort by Relevance</option>
            </select>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Specialty Filter */}
          <select
            value={filters.specialty}
            onChange={(e) => handleFilterChange('specialty', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Specialties</option>
            {specialties.map((specialty) => (
              <option key={specialty} value={specialty}>
                {specialty}
              </option>
            ))}
          </select>

          {/* Location Filter */}
          <select
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Locations</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>

          {/* Job Type Filter */}
          <select
            value={filters.jobType}
            onChange={(e) => handleFilterChange('jobType', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Job Types</option>
            <option value="full-time">Full-Time</option>
            <option value="part-time">Part-Time</option>
            <option value="contract">Contract</option>
            <option value="per-diem">Per Diem</option>
          </select>

          {/* Date Range Filter */}
          <select
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Time</option>
            <option value="7">Last 7 days</option>
            <option value="14">Last 14 days</option>
            <option value="30">Last 30 days</option>
          </select>
        </div>

        {/* Filter Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="text-sm text-gray-600">
            {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
            {(searchQuery || Object.values(filters).some((v) => v)) && (
              <button
                onClick={clearFilters}
                className="ml-3 text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear filters
              </button>
            )}
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
        </div>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredJobs.length === 0 ? (
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
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || Object.values(filters).some((v) => v)
              ? 'No jobs match your criteria'
              : 'No jobs available'}
          </h3>
          <p className="text-gray-600">
            {searchQuery || Object.values(filters).some((v) => v)
              ? 'Try adjusting your search or filters'
              : 'Check back later for new opportunities'}
          </p>
        </div>
      ) : (
        <>
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {currentJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onApply={handleApply}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-wrap justify-center items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Previous
              </button>
              
              <div className="flex flex-wrap gap-1 justify-center">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1))
                  .map((page, idx, arr) => (
                    <React.Fragment key={page}>
                      {idx > 0 && page - arr[idx - 1] > 1 && <span className="px-2 py-2 text-gray-400">…</span>}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 sm:px-4 py-2 rounded-lg text-sm ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Job Details Modal */}
      <JobDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedJob(null);
        }}
        onApply={handleApplyFromDetails}
        job={selectedJob}
      />

      {/* Job Application Modal */}
      <JobApplicationModal
        isOpen={showApplicationModal}
        onClose={() => {
          setShowApplicationModal(false);
          setSelectedJob(null);
        }}
        onSubmit={handleSubmitApplication}
        job={selectedJob}
      />
    </div>
  );
};

export default BrowseJobs;
