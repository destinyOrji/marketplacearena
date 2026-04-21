// My Applications Page - Track job applications

import React, { useState, useEffect } from 'react';
import { JobApplication } from '../types';
import { jobsApi } from '../services/api';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';

const MyApplications: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewing' | 'shortlisted' | 'offered' | 'accepted' | 'rejected'>('all');
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [declineReason, setDeclineReason] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await jobsApi.getApplications();
      setApplications(data);
    } catch (error) {
      toast.error('Failed to load applications');
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter((app) =>
    statusFilter === 'all' || app.status === statusFilter
  );

  const handleAcceptOffer = async (applicationId: string) => {
    if (!window.confirm('Are you sure you want to accept this offer? This action cannot be undone.')) {
      return;
    }

    try {
      const updated = await jobsApi.acceptOffer(applicationId);
      setApplications(applications.map((app) =>
        app.id === applicationId ? updated : app
      ));
      toast.success('Offer accepted successfully! The job has been added to your active appointments.');
    } catch (error) {
      toast.error('Failed to accept offer');
      console.error('Error accepting offer:', error);
    }
  };

  const handleDeclineOffer = (application: JobApplication) => {
    setSelectedApplication(application);
    setShowDeclineModal(true);
  };

  const handleSubmitDecline = async () => {
    if (!selectedApplication) return;

    try {
      const updated = await jobsApi.declineOffer(selectedApplication.id, declineReason);
      setApplications(applications.map((app) =>
        app.id === selectedApplication.id ? updated : app
      ));
      toast.success('Offer declined');
      setShowDeclineModal(false);
      setSelectedApplication(null);
      setDeclineReason('');
    } catch (error) {
      toast.error('Failed to decline offer');
      console.error('Error declining offer:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewing':
        return 'bg-blue-100 text-blue-800';
      case 'shortlisted':
        return 'bg-purple-100 text-purple-800';
      case 'offered':
        return 'bg-green-100 text-green-800';
      case 'accepted':
        return 'bg-green-200 text-green-900';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'reviewing':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        );
      case 'shortlisted':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        );
      case 'offered':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'accepted':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'rejected':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Count applications by status
  const statusCounts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    reviewing: applications.filter((a) => a.status === 'reviewing').length,
    shortlisted: applications.filter((a) => a.status === 'shortlisted').length,
    offered: applications.filter((a) => a.status === 'offered').length,
    accepted: applications.filter((a) => a.status === 'accepted').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Applications</h1>
        <p className="text-gray-600">Track your job applications and manage offers</p>
      </div>

      {/* Status Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex overflow-x-auto">
          {[
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'reviewing', label: 'Reviewing' },
            { key: 'shortlisted', label: 'Shortlisted' },
            { key: 'offered', label: 'Offered' },
            { key: 'accepted', label: 'Accepted' },
            { key: 'rejected', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key as any)}
              className={`flex-1 min-w-[120px] px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                statusFilter === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              {tab.label}
              <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs">
                {statusCounts[tab.key as keyof typeof statusCounts]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredApplications.length === 0 ? (
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {statusFilter === 'all' ? 'No applications yet' : `No ${statusFilter} applications`}
          </h3>
          <p className="text-gray-600">
            {statusFilter === 'all'
              ? 'Start applying to jobs to see your applications here'
              : 'Applications with this status will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <div
              key={application.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {application.job.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{application.job.location}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                      {application.job.specialty}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                      {application.job.jobType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                    {getStatusIcon(application.status)}
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Application Timeline */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-600">
                    Applied {formatDistanceToNow(new Date(application.appliedDate), { addSuffix: true })}
                  </div>
                  {application.offer && (
                    <div className="text-gray-600">
                      Offer expires: {new Date(application.offer.responseDeadline).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Offer Details (if offered) */}
              {application.offer && application.status === 'offered' && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-green-900 mb-1">Job Offer Received!</h4>
                      <p className="text-sm text-green-700">
                        Compensation: ${application.offer.finalCompensation.toLocaleString()}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Respond by {new Date(application.offer.responseDeadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptOffer(application.id)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Accept Offer
                    </button>
                    <button
                      onClick={() => handleDeclineOffer(application)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              )}

              {/* Cover Letter Preview */}
              {application.coverLetter && (
                <div className="mt-4">
                  <button
                    onClick={() => {
                      // Toggle cover letter visibility
                      console.log('View cover letter');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View Cover Letter
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Decline Offer Modal */}
      {showDeclineModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Decline Job Offer</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to decline the offer for {selectedApplication.job.title}?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason (Optional)
              </label>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Let the employer know why you're declining..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeclineModal(false);
                  setSelectedApplication(null);
                  setDeclineReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitDecline}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Decline Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyApplications;
