/**
 * Professional Verification Workflow
 * List pending verifications with document preview and approve/reject actions
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiCheckCircle, FiXCircle, FiFileText, FiUser, FiMail } from 'react-icons/fi';
import { Button, Modal } from '../../components';
import { professionalService } from '../../services/professionalService';
import { Professional, ProfessionalDocument } from '../../types';

const ProfessionalVerification: React.FC = () => {
  const navigate = useNavigate();
  const [pendingProfessionals, setPendingProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [documents, setDocuments] = useState<ProfessionalDocument[]>([]);
  const [previewModal, setPreviewModal] = useState<{ show: boolean; document: ProfessionalDocument | null }>({
    show: false,
    document: null
  });
  const [verifyModal, setVerifyModal] = useState<{ show: boolean; professional: Professional | null }>({
    show: false,
    professional: null
  });
  const [rejectModal, setRejectModal] = useState<{ show: boolean; professional: Professional | null; reason: string }>({
    show: false,
    professional: null,
    reason: ''
  });

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const fetchPendingVerifications = async () => {
    try {
      setLoading(true);
      const data = await professionalService.getPendingVerifications();
      setPendingProfessionals(data);
    } catch (error) {
      console.error('Failed to fetch pending verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (professional: Professional) => {
    setSelectedProfessional(professional);
    try {
      const docs = await professionalService.getProfessionalDocuments(professional.id);
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  };

  const handlePreviewDocument = (document: ProfessionalDocument) => {
    setPreviewModal({ show: true, document });
  };

  const handleVerifyClick = (professional: Professional) => {
    setVerifyModal({ show: true, professional });
  };

  const handleVerifyConfirm = async () => {
    if (!verifyModal.professional) return;

    try {
      await professionalService.verifyProfessional(verifyModal.professional.id);
      setVerifyModal({ show: false, professional: null });
      setSelectedProfessional(null);
      fetchPendingVerifications();
    } catch (error) {
      console.error('Failed to verify professional:', error);
      alert('Failed to verify professional. Please try again.');
    }
  };

  const handleRejectClick = (professional: Professional) => {
    setRejectModal({ show: true, professional, reason: '' });
  };

  const handleRejectConfirm = async () => {
    if (!rejectModal.professional || !rejectModal.reason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }

    try {
      await professionalService.rejectProfessional(rejectModal.professional.id, rejectModal.reason);
      setRejectModal({ show: false, professional: null, reason: '' });
      setSelectedProfessional(null);
      fetchPendingVerifications();
    } catch (error) {
      console.error('Failed to reject professional:', error);
      alert('Failed to reject professional. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Professional Verification</h1>
        <div className="text-sm text-gray-600">
          {pendingProfessionals.length} pending verification{pendingProfessionals.length !== 1 ? 's' : ''}
        </div>
      </div>

      {pendingProfessionals.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FiCheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up!</h3>
          <p className="text-gray-600">There are no pending professional verifications at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Professionals List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Pending Professionals</h2>
            <div className="space-y-3">
              {pendingProfessionals.map((professional) => (
                <div
                  key={professional.id}
                  className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all ${
                    selectedProfessional?.id === professional.id
                      ? 'ring-2 ring-blue-500'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => handleViewDetails(professional)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <FiUser className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900">
                          {professional.first_name} {professional.last_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {professional.professional_type} - {professional.specialization}
                        </p>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center text-xs text-gray-500">
                            <FiMail className="h-3 w-3 mr-1" />
                            <span className="truncate">{professional.email}</span>
                          </div>
                          {professional.phone && (
                            <div className="flex items-center text-xs text-gray-500">
                              <span>📞 {professional.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <span>License: {professional.license_number}</span>
                    <span>Applied: {professional.created_at ? 
                      new Date(professional.created_at).toLocaleDateString() 
                      : professional.user?.createdAt ? 
                        new Date(professional.user.createdAt).toLocaleDateString() 
                        : 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Professional Details and Documents */}
          <div className="space-y-4">
            {selectedProfessional ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Professional Details</h2>
                  <div className="flex space-x-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleVerifyClick(selectedProfessional)}
                    >
                      <FiCheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRejectClick(selectedProfessional)}
                    >
                      <FiXCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>

                {/* Professional Information Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                      <p className="mt-1 text-base text-gray-900">
                        {selectedProfessional.first_name} {selectedProfessional.last_name}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Professional Type</h3>
                        <p className="mt-1 text-base text-gray-900">{selectedProfessional.professional_type}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Specialization</h3>
                        <p className="mt-1 text-base text-gray-900">{selectedProfessional.specialization}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">License Number</h3>
                      <p className="mt-1 text-base text-gray-900">{selectedProfessional.license_number}</p>
                    </div>
                    {selectedProfessional.license_expiry_date && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">License Expiry Date</h3>
                        <p className="mt-1 text-base text-gray-900">
                          {new Date(selectedProfessional.license_expiry_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {selectedProfessional.experience_years && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Experience</h3>
                        <p className="mt-1 text-base text-gray-900">
                          {selectedProfessional.experience_years} years
                        </p>
                      </div>
                    )}
                    {selectedProfessional.bio && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Bio</h3>
                        <p className="mt-1 text-sm text-gray-700">{selectedProfessional.bio}</p>
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center text-sm text-gray-700">
                          <FiMail className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{selectedProfessional.email}</span>
                        </div>
                        {selectedProfessional.phone && (
                          <div className="flex items-center text-sm text-gray-700">
                            <span>📞 {selectedProfessional.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents Section */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Submitted Documents</h3>
                  {documents.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No documents uploaded</p>
                  ) : (
                    <div className="space-y-3">
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center space-x-3">
                            <FiFileText className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{doc.document_type}</p>
                              <p className="text-xs text-gray-500">
                                Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                doc.verification_status === 'verified'
                                  ? 'bg-green-100 text-green-800'
                                  : doc.verification_status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {doc.verification_status}
                            </span>
                            <button
                              onClick={() => handlePreviewDocument(doc)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              <FiEye className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* View Full Profile Button */}
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/admin/professionals/${selectedProfessional.id}`)}
                  className="w-full"
                >
                  View Full Profile
                </Button>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <FiUser className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Professional</h3>
                <p className="text-gray-600">
                  Click on a professional from the list to view their details and documents.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      <Modal
        isOpen={previewModal.show}
        onClose={() => setPreviewModal({ show: false, document: null })}
        title="Document Preview"
        size="xl"
      >
        {previewModal.document && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Document Type</p>
                <p className="font-medium text-gray-900">{previewModal.document.document_type}</p>
              </div>
              <div>
                <p className="text-gray-500">Upload Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(previewModal.document.uploaded_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <span
                  className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                    previewModal.document.verification_status === 'verified'
                      ? 'bg-green-100 text-green-800'
                      : previewModal.document.verification_status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {previewModal.document.verification_status}
                </span>
              </div>
              {previewModal.document.rejection_reason && (
                <div className="col-span-2">
                  <p className="text-gray-500">Rejection Reason</p>
                  <p className="font-medium text-red-600">{previewModal.document.rejection_reason}</p>
                </div>
              )}
            </div>
            <div className="border-t pt-4">
              <div className="bg-gray-100 rounded-lg p-4 min-h-[400px] flex items-center justify-center">
                {previewModal.document.document_url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                  <img
                    src={previewModal.document.document_url}
                    alt={previewModal.document.document_type}
                    className="max-w-full max-h-[500px] object-contain"
                  />
                ) : previewModal.document.document_url.match(/\.pdf$/i) ? (
                  <iframe
                    src={previewModal.document.document_url}
                    className="w-full h-[500px]"
                    title="Document Preview"
                  />
                ) : (
                  <div className="text-center">
                    <FiFileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Preview not available for this file type</p>
                    <a
                      href={previewModal.document.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Open in New Tab
                    </a>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                variant="secondary"
                onClick={() => setPreviewModal({ show: false, document: null })}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Verify Confirmation Modal */}
      <Modal
        isOpen={verifyModal.show}
        onClose={() => setVerifyModal({ show: false, professional: null })}
        title="Approve Professional"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
            <FiCheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-medium text-green-900">Approve Verification</p>
              <p className="text-sm text-green-700">
                This will grant the professional full access to the platform
              </p>
            </div>
          </div>
          <p className="text-gray-700">
            Are you sure you want to approve professional{' '}
            <strong>
              {verifyModal.professional?.first_name} {verifyModal.professional?.last_name}
            </strong>
            ?
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setVerifyModal({ show: false, professional: null })}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleVerifyConfirm}>
              <FiCheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Confirmation Modal */}
      <Modal
        isOpen={rejectModal.show}
        onClose={() => setRejectModal({ show: false, professional: null, reason: '' })}
        title="Reject Professional"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg">
            <FiXCircle className="h-6 w-6 text-red-600" />
            <div>
              <p className="font-medium text-red-900">Reject Verification</p>
              <p className="text-sm text-red-700">
                The professional will be notified of the rejection
              </p>
            </div>
          </div>
          <p className="text-gray-700">
            Please provide a reason for rejecting professional{' '}
            <strong>
              {rejectModal.professional?.first_name} {rejectModal.professional?.last_name}
            </strong>
            :
          </p>
          <textarea
            value={rejectModal.reason}
            onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            rows={4}
            placeholder="Enter detailed rejection reason (e.g., invalid license, incomplete documents, etc.)..."
          />
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setRejectModal({ show: false, professional: null, reason: '' })}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleRejectConfirm}>
              <FiXCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProfessionalVerification;
