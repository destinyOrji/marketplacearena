import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserIcon, PhoneIcon, EnvelopeIcon } from '../../components/Icons';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

// Simple Lock Icon component
const LockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const PatientRegister: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName) {
      setError('Please enter your full name');
      return false;
    }
    if (!formData.email) {
      setError('Please enter your email');
      return false;
    }
    if (!formData.phone) {
      setError('Please enter your phone number');
      return false;
    }
    if (!formData.phone.startsWith('+')) {
      setError('Phone number must include country code (e.g., +234...)');
      return false;
    }
    return true;
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Send OTP to phone number
      await axios.post(`${API_URL}/otp/send`, {
        phoneNumber: formData.phone,
        userType: 'patient'
      });

      // Store form data and navigate to OTP verification
      localStorage.setItem('patientRegisterStep1', JSON.stringify(formData));
      navigate('/register/patient/otp-verify');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            {/* Header */}
            <div className="text-center mb-8">
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <img 
                  src="/logo512.png" 
                  alt="Marketplace Health Logo" 
                  className="w-16 h-16 rounded-2xl shadow-lg"
                />
              </div>

              <h1 className="text-3xl font-bold text-blue-600 mb-2">
                Welcome to Marketplace Health
              </h1>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Lets get you Started
              </h2>
              <p className="text-gray-600">
                Get started with seamless access to healthcare
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleNext} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Basic Information
                </h3>

                {/* First Name and Last Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      First Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Enter First name"
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Last Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Enter Last name"
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Phone Number */}
                <div className="mb-4">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PhoneIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+2349012345678"
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Include country code (e.g., +234...)</p>
                </div>

                {/* Email */}
                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter Email"
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="mb-4">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter Password"
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="mb-6">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm Password"
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending OTP...' : 'Continue to Verification'}
                </button>

                {/* Login Link */}
                <div className="text-center mt-4">
                  <p className="text-gray-600 text-sm">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={handleLoginClick}
                      className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                    >
                      Login Here
                    </button>
                  </p>
                </div>
              </div>
            </form>
          </div>

          {/* Right Side - Illustration */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative">
              <svg
                className="w-full h-auto max-w-lg"
                viewBox="0 0 500 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Mobile Phone */}
                <rect
                  x="150"
                  y="80"
                  width="180"
                  height="280"
                  rx="20"
                  fill="#E0F2FE"
                  stroke="#0EA5E9"
                  strokeWidth="3"
                />
                <rect x="170" y="100" width="140" height="200" rx="10" fill="#BAE6FD" />
                <circle cx="240" cy="340" r="15" fill="#0EA5E9" />
                <rect x="190" y="250" width="100" height="15" rx="7.5" fill="#0EA5E9" />
                <rect x="190" y="275" width="100" height="15" rx="7.5" fill="#38BDF8" />

                {/* Heart with Cross */}
                <path
                  d="M120 180c0-20 15-35 35-35 10 0 20 5 25 12 5-7 15-12 25-12 20 0 35 15 35 35 0 25-30 50-60 70-30-20-60-45-60-70z"
                  fill="#0EA5E9"
                  opacity="0.3"
                />
                <rect x="175" y="175" width="10" height="30" rx="2" fill="#0EA5E9" />
                <rect x="165" y="185" width="30" height="10" rx="2" fill="#0EA5E9" />

                {/* Doctor Illustration */}
                <ellipse cx="400" cy="320" rx="40" ry="8" fill="#E0F2FE" opacity="0.5" />
                <rect x="385" y="240" width="30" height="80" rx="5" fill="#0EA5E9" />
                <circle cx="400" cy="210" r="25" fill="#FDE68A" />
                <path d="M390 205 Q400 195 410 205" stroke="#1F2937" strokeWidth="2" fill="none" />
                <circle cx="395" cy="210" r="2" fill="#1F2937" />
                <circle cx="405" cy="210" r="2" fill="#1F2937" />
                <path d="M375 200 Q370 190 375 185" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
                <rect x="390" y="250" width="20" height="40" rx="3" fill="white" />
                <path d="M385 260 L375 280 L385 290" stroke="#0EA5E9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />

                {/* Ambulance */}
                <rect x="320" y="340" width="80" height="40" rx="5" fill="white" stroke="#0EA5E9" strokeWidth="2" />
                <rect x="330" y="350" width="25" height="20" rx="3" fill="#BAE6FD" />
                <circle cx="340" cy="385" r="8" fill="#1F2937" />
                <circle cx="380" cy="385" r="8" fill="#1F2937" />
                <rect x="365" y="345" width="15" height="8" rx="2" fill="#EF4444" />
                <rect x="370" y="348" width="5" height="15" rx="1" fill="#0EA5E9" />
                <rect x="365" y="355" width="15" height="5" rx="1" fill="#0EA5E9" />

                {/* Stethoscope */}
                <path
                  d="M280 120 Q290 140 280 160"
                  stroke="#0EA5E9"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                />
                <circle cx="280" cy="165" r="8" fill="#0EA5E9" />
                <path
                  d="M280 120 Q270 140 280 160"
                  stroke="#0EA5E9"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                />

                {/* Sparkles */}
                <path d="M100 150 L105 155 L100 160 L95 155 Z" fill="#FCD34D" />
                <path d="M420 100 L423 103 L420 106 L417 103 Z" fill="#FCD34D" />
                <path d="M130 280 L133 283 L130 286 L127 283 Z" fill="#FCD34D" />

                {/* Speech Bubble */}
                <ellipse cx="350" cy="150" rx="50" ry="30" fill="#E0F2FE" opacity="0.7" />
                <path d="M330 170 L325 185 L340 175 Z" fill="#E0F2FE" opacity="0.7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex space-x-6 text-sm text-gray-600">
              <a href="/about" className="hover:text-blue-600 transition-colors">
                About Us
              </a>
              <a href="/contact" className="hover:text-blue-600 transition-colors">
                Contact
              </a>
              <a href="/privacy" className="hover:text-blue-600 transition-colors">
                Privacy Policy
              </a>
            </div>
            <p className="text-sm text-gray-500">
              © 2026 Marketplace Health. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PatientRegister;
