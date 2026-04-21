/**
 * Ambulance Provider Detail View
 * Display complete provider profile with statistics and verification actions
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiEdit, FiTrash2, FiMail, FiCheckCircle, FiXCircle, FiFileText, FiTruck } from 'react-icons/fi';
import { Button, Modal } from '../../components';
import { ambulanceService } from '../../services/ambulanceService';
import { AmbulanceProvider, AmbulanceDocument } from '../../types';

const ProviderDetail: React.FC = () => {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  const [provider, setProvider] = useState<AmbulanceProvider | null>(null);
  const [documents, setDocuments] = useState<AmbulanceDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [verifyModal, setVerifyModal] = useState(false);
  const [rejectModal, setRejectModal] = useState({ show: false, reason: '' });

  useEffect(() => {
    if (providerId) {
      fetchProviderDetails();
      fetchDocuments();
    }
  }, [providerId]);

  const fetchProviderDetails = async () => {
    try {
      setLoading(true);
      const data = await ambulanceService.getProviderById(providerId!);
      setProvider(data);
    } catch (error) {
      console.error('Failed to fetch provider details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const docs = await ambulanceService.getProviderDocuments(providerId!);
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  };

  const handleEdit = () => {
    navigate(`/admin/ambulances/${providerId}/edit`);
  };

  const handleDeleteClick = () => {
    setDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!provider) return;

    try {
      await ambulanceService.deleteProvider(provider.id);
      navigate('/admin/ambulances');
    } catch (error) {
      console.error('Failed to delete provider:', error);
      alert('Failed to delete provider. Please try again.');
    }
  };

  const handleVerifyClick = () => {
    setVerifyModal(true);
  };

  const handleVerifyConfirm = async () => {
    if (!provider) return;

    try {
      await ambulanceService.verifyProvider(provider.id);
      setVerifyModal(false);
      fetchProviderDetails();
    } catch (error) {
      console.error('Failed to verify provider:', error);
      alert('Failed to verify provider. Please try again.');
    }
  };

  const handleRejectClick = () => {
    setRejectModal({ show: true, reason: '' });
  };

  const handleRejectConfirm = async () => {
    if (!provider || !rejectModal.reason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }

    try {
      await ambulanceService.rejectProvider(provider.id, rejectModal.reason);
      setRejectModal({ show: false, reason: '' });
      fetchProviderDetails();
    } catch (error) {
      console.error('Failed to reject provider:', error);
      alert('Failed to reject provider. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Provider not found</p>
        <Button onClick={() => navigate('/admin/ambulances')} className="mt-4">
          Back to Providers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/ambulances')}
            className="text-gray-600 hover:text-gray-900"
          >
            <FiChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Provider Details</h1>
        </div>
        <div className="flex space-x-3">
          {provider.verification_status === 'pending' && (
            <>
              <Button variant="primary" onClick={handleVerifyClick}>
                <FiCheckCircle className="h-4 w-4 mr-2" />
                Verify
              </Button>
              <Button variant="danger" onClick={handleRejectClick}>
                <FiXCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </>
          )}
          <Button variant="secondary" onClick={handleEdit}>
            <FiEdit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="danger" onClick={handleDeleteClick}>
            <FiTrash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Provider Profile Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start space-x-6">
          <div className="flex-shrink-0">
            <div className="h-24 w-24 rounded-full bg-red-100 flex items-center justify-center">
              <FiTruck className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{provider.provider_name}</h2>
              {provider.is_online && (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Online
                </span>
              )}
            </div>
            <p className="text-lg text-gray-600 mt-1">{provider.service_type}</p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center text-gray-600">
                <FiMail className="h-5 w-5 mr-2" />
                <span>{provider.email}</span>
              </div>
              <div className="flex items-center text-gray-600">
                {/* Icon removed - not available in Feather Icons */}
                <span>{provider.phone}</span>
              </div>
              <div className="flex items-center text-gray-600">
                {/* Icon removed - not available in Feather Icons */}
                <span>{provider.address}, {provider.city}, {provider.state}</span>
              </div>
            </div>
            {provider.description && (
              <div className="mt-4">
                <p className="text-sm text-gray-700">{provider.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Service Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Registration Number</p>
            <p className="text-base font-medium text-gray-900">{provider.registration_number}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Service Type</p>
            <p className="text-base font-medium text-gray-900">{provider.service_type}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Coverage Area</p>
            <p className="text-base font-medium text-gray-900">{provider.coverage_area || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Verification Status</p>
            <span
              className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                provider.verification_status === 'verified'
                  ? 'bg-green-100 text-green-800'
                  : provider.verification_status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {provider.verification_status.charAt(0).toUpperCase() + provider.verification_status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Documents */}
      {documents.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Documents</h3>
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
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistics */}
      {provider.statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Bookings</h3>
            <p className="text-3xl font-bold text-blue-600">{provider.statistics.total_bookings}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Vehicles</h3>
            <p className="text-3xl font-bold text-green-600">{provider.statistics.total_vehicles}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Bookings</h3>
            <p className="text-3xl font-bold text-purple-600">{provider.statistics.active_bookings}</p>
          </div>
        </div>
      )}

      {/* Account Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Provider ID</p>
            <p className="text-base font-medium text-gray-900">{provider.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Registration Date</p>
            <p className="text-base font-medium text-gray-900">
              {new Date(provider.created_at).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Account Status</p>
            <span
              className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                provider.is_active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {provider.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Provider"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete provider{' '}
            <strong>{provider.provider_name}</strong>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={verifyModal}
        onClose={() => setVerifyModal(false)}
        title="Verify Provider"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to verify provider{' '}
            <strong>{provider.provider_name}</strong>
            ?
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setVerifyModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleVerifyConfirm}>
              Verify
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={rejectModal.show}
        onClose={() => setRejectModal({ show: false, reason: '' })}
        title="Reject Provider"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Please provide a reason for rejecting provider{' '}
            <strong>{provider.provider_name}</strong>
            :
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
              onClick={() => setRejectModal({ show: false, reason: '' })}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleRejectConfirm}>
              Reject
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProviderDetail;
