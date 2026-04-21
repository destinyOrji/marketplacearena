// Profile Onboarding Page - Complete professional profile

import React, { useState } from 'react';
import OnboardingWizard from '../components/OnboardingWizard';
import { ProfessionalProfile } from '../types';
import { profileApi } from '../services/api';
import { profileSchema, formatValidationErrors } from '../utils/validation';

const ProfileOnboarding: React.FC = () => {
  const [showWizard, setShowWizard] = useState(true);
  const [profile, setProfile] = useState<Partial<ProfessionalProfile>>({
    fullName: '',
    email: '',
    phone: '',
    specialization: [],
    yearsOfExperience: 0,
    licenseNumber: '',
    certifications: [],
    education: [],
    bio: '',
    languages: [],
    completionPercentage: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleComplete = async (updatedProfile: Partial<ProfessionalProfile>) => {
    setError(null);
    setLoading(true);

    try {
      // Validate profile data
      const validationResult = profileSchema.safeParse({
        fullName: updatedProfile.fullName,
        phone: updatedProfile.phone,
        licenseNumber: updatedProfile.licenseNumber,
        yearsOfExperience: updatedProfile.yearsOfExperience,
        specialization: updatedProfile.specialization,
        bio: updatedProfile.bio,
        languages: updatedProfile.languages,
      });

      if (!validationResult.success) {
        const errors = formatValidationErrors(validationResult.error);
        setError(Object.values(errors).join(', '));
        setLoading(false);
        return;
      }

      // Submit to API
      await profileApi.updateProfile(updatedProfile);
      
      setProfile(updatedProfile);
      setShowWizard(false);
      setSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    setShowWizard(false);
  };

  if (showWizard) {
    return (
      <div>
        {error && (
          <div className="max-w-4xl mx-auto mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3">
              <svg className="animate-spin h-6 w-6 text-blue-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-gray-900">Saving profile...</span>
            </div>
          </div>
        )}
        <OnboardingWizard profile={profile} onComplete={handleComplete} onSkip={handleSkip} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            Profile saved successfully!
          </div>
        )}
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <button
            onClick={() => setShowWizard(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Edit Profile
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <span className="ml-2 text-gray-900">{profile.fullName || 'Not set'}</span>
              </div>
              <div>
                <span className="text-gray-600">Phone:</span>
                <span className="ml-2 text-gray-900">{profile.phone || 'Not set'}</span>
              </div>
              <div>
                <span className="text-gray-600">License:</span>
                <span className="ml-2 text-gray-900">{profile.licenseNumber || 'Not set'}</span>
              </div>
              <div>
                <span className="text-gray-600">Experience:</span>
                <span className="ml-2 text-gray-900">{profile.yearsOfExperience} years</span>
              </div>
            </div>
          </div>

          {profile.specialization && profile.specialization.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Specializations</h3>
              <div className="flex flex-wrap gap-2">
                {profile.specialization.map((spec, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}

          {profile.certifications && profile.certifications.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Certifications</h3>
              <div className="space-y-2">
                {profile.certifications.map((cert, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900">{cert.name}</h4>
                    <p className="text-sm text-gray-600">{cert.issuingOrganization}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {profile.bio && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Bio</h3>
              <p className="text-gray-700">{profile.bio}</p>
            </div>
          )}

          {profile.languages && profile.languages.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {profile.languages.map((lang, index) => (
                  <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileOnboarding;
