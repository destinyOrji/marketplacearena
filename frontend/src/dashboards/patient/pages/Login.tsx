import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { showSuccessToast, showErrorToast } from '../utils/toast';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      await login(formData.email, formData.password);
      showSuccessToast('Login successful! Welcome back.');
      // Redirect to patient dashboard on success
      navigate('/patient/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4 py-12">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0 bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="mb-8">
            {/* Logo and Title */}
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg mr-3">
                <svg
                  className="w-7 h-7 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-blue-600">Marketplace Health</h1>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome Back 👋
            </h2>
            <p className="text-gray-600">Please enter your details to login</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
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
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5 text-gray-400 hover:text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-gray-400 hover:text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link
                to="/patient/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline"
              >
                Forgot Password?
              </Link>
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
                <Link
                  to="/patient/register"
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                >
                  Create an Account
                </Link>
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
