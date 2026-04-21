// Onboarding Wizard Component - Multi-step profile completion

import React, { useState } from 'react';
import { ProfessionalProfile, Certification, Education } from '../types';
import DocumentUpload from './DocumentUpload';

interface OnboardingWizardProps {
  profile: Partial<ProfessionalProfile>;
  onComplete: (profile: Partial<ProfessionalProfile>) => void;
  onSkip?: () => void;
}

type Step = 'basic' | 'specialization' | 'certifications' | 'education' | 'bio';

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ profile, onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState<Step>('basic');
  const [formData, setFormData] = useState<Partial<ProfessionalProfile>>(profile);

  const steps: Step[] = ['basic', 'specialization', 'certifications', 'education', 'bio'];
  const stepIndex = steps.indexOf(currentStep);
  const progress = ((stepIndex + 1) / steps.length) * 100;

  const handleNext = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    } else {
      onComplete(formData);
    }
  };

  const handleBack = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const updateFormData = (updates: Partial<ProfessionalProfile>) => {
    setFormData({ ...formData, ...updates });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold text-gray-900">Complete Your Profile</h2>
          <span className="text-sm text-gray-600">{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
        {currentStep === 'basic' && (
          <BasicInfoStep formData={formData} updateFormData={updateFormData} />
        )}
        {currentStep === 'specialization' && (
          <SpecializationStep formData={formData} updateFormData={updateFormData} />
        )}
        {currentStep === 'certifications' && (
          <CertificationsStep formData={formData} updateFormData={updateFormData} />
        )}
        {currentStep === 'education' && (
          <EducationStep formData={formData} updateFormData={updateFormData} />
        )}
        {currentStep === 'bio' && (
          <BioStep formData={formData} updateFormData={updateFormData} />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={handleBack}
          disabled={stepIndex === 0}
          className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>
        <div className="flex gap-3">
          {onSkip && (
            <button
              onClick={onSkip}
              className="px-6 py-2 text-gray-600 hover:text-gray-800"
            >
              Skip for now
            </button>
          )}
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {stepIndex === steps.length - 1 ? 'Complete' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Step Components
interface StepProps {
  formData: Partial<ProfessionalProfile>;
  updateFormData: (updates: Partial<ProfessionalProfile>) => void;
}

const BasicInfoStep: React.FC<StepProps> = ({ formData, updateFormData }) => {
  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            value={formData.fullName || ''}
            onChange={(e) => updateFormData({ fullName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => updateFormData({ phone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            License Number *
          </label>
          <input
            type="text"
            value={formData.licenseNumber || ''}
            onChange={(e) => updateFormData({ licenseNumber: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Years of Experience *
          </label>
          <input
            type="number"
            min="0"
            value={formData.yearsOfExperience || 0}
            onChange={(e) => updateFormData({ yearsOfExperience: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>
    </div>
  );
};

const SpecializationStep: React.FC<StepProps> = ({ formData, updateFormData }) => {
  const [newSpecialization, setNewSpecialization] = useState('');
  const specializations = formData.specialization || [];

  const addSpecialization = () => {
    if (newSpecialization.trim()) {
      updateFormData({ specialization: [...specializations, newSpecialization.trim()] });
      setNewSpecialization('');
    }
  };

  const removeSpecialization = (index: number) => {
    updateFormData({ specialization: specializations.filter((_, i) => i !== index) });
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Specialization</h3>
      <p className="text-gray-600 mb-4">Add your areas of expertise and specialization</p>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newSpecialization}
            onChange={(e) => setNewSpecialization(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addSpecialization()}
            placeholder="e.g., Cardiology, Pediatrics"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={addSpecialization}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add
          </button>
        </div>

        {specializations.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {specializations.map((spec, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full"
              >
                {spec}
                <button
                  onClick={() => removeSpecialization(index)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CertificationsStep: React.FC<StepProps> = ({ formData, updateFormData }) => {
  const certifications = formData.certifications || [];
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCert, setNewCert] = useState({
    name: '',
    issuingOrganization: '',
    issueDate: '',
    expiryDate: '',
  });
  const [documents, setDocuments] = useState<any[]>([]);

  const handleAddCertification = () => {
    if (newCert.name && newCert.issuingOrganization && newCert.issueDate) {
      const certification: Certification = {
        id: Date.now().toString(),
        name: newCert.name,
        issuingOrganization: newCert.issuingOrganization,
        issueDate: new Date(newCert.issueDate),
        expiryDate: newCert.expiryDate ? new Date(newCert.expiryDate) : undefined,
        documentUrl: documents[0]?.url || '',
      };
      updateFormData({ certifications: [...certifications, certification] });
      setNewCert({ name: '', issuingOrganization: '', issueDate: '', expiryDate: '' });
      setDocuments([]);
      setShowAddForm(false);
    }
  };

  const handleRemoveCertification = (id: string) => {
    updateFormData({ certifications: certifications.filter(cert => cert.id !== id) });
  };

  const handleUpload = async (file: File) => {
    // Mock upload - in real app, upload to server
    const mockDoc = {
      id: Date.now().toString(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      uploadedAt: new Date(),
    };
    setDocuments([mockDoc]);
    return mockDoc;
  };

  const handleRemoveDoc = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Certifications & Licenses</h3>
      <p className="text-gray-600 mb-4">Add your professional certifications</p>
      
      <div className="space-y-4">
        {certifications.map((cert) => (
          <div key={cert.id} className="p-4 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900">{cert.name}</h4>
                <p className="text-sm text-gray-600">{cert.issuingOrganization}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Issued: {new Date(cert.issueDate).toLocaleDateString()}
                  {cert.expiryDate && ` • Expires: ${new Date(cert.expiryDate).toLocaleDateString()}`}
                </p>
              </div>
              <button
                onClick={() => handleRemoveCertification(cert.id)}
                className="text-red-600 hover:text-red-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}

        {showAddForm ? (
          <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Certification Name *
              </label>
              <input
                type="text"
                value={newCert.name}
                onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Board Certified in Cardiology"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issuing Organization *
              </label>
              <input
                type="text"
                value={newCert.issuingOrganization}
                onChange={(e) => setNewCert({ ...newCert, issuingOrganization: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., American Board of Internal Medicine"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Date *
                </label>
                <input
                  type="date"
                  value={newCert.issueDate}
                  onChange={(e) => setNewCert({ ...newCert, issueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={newCert.expiryDate}
                  onChange={(e) => setNewCert({ ...newCert, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Certificate Document
              </label>
              <DocumentUpload
                documents={documents}
                onUpload={handleUpload}
                onRemove={handleRemoveDoc}
                label="Upload Certificate"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleAddCertification}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Certification
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewCert({ name: '', issuingOrganization: '', issueDate: '', expiryDate: '' });
                  setDocuments([]);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600"
          >
            + Add Certification
          </button>
        )}
      </div>
    </div>
  );
};

const EducationStep: React.FC<StepProps> = ({ formData, updateFormData }) => {
  const education = formData.education || [];

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Education</h3>
      <p className="text-gray-600 mb-4">Add your educational background (optional)</p>
      
      <div className="space-y-4">
        {education.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No education added yet</p>
        ) : (
          education.map((edu, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900">{edu.degree}</h4>
              <p className="text-sm text-gray-600">{edu.institution} - {edu.graduationYear}</p>
            </div>
          ))
        )}
        
        <button className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600">
          + Add Education
        </button>
      </div>
    </div>
  );
};

const BioStep: React.FC<StepProps> = ({ formData, updateFormData }) => {
  const [newLanguage, setNewLanguage] = useState('');
  const languages = formData.languages || [];

  const addLanguage = () => {
    if (newLanguage.trim()) {
      updateFormData({ languages: [...languages, newLanguage.trim()] });
      setNewLanguage('');
    }
  };

  const removeLanguage = (index: number) => {
    updateFormData({ languages: languages.filter((_, i) => i !== index) });
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Bio & Languages</h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Professional Bio
          </label>
          <textarea
            value={formData.bio || ''}
            onChange={(e) => updateFormData({ bio: e.target.value })}
            rows={6}
            placeholder="Tell patients about yourself, your experience, and approach to healthcare..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Languages Spoken
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
              placeholder="e.g., English, Spanish"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={addLanguage}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
          </div>

          {languages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {languages.map((lang, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full"
                >
                  {lang}
                  <button
                    onClick={() => removeLanguage(index)}
                    className="text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
