/**
 * Ambulance Verification Page
 * Display pending ambulance provider verifications
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiCheckCircle, FiXCircle, FiFileText, FiTruck, FiAlertCircle } from 'react-icons/fi';
import { Button, Modal } from '../../components';
import { ambulanceService } from '../../services/ambulanceService';
import { AmbulanceProvider, AmbulanceDocument } from '../../types';

const AmbulanceVerification: React.FC = () => {
  const navigate = useNavigate();
  const [pendingProviders, setPendingProviders] = useState<AmbulanceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<AmbulanceProvider | null>(null);
  const [documents, setDocuments] = useState<AmbulanceDocument[]>([]);
  const [documentModal, setDocumentModal] = useState(false);
  const [verifyModal, setVerifyModal] = useState(false);
  const [rejectModal, setRejectModal] = useState({ show: false, reason: '' });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const fetchPendingVerifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ambulanceService.getPendingVerifications();
      // Map the backend response to match the frontend expected format
      const mapped = (response || []).map((provider: any) => ({
        id: provider._id || provider.id,
        user_id: provider.user?._id || provider.user_id,
        provider_name: provider.serviceName || provider.provider_name || 'N/A',
        email: provider.user?.email || provider.email || 'N/A',
        phone: provider.phone || provider.user?.phone || 'N/A',
        service_type: provider.serviceType || provider.service_type || 'N/A',
        registration_number: provider.registrationNumber || provider.registration_number || 'N/A',
        address: provider.baseAddress?.street || provider.address || 'N/A',
        city: provider.baseAddress?.city || provider.city || 'N/A',
        state: provider.baseAddress?.state || provider.state || 'N/A',
        country: provider.baseAddress?.country || provider.country || 'N/A',
        verification_status: provider.isVerified ? 'verified' : 'pending',
        is_active: provider.isAvailable || provider.is_active || false,
        is_online: provider.isAvailable || provider.is_online || false,
        email_verified: provider.user?.emailVerified || provider.email_verified || false,
        created_at: provider.createdAt || provider.created_at || new Date().toISOString(),
      }));
      setPendingProviders(mapped);
    } catch (error: any) {
      console.error('Failed to fetch pending verifications:', error);
      setError(error.message || 'Failed to load pending verifications');
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
      setActionLoading(true);
      await ambulanceService.verifyProvider(selectedProvider.id);
      setVerifyModal(false);
      setSelectedProvider(null);
      await fetchPendingVerifications();
      alert('Provider verified successfully!');
    } catch (error: any) {
      console.error('Failed to verify provider:', error);
      alert(error.message || 'Failed to verify provider');
    } finally {
      setActionLoading(false);
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
      setActionLoading(true);
      await ambulanceService.rejectProvider(selectedProvider.id, rejectModal.reason);
      setRejectModal({ show: false, reason: '' });
      setSelectedProvider(null);
      await fetchPendingVerifications();
      alert('Provider rejected successfully!');
    } catch (error: any) {
      console.error('Failed to reject provider:', error);
      alert(error.message || 'Failed to reject provider');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Ambulance Provider Verification</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
          <FiAlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Verifications</h3>
            <p className="text-sm text-red-700 mb-4">{error}</p>
            <button
              onClick={fetchPendingVerifications}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
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
            <Button variant="secondary" onClick={() => { setVerifyModal(false); setSelectedProvider(null); }} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleVerifyConfirm} disabled={actionLoading}>
              {actionLoading ? 'Verifying...' : 'Verify Provider'}
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
            <Button variant="secondary" onClick={() => { setRejectModal({ show: false, reason: '' }); setSelectedProvider(null); }} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleRejectConfirm} disabled={actionLoading}>
              {actionLoading ? 'Rejecting...' : 'Reject Provider'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AmbulanceVerification;
