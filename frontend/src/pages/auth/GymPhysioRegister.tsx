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

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      localStorage.setItem('gymPhysioRegisterStep1', JSON.stringify(formData));
      navigate('/register/gym-physio/step2');
    } catch (err: any) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <img 
                  src="/logo512.png" 
                  alt="Marketplace Health Logo" 
                  className="w-16 h-16 rounded-2xl shadow-lg"
                />
              </div>

              <h1 className="text-3xl font-bold text-orange-600 mb-2">
                Welcome to Marketplace Health
              </h1>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Gym & Physiotherapy Registration
              </h2>
              <p className="text-gray-600">
                Get started with seamless access to healthcare
              </p>
            </div>

            <form onSubmit={handleNext} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
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
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
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
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Include country code (e.g., +234...)</p>
                </div>

                <div className="mb-6">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? 'Processing...' : 'Continue'}
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </button>

                <div className="text-center mt-4">
                  <p className="text-gray-600 text-sm">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={handleLoginClick}
                      className="text-orange-600 hover:text-orange-700 font-semibold hover:underline"
                    >
                      Login Here
                    </button>
                  </p>
                </div>
              </div>
            </form>
          </div>

          <div className="hidden lg:flex items-center justify-center">
            <svg className="w-full h-auto max-w-lg" viewBox="0 0 500 400" fill="none">
              <rect x="150" y="80" width="180" height="280" rx="20" fill="#FED7AA" stroke="#EA580C" strokeWidth="3" />
              <rect x="170" y="100" width="140" height="200" rx="10" fill="#FDBA74" />
              <circle cx="240" cy="340" r="15" fill="#EA580C" />
              <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z" fill="#EA580C" transform="translate(200, 150) scale(3)" />
            </svg>
          </div>
        </div>
      </div>

      <footer className="py-6 border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex space-x-6 text-sm text-gray-600">
              <a href="/about" className="hover:text-orange-600 transition-colors">About Us</a>
              <a href="/contact" className="hover:text-orange-600 transition-colors">Contact</a>
              <a href="/privacy" className="hover:text-orange-600 transition-colors">Privacy Policy</a>
            </div>
            <p className="text-sm text-gray-500">© 2026 Marketplace Health. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GymPhysioRegister;
