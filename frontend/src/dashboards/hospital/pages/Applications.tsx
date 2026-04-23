import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiFileText, FiCheckCircle, FiXCircle, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axios from 'axios';
import { format } from 'date-fns';

const API_URL = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';

const Applications: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const getHeaders = () => {
    const token = localStorage.getItem('hospitalToken') || localStorage.getItem('authToken');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => { loadApplications(); }, [statusFilter]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/hospitals/applications`, getHeaders());
      const data = res.data?.data || res.data || [];
      const list = Array.isArray(data) ? data : [];
      setApplications(statusFilter ? list.filter((a: any) => (a.status || a.application_status) === statusFilter) : list);
    } catch {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (appId: string) => {
    setActionLoading(appId);
    try {
      await axios.put(`${API_URL}/hospitals/applications/${appId}/accept`, {}, getHeaders());
      toast.success('Application accepted!');
      setApplications(prev => prev.map(a =>
        (a._id || a.id || a.application_id) === appId ? { ...a, status: 'accepted', application_status: 'accepted' } : a
      ));
    } catch {
      toast.error('Failed to accept application');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (appId: string) => {
    setActionLoading(appId);
    try {
      await axios.put(`${API_URL}/hospitals/applications/${appId}/reject`, {}, getHeaders());
      toast.success('Application rejected');
      setApplications(prev => prev.map(a =>
        (a._id || a.id || a.application_id) === appId ? { ...a, status: 'rejected', application_status: 'rejected' } : a
      ));
    } catch {
      toast.error('Failed to reject application');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      shortlisted: 'bg-purple-100 text-purple-800',
      offered: 'bg-indigo-100 text-indigo-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      withdrawn: 'bg-gray-100 text-gray-800',
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Job Applications</h2>
          <p className="mt-1 text-sm text-gray-500">Review applications from health professionals</p>
        </div>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          {applications.length} total
        </span>
      </div>

      {/* Filter */}
      <div className="bg-white shadow rounded-lg p-4 flex items-center gap-3">
        <FiFilter className="h-5 w-5 text-gray-400" />
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); }}
          className="block w-full max-w-xs pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="offered">Offered</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center h-48 items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <FiFileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-sm font-medium text-gray-900">No applications yet</h3>
          <p className="mt-1 text-sm text-gray-500">Applications will appear here when professionals apply to your vacancies.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <ul className="divide-y divide-gray-200">
            {applications.map((app: any) => {
              const id = app._id || app.id || app.application_id;
              const status = app.status || app.application_status || 'pending';
              const profName = app.professional?.user?.firstName
                ? `${app.professional.user.firstName} ${app.professional.user.lastName}`
                : app.professional_name || 'Professional';
              const profType = app.professional?.professionalType || app.professional_type || '';
              const jobTitle = app.job?.jobTitle || app.job?.job_title || app.vacancy_title || 'N/A';
              const appliedAt = app.createdAt || app.applied_at;
              const coverLetter = app.coverLetter || app.cover_letter || '';
              const isLoading = actionLoading === id;

              return (
                <li key={id} className="px-6 py-5 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <FiUser className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <p className="text-base font-semibold text-gray-900">{profName}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(status)}`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Applied for: <span className="font-medium text-blue-600">{jobTitle}</span>
                          {profType && <> &bull; <span className="capitalize">{profType}</span></>}
                        </p>
                        {appliedAt && (
                          <p className="text-xs text-gray-400 mt-1">
                            Applied {format(new Date(appliedAt), 'MMM d, yyyy')}
                          </p>
                        )}
                        {coverLetter && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2 italic">"{coverLetter}"</p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {status === 'pending' && (
                      <div className="flex gap-2 ml-4 flex-shrink-0">
                        <button onClick={() => handleAccept(id)} disabled={isLoading}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50">
                          <FiCheckCircle className="h-4 w-4" />
                          {isLoading ? '...' : 'Accept'}
                        </button>
                        <button onClick={() => handleReject(id)} disabled={isLoading}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50">
                          <FiXCircle className="h-4 w-4" />
                          Reject
                        </button>
                      </div>
                    )}
                    {status === 'accepted' && (
                      <span className="ml-4 flex items-center gap-1 text-green-600 text-sm font-medium">
                        <FiCheckCircle className="h-4 w-4" /> Accepted
                      </span>
                    )}
                    {status === 'rejected' && (
                      <span className="ml-4 flex items-center gap-1 text-red-600 text-sm font-medium">
                        <FiXCircle className="h-4 w-4" /> Rejected
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Applications;
