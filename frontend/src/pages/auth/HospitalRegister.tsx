/**
 * Hospital Registration - Two-Column Layout with Illustration
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const hospitalTypes = [
  'General Hospital',
  'Specialist Hospital',
  'Teaching Hospital',
  'Private Hospital',
  'Clinic',
  'Medical Center'
];

const HospitalRegister: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    hospitalName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    registrationNumber: '',
    hospitalType: '',
    address: '',
    city: '',
    state: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateForm = () => {
    if (!formData.hospitalName || !formData.email || !formData.phone ||
      !formData.password || !formData.confirmPassword || !formData.registrationNumber ||
      !formData.hospitalType) {
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
      localStorage.setItem('hospitalRegisterData', JSON.stringify(formData));
      navigate('/register/hospital/otp-verify');
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
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Register Your Hospital</h2>
              <p className="text-gray-600">Join our healthcare network and reach more patients</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Hospital Name */}
              <div>
                <label className={labelClass}>Hospital Name *</label>
                <input name="hospitalName" type="text" required value={formData.hospitalName}
                  onChange={handleChange} className={inputClass} placeholder="Enter hospital name" />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Email *</label>
                  <input name="email" type="email" required value={formData.email}
                    onChange={handleChange} className={inputClass} placeholder="Enter email" />
                </div>
                <div>
                  <label className={labelClass}>Phone *</label>
                  <input name="phone" type="tel" required placeholder="+234..."
                    value={formData.phone} onChange={handleChange} className={inputClass} />
                  <p className="text-xs text-gray-400 mt-1">Include country code (e.g., +234...)</p>
                </div>
              </div>

              {/* Registration Number & Hospital Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Registration Number *</label>
                  <input name="registrationNumber" type="text" required value={formData.registrationNumber}
                    onChange={handleChange} className={inputClass} placeholder="e.g., HOS-12345" />
                </div>
                <div>
                  <label className={labelClass}>Hospital Type *</label>
                  <select name="hospitalType" required value={formData.hospitalType}
                    onChange={handleChange} className={inputClass}>
                    <option value="">— Select type —</option>
                    {hospitalTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className={labelClass}>Address</label>
                <input name="address" type="text" value={formData.address}
                  onChange={handleChange} className={inputClass} placeholder="Street address" />
              </div>

              {/* City & State */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>City</label>
                  <input name="city" type="text" value={formData.city}
                    onChange={handleChange} className={inputClass} placeholder="City" />
                </div>
                <div>
                  <label className={labelClass}>State</label>
                  <input name="state" type="text" value={formData.state}
                    onChange={handleChange} className={inputClass} placeholder="State" />
                </div>
              </div>

              {/* Password */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Password *</label>
                  <input name="password" type="password" required value={formData.password}
                    onChange={handleChange} className={inputClass} placeholder="Enter password" />
                </div>
                <div>
                  <label className={labelClass}>Confirm Password *</label>
                  <input name="confirmPassword" type="password" required value={formData.confirmPassword}
                    onChange={handleChange} className={inputClass} placeholder="Confirm password" />
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
              {/* Hospital building */}
              <rect x="120" y="160" width="260" height="180" rx="8" fill="#DBEAFE" stroke="#2563EB" strokeWidth="2" />
              {/* Roof */}
              <rect x="100" y="140" width="300" height="30" rx="6" fill="#2563EB" />
              {/* Hospital cross on building */}
              <rect x="233" y="170" width="14" height="50" rx="4" fill="#2563EB" />
              <rect x="215" y="188" width="50" height="14" rx="4" fill="#2563EB" />
              {/* Windows */}
              <rect x="140" y="200" width="40" height="35" rx="4" fill="#93C5FD" />
              <rect x="200" y="200" width="40" height="35" rx="4" fill="#93C5FD" />
              <rect x="320" y="200" width="40" height="35" rx="4" fill="#93C5FD" />
              <rect x="140" y="255" width="40" height="35" rx="4" fill="#93C5FD" />
              <rect x="320" y="255" width="40" height="35" rx="4" fill="#93C5FD" />
              {/* Door */}
              <rect x="210" y="285" width="80" height="55" rx="4" fill="#1D4ED8" />
              <circle cx="283" cy="315" r="4" fill="#BFDBFE" />
              {/* Flag pole */}
              <rect x="248" y="80" width="4" height="60" fill="#6B7280" />
              <rect x="252" y="80" width="30" height="20" rx="2" fill="#2563EB" />
              {/* Ambulance */}
              <rect x="30" y="290" width="80" height="45" rx="6" fill="#EFF6FF" stroke="#2563EB" strokeWidth="2" />
              <rect x="30" y="290" width="30" height="45" rx="6" fill="#BFDBFE" stroke="#2563EB" strokeWidth="2" />
              <circle cx="50" cy="340" r="10" fill="#374151" />
              <circle cx="50" cy="340" r="5" fill="#9CA3AF" />
              <circle cx="95" cy="340" r="10" fill="#374151" />
              <circle cx="95" cy="340" r="5" fill="#9CA3AF" />
              <rect x="42" y="298" width="8" height="20" rx="2" fill="#2563EB" />
              <rect x="36" y="304" width="20" height="8" rx="2" fill="#2563EB" />
              {/* Trees */}
              <rect x="390" y="290" width="10" height="50" rx="3" fill="#6B7280" />
              <ellipse cx="395" cy="270" rx="25" ry="30" fill="#BBF7D0" />
              <rect x="430" y="300" width="8" height="40" rx="3" fill="#6B7280" />
              <ellipse cx="434" cy="283" rx="20" ry="25" fill="#86EFAC" />
              {/* Stars */}
              <path d="M60 100 L63 107 L70 110 L63 113 L60 120 L57 113 L50 110 L57 107 Z" fill="#FCD34D" />
              <path d="M440 160 L442 165 L447 167 L442 169 L440 174 L438 169 L433 167 L438 165 Z" fill="#FCD34D" />
              <path d="M80 200 L82 205 L87 207 L82 209 L80 214 L78 209 L73 207 L78 205 Z" fill="#93C5FD" />
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

export default HospitalRegister;
