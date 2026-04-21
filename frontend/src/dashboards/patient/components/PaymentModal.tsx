import React, { useState } from 'react';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import { z } from 'zod';
import { paymentsApi } from '../services/api';

interface PaymentModalProps {
  isOpen: boolean;
  amount: number;
  service: string;
  appointmentId?: string;
  onClose: () => void;
  onSuccess: (paymentId: string) => void;
}

type PaymentMethodType = 'card' | 'bank_transfer' | 'mobile_money';

// Validation schemas
const cardPaymentSchema = z.object({
  cardNumber: z.string()
    .min(1, 'Card number is required')
    .regex(/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/, 'Invalid card number format'),
  cardName: z.string()
    .min(1, 'Cardholder name is required')
    .min(3, 'Name must be at least 3 characters'),
  expiryDate: z.string()
    .min(1, 'Expiry date is required')
    .regex(/^\d{2}\/\d{2}$/, 'Invalid expiry date format (MM/YY)')
    .refine((val) => {
      const [month, year] = val.split('/').map(Number);
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;
      
      if (month < 1 || month > 12) return false;
      if (year < currentYear) return false;
      if (year === currentYear && month < currentMonth) return false;
      return true;
    }, 'Card has expired'),
  cvv: z.string()
    .min(3, 'CVV must be 3 or 4 digits')
    .max(4, 'CVV must be 3 or 4 digits')
    .regex(/^\d{3,4}$/, 'CVV must contain only numbers'),
});

const bankTransferSchema = z.object({
  bankName: z.string().min(1, 'Please select a bank'),
  accountNumber: z.string()
    .min(1, 'Account number is required')
    .min(8, 'Account number must be at least 8 digits')
    .regex(/^\d+$/, 'Account number must contain only numbers'),
});

