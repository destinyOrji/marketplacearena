/**
 * Approved Jobs Page - Shows all jobs where professional has been accepted/hired
 * Includes complete job details, hospital information, address, contact, and benefits
 */
import React, { useState, useEffect } from 'react';
import { 
  FiNavigation, FiFolder, FiDollarSign, FiCalendar, FiPhoneCall, 
  FiMail, FiExternalLink, FiClock, FiStar, FiCheckCircle, FiAlertCircle 
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { jobsApi } from '../services/api';
import { format } from 'date-fns';

interface ApprovedJob {
  applicationId: string;
  applicationDate: string;
  acceptedDate: string;
  reviewNotes: string;
  onboarding: {
    startDate?: string;
    interviewDate?: string;
    interviewTime?: string;
    interviewLocation?: string;
    contactPerson?: string;
    contactPhone?: string;
    contactEmail?: string;
    additionalNotes?: string;
    documentsRequired?: string[];
    onboardingInstructions?: string;
  };
  jobId: string;
  jobTitle: string;
  department: string;
  jobDescription: string;
  employmentType: string;
  experienceLevel: string;
  salaryRangeMin: number;
  salaryRangeMax: number;
  salaryCurrency: string;
  benefits: string[];
  hospitalId: string;
  hospitalName: string;
  hospitalRegistrationNumber: string;
  hospitalPhone: string;
  hospitalEmail: string;
  hospitalWebsite: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    fullAddress: string;
  };
  operatingHours: any;
  emergencyServices: boolean;
  applicationDeadline: string | null;
  numberOfPositions: number;
  requiredQualifications: string[];
}

