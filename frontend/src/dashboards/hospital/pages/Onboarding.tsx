/**
 * Hospital Onboarding Page
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FiCheck } from 'react-icons/fi';
import { hospitalApi } from '../services/api';
import { useHospital } from '../contexts/HospitalContext';
import { OperatingHours } from '../types';

interface OnboardingFormData {
  number_of_beds: number;
  specializations: string;
  certifications: string;
  description: string;
  operating_hours: {
    [key: string]: {
      open: string;
      close: string;
      is_closed: boolean;
    };
  };
}

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { refreshHospital } = useHospital();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<OnboardingFormData>({
    defaultValues: {
      operating_hours: {
        monday: { open: '09:00', close: '17:00', is_closed: false },
        tuesday: { open: '09:00', close: '17:00', is_closed: false },
        wednesday: { open: '09:00', close: '17:00', is_closed: false },
        thursday: { open: '09:00', close: '17:00', is_closed: false },
        friday: { open: '09:00', close: '17:00', is_closed: false },
        saturday: { open: '09:00', close: '13:00', is_closed: false },
        sunday: { open: '09:00', close: '13:00', is_closed: true },
      },
    },
  });

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const onSubmit = async (data: OnboardingFormData) => {
    try {
      setSubmitting(true);

      // Parse specializations and certifications
      const specializations = data.specializations
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const certifications = data.certifications
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c.length > 0);

      await hospitalApi.completeOnboarding({
        number_of_beds: data.number_of_beds,
        specializations,
        certifications,
        operating_hours: data.operating_hours as unknown as OperatingHours,
        description: data.description,
      });

      toast.success('Onboarding completed successfully!');
      await refreshHospital();
      navigate('/hospital/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to complete onboarding');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Complete Your Profile</h2>
        <p className="mt-1 text-sm text-gray-500">
          Please provide additional information about your hospital to complete the onboarding process.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Facility Details */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Facility Details</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Number of Beds *
              </label>
              <input
                type="number"
                {...register('number_of_beds', { 
                  required: 'Number of beds is required',
                  min: { value: 1, message: 'Must be at least 1' }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              {errors.number_of_beds && (
                <p className="mt-1 text-sm text-red-600">{errors.number_of_beds.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Specializations *
              </label>
              <input
                type="text"
                {...register('specializations', { required: 'At least one specialization is required' })}
                placeholder="e.g., Cardiology, Neurology, Pediatrics (comma-separated)"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              {errors.specializations && (
                <p className="mt-1 text-sm text-red-600">{errors.specializations.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Enter specializations separated by commas
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Certifications
              </label>
              <input
                type="text"
                {...register('certifications')}
                placeholder="e.g., JCI Accredited, ISO 9001 (comma-separated)"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter certifications separated by commas
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={5}
                placeholder="Tell us about your hospital, services, and what makes you unique..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Operating Hours</h3>
          
          <div className="space-y-4">
            {days.map((day) => {
              const isClosed = watch(`operating_hours.${day}.is_closed`);
              
              return (
                <div key={day} className="flex items-center space-x-4">
                  <div className="w-32">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {day}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 flex-1">
                    <input
                      type="time"
                      {...register(`operating_hours.${day}.open`)}
                      disabled={isClosed}
                      className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="time"
                      {...register(`operating_hours.${day}.close`)}
                      disabled={isClosed}
                      className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100"
                    />
                  </div>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      {...register(`operating_hours.${day}.is_closed`)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Closed</span>
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/hospital/dashboard')}
            className="px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Skip for Now
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <FiCheck className="mr-2 h-5 w-5" />
            {submitting ? 'Completing...' : 'Complete Onboarding'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Onboarding;
