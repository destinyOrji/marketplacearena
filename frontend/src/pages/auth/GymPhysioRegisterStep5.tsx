import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../dashboards/patient/contexts/AuthContext';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  progress: number;
}

const GymPhysioRegisterStep5: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const step1Data = localStorage.getItem('gymPhysioRegisterStep1');
    const step2Data = localStorage.getItem('gymPhysioRegisterStep2');
    const step4Data = localStorage.getItem('gymPhysioRegisterStep4');
    if (!step1Data || !step2Data || !step4Data) {
      navigate('/register/gym-physio');
    }
  }, [navigate]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const handleFiles = (newFiles: File[]) => {
    const uploadedFiles: UploadedFile[] = newFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      progress: 100,
    }));

    setFiles((prev) => [...prev, ...uploadedFiles]);
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (files.length === 0) {
      setError('Please upload at least one document');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const step1Data = JSON.parse(localStorage.getItem('gymPhysioRegisterStep1') || '{}');
      const step2Data = JSON.parse(localStorage.getItem('gymPhysioRegisterStep2') || '{}');
      const step4Data = JSON.parse(localStorage.getItem('gymPhysioRegisterStep4') || '{}');

      try {
        await register({
          email: step1Data.email,
          password: step4Data.password,
          firstName: step1Data.firstName,
          lastName: step1Data.lastName,
          phone: step1Data.phone,
          role: 'gym-physio',
          phoneVerified: true,
          businessType: step2Data.businessType,
          businessName: step2Data.businessName,
          licenseNumber: step2Data.licenseNumber,
          specialization: step2Data.specialization,
          yearsInBusiness: parseInt(step2Data.yearsInBusiness) || 0,
          address: step2Data.streetAddress,
          city: step2Data.city,
          state: step2Data.state
        });

        localStorage.removeItem('gymPhysioRegisterStep1');
        localStorage.removeItem('gymPhysioRegisterStep2');
        localStorage.removeItem('gymPhysioRegisterStep4');

        setShowSuccessModal(true);
      } catch (regError: any) {
        if (regError.message && regError.message.includes('already exists')) {
          localStorage.removeItem('gymPhysioRegisterStep1');
          localStorage.removeItem('gymPhysioRegisterStep2');
          localStorage.removeItem('gymPhysioRegisterStep4');
          
          setShowSuccessModal(true);
        } else {
          throw regError;
        }
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img src="/logo512.png" alt="Marketplace Health Logo" className="w-16 h-16 rounded-2xl shadow-lg" />
          </div>
          <h1 className="text-2xl font-bold text-orange-600 mb-2">MarketPlace Health</h1>
          <div className="flex items-center justify-center mb-4">
            <div className="w-3 h-3 bg-orange-400 rounded-full mr-2"></div>
            <h2 className="text-xl font-semibold text-gray-900">Verification Pending</h2>
          </div>
          <p className="text-gray-600 text-sm">
            Your account is currently under review. Please upload and submit the required documents for verification.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
              isDragging ? 'border-orange-500 bg-orange-50' : 'border-gray-300 bg-gray-50'
            }`}
          >
            <div className="flex justify-center mb-4">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-gray-700 mb-2">Drag & drop files here or</p>
            <label className="inline-block">
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileInput}
                className="hidden"
              />
              <span className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-6 rounded-lg cursor-pointer transition-colors duration-200">
                Browse files
              </span>
            </label>
            <p className="text-sm text-gray-500 mt-3">Accepted file types: PDF, JPG, PNG (Max size: 5MB)</p>
          </div>

          {files.length > 0 && (
            <div className="mt-6 space-y-3">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center flex-1">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(file.id)}
                    className="ml-4 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-8 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit for Review'}
          </button>

          <div className="mt-6 flex items-center justify-center p-4 bg-orange-50 rounded-lg">
            <svg className="w-5 h-5 text-orange-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-orange-700">Verification Pending</span>
          </div>

          <p className="text-center text-sm text-gray-500 mt-4">
            We will review your details within 24 - 48 hours. You will be notified via email once your account is fully approved
          </p>
        </form>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center relative">
            <button onClick={handleModalClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Submission successful</h2>

            <p className="text-gray-600 leading-relaxed mb-6">
              Your documents have been successfully received and are now under review. We appreciate
              your commitment to joining Marketplace Healthcare. You will be notified once your profile is
              approved and ready to connect with clients across Nigeria.
            </p>

            <button
              onClick={handleModalClose}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Continue to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymPhysioRegisterStep5;
