/**
 * Vacancies List Page — Table Layout
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch, FiFilter, FiEye, FiEdit, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
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
      const res = await hospitalApi.listVacancies({
        status: statusFilter || undefined,
        search: searchTerm || undefined,
        page: currentPage,
        page_size: 10,
      });
      const data = (res as any)?.data || res;
      const list = data?.vacancies || data?.data || (Array.isArray(data) ? data : []);
      const pag = data?.pagination || null;
      setVacancies(list);
      setPagination(pag);
    } catch {
      toast.error('Failed to load vacancies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadVacancies(); }, [statusFilter, currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadVacancies();
  };

  const handleDelete = async (vacancyId: any) => {
    if (!window.confirm('Are you sure you want to delete this vacancy?')) return;
    try {
      await hospitalApi.deleteVacancy(vacancyId);
      toast.success('Vacancy deleted');
      loadVacancies();
    } catch {
      toast.error('Failed to delete vacancy');
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      active: 'bg-green-100 text-green-700',
      paused: 'bg-yellow-100 text-yellow-700',
      closed: 'bg-red-100 text-red-700',
      filled: 'bg-blue-100 text-blue-700',
    };
    return map[status] || map.draft;
  };

  const totalPages = pagination?.total_pages ?? 1;
  const totalCount = (pagination as any)?.total ?? pagination?.total_count ?? vacancies.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Job Vacancies</h2>
          <p className="mt-1 text-sm text-gray-500">Manage your job postings and track applications</p>
        </div>
        <Link
          to="/hospital/vacancies/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
        >
          <FiPlus className="mr-2 h-4 w-4" />
          Post New Vacancy
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title or department..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button type="submit"
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
              Search
            </button>
          </form>
          <div className="flex items-center gap-2">
            <FiFilter className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="border border-gray-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      ) : vacancies.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-sm font-medium text-gray-900 mb-1">No vacancies found</h3>
          <p className="text-sm text-gray-500 mb-4">Get started by posting your first job vacancy.</p>
          <Link to="/hospital/vacancies/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
            <FiPlus className="mr-2 h-4 w-4" /> Post New Vacancy
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Summary row */}
          <div className="px-6 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {totalCount} vacanc{totalCount !== 1 ? 'ies' : 'y'} found
            </p>
          </div>

          {/* Scrollable table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Job Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Applications
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {vacancies.map((vacancy: any) => {
                  const id = vacancy._id || vacancy.vacancy_id;
                  const title = vacancy.jobTitle || vacancy.job_title || 'Untitled';
                  const dept = vacancy.department || '—';
                  const empType = (vacancy.employmentType || vacancy.employment_type || '').replace(/_/g, ' ');
                  const expLevel = vacancy.experienceLevel || vacancy.experience_level || '—';
                  const apps = vacancy.applicationsCount || vacancy.applications_count || 0;
                  const deadline = vacancy.applicationDeadline || vacancy.application_deadline;
                  const status = vacancy.status || 'draft';

                  return (
                    <tr key={id} className="hover:bg-gray-50 transition-colors">
                      {/* Title */}
                      <td className="px-6 py-4">
                        <Link
                          to={`/hospital/vacancies/${id}`}
                          className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {title}
                        </Link>
                        {vacancy.numberOfPositions > 1 && (
                          <p className="text-xs text-gray-400 mt-0.5">{vacancy.numberOfPositions} positions</p>
                        )}
                      </td>

                      {/* Department */}
                      <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                        {dept}
                      </td>

                      {/* Employment Type */}
                      <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap capitalize">
                        {empType || '—'}
                      </td>

                      {/* Experience Level */}
                      <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap capitalize">
                        {expLevel}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadge(status)}`}>
                          {status}
                        </span>
                      </td>

                      {/* Applications */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/hospital/applications?vacancy=${id}`}
                          className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          {apps}
                          <span className="text-gray-400 text-xs">applicant{apps !== 1 ? 's' : ''}</span>
                        </Link>
                      </td>

                      {/* Deadline */}
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {deadline
                          ? (() => {
                              const d = new Date(deadline);
                              const isPast = d < new Date();
                              return (
                                <span className={isPast ? 'text-red-500' : ''}>
                                  {format(d, 'MMM d, yyyy')}
                                  {isPast && <span className="ml-1 text-xs">(expired)</span>}
                                </span>
                              );
                            })()
                          : <span className="text-gray-400">—</span>
                        }
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/hospital/vacancies/${id}`}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="View"
                          >
                            <FiEye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/hospital/vacancies/${id}/edit`}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Edit"
                          >
                            <FiEdit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Page <span className="font-medium">{currentPage}</span> of{' '}
                <span className="font-medium">{totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <FiChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .map((page, idx, arr) => (
                    <React.Fragment key={page}>
                      {idx > 0 && page - arr[idx - 1] > 1 && (
                        <span className="text-gray-400 text-sm">…</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <FiChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Vacancies;
