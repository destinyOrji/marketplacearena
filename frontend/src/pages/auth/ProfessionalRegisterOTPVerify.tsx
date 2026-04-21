import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OTPVerification from '../../components/OTPVerification';
import { useAuth } from '../../dashboards/patient/contexts/AuthContext';

const ProfessionalRegisterOTPVerify: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedData = localStorage.getItem('professionalRegisterData');
    if (!storedData) {
      navigate('/register/professional');
      return;
    }
    const data = JSON.parse(storedData);
    setPhoneNumber(data.phone);
  }, [navigate]);

  const handleOTPVerified = async () => {
    setLoading(true);
    setError('');
    try {
      const storedData = localStorage.getItem('professionalRegisterData');
      if (!storedData) throw new Error('Registration data not found');
      const formData = JSON.parse(storedData);

      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: 'professional',
        phone: formData.phone,
        phoneVerified: true,
        professionalType: formData.professionalType,
        licenseNumber: formData.licenseNumber,
        specialization: formData.specialization,
        yearsOfExperience: parseInt(formData.yearsOfExperience) || 0
      });

      localStorage.removeItem('professionalRegisterData');
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <img src="/logo512.png" alt="Logo" className="w-16 h-16 rounded-2xl shadow-lg mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-green-600 mb-2">Verify Your Phone</h1>
          <p className="text-gray-600">Enter the 6-digit code sent to your phone</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Completing registration...</p>
          </div>
        ) : (
          <OTPVerification
            phoneNumber={phoneNumber}
            onVerified={handleOTPVerified}
            onCancel={() => navigate('/register/professional')}
          />
        )}
      </div>
    </div>
  );
};

export default ProfessionalRegisterOTPVerify;
