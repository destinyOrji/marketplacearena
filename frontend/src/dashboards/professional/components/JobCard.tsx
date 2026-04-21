// JobCard Component - Display job posting information

import React from 'react';
import { JobPosting } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface JobCardProps {
  job: JobPosting;
  onApply: (id: string) => void;
  onViewDetails: (id: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onApply, onViewDetails }) => {
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
          <p className="text-sm text-gray-600">{job.location}</p>
        </div>
        {job.hasApplied && (
          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
            Applied
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-700 text-sm mb-4 line-clamp-2">{job.description}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getJobTypeColor(job.jobType)}`}>
          {job.jobType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
        </span>
        <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
          {job.specialty}
        </span>
      </div>

      {/* Compensation and Deadline */}
      <div className="flex items-center justify-between mb-4 text-sm">
        <div className="flex items-center gap-1 text-gray-700">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">{formatCompensation()}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs">
            {daysUntilDeadline > 0 ? `${daysUntilDeadline} days left` : 'Deadline passed'}
          </span>
        </div>
      </div>

      {/* Posted Date */}
      <p className="text-xs text-gray-500 mb-4">
        Posted {formatDistanceToNow(new Date(job.postedDate), { addSuffix: true })}
      </p>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onViewDetails(job.id)}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          View Details
        </button>
        {!job.hasApplied && daysUntilDeadline > 0 && (
          <button
            onClick={() => onApply(job.id)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Apply Now
          </button>
        )}
      </div>
    </div>
  );
};

export default JobCard;