const mobileMoneySchema = z.object({
  mobileProvider: z.string().min(1, 'Please select a mobile money provider'),
  mobileNumber: z.string()
    .min(1, 'Mobile number is required')
    .regex(/^\+?\d{10,15}$/, 'Invalid mobile number format'),
});

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  amount,
  service,
  appointmentId,
  onClose,
  onSuccess,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('card');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Card payment fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  // Bank transfer fields
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  // Mobile money fields
  const [mobileProvider, setMobileProvider] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    setErrors({});
    
    try {
      if (paymentMethod === 'card') {
        cardPaymentSchema.parse({
          cardNumber,
          cardName,
          expiryDate,
          cvv,
        });
      } else if (paymentMethod === 'bank_transfer') {
        bankTransferSchema.parse({
          bankName,
          accountNumber,
        });
      } else if (paymentMethod === 'mobile_money') {
        mobileMoneySchema.parse({
          mobileProvider,
          mobileNumber,
        });
      }
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err: z.ZodIssue) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
        showErrorToast('Please fix the validation errors');
      }
      return false;
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let paymentDetails: any = {
        amount,
        service,
        appointmentId,
        method: paymentMethod,
      };

      // Add method-specific details
      if (paymentMethod === 'card') {
        paymentDetails.cardDetails = {
          cardNumber: cardNumber.replace(/\s/g, ''),
          cardName,
          expiryDate,
          cvv,
        };
      } else if (paymentMethod === 'bank_transfer') {
        paymentDetails.bankDetails = {
          bankName,
          accountNumber,
        };
      } else if (paymentMethod === 'mobile_money') {
        paymentDetails.mobileMoneyDetails = {
          provider: mobileProvider,
          number: mobileNumber,
        };
      }

      const response = await paymentsApi.processPayment(paymentDetails);

      if (response.data.statuscode === 0) {
        showSuccessToast('Payment successful! Receipt sent to your email.');
        onSuccess(response.data.data.id);
        resetForm();
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      const errorMessage = error.response?.data?.message || 'Payment failed. Please try again.';
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCardNumber('');
    setCardName('');
    setExpiryDate('');
    setCvv('');
    setBankName('');
    setAccountNumber('');
    setMobileProvider('');
    setMobileNumber('');
    setErrors({});
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Payment</h2>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              aria-label="Close payment modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Payment Summary */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700">Service</span>
              <span className="font-medium text-gray-900">{service}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-700">Total Amount</span>
              <span className="text-2xl font-bold text-blue-600">${amount.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Payment Method
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  paymentMethod === 'card'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="text-2xl mb-1">💳</div>
                <div className="text-sm font-medium">Card</div>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="text-2xl mb-1">🏦</div>
                <div className="text-sm font-medium">Bank Transfer</div>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('mobile_money')}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  paymentMethod === 'mobile_money'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="text-2xl mb-1">📱</div>
                <div className="text-sm font-medium">Mobile Money</div>
              </button>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handlePayment}>
            {/* Card Payment Form */}
            {paymentMethod === 'card' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => {
                      setCardNumber(e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim());
                      setErrors({ ...errors, cardNumber: '' });
                    }}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${
                      errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.cardNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => {
                      setCardName(e.target.value);
                      setErrors({ ...errors, cardName: '' });
                    }}
                    placeholder="John Doe"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${
                      errors.cardName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.cardName && (
                    <p className="mt-1 text-sm text-red-600">{errors.cardName}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={expiryDate}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length >= 2) {
                          value = value.slice(0, 2) + '/' + value.slice(2, 4);
                        }
                        setExpiryDate(value);
                        setErrors({ ...errors, expiryDate: '' });
                      }}
                      placeholder="MM/YY"
                      maxLength={5}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${
                        errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.expiryDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={cvv}
                      onChange={(e) => {
                        setCvv(e.target.value.replace(/\D/g, ''));
                        setErrors({ ...errors, cvv: '' });
                      }}
                      placeholder="123"
                      maxLength={4}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${
                        errors.cvv ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.cvv && (
                      <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Bank Transfer Form */}
            {paymentMethod === 'bank_transfer' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Name <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={bankName}
                    onChange={(e) => {
                      setBankName(e.target.value);
                      setErrors({ ...errors, bankName: '' });
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${
                      errors.bankName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Bank</option>
                    <option value="bank1">First National Bank</option>
                    <option value="bank2">Standard Bank</option>
                    <option value="bank3">City Bank</option>
                    <option value="bank4">Trust Bank</option>
                  </select>
                  {errors.bankName && (
                    <p className="mt-1 text-sm text-red-600">{errors.bankName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => {
                      setAccountNumber(e.target.value.replace(/\D/g, ''));
                      setErrors({ ...errors, accountNumber: '' });
                    }}
                    placeholder="Enter your account number"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${
                      errors.accountNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.accountNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.accountNumber}</p>
                  )}
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    You will receive bank transfer instructions after confirming. Payment verification may take 1-2 business days.
                  </p>
                </div>
              </div>
            )}

            {/* Mobile Money Form */}
            {paymentMethod === 'mobile_money' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Money Provider <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={mobileProvider}
                    onChange={(e) => {
                      setMobileProvider(e.target.value);
                      setErrors({ ...errors, mobileProvider: '' });
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${
                      errors.mobileProvider ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Provider</option>
                    <option value="mpesa">M-Pesa</option>
                    <option value="airtel">Airtel Money</option>
                    <option value="mtn">MTN Mobile Money</option>
                    <option value="tigo">Tigo Pesa</option>
                  </select>
                  {errors.mobileProvider && (
                    <p className="mt-1 text-sm text-red-600">{errors.mobileProvider}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => {
                      setMobileNumber(e.target.value);
                      setErrors({ ...errors, mobileNumber: '' });
                    }}
                    placeholder="+1234567890"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${
                      errors.mobileNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.mobileNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.mobileNumber}</p>
                  )}
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    You will receive a payment prompt on your mobile device. Please approve the transaction to complete payment.
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  `Pay $${amount.toFixed(2)}`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
