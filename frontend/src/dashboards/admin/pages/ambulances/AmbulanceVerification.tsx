/**
 * Ambulance Verification Page
 * Display pending ambulance provider verifications
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiCheckCircle, FiXCircle, FiFileText, FiTruck } from 'react-icons/fi';
import { Button, Modal } from '../../components';
import { ambulanceService } from '../../services/ambulanceService';
import { AmbulanceProvider, AmbulanceDocument } from '../../types';

const AmbulanceVerification: React.FC = () => {
  const navigate = useNavigate();
  const [pendingProviders, setPendingProviders] = useState<AmbulanceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<AmbulanceProvider | null>(null);
  const [documents, setDocuments] = useState<AmbulanceDocument[]>([]);
  const [documentModal, setDocumentModal] = useState(false);
  const [verifyModal, setVerifyModal] = useState(false);
  const [rejectModal, setRejectModal] = useState({ show: false, reason: '' });

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const fetchPendingVerifications = async () => {
    try {
      setLoading(true);
      const data = await ambulanceService.getPendingVerifications();
      setPendingProviders(data);
    } catch (error) {
      console.error('Failed to fetch pending verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocuments = async (provider: AmbulanceProvider) => {
    setSelectedProvider(provider);
    try {
      const docs = await ambulanceService.getProviderDocuments(provider.id);
      setDocuments(docs);
      setDocumentModal(true);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  };

  const handleVerifyClick = (provider: AmbulanceProvider) => {
    setSelectedProvider(provider);
    setVerifyModal(true);
  };

  const handleVerifyConfirm = async () => {
    if (!selectedProvider) return;

    try {
      await ambulanceService.verifyProvider(selectedProvider.id);
      setVerifyModal(false);
      setSelectedProvider(null);
      fetchPendingVerifications();
    } catch (error) {
      console.error('Failed to verify provider:', error);
    }
  };

  const handleRejectClick = (provider: AmbulanceProvider) => {
    setSelectedProvider(provider);
    setRejectModal({ show: true, reason: '' });
  };

  const handleRejectConfirm = async () => {
    if (!selectedProvider || !rejectModal.reason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }

    try {
      await ambulanceService.rejectProvider(selectedProvider.id, rejectModal.reason);
      setRejectModal({ show: false, reason: '' });
      setSelectedProvider(null);
      fetchPendingVerifications();
    } catch (error) {
      console.error('Failed to reject provider:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Ambulance Provider Verification</h1>
        <div className="text-sm text-gray-600">
          {pendingProviders.length} pending verification{pendingProviders.length !== 1 ? 's' : ''}
        </div>
      </div>

      {pendingProviders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FiCheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <p className="text-gray-500">No pending provider verifications</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingProviders.map((provider) => (
            <div key={provider.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                      <FiTruck className="h-8 w-8 text-red-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{provider.provider_name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{provider.service_type}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div><span className="font-medium">Email:</span> {provider.email}</div>
                      <div><span className="font-medium">Phone:</span> {provider.phone}</div>
                      <div><span className="font-medium">Location:</span> {provider.city}, {provider.state}</div>
                      <div><span className="font-medium">Registration:</span> {provider.registration_number}</div>
                      <div className="col-span-2">
                        <span className="font-medium">Registered:</span> {new Date(provider.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <Button size="sm" variant="secondary" onClick={() => navigate(`/admin/ambulances/${provider.id}`)}>
                    <FiEye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => handleViewDocuments(provider)}>
                    <FiFileText className="h-4 w-4 mr-2" />
                    View Documents
                  </Button>
                  <Button size="sm" variant="primary" onClick={() => handleVerifyClick(provider)}>
                    <FiCheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleRejectClick(provider)}>
                    <FiXCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={documentModal}
        onClose={() => { setDocumentModal(false); setSelectedProvider(null); setDocuments([]); }}
        title={`Documents - ${selectedProvider?.provider_name}`}
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
                      <p className="text-xs text-gray-500">Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <a href={doc.document_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View Document
                  </a>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end mt-6">
            <Button variant="secondary" onClick={() => { setDocumentModal(false); setSelectedProvider(null); setDocuments([]); }}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={verifyModal}
        onClose={() => { setVerifyModal(false); setSelectedProvider(null); }}
        title="Verify Provider"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to verify provider <strong>{selectedProvider?.provider_name}</strong>?
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => { setVerifyModal(false); setSelectedProvider(null); }}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleVerifyConfirm}>
              Verify Provider
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={rejectModal.show}
        onClose={() => { setRejectModal({ show: false, reason: '' }); setSelectedProvider(null); }}
        title="Reject Provider"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Please provide a reason for rejecting provider <strong>{selectedProvider?.provider_name}</strong>:
          </p>
          <textarea
            value={rejectModal.reason}
            onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Enter rejection reason..."
          />
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => { setRejectModal({ show: false, reason: '' }); setSelectedProvider(null); }}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleRejectConfirm}>
              Reject Provider
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AmbulanceVerification;
