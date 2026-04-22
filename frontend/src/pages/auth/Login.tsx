  import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserIcon, LockIcon, EyeIcon, EyeSlashIcon } from '../../components/Icons';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    accountType: '',
    emailOrPhone: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingSearch, setPendingSearch] = useState<{query: string, type: string} | null>(null);

  // Check for pending search on mount
  useEffect(() => {
    const savedSearch = localStorage.getItem('pendingSearch');
    if (savedSearch) {
      try {
        const search = JSON.parse(savedSearch);
        setPendingSearch(search);
      } catch (e) {
        console.error('Error parsing pending search:', e);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Make direct API call instead of using role-specific AuthContext
      const API_URL = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api/v1';
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.emailOrPhone,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Login failed');
      }

      const { user, token } = data.data;

      // Store tokens and user data for all dashboard types
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Store role-specific tokens for dashboard compatibility
      if (user.role === 'professional') {
        localStorage.setItem('professionalToken', token);
        localStorage.setItem('professional', JSON.stringify(user));
      } else if (user.role === 'hospital') {
        localStorage.setItem('hospitalToken', token);
        localStorage.setItem('hospital', JSON.stringify(user));
      } else if (user.role === 'ambulance') {
        localStorage.setItem('ambulanceToken', token);
        localStorage.setItem('ambulance', JSON.stringify(user));
      } else if (user.role === 'gym-physio') {
        localStorage.setItem('gymPhysioToken', token);
        localStorage.setItem('gymPhysio', JSON.stringify(user));
      }

      console.log('🔍 Login Debug - User data:', user);
      console.log('🔍 Login Debug - User role:', user.role);
      
      const roleRoutes: Record<string, string> = {
        client: '/patient/dashboard',
        patient: '/patient/dashboard',
        professional: '/professional/dashboard',
        hospital: '/hospital/dashboard',
        ambulance: '/ambulance/dashboard',
        'gym-physio': '/gym-physio/dashboard',
        admin: '/admin/dashboard',
        super_admin: '/admin/dashboard',
      };

      const dashboard = roleRoutes[user.role] || '/patient/dashboard';
      console.log('🔍 Login Debug - Expected dashboard:', dashboard);
      console.log('🔍 Login Debug - Navigating to:', dashboard);
      
      // Add a small delay to ensure localStorage is set
      setTimeout(() => {
        console.log('🔍 Login Debug - Redirecting now...');
        window.location.href = dashboard;
      }, 100);
      
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  const handleCreateAccount = () => {
    navigate('/get-started');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4 py-12">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0 bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="mb-8">
            {/* Logo and Title */}
            <div className="flex items-center mb-6">
              <img 
                src="/logo512.png" 
                alt="Marketplace Health Logo" 
                className="w-12 h-12 rounded-xl shadow-lg mr-3"
              />
              <h1 className="text-2xl font-bold text-blue-600">Marketplace Health</h1>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome Back 👋
            </h2>
            <p className="text-gray-600">Please enter your details to login</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Pending Search Notification */}
            {pendingSearch && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      You searched for: "{pendingSearch.query}"
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Please login to continue your search and access our services.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
                {error.includes('Invalid credentials') && (
                  <p className="text-sm text-red-600 mt-2">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/get-started')}
                      className="font-semibold underline hover:text-red-700"
                    >
                      Sign up here
                    </button>
                  </p>
                )}
              </div>
            )}

            {/* Account Type */}
            <div>
              <label
                htmlFor="accountType"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Account Type
              </label>
              <div className="relative">
                <select
                  id="accountType"
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleChange}
                  required
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white"
                >
                  <option value="">Select account type</option>
                  <option value="patient">Patient</option>
                  <option value="professional">Professional</option>
                  <option value="hospital">Hospital</option>
                  <option value="ambulance">Ambulance</option>
                  <option value="gym-physio">Gym & Physiotherapy</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Email or Phone */}
            <div>
              <label
                htmlFor="emailOrPhone"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email or Phone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="emailOrPhone"
                  name="emailOrPhone"
                  value={formData.emailOrPhone}
                  onChange={handleChange}
                  placeholder="Enter Email or Phone"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Password */}
            <div>
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
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter Password"
                  required
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <EyeIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline"
              >
                Forgot Password
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            {/* Create Account Link */}
            <div className="text-center mt-6">
              <p className="text-gray-600 text-sm">
                New here?{' '}
                <button
                  type="button"
                  onClick={handleCreateAccount}
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                >
                  Create an Account
                </button>
              </p>
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
  );
};

export default Login;
