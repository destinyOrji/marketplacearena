/**
 * Vacancies List Page
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch, FiFilter, FiEye, FiEdit, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { hospitalApi } from '../services/api';
import type { Vacancy, PaginationMeta } from '../types';
import { format } from 'date-fns';

const Vacancies: React.FC = () => {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const loadVacancies = async () => {
    try {
      setLoading(true);
      const data = await hospitalApi.listVacancies({
        status: statusFilter || undefined,
        search: searchTerm || undefined,
        page: currentPage,
        page_size: 10,
      });
      setVacancies(data.vacancies);
      setPagination(data.pagination);
    } catch (error: any) {
      toast.error('Failed to load vacancies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVacancies();
  }, [statusFilter, currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadVacancies();
  };

  const handleDelete = async (vacancyId: number) => {
    if (!window.confirm('Are you sure you want to close this vacancy?')) return;

    try {
      await hospitalApi.deleteVacancy(vacancyId);
      toast.success('Vacancy closed successfully');
      loadVacancies();
    } catch (error: any) {
      toast.error('Failed to close vacancy');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      closed: 'bg-red-100 text-red-800',
      filled: 'bg-blue-100 text-blue-800',
    };
    return styles[status as keyof typeof styles] || styles.draft;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Job Vacancies</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your job postings and track applications
          </p>
        </div>
        <Link
          to="/hospital/vacancies/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <FiPlus className="mr-2 h-4 w-4" />
          Post New Vacancy
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search vacancies..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </form>

          <div className="flex items-center space-x-2">
            <FiFilter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="closed">Closed</option>
              <option value="filled">Filled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vacancies List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : vacancies.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <h3 className="mt-2 text-sm font-medium text-gray-900">No vacancies</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new job vacancy.
          </p>
          <div className="mt-6">
            <Link
              to="/hospital/vacancies/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <FiPlus className="mr-2 h-4 w-4" />
              Post New Vacancy
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {vacancies.map((vacancy) => (
                <li key={vacancy.vacancy_id} className="hover:bg-gray-50">
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <Link
                            to={`/hospital/vacancies/${vacancy.vacancy_id}`}
                            className="text-lg font-medium text-blue-600 hover:text-blue-800 truncate"
                          >
                            {vacancy.job_title}
                          </Link>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                              vacancy.status
                            )}`}
                          >
                            {vacancy.status}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                          <span>{vacancy.department}</span>
                          <span>•</span>
                          <span>{vacancy.employment_type.replace('_', ' ')}</span>
                          <span>•</span>
                          <span>{vacancy.experience_level} level</span>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                          <span className="flex items-center">
                            <FiEye className="mr-1 h-4 w-4" />
                            {vacancy.views_count} views
                          </span>
                          <span>•</span>
                          <span>{vacancy.applications_count} applications</span>
                          <span>•</span>
                          <span>
                            Deadline: {format(new Date(vacancy.application_deadline), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 flex items-center space-x-2">
                        <Link
                          to={`/hospital/vacancies/${vacancy.vacancy_id}`}
                          className="p-2 text-gray-400 hover:text-blue-600"
                          title="View Details"
                        >
                          <FiEye className="h-5 w-5" />
                        </Link>
                        <Link
                          to={`/hospital/vacancies/${vacancy.vacancy_id}/edit`}
                          className="p-2 text-gray-400 hover:text-blue-600"
                          title="Edit"
                        >
                          <FiEdit className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(vacancy.vacancy_id)}
                          className="p-2 text-gray-400 hover:text-red-600"
                          title="Close Vacancy"
                        >
                          <FiTrash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Pagination */}
          {pagination && pagination.total_pages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === pagination.total_pages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{pagination.total_pages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === pagination.total_pages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Vacancies;
