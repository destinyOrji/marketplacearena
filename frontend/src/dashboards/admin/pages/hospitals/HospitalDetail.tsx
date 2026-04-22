import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiTrash2, FiMail, FiCheckCircle, FiXCircle, FiPhone, FiMapPin } from 'react-icons/fi';
import { Button, Modal } from '../../components';
import { hospitalService } from '../../services/hospitalService';

const HospitalDetail: React.FC = () => {
  const { hospitalId } = useParams<{ hospitalId: string }>();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [verifyModal, setVerifyModal] = useState(false);
  const [rejectModal, setRejectModal] = useState({ show: false, reason: '' });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (hospitalId) fetchDetails();
  }, [hospitalId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const data = await hospitalService.getHospitalById(hospitalId!);
      setHospital(data);
    } catch (error) {
      console.error('Failed to fetch hospital details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setActionLoading(true);
    try {
      await hospitalService.verifyHospital(hospital.id);
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
      await hospitalService.rejectHospital(hospital.id, rejectModal.reason);
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
      await hospitalService.deleteHospital(hospital.id);
      navigate('/admin/hospitals');
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

  if (!hospital) return (
    <div className="text-center py-12">
      <p className="text-gray-500">Hospital not found</p>
      <Button onClick={() => navigate('/admin/hospitals')} className="mt-4">Back</Button>
    </div>
  );

  const isVerified = hospital.isVerified;
  const address = hospital.address;
  const addressStr = [address?.street, address?.city, address?.state].filter(Boolean).join(', ');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/admin/hospitals')} className="text-gray-600 hover:text-gray-900">
            <FiChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Hospital Details</h1>
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
          <div className="h-24 w-24 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600 text-3xl font-bold">
            {hospital.hospitalName?.[0] || 'H'}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{hospital.hospitalName}</h2>
            <p className="text-lg text-gray-600 mt-1">{hospital.hospitalType}</p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center text-gray-600 gap-2">
                <FiMail className="h-4 w-4" /> <span>{hospital.email}</span>
              </div>
              <div className="flex items-center text-gray-600 gap-2">
                <FiPhone className="h-4 w-4" /> <span>{hospital.phone}</span>
              </div>
              {addressStr && (
                <div className="flex items-center text-gray-600 gap-2 md:col-span-2">
                  <FiMapPin className="h-4 w-4" /> <span>{addressStr}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status & Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification & Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Verification Status</p>
            <span className={`inline-block mt-1 px-3 py-1 text-sm font-semibold rounded-full ${isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {isVerified ? 'Verified' : 'Pending'}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Registration Number</p>
            <p className="text-base font-medium text-gray-900 mt-1">{hospital.registrationNumber || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Registered</p>
            <p className="text-base font-medium text-gray-900 mt-1">
              {hospital.createdAt ? new Date(hospital.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Emergency Services</p>
            <span className={`inline-block mt-1 px-3 py-1 text-sm font-semibold rounded-full ${hospital.emergencyServices ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {hospital.emergencyServices ? 'Available' : 'Not Available'}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Website</p>
            <p className="text-base font-medium text-gray-900 mt-1">
              {hospital.website ? <a href={hospital.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{hospital.website}</a> : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Beds Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-3xl font-bold text-blue-600">{hospital.totalBeds || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Total Beds</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-3xl font-bold text-green-600">{hospital.availableBeds || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Available Beds</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-3xl font-bold text-red-600">{hospital.icuBeds || 0}</p>
          <p className="text-sm text-gray-500 mt-1">ICU Beds</p>
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={verifyModal} onClose={() => setVerifyModal(false)} title="Verify Hospital">
        <div className="space-y-4">
          <p className="text-gray-700">Verify <strong>{hospital.hospitalName}</strong>? This grants them full platform access.</p>
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setVerifyModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleVerify} disabled={actionLoading}>
              {actionLoading ? 'Verifying...' : 'Verify'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={rejectModal.show} onClose={() => setRejectModal({ show: false, reason: '' })} title="Reject Hospital">
        <div className="space-y-4">
          <p className="text-gray-700">Reason for rejecting <strong>{hospital.hospitalName}</strong>:</p>
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

      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Hospital">
        <div className="space-y-4">
          <p className="text-gray-700">Delete <strong>{hospital.hospitalName}</strong>? This cannot be undone.</p>
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

export default HospitalDetail;
