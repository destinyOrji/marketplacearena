import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiEye, FiSearch } from 'react-icons/fi';
import { authService } from '../../services/authService';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://healthmarketarena.com/api';

const HospitalVacancies: React.FC = () => {
  const navigate = useNavigate();
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${authService.getAccessToken()}` }
  });

  useEffect(() => { fetchVacancies(); }, [statusFilter]);

  const fetchVacancies = async () => {
    setLoading(true);
    try {
      // Get all hospitals then their vacancies
      const hospitalsRes = await axios.get(`${API_BASE_URL}/admin/hospitals?page_size=100`, getHeaders());
      const hospitals = hospitalsRes.data?.data || [];

      // Fetch vacancies for each hospital
      const allVacancies: any[] = [];
      for (const hospital of hospitals) {
        try {
          const vacRes = await axios.get(
            `${API_BASE_URL}/admin/hospitals/${hospital.id || hospital._id}/vacancies`,
            getHeaders()
          );
          const vacs = vacRes.data?.data || [];
          vacs.forEach((v: any) => {
            allVacancies.push({
              ...v,
              hospitalName: hospital.hospitalName || hospital.hospital_name,
              hospitalId: hospital.id || hospital._id,
            });
          });
        } catch {
          // skip if hospital has no vacancies endpoint
        }
      }
      setVacancies(allVacancies);
    } catch (error) {
      console.error('Failed to fetch vacancies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (vacancy: any) => {
    setActionLoading(vacancy._id || vacancy.id);
    try {
      await axios.patch(
        `${API_BASE_URL}/hospitals/vacancies/${vacancy._id || vacancy.id}/status`,
        { status: 'active' },
        getHeaders()
      );
      setVacancies(prev => prev.map(v =>
        (v._id || v.id) === (vacancy._id || vacancy.id) ? { ...v, status: 'active' } : v
      ));
    } catch (error) {
      alert('Failed to approve vacancy');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (vacancy: any) => {
    setActionLoading(vacancy._id || vacancy.id);
    try {
      await axios.patch(
        `${API_BASE_URL}/hospitals/vacancies/${vacancy._id || vacancy.id}/status`,
        { status: 'closed' },
        getHeaders()
      );
      setVacancies(prev => prev.map(v =>
        (v._id || v.id) === (vacancy._id || vacancy.id) ? { ...v, status: 'closed' } : v
      ));
    } catch (error) {
      alert('Failed to reject vacancy');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = vacancies.filter(v => {
    const title = v.jobTitle || v.job_title || '';
    const hospital = v.hospitalName || '';
    const matchSearch = !search || title.toLowerCase().includes(search.toLowerCase()) || hospital.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      paused: 'bg-yellow-100 text-yellow-800',
      closed: 'bg-red-100 text-red-800',
      filled: 'bg-blue-100 text-blue-800',
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hospital Vacancies</h1>
          <p className="text-sm text-gray-500 mt-1">Review and approve job vacancies posted by hospitals</p>
        </div>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          {filtered.length} vacancies
        </span>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by title or hospital..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="draft">Draft (Pending Approval)</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="closed">Closed</option>
          <option value="filled">Filled</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No vacancies found</p>
            <p className="text-gray-400 text-sm mt-1">Hospitals haven't posted any vacancies yet</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hospital</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Posted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((vacancy: any) => {
                const id = vacancy._id || vacancy.id;
                const title = vacancy.jobTitle || vacancy.job_title || 'Untitled';
                const dept = vacancy.department || 'N/A';
                const empType = (vacancy.employmentType || vacancy.employment_type || '').replace(/_/g, ' ');
                const isLoading = actionLoading === id;

                return (
                  <tr key={id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{title}</p>
                      <p className="text-xs text-gray-500">{vacancy.experienceLevel || ''} level</p>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/admin/hospitals/${vacancy.hospitalId}`)}
                        className="text-sm text-blue-600 hover:underline font-medium"
                      >
                        {vacancy.hospitalName || 'Unknown Hospital'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{dept}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">{empType || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(vacancy.status)}`}>
                        {vacancy.status || 'draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {vacancy.createdAt ? new Date(vacancy.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {vacancy.status === 'draft' && (
                          <>
                            <button
                              onClick={() => handleApprove(vacancy)}
                              disabled={isLoading}
                              className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                              <FiCheckCircle className="h-3 w-3" />
                              {isLoading ? '...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleReject(vacancy)}
                              disabled={isLoading}
                              className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                              <FiXCircle className="h-3 w-3" />
                              Reject
                            </button>
                          </>
                        )}
                        {vacancy.status === 'active' && (
                          <button
                            onClick={() => handleReject(vacancy)}
                            disabled={isLoading}
                            className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-xs rounded-lg hover:bg-red-200 disabled:opacity-50"
                          >
                            <FiXCircle className="h-3 w-3" />
                            Close
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/admin/hospitals/${vacancy.hospitalId}`)}
                          className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200"
                        >
                          <FiEye className="h-3 w-3" />
                          Hospital
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default HospitalVacancies;
