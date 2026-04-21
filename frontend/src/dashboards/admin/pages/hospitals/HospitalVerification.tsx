/**
 * Hospital Verification Page
 * Display pending hospital verifications with document preview and approval/rejection actions
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiCheckCircle, FiXCircle, FiFileText } from 'react-icons/fi';
import { Button, Modal } from '../../components';
import { hospitalService } from '../../services/hospitalService';
import { Hospital, HospitalDocument } from '../../types';

const HospitalVerification: React.FC = () => {
  const navigate = useNavigate();
  const [pendingHospitals, setPendingHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [documents, setDocuments] = useState<HospitalDocument[]>([]);
  const [documentModal, setDocumentModal] = useState(false);
  const [verifyModal, setVerifyModal] = useState(false);
  const [rejectModal, setRejectModal] = useState({ show: false, reason: '' });

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const fetchPendingVerifications = async () => {
    try {
      setLoading(true);
      const data = await hospitalService.getPendingVerifications();
      setPendingHospitals(data);
    } catch (error) {
      console.error('Failed to fetch pending verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocuments = async (hospital: Hospital) => {
    setSelectedHospital(hospital);
    try {
      const docs = await hospitalService.getHospitalDocuments(hospital.id);
      setDocuments(docs);
      setDocumentModal(true);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      alert('Failed to load documents. Please try again.');
    }
  };

  const handleVerifyClick = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setVerifyModal(true);
  };

  const handleVerifyConfirm = async () => {
    if (!selectedHospital) return;

    try {
      await hospitalService.verifyHospital(selectedHospital.id);
      setVerifyModal(false);
      setSelectedHospital(null);
      fetchPendingVerifications();
    } catch (error) {
      console.error('Failed to verify hospital:', error);
      alert('Failed to verify hospital. Please try again.');
    }
  };

  const handleRejectClick = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setRejectModal({ show: true, reason: '' });
  };

  const handleRejectConfirm = async () => {
    if (!selectedHospital || !rejectModal.reason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }

    try {
      await hospitalService.rejectHospital(selectedHospital.id, rejectModal.reason);
      setRejectModal({ show: false, reason: '' });
      setSelectedHospital(null);
      fetchPendingVerifications();
    } catch (error) {
      console.error('Failed to reject hospital:', error);
      alert('Failed to reject hospital. Please try again.');
    }
  };

  const handleViewDetails = (hospital: Hospital) => {
    navigate(`/admin/hospitals/${hospital.id}`);
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
        <h1 className="text-2xl font-bold text-gray-900">Hospital Verification</h1>
        <div className="text-sm text-gray-600">
          {pendingHospitals.length} pending verification{pendingHospitals.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Pending Hospitals List */}
      {pendingHospitals.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FiCheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <p className="text-gray-500">No pending hospital verifications</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingHospitals.map((hospital) => (
            <div key={hospital.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {hospital.hospital_name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{hospital.facility_type}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Email:</span> {hospital.email}
                      </div>
                      <div>
                        <span className="font-medium">Phone:</span> {hospital.phone}
                      </div>
                      <div>
                        <span className="font-medium">Location:</span> {hospital.city}, {hospital.state}
                      </div>
                      <div>
                        <span className="font-medium">Registration:</span> {hospital.registration_number}
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Registered:</span>{' '}
                        {new Date(hospital.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleViewDetails(hospital)}
                  >
                    <FiEye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleViewDocuments(hospital)}
                  >
                    <FiFileText className="h-4 w-4 mr-2" />
                    View Documents
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleVerifyClick(hospital)}
                  >
                    <FiCheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRejectClick(hospital)}
                  >
                    <FiXCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Preview Modal */}
      <Modal
        isOpen={documentModal}
        onClose={() => {
          setDocumentModal(false);
          setSelectedHospital(null);
          setDocuments([]);
        }}
        title={`Documents - ${selectedHospital?.hospital_name}`}
      >
        <div className="space-y-4">
          {documents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No documents available</p>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
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
                    <a
                      href={doc.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Document
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end mt-6">
            <Button
              variant="secondary"
              onClick={() => {
                setDocumentModal(false);
                setSelectedHospital(null);
                setDocuments([]);
              }}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Verify Confirmation Modal */}
      <Modal
        isOpen={verifyModal}
        onClose={() => {
          setVerifyModal(false);
          setSelectedHospital(null);
        }}
        title="Verify Hospital"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to verify hospital{' '}
            <strong>{selectedHospital?.hospital_name}</strong>? This will grant them full access to
            the platform and allow them to post job vacancies.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => {
                setVerifyModal(false);
                setSelectedHospital(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleVerifyConfirm}>
              Verify Hospital
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Confirmation Modal */}
      <Modal
        isOpen={rejectModal.show}
        onClose={() => {
          setRejectModal({ show: false, reason: '' });
          setSelectedHospital(null);
        }}
        title="Reject Hospital"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Please provide a reason for rejecting hospital{' '}
            <strong>{selectedHospital?.hospital_name}</strong>. This will be sent to the hospital
            administrator.
          </p>
          <textarea
            value={rejectModal.reason}
            onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Enter rejection reason..."
          />
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => {
                setRejectModal({ show: false, reason: '' });
                setSelectedHospital(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleRejectConfirm}>
              Reject Hospital
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HospitalVerification;
