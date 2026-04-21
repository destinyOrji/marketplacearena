/**
 * Patient Detail View
 * Display complete patient profile with statistics and activity history
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiEdit, FiTrash2, FiMail, FiCalendar, FiUser } from 'react-icons/fi';
import { Button, Modal } from '../../components';
import { patientService } from '../../services/patientService';
import { Patient } from '../../types';

const PatientDetail: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);

  useEffect(() => {
    if (patientId) {
      fetchPatientDetails();
    }
  }, [patientId]);

  const fetchPatientDetails = async () => {
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

  const handleEdit = () => {
    navigate(`/admin/patients/${patientId}/edit`);
  };

  const handleDeleteClick = () => {
    setDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!patient) return;

    try {
      await patientService.deletePatient(patient.id);
      navigate('/admin/patients');
    } catch (error) {
      console.error('Failed to delete patient:', error);
      alert('Failed to delete patient. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Patient not found</p>
        <Button onClick={() => navigate('/admin/patients')} className="mt-4">
          Back to Patients
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
            onClick={() => navigate('/admin/patients')}
            className="text-gray-600 hover:text-gray-900"
          >
            <FiChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Patient Details</h1>
        </div>
        <div className="flex space-x-3">
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

      {/* Patient Profile Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start space-x-6">
          <div className="flex-shrink-0">
            <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center">
              <FiUser className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {patient.first_name} {patient.last_name}
            </h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center text-gray-600">
                <FiMail className="h-5 w-5 mr-2" />
                <span>{patient.email}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FiMail className="h-5 w-5 mr-2" />
                <span>{patient.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FiCalendar className="h-5 w-5 mr-2" />
                <span>DOB: {patient.date_of_birth || 'N/A'}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FiUser className="h-5 w-5 mr-2" />
                <span>Gender: {patient.gender || 'N/A'}</span>
              </div>
              {patient.address && (
                <div className="flex items-center text-gray-600 md:col-span-2">
                  <FiMail className="h-5 w-5 mr-2" />
                  <span>
                    {patient.address}
                    {patient.city && `, ${patient.city}`}
                    {patient.state && `, ${patient.state}`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Registration Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Patient ID</p>
            <p className="text-base font-medium text-gray-900">{patient.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Registration Date</p>
            <p className="text-base font-medium text-gray-900">
              {new Date(patient.created_at).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Account Status</p>
            <span
              className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                patient.is_active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {patient.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email Verification</p>
            <span
              className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                patient.email_verified
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {patient.email_verified ? 'Verified' : 'Pending'}
            </span>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {patient.statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Appointments</h3>
            <p className="text-3xl font-bold text-blue-600">{patient.statistics.total_appointments}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Emergency Bookings</h3>
            <p className="text-3xl font-bold text-red-600">{patient.statistics.total_emergencies}</p>
          </div>
        </div>
      )}

      {/* Activity History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity History</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <p className="text-sm font-medium text-gray-900">Account Created</p>
            <p className="text-sm text-gray-500">
              {new Date(patient.created_at).toLocaleString()}
            </p>
          </div>
          {patient.email_verified && (
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="text-sm font-medium text-gray-900">Email Verified</p>
              <p className="text-sm text-gray-500">Email verification completed</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Patient"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete patient{' '}
            <strong>
              {patient.first_name} {patient.last_name}
            </strong>
            ? This action cannot be undone and will remove all associated data.
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
    </div>
  );
};

export default PatientDetail;
