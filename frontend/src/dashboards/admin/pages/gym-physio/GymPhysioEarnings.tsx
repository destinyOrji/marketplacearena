import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiDollarSign, FiTrendingUp, FiCheckCircle, FiClock } from 'react-icons/fi';
import { authService } from '../../services/authService';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://healthmarketarena.com/api';

const GymPhysioEarnings: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [earnings, setEarnings] = useState<any>({ totalEarnings: 0, platformFees: 0, netEarnings: 0, completedAppointments: 0, appointments: [] });
  const [loading, setLoading] = useState(true);
  const [providerName, setProviderName] = useState('');

  const h = () => ({ headers: { Authorization: `Bearer ${authService.getAccessToken()}` } });

  useEffect(() => { if (id) fetchData(); }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [provRes, earnRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/admin/gym-physio/${id}`, h()),
        axios.get(`${API_BASE_URL}/admin/gym-physio/${id}/earnings`, h()),
      ]);
      const p = provRes.data?.data || {};
      setProviderName(p.businessName || `${p.user?.firstName || ''} ${p.user?.lastName || ''}`.trim() || 'Provider');
      setEarnings(earnRes.data?.data || { totalEarnings: 0, platformFees: 0, netEarnings: 0, completedAppointments: 0, appointments: [] });
    } catch {
      // keep defaults
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Earnings', value: `₦${(earnings.totalEarnings || 0).toLocaleString()}`, icon: FiDollarSign, color: 'bg-blue-100 text-blue-600' },
    { label: 'Platform Fees (10%)', value: `₦${(earnings.platformFees || 0).toLocaleString()}`, icon: FiTrendingUp, color: 'bg-orange-100 text-orange-600' },
    { label: 'Net Earnings', value: `₦${(earnings.netEarnings || 0).toLocaleString()}`, icon: FiCheckCircle, color: 'bg-green-100 text-green-600' },
    { label: 'Completed Sessions', value: earnings.completedAppointments ?? 0, icon: FiClock, color: 'bg-purple-100 text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => navigate(`/admin/gym-physio/${id}`)} className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-1">
          <FiChevronLeft className="h-4 w-4" /> Back to {providerName}
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
        <p className="text-sm text-gray-500 mt-0.5">{providerName}</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Transaction history */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Completed Sessions</h3>
            </div>
            {!earnings.appointments?.length ? (
              <div className="p-12 text-center">
                <FiDollarSign className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No completed sessions yet.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    {['Date', 'Service', 'Amount', 'Payment Status'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {earnings.appointments.map((apt: any, i: number) => (
                    <tr key={apt.id || i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {apt.date ? new Date(apt.date).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{apt.service || 'Session'}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        ₦{(apt.amount || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${apt.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {apt.status || 'pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default GymPhysioEarnings;
