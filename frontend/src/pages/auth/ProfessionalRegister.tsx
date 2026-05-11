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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left — Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <img src="/logo512.png" alt="Health Market Arena Logo" className="w-16 h-16 rounded-2xl shadow-lg" />
              </div>
              <h1 className="text-3xl font-bold text-blue-600 mb-2">Welcome to Health Market Arena</h1>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Register as Professional</h2>
              <p className="text-gray-600">Join our network of healthcare professionals</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>First Name *</label>
                  <input name="firstName" type="text" required value={formData.firstName} onChange={handleChange} className={inputClass} placeholder="Enter First name" />
                </div>
                <div>
                  <label className={labelClass}>Last Name *</label>
                  <input name="lastName" type="text" required value={formData.lastName} onChange={handleChange} className={inputClass} placeholder="Enter Last name" />
                </div>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Email *</label>
                  <input name="email" type="email" required value={formData.email} onChange={handleChange} className={inputClass} placeholder="Enter Email" />
                </div>
                <div>
                  <label className={labelClass}>Phone *</label>
                  <input name="phone" type="tel" required placeholder="+234..." value={formData.phone} onChange={handleChange} className={inputClass} />
                  <p className="text-xs text-gray-400 mt-1">Include country code (e.g., +234...)</p>
                </div>
              </div>

              {/* Professional Type */}
              <div>
                <label className={labelClass}>Professional Type *</label>
                <select name="professionalType" required value={formData.professionalType} onChange={handleChange} className={inputClass}>
                  <option value="">— Select your professional type —</option>
                  {Object.keys(PROFESSIONAL_TYPES).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Specialization */}
              {formData.professionalType && (
                <div>
                  <label className={labelClass}>Specialization *</label>
                  <select name="specialization" required value={formData.specialization} onChange={handleChange} className={inputClass}>
                    <option value="">— Select your specialization —</option>
                    {specializations.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">Based on your selected professional type.</p>
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
                  <input name="password" type="password" required value={formData.password} onChange={handleChange} className={inputClass} placeholder="Enter Password" />
                </div>
                <div>
                  <label className={labelClass}>Confirm Password *</label>
                  <input name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange} className={inputClass} placeholder="Confirm Password" />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg disabled:bg-gray-400 transition-colors">
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

          {/* Right — Illustration */}
          <div className="hidden lg:flex items-center justify-center">
            <svg className="w-full h-auto max-w-lg" viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Doctor with stethoscope */}
              <circle cx="250" cy="100" r="50" fill="#BFDBFE" stroke="#2563EB" strokeWidth="2" />
              <rect x="220" y="150" width="60" height="100" rx="10" fill="#2563EB" />
              <rect x="185" y="165" width="40" height="14" rx="7" fill="#93C5FD" />
              <rect x="275" y="165" width="40" height="14" rx="7" fill="#93C5FD" />
              <rect x="220" y="250" width="25" height="70" rx="8" fill="#1D4ED8" />
              <rect x="255" y="250" width="25" height="70" rx="8" fill="#1D4ED8" />
              {/* Stethoscope */}
              <path d="M290 170 Q310 190 300 220" stroke="#2563EB" strokeWidth="4" fill="none" strokeLinecap="round" />
              <circle cx="300" cy="225" r="10" fill="#2563EB" />
              {/* Medical cross */}
              <rect x="380" y="80" width="14" height="50" rx="4" fill="#2563EB" />
              <rect x="362" y="98" width="50" height="14" rx="4" fill="#2563EB" />
              {/* Clipboard */}
              <rect x="60" y="160" width="80" height="100" rx="8" fill="#DBEAFE" stroke="#2563EB" strokeWidth="2" />
              <rect x="75" y="180" width="50" height="6" rx="3" fill="#2563EB" />
              <rect x="75" y="196" width="50" height="6" rx="3" fill="#93C5FD" />
              <rect x="75" y="212" width="35" height="6" rx="3" fill="#93C5FD" />
              <rect x="85" y="148" width="30" height="20" rx="4" fill="#2563EB" />
              {/* Heart rate */}
              <polyline points="60,320 100,320 120,280 140,360 160,300 180,320 220,320" stroke="#2563EB" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              {/* Stars */}
              <path d="M420 180 L423 187 L430 190 L423 193 L420 200 L417 193 L410 190 L417 187 Z" fill="#FCD34D" />
              <path d="M70 100 L72 105 L77 107 L72 109 L70 114 L68 109 L63 107 L68 105 Z" fill="#FCD34D" />
              <path d="M400 300 L402 305 L407 307 L402 309 L400 314 L398 309 L393 307 L398 305 Z" fill="#93C5FD" />
              {/* Floor */}
              <rect x="0" y="355" width="500" height="15" rx="4" fill="#E5E7EB" />
            </svg>
          </div>
        </div>
      </div>

      <footer className="py-6 border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex space-x-6 text-sm text-gray-600">
              <a href="/about" className="hover:text-blue-600 transition-colors">About Us</a>
              <a href="/contact" className="hover:text-blue-600 transition-colors">Contact</a>
              <a href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
            </div>
            <p className="text-sm text-gray-500">© 2026 Health Market Arena. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProfessionalRegister;
