/**
 * Application Detail Page
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiDownload, FiMail, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { hospitalApi } from '../services/api';
import type { ApplicationDetail } from '../types';
import { format } from 'date-fns';

const ApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadApplication();
  }, [id]);

  const loadApplication = async () => {
    try {
      setLoading(true);
      const data = await hospitalApi.getApplication(Number(id));
      setApplication(data);
    } catch (error: any) {
      toast.error('Failed to load application');
      navigate('/hospital/applications');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (status: string) => {
    try {
      setActionLoading(true);
      await hospitalApi.reviewApplication(Number(id), {
        application_status: status,
        review_notes: '',
      });
      toast.success('Application status updated');
      loadApplication();
    } catch (error: any) {
      toast.error('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !application) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      shortlisted: 'bg-purple-100 text-purple-800',
      offered: 'bg-indigo-100 text-indigo-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      withdrawn: 'bg-gray-100 text-gray-800',
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{application.professional.user_name}</h2>
            <p className="mt-1 text-sm text-gray-500">
              Applied for {application.vacancy_title} • {application.vacancy_department}
            </p>
            <span
              className={`inline-flex mt-2 items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                application.application_status
              )}`}
            >
              {application.application_status}
            </span>
          </div>
          <div className="flex space-x-2">
            {application.application_status === 'pending' && (
              <>
                <button
                  onClick={() => handleReview('reviewed')}
                  disabled={actionLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  <FiCheckCircle className="mr-2 h-4 w-4" />
                  Mark as Reviewed
                </button>
                <button
                  onClick={() => handleReview('rejected')}
                  disabled={actionLoading}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  <FiXCircle className="mr-2 h-4 w-4" />
                  Reject
                </button>
              </>
            )}
            {application.application_status === 'reviewed' && (
              <button
                onClick={() => handleReview('shortlisted')}
                disabled={actionLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
              >
                Shortlist
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Professional Info */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h3>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="mt-1 text-sm text-gray-900">{application.professional.user_email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Professional Type</dt>
            <dd className="mt-1 text-sm text-gray-900">{application.professional.professional_type}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Specialization</dt>
            <dd className="mt-1 text-sm text-gray-900">{application.professional.specialization}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Years of Experience</dt>
            <dd className="mt-1 text-sm text-gray-900">{application.professional.years_of_experience} years</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">License Number</dt>
            <dd className="mt-1 text-sm text-gray-900">{application.professional.license_number}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Applied On</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {format(new Date(application.applied_at), 'MMMM d, yyyy')}
            </dd>
          </div>
        </dl>
      </div>

      {/* Qualifications */}
      {application.professional.qualifications.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Qualifications</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {application.professional.qualifications.map((qual, index) => (
              <li key={index}>{qual}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Certifications */}
      {application.professional.certifications.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Certifications</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {application.professional.certifications.map((cert, index) => (
              <li key={index}>{cert}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Skills */}
      {application.professional.skills.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {application.professional.skills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Cover Letter */}
      {application.cover_letter && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Cover Letter</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{application.cover_letter}</p>
        </div>
      )}

      {/* Resume */}
      {application.resume_file && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Resume</h3>
          <a
            href={application.resume_file}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <FiDownload className="mr-2 h-4 w-4" />
            Download Resume
          </a>
        </div>
      )}

      {/* Review Notes */}
      {application.review_notes && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Review Notes</h3>
          <p className="text-gray-700">{application.review_notes}</p>
          {application.reviewer_name && (
            <p className="mt-2 text-sm text-gray-500">
              Reviewed by {application.reviewer_name} on{' '}
              {application.reviewed_at && format(new Date(application.reviewed_at), 'MMMM d, yyyy')}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ApplicationDetailPage;
