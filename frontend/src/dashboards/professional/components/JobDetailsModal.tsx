// Job Details Modal - View complete job information

import React from 'react';
import { JobPosting } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface JobDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  job: JobPosting | null;
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  isOpen,
  onClose,
  onApply,
  job,
}) => {
  if (!isOpen || !job) return null;

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case 'full-time':
        return 'bg-blue-100 text-blue-800';
      case 'part-time':
        return 'bg-green-100 text-green-800';
      case 'contract':
        return 'bg-purple-100 text-purple-800';
      case 'per-diem':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCompensation = () => {
    if (job.compensation.type === 'negotiable') {
      return 'Negotiable';
    }
    if (job.compensation.amount) {
      return `$${job.compensation.amount.toLocaleString()}${
        job.compensation.type === 'hourly' ? '/hr' : ''
      }`;
    }
    return 'Not specified';
  };

  const daysUntilDeadline = Math.ceil(
    (new Date(job.applicationDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Job Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h3>
                <p className="text-gray-600">{job.location}</p>
              </div>
              {job.hasApplied && (
                <span className="px-4 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  Applied
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getJobTypeColor(job.jobType)}`}>
                {job.jobType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                {job.specialty}
              </span>
            </div>
          </div>

          {/* Key Information */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600 mb-1">Compensation</p>
              <p className="font-semibold text-gray-900">{formatCompensation()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Application Deadline</p>
              <p className="font-semibold text-gray-900">
                {new Date(job.applicationDeadline).toLocaleDateString()}
                <span className="text-sm text-gray-600 ml-2">
                  ({daysUntilDeadline > 0 ? `${daysUntilDeadline} days left` : 'Expired'})
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Posted</p>
              <p className="font-semibold text-gray-900">
                {formatDistanceToNow(new Date(job.postedDate), { addSuffix: true })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Job Type</p>
              <p className="font-semibold text-gray-900">
                {job.jobType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Job Description</h4>
            <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
            {!job.hasApplied && daysUntilDeadline > 0 && (
              <button
                onClick={onApply}
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Apply Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModal;
