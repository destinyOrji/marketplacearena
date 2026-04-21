/**
 * Vacancy Form Page (Create/Edit)
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FiSave, FiX } from 'react-icons/fi';
import { hospitalApi } from '../services/api';
import type { Vacancy } from '../types';

interface VacancyFormData {
  job_title: string;
  department: string;
  job_description: string;
  required_qualifications: string;
  experience_level: string;
  minimum_experience_years: number;
  employment_type: string;
  salary_range_min?: number;
  salary_range_max?: number;
  salary_currency: string;
  benefits: string;
  number_of_positions: number;
  application_deadline: string;
  status: string;
}

const VacancyForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!id;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<VacancyFormData>({
    defaultValues: {
      salary_currency: 'USD',
      number_of_positions: 1,
      status: 'draft',
    },
  });

  useEffect(() => {
    if (isEdit) {
      loadVacancy();
    }
  }, [id]);

  const loadVacancy = async () => {
    try {
      setLoading(true);
      const vacancy = await hospitalApi.getVacancy(Number(id));
      reset({
        ...vacancy,
        required_qualifications: vacancy.required_qualifications.join(', '),
        benefits: vacancy.benefits.join(', '),
        application_deadline: vacancy.application_deadline.split('T')[0],
      });
    } catch (error: any) {
      toast.error('Failed to load vacancy');
      navigate('/hospital/vacancies');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: VacancyFormData) => {
    try {
      setSubmitting(true);

      const payload: Partial<Vacancy> = {
        ...data,
        employment_type: data.employment_type as 'full_time' | 'part_time' | 'contract' | 'temporary',
        experience_level: data.experience_level as 'entry' | 'mid' | 'senior' | 'expert',
        status: data.status as 'draft' | 'active' | 'paused' | 'closed' | 'filled',
        required_qualifications: data.required_qualifications
          .split(',')
          .map((q) => q.trim())
          .filter((q) => q.length > 0),
        benefits: data.benefits
          .split(',')
          .map((b) => b.trim())
          .filter((b) => b.length > 0),
      };

      if (isEdit) {
        await hospitalApi.updateVacancy(Number(id), payload);
        toast.success('Vacancy updated successfully');
      } else {
        await hospitalApi.createVacancy(payload);
        toast.success('Vacancy created successfully');
      }

      navigate('/hospital/vacancies');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save vacancy');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Vacancy' : 'Create New Vacancy'}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {isEdit ? 'Update the job vacancy details' : 'Post a new job opening for health professionals'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Job Title *
              </label>
              <input
                type="text"
                {...register('job_title', { required: 'Job title is required' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              {errors.job_title && (
                <p className="mt-1 text-sm text-red-600">{errors.job_title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Department *
              </label>
              <input
                type="text"
                {...register('department', { required: 'Department is required' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              {errors.department && (
                <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Number of Positions *
              </label>
              <input
                type="number"
                {...register('number_of_positions', { 
                  required: 'Number of positions is required',
                  min: { value: 1, message: 'Must be at least 1' }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Job Description *
              </label>
              <textarea
                {...register('job_description', { required: 'Job description is required' })}
                rows={6}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              {errors.job_description && (
                <p className="mt-1 text-sm text-red-600">{errors.job_description.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Requirements</h3>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Required Qualifications *
              </label>
              <textarea
                {...register('required_qualifications', { required: 'Qualifications are required' })}
                rows={3}
                placeholder="e.g., MD degree, Board certification, 5+ years experience (comma-separated)"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">Enter qualifications separated by commas</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Experience Level *
              </label>
              <select
                {...register('experience_level', { required: 'Experience level is required' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Select level</option>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
                <option value="expert">Expert Level</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Minimum Years of Experience *
              </label>
              <input
                type="number"
                {...register('minimum_experience_years', { 
                  required: 'Minimum experience is required',
                  min: { value: 0, message: 'Cannot be negative' }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Employment Type *
              </label>
              <select
                {...register('employment_type', { required: 'Employment type is required' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Select type</option>
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="temporary">Temporary</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Application Deadline *
              </label>
              <input
                type="date"
                {...register('application_deadline', { required: 'Deadline is required' })}
                min={new Date().toISOString().split('T')[0]}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Compensation */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Compensation & Benefits</h3>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Minimum Salary
              </label>
              <input
                type="number"
                {...register('salary_range_min')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Maximum Salary
              </label>
              <input
                type="number"
                {...register('salary_range_max')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Currency
              </label>
              <select
                {...register('salary_currency')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">
                Benefits
              </label>
              <textarea
                {...register('benefits')}
                rows={3}
                placeholder="e.g., Health insurance, Paid time off, Professional development (comma-separated)"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">Enter benefits separated by commas</p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Publication Status</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              {...register('status')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Set to "Active" to publish the vacancy immediately
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/hospital/vacancies')}
            className="px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <FiX className="inline mr-2 h-5 w-5" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <FiSave className="mr-2 h-5 w-5" />
            {submitting ? 'Saving...' : isEdit ? 'Update Vacancy' : 'Create Vacancy'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VacancyForm;
