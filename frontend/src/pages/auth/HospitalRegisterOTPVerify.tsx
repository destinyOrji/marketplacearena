/**
 * Hospital Registration - OTP Verification
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HospitalRegisterOTPVerify: React.FC = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      // Get stored data
      const storedData = localStorage.getItem('hospitalRegisterData');
      if (!storedData) {
        throw new Error('Registration data not found. Please start again.');
      }

      const formData = JSON.parse(storedData);

      // Verify OTP
      const verifyResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1'}/api/auth/verify-phone-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone, otp })
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(verifyData.message || 'Invalid OTP');
      }

      // Register hospital
      const registerResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.hospitalName.split(' ')[0],
          lastName: formData.hospitalName.split(' ').slice(1).join(' ') || 'Hospital',
          role: 'hospital',
          phone: formData.phone,
          phoneVerified: true,
          hospitalName: formData.hospitalName,
          registrationNumber: formData.registrationNumber,
          hospitalType: formData.hospitalType,
          address: formData.address,
          city: formData.city,
          state: formData.state
        })
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        throw new Error(registerData.message || 'Registration failed');
      }

      // Clear stored data
      localStorage.removeItem('hospitalRegisterData');

      // Show success and redirect to login
      alert('Registration successful! Please login to continue.');
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    setError('');

    try {
      const storedData = localStorage.getItem('hospitalRegisterData');
      if (!storedData) {
        throw new Error('Registration data not found');
      }

      const formData = JSON.parse(storedData);

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1'}/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }

      alert('OTP sent successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <img src="/logo512.png" alt="Logo" className="w-16 h-16 rounded-2xl shadow-lg mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Verify Your Phone</h1>
          <p className="text-gray-600">Enter the 6-digit code sent to your phone</p>
        </div>

        <form onSubmit={handleVerify} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">OTP Code</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              maxLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg disabled:bg-gray-400 transition"
          >
            {loading ? 'Verifying...' : 'Verify & Complete Registration'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resending}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400"
            >
              {resending ? 'Sending...' : 'Resend OTP'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/register/hospital')}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              ← Back to registration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HospitalRegisterOTPVerify;
