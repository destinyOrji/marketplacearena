/**
 * Professional Registration
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// All professional types with their matching specializations
const PROFESSIONAL_TYPES: Record<string, string[]> = {
  'Doctor (General Practitioner)': [
    'General Practice', 'Family Medicine', 'Internal Medicine', 'Geriatrics',
  ],
  'Doctor (Specialist)': [
    'Cardiology', 'Neurology', 'Oncology', 'Orthopedics', 'Pediatrics',
    'Psychiatry', 'Dermatology', 'Gastroenterology', 'Endocrinology',
    'Nephrology', 'Pulmonology', 'Rheumatology', 'Urology', 'Ophthalmology',
    'ENT (Ear, Nose & Throat)', 'Hematology', 'Infectious Disease',
    'Reproductive Medicine', 'Sports Medicine',
  ],
  'Surgeon': [
    'General Surgery', 'Cardiothoracic Surgery', 'Neurosurgery',
    'Orthopedic Surgery', 'Plastic & Reconstructive Surgery',
    'Vascular Surgery', 'Pediatric Surgery', 'Laparoscopic Surgery',
  ],
  'Nurse': [
    'General Nursing', 'Critical Care Nursing', 'Pediatric Nursing',
    'Midwifery', 'Psychiatric Nursing', 'Oncology Nursing',
    'Community Health Nursing', 'Perioperative Nursing',
  ],
  'Pharmacist': [
    'Clinical Pharmacy', 'Community Pharmacy', 'Hospital Pharmacy',
    'Industrial Pharmacy', 'Pharmaceutical Research',
  ],
  'Physiotherapist': [
    'Musculoskeletal Physiotherapy', 'Neurological Physiotherapy',
    'Cardiopulmonary Physiotherapy', 'Pediatric Physiotherapy',
    'Sports Physiotherapy', 'Geriatric Physiotherapy',
  ],
  'Therapist': [
    'Occupational Therapy', 'Speech & Language Therapy',
    'Psychotherapy', 'Cognitive Behavioral Therapy (CBT)',
    'Radiation Therapy', 'Respiratory Therapy',
  ],
  'Dentist': [
    'General Dentistry', 'Orthodontics', 'Oral Surgery',
    'Periodontics', 'Endodontics', 'Prosthodontics', 'Pediatric Dentistry',
  ],
  'Radiologist / Imaging Specialist': [
    'Diagnostic Radiology', 'Interventional Radiology',
    'Nuclear Medicine', 'Ultrasound', 'MRI Specialist',
  ],
  'Laboratory Scientist / Technician': [
    'Clinical Biochemistry', 'Haematology', 'Microbiology',
    'Histopathology', 'Immunology', 'Medical Laboratory Science',
  ],
  'Nutritionist / Dietitian': [
    'Clinical Nutrition', 'Sports Nutrition', 'Pediatric Nutrition',
    'Diabetes & Metabolic Nutrition', 'Community Nutrition',
  ],
  'Mental Health Professional': [
    'Psychiatry', 'Clinical Psychology', 'Counselling Psychology',
    'Neuropsychology', 'Child & Adolescent Psychology',
  ],
  'Emergency Medical Technician (EMT)': [
    'Basic Life Support (BLS)', 'Advanced Life Support (ALS)',
    'Paramedic', 'Critical Care Transport',
  ],
  'Other Healthcare Professional': [
    'Health Administration', 'Public Health', 'Medical Research',
    'Healthcare IT', 'Medical Education', 'Other',
  ],
};

const ProfessionalRegister: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    professionalType: '',
    specialization: '',
    licenseNumber: '',
    yearsOfExperience: '0',
  });

  const specializations = formData.professionalType
    ? PROFESSIONAL_TYPES[formData.professionalType] || []
    : [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset specialization when type changes
      ...(name === 'professionalType' ? { specialization: '' } : {}),
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone ||
      !formData.password || !formData.confirmPassword || !formData.professionalType ||
      !formData.specialization || !formData.licenseNumber) {
      setError('Please fill all required fields');
      return false;
    }
    if (!formData.phone.startsWith('+')) {
      setError('Phone number must include country code (e.g., +234...)');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api'}/otp/send`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: formData.phone }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to send OTP');
      localStorage.setItem('professionalRegisterData', JSON.stringify(formData));
      navigate('/register/professional/otp-verify');
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Register as Professional</h1>
          <p className="text-gray-600">Join our network of healthcare professionals</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>First Name *</label>
              <input name="firstName" type="text" required value={formData.firstName} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Last Name *</label>
              <input name="lastName" type="text" required value={formData.lastName} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Email *</label>
              <input name="email" type="email" required value={formData.email} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone *</label>
              <input name="phone" type="tel" required placeholder="+234..." value={formData.phone} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          {/* Professional Type */}
          <div>
            <label className={labelClass}>Professional Type *</label>
            <select
              name="professionalType"
              required
              value={formData.professionalType}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">— Select your professional type —</option>
              {Object.keys(PROFESSIONAL_TYPES).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Specialization — only shown after type is selected */}
          {formData.professionalType && (
            <div>
              <label className={labelClass}>Specialization *</label>
              <select
                name="specialization"
                required
                value={formData.specialization}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">— Select your specialization —</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Specializations shown are based on your selected professional type.
              </p>
            </div>
          )}

          {/* License & Experience */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>License Number *</label>
              <input name="licenseNumber" type="text" required value={formData.licenseNumber} onChange={handleChange} className={inputClass} placeholder="e.g., MDCN-12345" />
            </div>
            <div>
              <label className={labelClass}>Years of Experience</label>
              <input name="yearsOfExperience" type="number" min="0" max="60" value={formData.yearsOfExperience} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          {/* Password */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Password *</label>
              <input name="password" type="password" required value={formData.password} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Confirm Password *</label>
              <input name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Sending OTP...' : 'Continue to Verification'}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already registered?{' '}
              <a href="/login" className="text-blue-600 font-semibold hover:underline">Sign in</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfessionalRegister;
