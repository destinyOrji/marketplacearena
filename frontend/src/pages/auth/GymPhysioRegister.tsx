/**
 * Gym & Physiotherapy Registration Step 1 - Basic Information
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserIcon, PhoneIcon, EnvelopeIcon, ArrowRightIcon } from '../../components/Icons';

const GymPhysioRegister: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;
    setLoading(true);
    try {
      localStorage.setItem('gymPhysioRegisterStep1', JSON.stringify(formData));
      navigate('/register/gym-physio/step2');
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Gym & Physiotherapy Registration</h2>
              <p className="text-gray-600">Get started with seamless access to healthcare</p>
            </div>

            <form onSubmit={handleNext} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="w-5 h-5 text-gray-400" />
                      </div>
                      <input type="text" id="firstName" name="firstName" value={formData.firstName}
                        onChange={handleChange} placeholder="Enter First name" required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="w-5 h-5 text-gray-400" />
                      </div>
                      <input type="text" id="lastName" name="lastName" value={formData.lastName}
                        onChange={handleChange} placeholder="Enter Last name" required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" />
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PhoneIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input type="tel" id="phone" name="phone" value={formData.phone}
                      onChange={handleChange} placeholder="+2349012345678" required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Include country code (e.g., +234...)</p>
                </div>

                <div className="mb-6">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input type="email" id="email" name="email" value={formData.email}
                      onChange={handleChange} placeholder="Enter Email" required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" />
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center">
                  {loading ? 'Processing...' : 'Continue'}
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </button>

                <div className="text-center mt-4">
                  <p className="text-gray-600 text-sm">
                    Already have an account?{' '}
                    <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">Login Here</a>
                  </p>
                </div>
              </div>
            </form>
          </div>

          {/* Right — Illustration */}
          <div className="hidden lg:flex items-center justify-center">
            <svg className="w-full h-auto max-w-lg" viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Gym equipment illustration */}
              {/* Dumbbell */}
              <rect x="80" y="180" width="200" height="20" rx="10" fill="#DBEAFE" stroke="#2563EB" strokeWidth="2" />
              <rect x="60" y="155" width="40" height="70" rx="8" fill="#2563EB" />
              <rect x="260" y="155" width="40" height="70" rx="8" fill="#2563EB" />
              <rect x="40" y="165" width="30" height="50" rx="6" fill="#1D4ED8" />
              <rect x="290" y="165" width="30" height="50" rx="6" fill="#1D4ED8" />
              {/* Person doing exercise */}
              <circle cx="350" cy="120" r="30" fill="#BFDBFE" stroke="#2563EB" strokeWidth="2" />
              <rect x="330" y="150" width="40" height="80" rx="8" fill="#2563EB" />
              <rect x="310" y="160" width="25" height="12" rx="6" fill="#93C5FD" />
              <rect x="365" y="160" width="25" height="12" rx="6" fill="#93C5FD" />
              <rect x="330" y="230" width="18" height="60" rx="6" fill="#1D4ED8" />
              <rect x="352" y="230" width="18" height="60" rx="6" fill="#1D4ED8" />
              {/* Heart rate line */}
              <polyline points="80,320 120,320 140,280 160,360 180,300 200,320 240,320" stroke="#2563EB" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              {/* Physio cross */}
              <rect x="420" y="100" width="12" height="40" rx="4" fill="#2563EB" />
              <rect x="406" y="114" width="40" height="12" rx="4" fill="#2563EB" />
              {/* Stars */}
              <path d="M60 80 L63 87 L70 90 L63 93 L60 100 L57 93 L50 90 L57 87 Z" fill="#FCD34D" />
              <path d="M440 200 L442 205 L447 207 L442 209 L440 214 L438 209 L433 207 L438 205 Z" fill="#FCD34D" />
              <path d="M100 300 L102 305 L107 307 L102 309 L100 314 L98 309 L93 307 L98 305 Z" fill="#93C5FD" />
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

export default GymPhysioRegister;
