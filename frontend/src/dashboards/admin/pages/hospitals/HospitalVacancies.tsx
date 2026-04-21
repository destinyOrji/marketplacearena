/**
 * Hospital Vacancies View
 * Display all job vacancies posted by a hospital
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiCalendar, FiUsers } from 'react-icons/fi';
import { Button, Modal } from '../../components';
import { hospitalService } from '../../services/hospitalService';
import { HospitalVacancy } from '../../types';

const HospitalVacancies: React.FC = () => {
  const { hospitalId } = useParams<{ hospitalId: string }>();
  const navigate = useNavigate();
  const [vacancies, setVacancies] = useState<HospitalVacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [toggleModal, setToggleModal] = useState<{ show: boolean; vacancy: HospitalVacancy | null; newStatus: string }>({
    show: false,
    vacancy: null,
    newStatus: ''
  });

  useEffect(() => {
    if (hospitalId) {
      fetchVacancies();
    }
  }, [hospitalId, statusFilter]);

  const fetchVacancies = async () => {
    try {
      setLoading(true);
      const data = await hospitalService.getHospitalVacancies(hospitalId!, {
        status: statusFilter
      });
      setVacancies(data);
    } catch (error) {
      console.error('Failed to fetch vacancies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = (vacancy: HospitalVacancy, newStatus: string) => {
    setToggleModal({ show: true, vacancy, newStatus });
  };

  const handleToggleConfirm = async () => {
    if (!toggleModal.vacancy) return;

    try {
      await hospitalService.toggleVacancyStatus(
        hospitalId!,
        toggleModal.vacancy.id,
        toggleModal.newStatus
      );
      setToggleModal({ show: false, vacancy: null, newStatus: '' });
      fetchVacancies();
    } catch (error) {
      console.error('Failed to toggle vacancy status:', error);
      alert('Failed to update vacancy status. Please try again.');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/admin/hospitals/${hospitalId}`)}
            className="text-gray-600 hover:text-gray-900"
          >
            <FiChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Hospital Vacancies</h1>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Vacancies List */}
      {vacancies.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No vacancies found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {vacancies.map((vacancy) => (
            <div key={vacancy.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{vacancy.position}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(vacancy.status)}`}>
                      {vacancy.status.charAt(0).toUpperCase() + vacancy.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{vacancy.department}</p>
                  <p className="text-sm text-gray-700 mb-4">{vacancy.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <span>{vacancy.employment_type}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FiCalendar className="h-4 w-4 mr-2" />
                      <span>Posted: {new Date(vacancy.posted_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FiUsers className="h-4 w-4 mr-2" />
                      <span>{vacancy.application_count} Applications</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Requirements:</p>
                    <p className="text-sm text-gray-600">{vacancy.requirements}</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Salary Range:</p>
                    <p className="text-sm text-gray-600">{vacancy.salary_range}</p>
                  </div>

                  {vacancy.closing_date && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Closing Date:</span>{' '}
                      {new Date(vacancy.closing_date).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="ml-4 flex flex-col space-y-2">
                  {vacancy.status === 'active' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleToggleStatus(vacancy, 'inactive')}
                    >
                      Deactivate
                    </Button>
                  )}
                  {vacancy.status === 'inactive' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleToggleStatus(vacancy, 'active')}
                    >
                      Activate
                    </Button>
                  )}
                  {vacancy.status !== 'closed' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleToggleStatus(vacancy, 'closed')}
                    >
                      Close
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toggle Status Confirmation Modal */}
      <Modal
        isOpen={toggleModal.show}
        onClose={() => setToggleModal({ show: false, vacancy: null, newStatus: '' })}
        title="Update Vacancy Status"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to change the status of vacancy{' '}
            <strong>{toggleModal.vacancy?.position}</strong> to{' '}
            <strong>{toggleModal.newStatus}</strong>?
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setToggleModal({ show: false, vacancy: null, newStatus: '' })}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleToggleConfirm}>
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HospitalVacancies;
