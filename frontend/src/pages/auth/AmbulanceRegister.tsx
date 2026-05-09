/**
 * Ambulance Service Registration
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const serviceTypes = [
  'Basic Life Support (BLS)',
  'Advanced Life Support (ALS)',
  'Critical Care Transport',
  'Air Ambulance',
  'Non-Emergency Medical Transport',
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
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateForm = () => {
    if (!formData.serviceName || !formData.email || !formData.phone ||
      !formData.emergencyNumber || !formData.registrationNumber ||
      !formData.serviceType || !formData.password || !formData.confirmPassword) {
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
      localStorage.setItem('ambulanceRegisterData', JSON.stringify(formData));
      navigate('/register/ambulance/otp-verify');
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'block w-full pl-3 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-2';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left — Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <img src="/logo512.png" alt="Health Market Arena Logo" className="w-16 h-16 rounded-2xl shadow-lg" />
              </div>
              <h1 className="text-3xl font-bold text-blue-600 mb-2">Welcome to Health Market Arena</h1>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Register Ambulance Service</h2>
              <p className="text-gray-600">Join our emergency response network</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div>
                <label className={labelClass}>Service Name *</label>
                <input name="serviceName" type="text" required placeholder="e.g., City Emergency Ambulance"
                  value={formData.serviceName} onChange={handleChange} className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Email *</label>
                  <input name="email" type="email" required value={formData.email} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Office Phone *</label>
                  <input name="phone" type="tel" required placeholder="+234..." value={formData.phone} onChange={handleChange} className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Emergency Hotline *</label>
                <input name="emergencyNumber" type="tel" required placeholder="+234..."
                  value={formData.emergencyNumber} onChange={handleChange}
                  className="block w-full px-3 py-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-red-50 text-sm" />
                <p className="mt-1 text-xs text-red-600">This number will be displayed for emergency calls</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Registration Number *</label>
                  <input name="registrationNumber" type="text" required value={formData.registrationNumber} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Service Type *</label>
                  <select name="serviceType" required value={formData.serviceType} onChange={handleChange} className={inputClass}>
                    <option value="">Select type</option>
                    {serviceTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Base Address</label>
                <input name="baseAddress" type="text" value={formData.baseAddress} onChange={handleChange} className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>City</label>
                  <input name="city" type="text" value={formData.city} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>State</label>
                  <input name="state" type="text" value={formData.state} onChange={handleChange} className={inputClass} />
                </div>
              </div>

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

              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed">
                {loading ? 'Sending OTP...' : 'Continue to Verification'}
              </button>

              <div className="text-center">
                <p className="text-gray-600 text-sm">
                  Already registered?{' '}
                  <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">Sign in</a>
                </p>
              </div>
            </form>
          </div>

          {/* Right — Illustration */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative">
              <svg className="w-full h-auto max-w-lg" viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Ambulance body */}
                <rect x="80" y="200" width="280" height="120" rx="12" fill="#DBEAFE" stroke="#2563EB" strokeWidth="3" />
                {/* Cab */}
                <rect x="300" y="160" width="80" height="160" rx="10" fill="#BFDBFE" stroke="#2563EB" strokeWidth="2" />
                {/* Windows */}
                <rect x="100" y="220" width="80" height="50" rx="6" fill="#93C5FD" />
                <rect x="310" y="175" width="55" height="45" rx="6" fill="#93C5FD" />
                {/* Wheels */}
                <circle cx="150" cy="330" r="30" fill="#1E3A5F" />
                <circle cx="150" cy="330" r="18" fill="#DBEAFE" />
                <circle cx="310" cy="330" r="30" fill="#1E3A5F" />
                <circle cx="310" cy="330" r="18" fill="#DBEAFE" />
                {/* Cross */}
                <rect x="185" y="225" width="15" height="45" rx="4" fill="#2563EB" />
                <rect x="170" y="240" width="45" height="15" rx="4" fill="#2563EB" />
                {/* Siren */}
                <rect x="300" y="148" width="80" height="18" rx="6" fill="#EF4444" />
                <circle cx="320" cy="157" r="6" fill="#FCA5A5" />
                <circle cx="360" cy="157" r="6" fill="#FCA5A5" />
                {/* Road */}
                <rect x="0" y="355" width="500" height="20" rx="4" fill="#E5E7EB" />
                <rect x="60" y="362" width="60" height="6" rx="3" fill="white" />
                <rect x="200" y="362" width="60" height="6" rx="3" fill="white" />
                <rect x="340" y="362" width="60" height="6" rx="3" fill="white" />
                {/* Stars/sparkles */}
                <path d="M430 80 L433 87 L440 90 L433 93 L430 100 L427 93 L420 90 L427 87 Z" fill="#FCD34D" />
                <path d="M60 120 L62 125 L67 127 L62 129 L60 134 L58 129 L53 127 L58 125 Z" fill="#FCD34D" />
                <path d="M400 200 L402 205 L407 207 L402 209 L400 214 L398 209 L393 207 L398 205 Z" fill="#93C5FD" />
                {/* Text badge */}
                <rect x="100" y="155" width="160" height="40" rx="8" fill="#2563EB" />
                <text x="180" y="180" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">AMBULANCE</text>
              </svg>
            </div>
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

export default AmbulanceRegister;