const ApprovedJobs: React.FC = () => {
  const [jobs, setJobs] = useState<ApprovedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<ApprovedJob | null>(null);

  useEffect(() => {
    loadApprovedJobs();
  }, []);

  const loadApprovedJobs = async () => {
    try {
      setLoading(true);
      const data = await jobsApi.getApprovedJobs();
      setJobs(data);
      if (data.length > 0) {
        setSelectedJob(data[0]);
      }
    } catch (error) {
      toast.error('Failed to load approved jobs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatSalary = (min: number, max: number, currency: string) => {
    if (!min && !max) return 'Negotiable';
    const formatter = new Intl.NumberFormat('en-US', { style: 'decimal' });
    if (min && max) {
      return `${currency} ${formatter.format(min)} - ${formatter.format(max)}`;
    }
    return `${currency} ${formatter.format(min || max)}`;
  };

  const formatEmploymentType = (type: string) => {
    return type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Full Time';
  };

  const getOperatingHoursForToday = (operatingHours: any) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    const hours = operatingHours?.[today];
    
    if (!hours) return 'Not available';
    if (hours.is24Hours) return '24 Hours';
    if (hours.open && hours.close) return `${hours.open} - ${hours.close}`;
    return 'Closed';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Approved Jobs</h2>
          <p className="mt-1 text-sm text-gray-500">View details of jobs you've been accepted for</p>
        </div>

        <div className="bg-white shadow rounded-lg p-12 text-center">
          <FiCheckCircle className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Approved Jobs Yet</h3>
          <p className="text-sm text-gray-500 mb-6">
            Once a hospital accepts your application, the job details will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Approved Jobs</h2>
        <p className="mt-1 text-sm text-gray-500">
          You have {jobs.length} approved job{jobs.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Jobs List Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700">Your Approved Positions</h3>
            </div>
            <div className="divide-y divide-gray-100 max-h-[calc(100vh-280px)] overflow-y-auto">
              {jobs.map((job) => (
                <button
                  key={job.applicationId}
                  onClick={() => setSelectedJob(job)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                    selectedJob?.applicationId === job.applicationId ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">{job.jobTitle}</h4>
                      <p className="text-xs text-gray-600 mt-0.5 truncate">{job.hospitalName}</p>
                      <p className="text-xs text-gray-500 mt-1">{job.department}</p>
                    </div>
                    <FiCheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                    <FiCalendar className="h-3 w-3" />
                    <span>Accepted {format(new Date(job.acceptedDate), 'MMM d, yyyy')}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Job Details Panel */}
        {selectedJob && (
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{selectedJob.jobTitle}</h3>
                    <p className="text-sm text-gray-600 mt-1">{selectedJob.hospitalName}</p>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    <FiCheckCircle className="h-3 w-3 mr-1" />
                    Accepted
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <FiFolder className="h-4 w-4" />
                    <span>{formatEmploymentType(selectedJob.employmentType)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiDollarSign className="h-4 w-4" />
                    <span>{formatSalary(selectedJob.salaryRangeMin, selectedJob.salaryRangeMax, selectedJob.salaryCurrency)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiStar className="h-4 w-4" />
                    <span className="capitalize">{selectedJob.experienceLevel || 'Mid'} Level</span>
                  </div>
                </div>
              </div>

              {/* Content - Scrollable */}
              <div className="max-h-[calc(100vh-340px)] overflow-y-auto">
                <div className="px-6 py-5 space-y-6">
                  {/* Job Description */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <FiFolder className="h-4 w-4 text-blue-600" />
                      Job Description
                    </h4>
                    <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                      {selectedJob.jobDescription}
                    </p>
                  </div>

                  {/* Department */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Department</h4>
                    <p className="text-sm text-gray-600">{selectedJob.department}</p>
                  </div>

                  {/* Required Qualifications */}
                  {selectedJob.requiredQualifications && selectedJob.requiredQualifications.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Required Qualifications</h4>
                      <ul className="space-y-1.5">
                        {selectedJob.requiredQualifications.map((qual, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                            <FiCheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{qual}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Benefits */}
                  {selectedJob.benefits && selectedJob.benefits.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Benefits & Perks</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedJob.benefits.map((benefit, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Onboarding Details */}
                  {selectedJob.onboarding && Object.keys(selectedJob.onboarding).length > 0 && (
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FiCalendar className="h-4 w-4 text-green-600" />
                        Onboarding Information
                      </h4>
                      <div className="bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-xl p-4 space-y-3">
                        {/* Start Date */}
                        {selectedJob.onboarding.startDate && (
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
                              <FiCalendar className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Start Date</p>
                              <p className="text-sm font-bold text-gray-900 mt-0.5">
                                {format(new Date(selectedJob.onboarding.startDate), 'EEEE, MMMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Interview Details */}
                        {(selectedJob.onboarding.interviewDate || selectedJob.onboarding.interviewTime || selectedJob.onboarding.interviewLocation) && (
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                              <FiClock className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Interview/Meeting</p>
                              <div className="text-sm text-gray-900 mt-0.5 space-y-1">
                                {selectedJob.onboarding.interviewDate && (
                                  <p className="font-bold">
                                    {format(new Date(selectedJob.onboarding.interviewDate), 'EEEE, MMMM d, yyyy')}
                                    {selectedJob.onboarding.interviewTime && (
                                      <span className="ml-2 text-blue-600">{selectedJob.onboarding.interviewTime}</span>
                                    )}
                                  </p>
                                )}
                                {selectedJob.onboarding.interviewLocation && (
                                  <p className="flex items-center gap-1 text-gray-600">
                                    <FiNavigation className="h-3.5 w-3.5" />
                                    {selectedJob.onboarding.interviewLocation}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Contact Person */}
                        {(selectedJob.onboarding.contactPerson || selectedJob.onboarding.contactPhone || selectedJob.onboarding.contactEmail) && (
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Your Contact Person</p>
                              <div className="text-sm text-gray-900 mt-0.5 space-y-1">
                                {selectedJob.onboarding.contactPerson && (
                                  <p className="font-bold">{selectedJob.onboarding.contactPerson}</p>
                                )}
                                {selectedJob.onboarding.contactPhone && (
                                  <p>
                                    <a href={`tel:${selectedJob.onboarding.contactPhone}`} className="text-blue-600 hover:underline">
                                      {selectedJob.onboarding.contactPhone}
                                    </a>
                                  </p>
                                )}
                                {selectedJob.onboarding.contactEmail && (
                                  <p>
                                    <a href={`mailto:${selectedJob.onboarding.contactEmail}`} className="text-blue-600 hover:underline">
                                      {selectedJob.onboarding.contactEmail}
                                    </a>
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Documents Required */}
                        {selectedJob.onboarding.documentsRequired && selectedJob.onboarding.documentsRequired.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Documents to Bring</p>
                            <ul className="space-y-1.5">
                              {selectedJob.onboarding.documentsRequired.map((doc, idx) => (
                                <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                  <FiCheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span>{doc}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Onboarding Instructions */}
                        {selectedJob.onboarding.onboardingInstructions && (
                          <div>
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Onboarding Instructions</p>
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                              {selectedJob.onboarding.onboardingInstructions}
                            </p>
                          </div>
                        )}

                        {/* Additional Notes */}
                        {selectedJob.onboarding.additionalNotes && (
                          <div>
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Additional Notes</p>
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                              {selectedJob.onboarding.additionalNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Hospital Contact Information */}
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Hospital Contact Information</h4>
                    <div className="space-y-2.5">
                      {selectedJob.hospitalPhone && (
                        <div className="flex items-center gap-3 text-sm">
                          <FiPhoneCall className="h-4 w-4 text-gray-400" />
                          <a href={`tel:${selectedJob.hospitalPhone}`} className="text-blue-600 hover:underline">
                            {selectedJob.hospitalPhone}
                          </a>
                        </div>
                      )}
                      {selectedJob.hospitalEmail && (
                        <div className="flex items-center gap-3 text-sm">
                          <FiMail className="h-4 w-4 text-gray-400" />
                          <a href={`mailto:${selectedJob.hospitalEmail}`} className="text-blue-600 hover:underline">
                            {selectedJob.hospitalEmail}
                          </a>
                        </div>
                      )}
                      {selectedJob.hospitalWebsite && (
                        <div className="flex items-center gap-3 text-sm">
                          <FiExternalLink className="h-4 w-4 text-gray-400" />
                          <a 
                            href={selectedJob.hospitalWebsite} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-600 hover:underline"
                          >
                            {selectedJob.hospitalWebsite}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hospital Address */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <FiNavigation className="h-4 w-4 text-blue-600" />
                      Hospital Location
                    </h4>
                    {selectedJob.address.fullAddress ? (
                      <p className="text-sm text-gray-600">{selectedJob.address.fullAddress}</p>
                    ) : (
                      <p className="text-sm text-gray-400">Address not available</p>
                    )}
                  </div>

                  {/* Operating Hours */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <FiClock className="h-4 w-4 text-blue-600" />
                      Operating Hours
                    </h4>
                    <p className="text-sm text-gray-600">
                      Today: <span className="font-medium">{getOperatingHoursForToday(selectedJob.operatingHours)}</span>
                    </p>
                    {selectedJob.emergencyServices && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-700 text-xs font-medium">
                        <FiAlertCircle className="h-3.5 w-3.5" />
                        24/7 Emergency Services Available
                      </div>
                    )}
                  </div>

                  {/* Application Timeline */}
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Application Timeline</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <FiCalendar className="h-4 w-4 text-gray-400" />
                        <span>Applied: {format(new Date(selectedJob.applicationDate), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiCheckCircle className="h-4 w-4 text-green-500" />
                        <span>Accepted: {format(new Date(selectedJob.acceptedDate), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Review Notes */}
                  {selectedJob.reviewNotes && (
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Hospital's Message</h4>
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <p className="text-sm text-gray-700 whitespace-pre-line">{selectedJob.reviewNotes}</p>
                      </div>
                    </div>
                  )}

                  {/* Additional Info */}
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Additional Information</h4>
                    <div className="space-y-1.5 text-sm text-gray-600">
                      <p>Number of Positions: <span className="font-medium">{selectedJob.numberOfPositions}</span></p>
                      {selectedJob.hospitalRegistrationNumber && (
                        <p>Hospital Reg. No: <span className="font-medium">{selectedJob.hospitalRegistrationNumber}</span></p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovedJobs;
