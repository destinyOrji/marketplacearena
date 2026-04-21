import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, MapMarkerIcon, ArrowLeftIcon, ArrowRightIcon } from '../../components/Icons';
import { useAuth } from '../../dashboards/patient/contexts/AuthContext';

const PatientRegisterStep2: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth(); // Move useAuth to top level
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    dateOfBirth: '',
    gender: '',
    streetAddress: '',
    city: '',
    state: '',
  });

  useEffect(() => {
    // Add a small delay to ensure localStorage is ready
    const checkData = () => {
      const step1Data = localStorage.getItem('patientRegisterStep1');
      if (!step1Data) {
        console.error('PatientRegisterStep2: No step1Data found in localStorage');
        console.log('Available localStorage keys:', Object.keys(localStorage));
        // Give it one more chance after a delay
        setTimeout(() => {
          const retryData = localStorage.getItem('patientRegisterStep1');
          if (!retryData) {
            console.error('PatientRegisterStep2: Still no data after retry, redirecting');
            navigate('/register');
          } else {
            console.log('PatientRegisterStep2: Data found on retry');
          }
        }, 500);
      } else {
        console.log('PatientRegisterStep2: step1Data found:', JSON.parse(step1Data));
      }
    };
    
    // Small delay to ensure navigation is complete
    setTimeout(checkData, 100);
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleBack = () => {
    navigate('/register');
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Get step 1 data
      const step1DataStr = localStorage.getItem('patientRegisterStep1');
      if (!step1DataStr) {
        alert('Session expired. Please start registration again.');
        navigate('/register');
        return;
      }
      
      const step1Data = JSON.parse(step1DataStr);
      
      // Validate step 1 data
      if (!step1Data.firstName || !step1Data.lastName || !step1Data.email || !step1Data.phone) {
        alert('Missing required information. Please start registration again.');
        navigate('/register');
        return;
      }
      
      // Format date properly (date input already gives YYYY-MM-DD format)
      let formattedDate = formData.dateOfBirth;
      if (formattedDate && !formattedDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // If somehow the date is in wrong format, try to convert it
        const date = new Date(formattedDate);
        if (!isNaN(date.getTime())) {
          formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
        } else {
          throw new Error('Please enter a valid date of birth');
        }
      }
      
      // Store step 2 data - we'll register the user after all steps are complete
      const step2Data = {
        ...formData,
        dateOfBirth: formattedDate || null,
      };
      localStorage.setItem('patientRegisterStep2', JSON.stringify(step2Data));
      
      // Combine all registration data for final submission
      const registrationData = {
        role: 'client', // Backend expects 'client' for patients
        email: step1Data.email,
        password: step1Data.password,
        firstName: step1Data.firstName,
        lastName: step1Data.lastName,
        phone: step1Data.phone,
        phoneVerified: true, // Phone was verified in OTP step
        dateOfBirth: formattedDate || null,
        gender: formData.gender || '',
      };

      console.log('Preparing registration data:', registrationData);

      // Register user with backend NOW
      await register(registrationData);
      
      // Show success modal
      setShowModal(true);
    } catch (error: any) {
      console.error('Registration error:', error);
      alert(error.message || 'Registration failed. Please try again.');
    }
  };

  const handleModalContinue = () => {
    setShowModal(false);
    navigate('/login');
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
                Enter the additional information needed to set up your account.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleContinue} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Additional Details
                </h3>

                {/* Date of Birth */}
                <div className="mb-4">
                  <label
                    htmlFor="dateOfBirth"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Date of Birth
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CalendarIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div className="mb-4">
                  <label
                    htmlFor="gender"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Gender
                  </label>
                  <div className="relative">
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                      className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
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

                {/* Street Address */}
                <div className="mb-4">
                  <label
                    htmlFor="streetAddress"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Street Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapMarkerIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="streetAddress"
                      name="streetAddress"
                      value={formData.streetAddress}
                      onChange={handleChange}
                      placeholder="15 Herbert Macaulay Street"
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                {/* City and State */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      City
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapMarkerIcon className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Port Harcourt"
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="state"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      State
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapMarkerIcon className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="Rivers State"
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
                >
                  <ArrowLeftIcon className="w-5 h-5 mr-2" />
                  Back
                </button>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
                >
                  Continue
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </button>
              </div>

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

      {/* Registration Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Registration Confirmation
            </h2>

            {/* Message */}
            <p className="text-gray-600 mb-8 leading-relaxed">
              Your phone number has been verified successfully! Your account has been created
              and you can now access all features.
            </p>

            {/* Continue Button */}
            <button
              onClick={handleModalContinue}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
            >
              Continue
              <svg
                className="w-5 h-5 ml-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientRegisterStep2;
