import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockIcon, EyeIcon, EyeSlashIcon } from '../../components/Icons';

const GymPhysioRegisterStep4: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      const step1Data = localStorage.getItem('gymPhysioRegisterStep1');
      const step2Data = localStorage.getItem('gymPhysioRegisterStep2');
      if (!step1Data || !step2Data) {
        navigate('/register/gym-physio');
      }
    }, 100);
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    localStorage.setItem('gymPhysioRegisterStep4', JSON.stringify(formData));
    setShowModal(true);
  };

  const handleModalContinue = () => {
    setShowModal(false);
    navigate('/register/gym-physio/step5');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <img src="/logo512.png" alt="Marketplace Health Logo" className="w-16 h-16 rounded-2xl shadow-lg" />
              </div>
              <h1 className="text-3xl font-bold text-orange-600 mb-2">Welcome to Marketplace Health</h1>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Set Your Password</h2>
              <p className="text-gray-600">Create a secure password for your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Set Password</h3>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="mb-4">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
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
                      minLength={8}
                      className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {showPassword ? <EyeSlashIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" /> : <EyeIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />}
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm Password"
                      required
                      minLength={8}
                      className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" /> : <EyeIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />}
                    </button>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Processing...' : 'Continue'}
              </button>
            </form>
          </div>

          <div className="hidden lg:flex items-center justify-center">
            <svg className="w-full h-auto max-w-lg" viewBox="0 0 500 400" fill="none">
              <rect x="150" y="80" width="180" height="280" rx="20" fill="#FED7AA" stroke="#EA580C" strokeWidth="3" />
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Documents Submission Required</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              To complete your registration and verify your business credentials, please upload the required documents in the next step.
            </p>
            <button
              onClick={handleModalContinue}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
            >
              Continue to Upload Documents
              <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymPhysioRegisterStep4;
