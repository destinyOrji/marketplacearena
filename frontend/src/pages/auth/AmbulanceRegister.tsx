/**
 * Ambulance Service Registration Step 1 - Basic Information
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const serviceTypes = [
  'Basic Life Support (BLS)',
  'Advanced Life Support (ALS)',
  'Critical Care Transport',
  'Air Ambulance',
  'Non-Emergency Medical Transport'
];

const AmbulanceRegister: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    serviceName: '',
    email: '',
    phone: '',
    emergencyNumber: '',
    registrationNumber: '',
    serviceType: '',
    baseAddress: '',
    city: '',
    state: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.serviceName || !formData.email || !formData.phone || !formData.emergencyNumber || 
        !formData.registrationNumber || !formData.serviceType || !formData.password || !formData.confirmPassword) {
      setError('Please fill all required fields');
      return false;
    }
    if (!formData.phone.startsWith('+') || !formData.emergencyNumber.startsWith('+')) {
      setError('Phone numbers must include country code (e.g., +234...)');
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
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api/v1'}/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      // Store form data and navigate to OTP verification
      localStorage.setItem('ambulanceRegisterData', JSON.stringify(formData));
      navigate('/register/ambulance/otp-verify');
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <img src="/logo512.png" alt="Logo" className="w-16 h-16 rounded-2xl shadow-lg mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-red-600 mb-2">Register Ambulance Service</h1>
          <p className="text-gray-600">Join our emergency response network</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Service Name *</label>
            <input name="serviceName" type="text" required placeholder="e.g., City Emergency Ambulance" value={formData.serviceName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input name="email" type="email" required value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Office Phone *</label>
              <input name="phone" type="tel" required placeholder="+234..." value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Hotline *</label>
            <input name="emergencyNumber" type="tel" required placeholder="+234..." value={formData.emergencyNumber} onChange={handleChange} className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-red-50" />
            <p className="mt-1 text-xs text-red-600">This number will be displayed for emergency calls</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Registration Number *</label>
              <input name="registrationNumber" type="text" required value={formData.registrationNumber} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Type *</label>
              <select name="serviceType" required value={formData.serviceType} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500">
                <option value="">Select type</option>
                {serviceTypes.map((type: string) => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Base Address</label>
            <input name="baseAddress" type="text" value={formData.baseAddress} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input name="city" type="text" value={formData.city} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <input name="state" type="text" value={formData.state} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
              <input name="password" type="password" required value={formData.password} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
              <input name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg disabled:bg-gray-400">
            {loading ? 'Sending OTP...' : 'Continue to Verification'}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">Already registered? <a href="/login" className="text-red-600 font-semibold">Sign in</a></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AmbulanceRegister;
