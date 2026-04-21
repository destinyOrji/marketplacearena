/**
 * Vacancy Detail Page
 */
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiEye, FiFileText, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { hospitalApi } from '../services/api';
import type { Vacancy } from '../types';
import { format } from 'date-fns';

const VacancyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vacancy, setVacancy] = useState<Vacancy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVacancy();
  }, [id]);

  const loadVacancy = async () => {
    try {
      setLoading(true);
      const data = await hospitalApi.getVacancy(Number(id));
      setVacancy(data);
    } catch (error: any) {
      toast.error('Failed to load vacancy');
      navigate('/hospital/vacancies');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await hospitalApi.updateVacancyStatus(Number(id), newStatus);
      toast.success('Status updated successfully');
      loadVacancy();
    } catch (error: any) {
      toast.error('Failed to update status');
    }
  };

  if (loading || !vacancy) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{vacancy.job_title}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {vacancy.department} • {vacancy.employment_type.replace('_', ' ')}
            </p>
          </div>
          <div className="flex space-x-2">
            <Link
              to={`/hospital/vacancies/${id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FiEdit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiEye className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Views</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{vacancy.views_count}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiFileText className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Applications</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{vacancy.applications_count}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiCalendar className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Deadline</dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {format(new Date(vacancy.application_deadline), 'MMM d, yyyy')}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Job Description</h3>
        <p className="text-gray-700 whitespace-pre-wrap">{vacancy.job_description}</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Requirements</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          {vacancy.required_qualifications.map((qual, index) => (
            <li key={index}>{qual}</li>
          ))}
        </ul>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Experience Level:</span> {vacancy.experience_level}
          </div>
          <div>
            <span className="font-medium">Minimum Experience:</span> {vacancy.minimum_experience_years} years
          </div>
        </div>
      </div>

      {vacancy.salary_range_min && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Compensation</h3>
          <div className="flex items-center text-gray-700">
            <FiDollarSign className="h-5 w-5 mr-2" />
            <span>
              {vacancy.salary_range_min.toLocaleString()} - {vacancy.salary_range_max?.toLocaleString()} {vacancy.salary_currency}
            </span>
          </div>
          {vacancy.benefits.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-900 mb-2">Benefits:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {vacancy.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Applications Link */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Applications</h3>
            <p className="mt-1 text-sm text-gray-500">
              {vacancy.applications_count} applications received
            </p>
          </div>
          <Link
            to={`/hospital/applications?vacancy_id=${vacancy.vacancy_id}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            View Applications
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VacancyDetail;
