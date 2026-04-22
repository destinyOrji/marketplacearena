import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiTrash2, FiMail, FiCalendar, FiUser } from 'react-icons/fi';
import { Button, Modal } from '../../components';
import { patientService } from '../../services/patientService';

const PatientDetail: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (patientId) fetchDetails();
  }, [patientId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const data = await patientService.getPatientById(patientId!);
      setPatient(data);
    } catch (error) {
      console.error('Failed to fetch patient details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await patientService.deletePatient(patient.id || patient._id);
      navigate('/admin/patients');
    } catch {
      alert('Failed to delete patient. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );

  if (!patient) return (
    <div className="text-center py-12">
      <p className="text-gray-500">Patient not found</p>
      <Button onClick={() => navigate('/admin/patients')} className="mt-4">Back to Patients</Button>
    </div>
  );

  // Normalize - backend returns camelCase
  const firstName = patient.user?.firstName || patient.firstName || patient.first_name || '';
  const lastName = patient.user?.lastName || patient.lastName || patient.last_name || '';
  const email = patient.user?.email || patient.email || '';
  const phone = patient.phone || patient.user?.phone || '';
  const isActive = patient.user?.status === 'active' || patient.is_active !== false;
  const emailVerified = patient.user?.emailVerified || patient.emailVerified || patient.email_verified || false;
  const createdAt = patient.user?.createdAt || patient.createdAt || patient.created_at;
  const gender = patient.gender || '';
  const dateOfBirth = patient.dateOfBirth || patient.date_of_birth || '';
  const address = typeof patient.address === 'object'
    ? [patient.address?.street, patient.address?.city, patient.address?.state].filter(Boolean).join(', ')
    : patient.address || '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/admin/patients')} className="text-gray-600 hover:text-gray-900">
            <FiChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Patient Details</h1>
        </div>
        <Button variant="danger" onClick={() => setDeleteModal(true)}>
          <FiTrash2 className="h-4 w-4 mr-2" /> Delete
        </Button>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start space-x-6">
          <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <FiUser className="h-12 w-12 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{firstName} {lastName}</h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center text-gray-600 gap-2">
                <FiMail className="h-4 w-4" /> <span>{email}</span>
              </div>
              {phone && (
                <div className="flex items-center text-gray-600 gap-2">
                  <span>📞</span> <span>{phone}</span>
                </div>
              )}
              {dateOfBirth && (
                <div className="flex items-center text-gray-600 gap-2">
                  <FiCalendar className="h-4 w-4" />
                  <span>DOB: {new Date(dateOfBirth).toLocaleDateString()}</span>
                </div>
              )}
              {gender && (
                <div className="flex items-center text-gray-600 gap-2">
                  <FiUser className="h-4 w-4" /> <span className="capitalize">Gender: {gender}</span>
                </div>
              )}
              {address && (
                <div className="flex items-center text-gray-600 gap-2 md:col-span-2">
                  <span>📍</span> <span>{address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Patient ID</p>
            <p className="text-base font-medium text-gray-900 break-all">{patient.id || patient._id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Registered</p>
            <p className="text-base font-medium text-gray-900">
              {createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Account Status</p>
            <span className={`inline-block mt-1 px-3 py-1 text-sm font-semibold rounded-full ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email Verified</p>
            <span className={`inline-block mt-1 px-3 py-1 text-sm font-semibold rounded-full ${emailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {emailVerified ? 'Verified' : 'Pending'}
            </span>
          </div>
          {patient.bloodGroup && (
            <div>
              <p className="text-sm text-gray-500">Blood Group</p>
              <p className="text-base font-medium text-gray-900 mt-1">{patient.bloodGroup}</p>
            </div>
          )}
          {patient.maritalStatus && (
            <div>
              <p className="text-sm text-gray-500">Marital Status</p>
              <p className="text-base font-medium text-gray-900 mt-1 capitalize">{patient.maritalStatus}</p>
            </div>
          )}
        </div>
      </div>

      {/* Emergency Contact */}
      {patient.emergencyContact?.name && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="text-base font-medium text-gray-900">{patient.emergencyContact.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Relationship</p>
              <p className="text-base font-medium text-gray-900">{patient.emergencyContact.relationship || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="text-base font-medium text-gray-900">{patient.emergencyContact.phone || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-3xl font-bold text-blue-600">{patient.totalAppointments || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Total Appointments</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-3xl font-bold text-red-600">{patient.totalEmergencies || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Emergency Bookings</p>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Patient">
        <div className="space-y-4">
          <p className="text-gray-700">Delete <strong>{firstName} {lastName}</strong>? This cannot be undone.</p>
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

export default PatientDetail;
