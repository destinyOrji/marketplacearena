import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiSave, FiX } from 'react-icons/fi';
import { hospitalApi } from '../services/api';

const VacancyForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!id;

  const [form, setForm] = useState({
    jobTitle: '',
    department: '',
    jobDescription: '',
    requiredQualifications: '',
    experienceLevel: 'mid',
    minimumExperienceYears: 0,
    employmentType: 'full_time',
    salaryRangeMin: '',
    salaryRangeMax: '',
    salaryCurrency: 'NGN',
    benefits: '',
    numberOfPositions: 1,
    applicationDeadline: '',
    status: 'active',
  });

  useEffect(() => {
    if (isEdit) loadVacancy();
  }, [id]);

  const loadVacancy = async () => {
    setLoading(true);
    try {
      const vacancy = await hospitalApi.getVacancy(Number(id));
      const v = vacancy as any;
      setForm({
        jobTitle: v.jobTitle || v.job_title || '',
        department: v.department || '',
        jobDescription: v.jobDescription || v.job_description || '',
        requiredQualifications: Array.isArray(v.requiredQualifications)
          ? v.requiredQualifications.join(', ')
          : v.required_qualifications?.join(', ') || '',
        experienceLevel: v.experienceLevel || v.experience_level || 'mid',
        minimumExperienceYears: v.minimumExperienceYears || v.minimum_experience_years || 0,
        employmentType: v.employmentType || v.employment_type || 'full_time',
        salaryRangeMin: v.salaryRangeMin || v.salary_range_min || '',
        salaryRangeMax: v.salaryRangeMax || v.salary_range_max || '',
        salaryCurrency: v.salaryCurrency || v.salary_currency || 'NGN',
        benefits: Array.isArray(v.benefits) ? v.benefits.join(', ') : v.benefits || '',
        numberOfPositions: v.numberOfPositions || v.number_of_positions || 1,
        applicationDeadline: v.applicationDeadline
          ? new Date(v.applicationDeadline).toISOString().split('T')[0]
          : v.application_deadline?.split('T')[0] || '',
        status: v.status || 'active',
      });
    } catch {
      toast.error('Failed to load vacancy');
      navigate('/hospital/vacancies');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!form.jobTitle || !form.department || !form.jobDescription) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        jobTitle: form.jobTitle,
        department: form.department,
        jobDescription: form.jobDescription,
        requiredQualifications: form.requiredQualifications.split(',').map(q => q.trim()).filter(Boolean),
        experienceLevel: form.experienceLevel,
        minimumExperienceYears: Number(form.minimumExperienceYears),
        employmentType: form.employmentType,
        salaryRangeMin: form.salaryRangeMin ? Number(form.salaryRangeMin) : undefined,
        salaryRangeMax: form.salaryRangeMax ? Number(form.salaryRangeMax) : undefined,
        salaryCurrency: form.salaryCurrency,
        benefits: form.benefits.split(',').map(b => b.trim()).filter(Boolean),
        numberOfPositions: Number(form.numberOfPositions),
        applicationDeadline: form.applicationDeadline,
        status: form.status,
      };

      if (isEdit) {
        await hospitalApi.updateVacancy(Number(id), payload as any);
        toast.success('Vacancy updated successfully');
      } else {
        await hospitalApi.createVacancy(payload as any);
        toast.success(form.status === 'active'
          ? 'Vacancy created and professionals notified!'
          : 'Vacancy saved as draft');
      }
      navigate('/hospital/vacancies');
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to save vacancy');
    } finally {
      setSubmitting(false);
    }
  };

  const set = (field: string, value: any) => setForm(p => ({ ...p, [field]: value }));

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );

  const inputClass = "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm";
  const labelClass = "block text-sm font-medium text-gray-700";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Vacancy' : 'Post New Vacancy'}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {isEdit ? 'Update the job vacancy details' : 'Create a job opening - professionals will be notified when published'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>Job Title *</label>
              <input className={inputClass} value={form.jobTitle}
                onChange={e => set('jobTitle', e.target.value)} required placeholder="e.g. Senior Cardiologist" />
            </div>
            <div>
              <label className={labelClass}>Department *</label>
              <input className={inputClass} value={form.department}
                onChange={e => set('department', e.target.value)} required placeholder="e.g. Cardiology" />
            </div>
            <div>
              <label className={labelClass}>Number of Positions</label>
              <input type="number" min="1" className={inputClass} value={form.numberOfPositions}
                onChange={e => set('numberOfPositions', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Job Description *</label>
              <textarea rows={5} className={inputClass} value={form.jobDescription}
                onChange={e => set('jobDescription', e.target.value)} required
                placeholder="Describe the role, responsibilities, and what you're looking for..." />
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Requirements</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>Required Qualifications</label>
              <textarea rows={3} className={inputClass} value={form.requiredQualifications}
                onChange={e => set('requiredQualifications', e.target.value)}
                placeholder="e.g. MBBS, Board Certification, 5+ years experience (comma-separated)" />
              <p className="mt-1 text-xs text-gray-500">Separate with commas</p>
            </div>
            <div>
              <label className={labelClass}>Experience Level</label>
              <select className={inputClass} value={form.experienceLevel} onChange={e => set('experienceLevel', e.target.value)}>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
                <option value="expert">Expert Level</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Minimum Years of Experience</label>
              <input type="number" min="0" className={inputClass} value={form.minimumExperienceYears}
                onChange={e => set('minimumExperienceYears', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Employment Type</label>
              <select className={inputClass} value={form.employmentType} onChange={e => set('employmentType', e.target.value)}>
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="temporary">Temporary</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Application Deadline</label>
              <input type="date" className={inputClass} value={form.applicationDeadline}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => set('applicationDeadline', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Compensation */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Compensation & Benefits</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Min Salary</label>
              <input type="number" min="0" className={inputClass} value={form.salaryRangeMin}
                onChange={e => set('salaryRangeMin', e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className={labelClass}>Max Salary</label>
              <input type="number" min="0" className={inputClass} value={form.salaryRangeMax}
                onChange={e => set('salaryRangeMax', e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className={labelClass}>Currency</label>
              <select className={inputClass} value={form.salaryCurrency} onChange={e => set('salaryCurrency', e.target.value)}>
                <option value="NGN">NGN (₦)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
            <div className="sm:col-span-3">
              <label className={labelClass}>Benefits</label>
              <textarea rows={2} className={inputClass} value={form.benefits}
                onChange={e => set('benefits', e.target.value)}
                placeholder="e.g. Health insurance, Housing allowance, Annual leave (comma-separated)" />
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Publication</h3>
          <div>
            <label className={labelClass}>Status</label>
            <select className={inputClass} value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="draft">Save as Draft</option>
              <option value="active">Publish Now (notify professionals)</option>
              <option value="paused">Paused</option>
            </select>
            {form.status === 'active' && (
              <p className="mt-2 text-sm text-green-600 font-medium">
                ✓ All registered professionals will be notified about this vacancy
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button type="button" onClick={() => navigate('/hospital/vacancies')}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <FiX className="h-4 w-4" /> Cancel
          </button>
          <button type="submit" disabled={submitting}
            className="flex items-center gap-2 px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
            <FiSave className="h-4 w-4" />
            {submitting ? 'Saving...' : isEdit ? 'Update Vacancy' : 'Create Vacancy'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VacancyForm;
