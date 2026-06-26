/**
 * Patient OTP Verification Step
 * Verifies phone number with OTP before proceeding to step 2
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import OTPVerification from '../../components/OTPVerification';

const API_URL = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';

const PatientOTPVerify: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  useEffect(() => {
    const step1Data = localStorage.getItem('patientRegisterStep1');
    if (!step1Data) { navigate('/register'); return; }
    const data = JSON.parse(step1Data);
    if (!data.email) { navigate('/register'); return; }
    setEmail(data.email);
  }, [navigate]);

  const handleOTPVerified = () => {
    // OTP verified, proceed to step 2
    console.log('PatientOTPVerify: OTP verified, navigating to step2');
    console.log('localStorage before navigation:', {
      step1Data: localStorage.getItem('patientRegisterStep1')
    });
    navigate('/register/patient/step2');
  };

  const handleCancel = () => {
    // Go back to step 1
    navigate('/register');
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      {/* Header */}
      <div className="py-6 border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center">
            <img src="/logo512.png" alt="Health Market Arena Logo" className="w-10 h-10 rounded-lg shadow-md" />
            <span className="ml-3 text-xl font-bold text-blue-600">Health Market Arena</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-600 mb-2">Verify Your Email</h1>
            <p className="text-gray-600">We've sent a 6-digit code to your email</p>
          </div>

          <OTPVerification
            email={email}
            onVerified={handleOTPVerified}
            onCancel={handleCancel}
          />
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
              © 2026 Health Market Arena. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PatientOTPVerify;
