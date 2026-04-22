import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiEdit, FiTrash2, FiMail, FiUser, FiCheckCircle, FiXCircle, FiFileText, FiPhone } from 'react-icons/fi';
import { Button, Modal } from '../../components';
import { professionalService } from '../../services/professionalService';

const ProfessionalDetail: React.FC = () => {
  const { professionalId } = useParams<{ professionalId: string }>();
  const navigate = useNavigate();
  const [professional, setProfessional] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [verifyModal, setVerifyModal] = useState(false);
  const [rejectModal, setRejectModal] = useState({ show: false, reason: '' });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (professionalId) fetchDetails();
  }, [professionalId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const data = await professionalService.getProfessionalById(professionalId!);
      setProfessional(data);
    } catch (error) {
      console.error('Failed to fetch professional details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setActionLoading(true);
    try {
      await professionalService.verifyProfessional(professional.id);
      setVerifyModal(false);
      fetchDetails();
    } catch (error) {
      alert('Failed to verify. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModal.reason.trim()) { alert('Please provide a rejection reason.'); return; }
    setActionLoading(true);
    try {
      await professionalService.rejectProfessional(professional.id, rejectModal.reason);
      setRejectModal({ show: false, reason: '' });
      fetchDetails();
    } catch (error) {
      alert('Failed to reject. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await professionalService.deleteProfessional(professional.id);
      navigate('/admin/professionals');
    } catch (error) {
      alert('Failed to delete. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );

  if (!professional) return (
    <div className="text-center py-12">
      <p className="text-gray-500">Professional not found</p>
      <Button onClick={() => navigate('/admin/professionals')} className="mt-4">Back</Button>
    </div>
  );

  // Normalize data - backend returns camelCase
  const name = `${professional.user?.firstName || ''} ${professional.user?.lastName || ''}`.trim() || 'N/A';
  const email = professional.user?.email || 'N/A';
  const isVerified = professional.isVerified;
  const verificationStatus = isVerified ? 'verified' : 'pending';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/admin/professionals')} className="text-gray-600 hover:text-gray-900">
            <FiChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Professional Details</h1>
        </div>
        <div className="flex space-x-3">
          {!isVerified && (
            <>
              <Button variant="primary" onClick={() => setVerifyModal(true)}>
                <FiCheckCircle className="h-4 w-4 mr-2" /> Verify
              </Button>
              <Button variant="danger" onClick={() => setRejectModal({ show: true, reason: '' })}>
                <FiXCircle className="h-4 w-4 mr-2" /> Reject
              </Button>
            </>
          )}
          <Button variant="danger" onClick={() => setDeleteModal(true)}>
            <FiTrash2 className="h-4 w-4 mr-2" /> Delete
          </Button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start space-x-6">
          <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <FiUser className="h-12 w-12 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{name}</h2>
            <p className="text-lg text-gray-600 mt-1 capitalize">
              {professional.professionalType} {professional.specialization ? `- ${professional.specialization}` : ''}
            </p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center text-gray-600 gap-2">
                <FiMail className="h-4 w-4" /> <span>{email}</span>
              </div>
              {professional.phone && (
                <div className="flex items-center text-gray-600 gap-2">
                  <FiPhone className="h-4 w-4" /> <span>{professional.phone}</span>
                </div>
              )}
              {professional.licenseNumber && (
                <div className="flex items-center text-gray-600 gap-2">
                  <FiFileText className="h-4 w-4" /> <span>License: {professional.licenseNumber}</span>
                </div>
              )}
              {professional.yearsOfExperience > 0 && (
                <div className="flex items-center text-gray-600 gap-2">
                  <FiUser className="h-4 w-4" /> <span>{professional.yearsOfExperience} years experience</span>
                </div>
              )}
            </div>
            {professional.bio && <p className="mt-4 text-sm text-gray-700">{professional.bio}</p>}
          </div>
        </div>
      </div>

      {/* Status & Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification & Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Verification Status</p>
            <span className={`inline-block mt-1 px-3 py-1 text-sm font-semibold rounded-full ${isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {isVerified ? 'Verified' : 'Pending'}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Account Status</p>
            <span className={`inline-block mt-1 px-3 py-1 text-sm font-semibold rounded-full ${professional.user?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {professional.user?.status || 'Active'}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Registered</p>
            <p className="text-base font-medium text-gray-900 mt-1">
              {professional.createdAt ? new Date(professional.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Professional Type</p>
            <p className="text-base font-medium text-gray-900 mt-1 capitalize">{professional.professionalType || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Specialization</p>
            <p className="text-base font-medium text-gray-900 mt-1">{professional.specialization || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Consultation Fee</p>
            <p className="text-base font-medium text-gray-900 mt-1">
              {professional.consultationFee ? `₦${professional.consultationFee}` : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-3xl font-bold text-blue-600">{professional.totalAppointments || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Total Appointments</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-3xl font-bold text-green-600">{professional.completedAppointments || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Completed</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-3xl font-bold text-yellow-600">{professional.averageRating?.toFixed(1) || '0.0'}</p>
          <p className="text-sm text-gray-500 mt-1">Average Rating</p>
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={verifyModal} onClose={() => setVerifyModal(false)} title="Verify Professional">
        <div className="space-y-4">
          <p className="text-gray-700">Verify <strong>{name}</strong>? This grants them full platform access.</p>
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setVerifyModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleVerify} disabled={actionLoading}>
              {actionLoading ? 'Verifying...' : 'Verify'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={rejectModal.show} onClose={() => setRejectModal({ show: false, reason: '' })} title="Reject Professional">
        <div className="space-y-4">
          <p className="text-gray-700">Reason for rejecting <strong>{name}</strong>:</p>
          <textarea value={rejectModal.reason} onChange={e => setRejectModal({ ...rejectModal, reason: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4} placeholder="Enter rejection reason..." />
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setRejectModal({ show: false, reason: '' })}>Cancel</Button>
            <Button variant="danger" onClick={handleReject} disabled={actionLoading}>
              {actionLoading ? 'Rejecting...' : 'Reject'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Professional">
        <div className="space-y-4">
          <p className="text-gray-700">Delete <strong>{name}</strong>? This cannot be undone.</p>
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} disabled={actionLoading}>
              {actionLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProfessionalDetail;
