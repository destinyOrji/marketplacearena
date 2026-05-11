import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiFileText, FiCheckCircle, FiXCircle, FiSearch } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axios from 'axios';
import { format, formatDistanceToNow } from 'date-fns';

const API_URL = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'offered', label: 'Offered' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
];

const STATUS_STYLES: Record<string, { badge: string; dot: string }> = {
  pending:     { badge: 'bg-amber-100 text-amber-700 border-amber-200',     dot: 'bg-amber-400' },
  reviewed:    { badge: 'bg-blue-100 text-blue-700 border-blue-200',        dot: 'bg-blue-400' },
  shortlisted: { badge: 'bg-purple-100 text-purple-700 border-purple-200',  dot: 'bg-purple-400' },
  offered:     { badge: 'bg-indigo-100 text-indigo-700 border-indigo-200',  dot: 'bg-indigo-400' },
  accepted:    { badge: 'bg-green-100 text-green-700 border-green-200',     dot: 'bg-green-400' },
  rejected:    { badge: 'bg-red-100 text-red-700 border-red-200',           dot: 'bg-red-400' },
  withdrawn:   { badge: 'bg-gray-100 text-gray-600 border-gray-200',        dot: 'bg-gray-400' },
};

const Applications: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
      setApplications(statusFilter
        ? list.filter((a: any) => (a.status || a.application_status) === statusFilter)
        : list);
    } catch {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (appId: string) => {
    setActionLoading(appId + '_accept');
    try {
      await axios.put(`${API_URL}/hospitals/applications/${appId}/accept`, {}, getHeaders());
      toast.success('Application accepted!');
      setApplications(prev => prev.map(a =>
        (a._id || a.id) === appId ? { ...a, status: 'accepted' } : a
      ));
    } catch {
      toast.error('Failed to accept application');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (appId: string) => {
    setActionLoading(appId + '_reject');
    try {
      await axios.put(`${API_URL}/hospitals/applications/${appId}/reject`, {}, getHeaders());
      toast.success('Application rejected');
      setApplications(prev => prev.map(a =>
        (a._id || a.id) === appId ? { ...a, status: 'rejected' } : a
      ));
    } catch {
      toast.error('Failed to reject application');
    } finally {
      setActionLoading(null);
    }
  };

  // Counts per status
  const counts = STATUS_TABS.reduce((acc, tab) => {
    acc[tab.value] = tab.value === ''
      ? applications.length
      : applications.filter(a => (a.status || a.application_status) === tab.value).length;
    return acc;
  }, {} as Record<string, number>);

  // Search filter
  const filtered = applications.filter(app => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name = app.professional?.user?.firstName
      ? `${app.professional.user.firstName} ${app.professional.user.lastName}`.toLowerCase()
      : (app.professional_name || '').toLowerCase();
    const job = (app.job?.jobTitle || app.job?.job_title || '').toLowerCase();
    return name.includes(q) || job.includes(q);
  });

  const getInitials = (name: string) =>
    name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Applications</h1>
          <p className="text-sm text-gray-500 mt-0.5">Review and manage applications from health professionals</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-full">
            {applications.length} total
          </span>
          {counts['pending'] > 0 && (
            <span className="px-3 py-1.5 bg-amber-100 text-amber-700 text-sm font-semibold rounded-full border border-amber-200">
              {counts['pending']} pending
            </span>
          )}
        </div>
      </div>

      {/* Status tabs + Search */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-gray-200 scrollbar-hide">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                statusFilter === tab.value
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              {counts[tab.value] > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                  statusFilter === tab.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {counts[tab.value]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by applicant name or job title..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiFileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              {search ? 'No matching applications' : 'No applications yet'}
            </h3>
            <p className="text-sm text-gray-500">
              {search
                ? 'Try a different search term'
                : 'Applications will appear here when professionals apply to your vacancies.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((app: any) => {
              const id = app._id || app.id || app.application_id;
              const status = app.status || app.application_status || 'pending';
              const style = STATUS_STYLES[status] || STATUS_STYLES.withdrawn;
              const profName = app.professional?.user?.firstName
                ? `${app.professional.user.firstName} ${app.professional.user.lastName}`
                : app.professional_name || 'Professional';
              const profType = app.professional?.professionalType || app.professional_type || '';
              const profEmail = app.professional?.user?.email || '';
              const jobTitle = app.job?.jobTitle || app.job?.job_title || app.vacancy_title || 'N/A';
              const jobDept = app.job?.department || '';
              const appliedAt = app.createdAt || app.applied_at;
              const coverLetter = app.coverLetter || app.cover_letter || '';
              const isExpanded = expandedId === id;
              const isAccepting = actionLoading === id + '_accept';
              const isRejecting = actionLoading === id + '_reject';
              const isBusy = isAccepting || isRejecting;

              return (
                <div key={id} className="hover:bg-gray-50 transition-colors">
                  <div className="px-5 py-4">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-white text-sm font-bold">{getInitials(profName)}</span>
                      </div>

                      {/* Main content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-base font-bold text-gray-900">{profName}</p>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border capitalize ${style.badge}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                                {status}
                              </span>
                            </div>
                            {profType && (
                              <p className="text-xs text-gray-500 mt-0.5 capitalize">{profType}</p>
                            )}
                            {profEmail && (
                              <p className="text-xs text-gray-400">{profEmail}</p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleAccept(id)}
                                  disabled={isBusy}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm"
                                >
                                  {isAccepting ? (
                                    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                  ) : (
                                    <FiCheckCircle className="w-3.5 h-3.5" />
                                  )}
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleReject(id)}
                                  disabled={isBusy}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-red-600 text-xs font-semibold rounded-lg hover:bg-red-50 border border-red-200 disabled:opacity-50 transition-colors"
                                >
                                  {isRejecting ? (
                                    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                  ) : (
                                    <FiXCircle className="w-3.5 h-3.5" />
                                  )}
                                  Reject
                                </button>
                              </>
                            )}
                            {status === 'accepted' && (
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded-lg border border-green-200">
                                <FiCheckCircle className="w-3.5 h-3.5" /> Accepted
                              </span>
                            )}
                            {status === 'rejected' && (
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg border border-red-200">
                                <FiXCircle className="w-3.5 h-3.5" /> Rejected
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Job info row */}
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="font-medium text-blue-600">{jobTitle}</span>
                            {jobDept && <span className="text-gray-400">· {jobDept}</span>}
                          </div>
                          {appliedAt && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {formatDistanceToNow(new Date(appliedAt), { addSuffix: true })}
                              <span className="text-gray-300">·</span>
                              {format(new Date(appliedAt), 'MMM d, yyyy')}
                            </span>
                          )}
                        </div>

                        {/* Cover letter preview */}
                        {coverLetter && (
                          <div className="mt-3">
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : id)}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                            >
                              <svg className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              {isExpanded ? 'Hide' : 'View'} cover letter
                            </button>
                            {isExpanded && (
                              <div className="mt-2 p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-700 leading-relaxed italic">
                                "{coverLetter}"
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer count */}
      {!loading && filtered.length > 0 && (
        <p className="text-center text-sm text-gray-400">
          Showing {filtered.length} of {applications.length} application{applications.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
};

export default Applications;
