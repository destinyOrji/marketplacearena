/**
 * Vacancy Detail Page — fixed camelCase field mapping + string ID
 */
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiEdit, FiArrowLeft, FiEye, FiFileText, FiCalendar, FiUsers } from 'react-icons/fi';
import { hospitalApi } from '../services/api';
import { format } from 'date-fns';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';

const VacancyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vacancy, setVacancy] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const getHeaders = () => {
    const token = localStorage.getItem('hospitalToken') || localStorage.getItem('authToken');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => { loadVacancy(); }, [id]);

  const loadVacancy = async () => {
    try {
      setLoading(true);
      // Use direct axios call with string ID (MongoDB ObjectId)
      const res = await axios.get(`${API_URL}/hospitals/vacancies/${id}`, getHeaders());
      const data = res.data?.data || res.data;
      setVacancy(data);
    } catch {
      toast.error('Failed to load vacancy');
      navigate('/hospital/vacancies');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await axios.patch(`${API_URL}/hospitals/vacancies/${id}/status`, { status: newStatus }, getHeaders());
      toast.success('Status updated');
      loadVacancy();
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!vacancy) return null;

  // Normalize both camelCase (backend) and snake_case (type) fields
  const title = vacancy.jobTitle || vacancy.job_title || 'Untitled';
  const dept = vacancy.department || '—';
  const empType = (vacancy.employmentType || vacancy.employment_type || '').replace(/_/g, ' ');
  const expLevel = vacancy.experienceLevel || vacancy.experience_level || '—';
  const minExp = vacancy.minimumExperienceYears ?? vacancy.minimum_experience_years ?? 0;
  const description = vacancy.jobDescription || vacancy.job_description || '';
  const qualifications: string[] = vacancy.requiredQualifications || vacancy.required_qualifications || [];
  const benefits: string[] = vacancy.benefits || [];
  const salaryMin = vacancy.salaryRangeMin || vacancy.salary_range_min;
  const salaryMax = vacancy.salaryRangeMax || vacancy.salary_range_max;
  const currency = vacancy.salaryCurrency || vacancy.salary_currency || 'NGN';
  const deadline = vacancy.applicationDeadline || vacancy.application_deadline;
  const views = vacancy.views || vacancy.views_count || 0;
  const appsCount = vacancy.applicationsCount || vacancy.applications_count || 0;
  const positions = vacancy.numberOfPositions || vacancy.number_of_positions || 1;
  const status = vacancy.status || 'draft';

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    active: 'bg-green-100 text-green-700',
    paused: 'bg-yellow-100 text-yellow-700',
    closed: 'bg-red-100 text-red-700',
    filled: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back + Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button onClick={() => navigate('/hospital/vacancies')}
            className="mt-1 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColors[status] || statusColors.draft}`}>
                {status}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500 capitalize">
              {dept}{empType ? ` · ${empType}` : ''}{expLevel ? ` · ${expLevel} level` : ''}
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link to={`/hospital/vacancies/${id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            <FiEdit className="h-4 w-4" /> Edit
          </Link>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: FiEye, label: 'Views', value: views, color: 'text-blue-600', bg: 'bg-blue-50' },
          { icon: FiFileText, label: 'Applications', value: appsCount, color: 'text-purple-600', bg: 'bg-purple-50' },
          { icon: FiUsers, label: 'Positions', value: positions, color: 'text-green-600', bg: 'bg-green-50' },
          { icon: FiCalendar, label: 'Deadline', value: deadline ? format(new Date(deadline), 'MMM d') : '—', color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-2`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Status change */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Vacancy Status</h3>
            <p className="text-xs text-gray-500 mt-0.5">Change the status to control visibility</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {['draft', 'active', 'paused', 'closed', 'filled'].map(s => (
              <button key={s} onClick={() => handleStatusChange(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  status === s
                    ? `${statusColors[s]} ring-2 ring-offset-1 ring-current`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Job Description */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-bold text-gray-900 mb-3">Job Description</h3>
        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{description || 'No description provided.'}</p>
      </div>

      {/* Requirements */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-bold text-gray-900 mb-3">Requirements</h3>
        {qualifications.length > 0 ? (
          <ul className="space-y-2">
            {qualifications.map((q, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                {q}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400">No specific qualifications listed.</p>
        )}
        <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <div className="text-sm">
            <span className="text-gray-500">Experience Level:</span>{' '}
            <span className="font-medium text-gray-800 capitalize">{expLevel}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">Min. Experience:</span>{' '}
            <span className="font-medium text-gray-800">{minExp} year{minExp !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* Compensation */}
      {(salaryMin || salaryMax) && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-bold text-gray-900 mb-3">Compensation</h3>
          <p className="text-lg font-semibold text-green-700">
            {salaryMin?.toLocaleString()} {salaryMax ? `– ${salaryMax.toLocaleString()}` : ''} {currency}
          </p>
          {benefits.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Benefits:</p>
              <div className="flex flex-wrap gap-2">
                {benefits.map((b, i) => (
                  <span key={i} className="px-2.5 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Applications link */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-base font-bold text-gray-900">Applications Received</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {appsCount} application{appsCount !== 1 ? 's' : ''} for this vacancy
            </p>
          </div>
          <Link to={`/hospital/applications?vacancy=${id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            <FiFileText className="h-4 w-4" />
            View Applications
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VacancyDetail;
