// Profile Onboarding Page
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import DocumentUpload, { UploadedDocument } from '../components/DocumentUpload';
import { profileApi } from '../services/api';
import { profileSchema, ProfileFormData } from '../utils/validation';

interface DocumentState {
  license?: UploadedDocument;
  certification?: UploadedDocument;
  insurance?: UploadedDocument;
  vehicleRegistration?: UploadedDocument;
}

const SERVICE_TYPE_OPTIONS = [
  { value: 'ambulance', label: 'Ambulance Service' },
  { value: 'paramedic', label: 'Paramedic Service' },
  { value: 'fire', label: 'Fire Response' },
  { value: 'rescue', label: 'Rescue Service' },
  { value: 'medical-transport', label: 'Medical Transport' },
];

const ProfileOnboarding: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentState>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      organizationName: '',
      contactPerson: '',
      phone: '',
      emergencyPhone: '',
      licenseNumber: '',
      insuranceNumber: '',
      yearsOfExperience: 0,
      serviceTypes: [],
    },
  });

  const selectedServiceTypes = watch('serviceTypes');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await profileApi.getProfile();
      setValue('organizationName', profile.organizationName || '');
      setValue('contactPerson', profile.contactPerson || '');
      setValue('phone', profile.phone || '');
      setValue('emergencyPhone', profile.emergencyPhone || '');
      setValue('licenseNumber', profile.licenseNumber || '');
      setValue('insuranceNumber', profile.insuranceNumber || '');
      setValue('yearsOfExperience', profile.yearsOfExperience || 0);
      setValue('serviceTypes', profile.serviceTypes || []);
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (file: File, documentType: string) => {
    try {
      const documentUrl = await profileApi.uploadDocument(file, documentType);
      
      const uploadedDoc: UploadedDocument = {
        id: Date.now().toString(),
        type: documentType,
        name: file.name,
        url: documentUrl,
        uploadedAt: new Date(),
      };

      setDocuments(prev => ({
        ...prev,
        [documentType]: uploadedDoc,
      }));
      
      toast.success(`${file.name} uploaded successfully`);
    } catch (error) {
      console.error('Failed to upload document:', error);
      toast.error('Failed to upload document. Please try again.');
      throw error;
    }
  };

  const handleDocumentRemove = (documentType: string) => {
    setDocuments(prev => {
      const updated = { ...prev };
      delete updated[documentType as keyof DocumentState];
      return updated;
    });
    toast.info('Document removed');
  };

  const handleServiceTypeToggle = (serviceType: string) => {
    const currentTypes = selectedServiceTypes || [];
    const newTypes = currentTypes.includes(serviceType)
      ? currentTypes.filter(t => t !== serviceType)
      : [...currentTypes, serviceType];
    setValue('serviceTypes', newTypes, { shouldValidate: true });
  };

  const onSubmit = async (data: ProfileFormData) => {
    // Validate that all required documents are uploaded
    if (!documents.license || !documents.certification || !documents.insurance || !documents.vehicleRegistration) {
      toast.error('Please upload all required documents before submitting');
      return;
    }

    setSaving(true);
    try {
      await profileApi.updateProfile({
        organizationName: data.organizationName,
        contactPerson: data.contactPerson,
        phone: data.phone,
        emergencyPhone: data.emergencyPhone,
        licenseNumber: data.licenseNumber,
        insuranceNumber: data.insuranceNumber,
        yearsOfExperience: data.yearsOfExperience,
        serviceTypes: data.serviceTypes,
      } as any);

      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile. Please try again.';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile & Onboarding</h1>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Organization Information</h2>
            <p className="text-sm text-gray-600">
              Provide your organization details and contact information
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 mb-2">
                Organization Name <span className="text-red-500">*</span>
              </label>
              <input
                id="organizationName"
                type="text"
                {...register('organizationName')}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.organizationName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter organization name"
              />
              {errors.organizationName && (
                <p className="mt-1 text-sm text-red-600">{errors.organizationName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Person <span className="text-red-500">*</span>
              </label>
              <input
                id="contactPerson"
                type="text"
                {...register('contactPerson')}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.contactPerson ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter contact person name"
              />
              {errors.contactPerson && (
                <p className="mt-1 text-sm text-red-600">{errors.contactPerson.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                {...register('phone')}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+1234567890"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="emergencyPhone" className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Phone <span className="text-red-500">*</span>
              </label>
              <input
                id="emergencyPhone"
                type="tel"
                {...register('emergencyPhone')}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.emergencyPhone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+1234567890"
              />
              {errors.emergencyPhone && (
                <p className="mt-1 text-sm text-red-600">{errors.emergencyPhone.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-2">
                License Number <span className="text-red-500">*</span>
              </label>
              <input
                id="licenseNumber"
                type="text"
                {...register('licenseNumber')}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.licenseNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter license number"
              />
              {errors.licenseNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.licenseNumber.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="insuranceNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Insurance Number <span className="text-red-500">*</span>
              </label>
              <input
                id="insuranceNumber"
                type="text"
                {...register('insuranceNumber')}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.insuranceNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter insurance number"
              />
              {errors.insuranceNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.insuranceNumber.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700 mb-2">
                Years of Experience <span className="text-red-500">*</span>
              </label>
              <input
                id="yearsOfExperience"
                type="number"
                min="0"
                {...register('yearsOfExperience', { valueAsNumber: true })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.yearsOfExperience ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {errors.yearsOfExperience && (
                <p className="mt-1 text-sm text-red-600">{errors.yearsOfExperience.message}</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Service Types <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {SERVICE_TYPE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedServiceTypes?.includes(option.value)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedServiceTypes?.includes(option.value) || false}
                    onChange={() => handleServiceTypeToggle(option.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
            {errors.serviceTypes && (
              <p className="mt-2 text-sm text-red-600">{errors.serviceTypes.message}</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Required Documents</h2>
            <p className="text-sm text-gray-600">
              Upload the following documents to complete your profile verification
            </p>
          </div>

          <div className="space-y-6">
            <DocumentUpload
              documentType="license"
              label="Professional License"
              description="Upload your valid professional license (EMT, Paramedic, etc.)"
              accept=".pdf,.jpg,.jpeg,.png"
              maxSizeMB={5}
              existingDocument={documents.license}
              onUpload={handleDocumentUpload}
              onRemove={() => handleDocumentRemove('license')}
              required
            />

            <DocumentUpload
              documentType="certification"
              label="Certifications"
              description="Upload relevant certifications (CPR, ACLS, PALS, etc.)"
              accept=".pdf,.jpg,.jpeg,.png"
              maxSizeMB={5}
              existingDocument={documents.certification}
              onUpload={handleDocumentUpload}
              onRemove={() => handleDocumentRemove('certification')}
              required
            />

            <DocumentUpload
              documentType="insurance"
              label="Insurance Certificate"
              description="Upload proof of liability insurance"
              accept=".pdf,.jpg,.jpeg,.png"
              maxSizeMB={5}
              existingDocument={documents.insurance}
              onUpload={handleDocumentUpload}
              onRemove={() => handleDocumentRemove('insurance')}
              required
            />

            <DocumentUpload
              documentType="vehicleRegistration"
              label="Vehicle Registration"
              description="Upload vehicle registration documents"
              accept=".pdf,.jpg,.jpeg,.png"
              maxSizeMB={5}
              existingDocument={documents.vehicleRegistration}
              onUpload={handleDocumentUpload}
              onRemove={() => handleDocumentRemove('vehicleRegistration')}
              required
            />
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfileOnboarding;
