/**
 * Professional Registration - All Information
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const professionalTypes = [
  'doctor',
  'nurse',
  'technician',
  'therapist',
  'pharmacist',
  'physiotherapist',
  'other'
];

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
    licenseNumber: '',
    specialization: '',
    yearsOfExperience: '0'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || 
        !formData.password || !formData.confirmPassword || !formData.professionalType || 
        !formData.licenseNumber || !formData.specialization) {
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
      // Send OTP to phone
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api'}/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      // Store form data and navigate to OTP verification
      localStorage.setItem('professionalRegisterData', JSON.stringify(formData));
      navigate('/register/professional/otp-verify');
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <img src="/logo512.png" alt="Logo" className="w-16 h-16 rounded-2xl shadow-lg mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-green-600 mb-2">Register as Professional</h1>
          <p className="text-gray-600">Join our network of healthcare professionals</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
              <input name="firstName" type="text" required value={formData.firstName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
              <input name="lastName" type="text" required value={formData.lastName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input name="email" type="email" required value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
              <input name="phone" type="tel" required placeholder="+234..." value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Professional Type *</label>
              <select name="professionalType" required value={formData.professionalType} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                <option value="">Select type</option>
                {professionalTypes.map((type: string) => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">License Number *</label>
              <input name="licenseNumber" type="text" required value={formData.licenseNumber} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Specialization *</label>
              <input name="specialization" type="text" required placeholder="e.g., Cardiology" value={formData.specialization} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience *</label>
              <input name="yearsOfExperience" type="number" required min="0" value={formData.yearsOfExperience} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
              <input name="password" type="password" required value={formData.password} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
              <input name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg disabled:bg-gray-400">
            {loading ? 'Sending OTP...' : 'Continue to Verification'}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">Already registered? <a href="/login" className="text-green-600 font-semibold">Sign in</a></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfessionalRegister;
