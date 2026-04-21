import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OTPVerification from '../../components/OTPVerification';

const GymPhysioRegisterStep3: React.FC = () => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const step1Data = localStorage.getItem('gymPhysioRegisterStep1');
    const step2Data = localStorage.getItem('gymPhysioRegisterStep2');
    
    if (!step1Data || !step2Data) {
      navigate('/register/gym-physio');
      return;
    }

    const data = JSON.parse(step1Data);
    if (!data.phone) {
      navigate('/register/gym-physio');
      return;
    }

    setPhoneNumber(data.phone);
    setLoading(false);
  }, [navigate]);

  const handleOTPVerified = () => {
    navigate('/register/gym-physio/step4');
  };

  const handleCancel = () => {
    navigate('/register/gym-physio/step2');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex flex-col">
      <div className="py-6 border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center">
            <img src="/logo512.png" alt="Logo" className="w-10 h-10 rounded-lg shadow-md" />
            <span className="ml-3 text-xl font-bold text-orange-600">Marketplace Health</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-orange-600 mb-2">Verify Your Phone Number</h1>
            <p className="text-gray-600">We've sent a verification code to your phone</p>
          </div>
          <OTPVerification phoneNumber={phoneNumber} onVerified={handleOTPVerified} onCancel={handleCancel} />
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

export default GymPhysioRegisterStep3;
