// JobCard Component - Redesigned with better visual hierarchy

import React from 'react';
import { JobPosting } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface JobCardProps {
  job: JobPosting;
  onApply: (id: string) => void;
  onViewDetails: (id: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onApply, onViewDetails }) => {
  const jobTypeColors: Record<string, { bg: string; text: string }> = {
    'full-time':  { bg: 'bg-blue-50',   text: 'text-blue-700'   },
    'part-time':  { bg: 'bg-green-50',  text: 'text-green-700'  },
    'contract':   { bg: 'bg-purple-50', text: 'text-purple-700' },
    'per-diem':   { bg: 'bg-amber-50',  text: 'text-amber-700'  },
  };
  const typeStyle = jobTypeColors[job.jobType] || { bg: 'bg-gray-50', text: 'text-gray-700' };

  const jobTypeLabel = job.jobType
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const formatSalary = () => {
    const j = job as any;
    if (j.salaryMin && j.salaryMax) {
      const fmt = (n: number) =>
        n >= 1000000
          ? `₦${(n / 1000000).toFixed(1)}M`
          : n >= 1000
          ? `₦${(n / 1000).toFixed(0)}K`
          : `₦${n}`;
      return `${fmt(j.salaryMin)} – ${fmt(j.salaryMax)}`;
    }
    if (j.salaryMin) return `From ₦${j.salaryMin.toLocaleString()}`;
    if (job.compensation?.amount) {
      return `₦${job.compensation.amount.toLocaleString()}${job.compensation.type === 'hourly' ? '/hr' : ''}`;
    }
    return 'Negotiable';
  };

  const daysLeft = Math.ceil(
    (new Date(job.applicationDeadline).getTime() - Date.now()) / 86400000
  );
  const isExpired = daysLeft <= 0;
  const isUrgent = daysLeft > 0 && daysLeft <= 7;

  const hospitalName = (job as any).hospitalName;
  const experienceLevel = (job as any).experienceLevel;

  // Avatar initials from hospital name or job title
  const initials = hospitalName
    ? hospitalName.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
    : job.title.slice(0, 2).toUpperCase();

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 flex flex-col ${
      job.hasApplied ? 'border-green-200' : 'border-gray-200 hover:border-blue-200'
    }`}>
      {/* Top accent bar */}
      <div className={`h-1 rounded-t-2xl ${job.hasApplied ? 'bg-green-400' : 'bg-gradient-to-r from-blue-500 to-blue-700'}`} />

      <div className="p-5 flex flex-col flex-1">
        {/* Header row */}
        <div className="flex items-start gap-3 mb-3">
          {/* Hospital avatar */}
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white text-sm font-bold">{initials}</span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-gray-900 leading-tight truncate">{job.title}</h3>
            {hospitalName && (
              <p className="text-sm text-blue-600 font-medium mt-0.5 truncate">🏥 {hospitalName}</p>
            )}
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {job.location}
            </p>
          </div>

          {/* Applied badge */}
          {job.hasApplied && (
            <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Applied
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">{job.description}</p>

        {/* Tags row */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${typeStyle.bg} ${typeStyle.text}`}>
            {jobTypeLabel}
          </span>
          {job.specialty && (
            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
              {job.specialty}
            </span>
          )}
          {experienceLevel && (
            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-full capitalize">
              {experienceLevel}
            </span>
          )}
        </div>

        {/* Salary + Deadline */}
        <div className="flex items-center justify-between py-3 border-t border-b border-gray-100 mb-3">
          <div className="flex items-center gap-1.5 text-gray-800">
            <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-semibold">{formatSalary()}</span>
          </div>

          <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
            isExpired
              ? 'bg-red-50 text-red-600'
              : isUrgent
              ? 'bg-orange-50 text-orange-600'
              : 'bg-gray-50 text-gray-600'
          }`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {isExpired ? 'Expired' : isUrgent ? `${daysLeft}d left` : `${daysLeft} days left`}
          </div>
        </div>

        {/* Posted time */}
        <p className="text-xs text-gray-400 mb-4">
          Posted {formatDistanceToNow(new Date(job.postedDate), { addSuffix: true })}
        </p>

        {/* Actions — pushed to bottom */}
        <div className="flex gap-2 mt-auto">
          <button
            type="button"
            onClick={() => onViewDetails(job.id)}
            className="flex-1 px-3 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            View Details
          </button>
          {!job.hasApplied && !isExpired ? (
            <button
              type="button"
              onClick={() => onApply(job.id)}
              className="flex-1 px-3 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm"
            >
              Apply Now
            </button>
          ) : job.hasApplied ? (
            <div className="flex-1 px-3 py-2.5 bg-green-50 text-green-700 text-sm font-medium rounded-xl text-center border border-green-200">
              ✓ Applied
            </div>
          ) : (
            <div className="flex-1 px-3 py-2.5 bg-gray-50 text-gray-400 text-sm font-medium rounded-xl text-center border border-gray-200">
              Closed
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;
