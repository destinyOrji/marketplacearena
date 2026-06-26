/**
 * OTP Verification Component
 * Verifies email address with a 6-digit code
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface OTPVerificationProps {
  /** Email address the OTP was sent to */
  email: string;
  /** Called when OTP is verified successfully */
  onVerified: () => void;
  onCancel?: () => void;
  /** Legacy prop — if only phoneNumber is provided, treat it as email */
  phoneNumber?: string;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({
  email: emailProp,
  phoneNumber,
  onVerified,
  onCancel,
}) => {
  // Support legacy callers that pass phoneNumber instead of email
  const identifier = emailProp || phoneNumber || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';

  // Countdown timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(t => t - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // digits only
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...Array(6)].map((_, i) => digits[i] || '');
    setOtp(newOtp);
    // Focus last filled box
    const lastIdx = Math.min(digits.length, 5);
    document.getElementById(`otp-${lastIdx}`)?.focus();
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/otp/verify`, {
        email: identifier,
        // also send as phoneNumber for legacy backend compatibility
        phoneNumber: identifier,
        otp: otpCode,
      });

      if (response.data.statuscode === 0 || response.data.success) {
        setSuccess('Email verified successfully!');
        setTimeout(() => onVerified(), 800);
      } else {
        setError(response.data.message || 'Invalid code. Please try again.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post(`${API_URL}/otp/send`, {
        email: identifier,
        phoneNumber: identifier, // legacy compat
      });
      setSuccess('New code sent to your email!');
      setResendTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  // Mask email for display: jo***@gmail.com
  const maskedEmail = identifier.includes('@')
    ? identifier.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + '*'.repeat(Math.min(b.length, 4)) + c)
    : identifier;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-md">
      {/* Icon */}
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Check your email</h2>
        <p className="text-gray-500 text-sm">
          We sent a 6-digit code to
        </p>
        <p className="font-semibold text-gray-900 mt-1">{maskedEmail}</p>
      </div>

      {/* OTP boxes */}
      <div className="flex justify-center gap-2 mb-6">
        {otp.map((digit, index) => (
          <input
            key={index}
            id={`otp-${index}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={e => handleOtpChange(index, e.target.value)}
            onKeyDown={e => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-xl focus:outline-none transition-colors ${
              digit
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 focus:border-blue-500'
            }`}
          />
        ))}
      </div>

      {/* Error / Success */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600 text-center">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-sm text-green-600 text-center">✓ {success}</p>
        </div>
      )}

      {/* Verify button */}
      <button
        onClick={handleVerify}
        disabled={loading || otp.join('').length !== 6}
        className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mb-4"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Verifying...
          </span>
        ) : 'Verify Code'}
      </button>

      {/* Resend */}
      <div className="text-center">
        {canResend ? (
          <button onClick={handleResend} disabled={loading}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            Resend code
          </button>
        ) : (
          <p className="text-gray-500 text-sm">
            Resend code in <span className="font-semibold">{resendTimer}s</span>
          </p>
        )}
      </div>

      {/* Cancel */}
      {onCancel && (
        <button onClick={onCancel}
          className="w-full mt-4 py-2 px-4 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors">
          ← Go back
        </button>
      )}
    </div>
  );
};

export default OTPVerification;
