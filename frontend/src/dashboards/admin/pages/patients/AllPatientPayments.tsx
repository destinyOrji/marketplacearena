import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import axios from 'axios';

const API = process.env.REACT_APP_API_BASE_URL || 'https://healthmarketarena.com/api';
const h = () => ({ headers: { Authorization: `Bearer ${authService.getAccessToken()}` } });

const AllPatientPayments: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>({ totalRevenue: 0, platformFees: 0, totalTransactions: 0, patients: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/patients/all-payments`, h());
      setData(res.data?.data || { totalRevenue: 0, platformFees: 0, totalTransactions: 0, patients: [] });
    } catch {
      setData({ totalRevenue: 0, platformFees: 0, totalTransactions: 0, patients: [] });
    } finally {
      setLoading(false);
    }
  };

  const patients: any[] = (data.patients || []).filter((p: any) => {
    if (!search) return true;
    return p.name?.toLowerCase().includes(search.toLowerCase()) ||
           p.email?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Patient Payments</h1>
      <p className="text-sm text-gray-500">All payments made by patients for consultations and services</p>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          ['Total Revenue', `₦${(data.totalRevenue || 0).toLocaleString()}`, 'bg-blue-600'],
          ['Platform Revenue (10%)', `₦${(data.platformFees || 0).toLocaleString()}`, 'bg-purple-600'],
          ['Net to Providers', `₦${((data.totalRevenue || 0) - (data.platformFees || 0)).toLocaleString()}`, 'bg-green-600'],
          ['Transactions', (data.totalTransactions || 0).toLocaleString(), 'bg-gray-700'],
        ].map(([label, value, color]) => (
          <div key={label} className={`${color} text-white rounded-xl p-5`}>
            <p className="text-sm opacity-80">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex gap-4 items-center">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search patient name or email..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-500">{patients.length} patients</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">💳</p>
            <p>{search ? 'No patients match your search' : 'No payment data available'}</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Patient', 'Email', 'Appointments', 'Total Paid', 'Platform (10%)', 'Net to Providers'].map(col => (
                  <th key={col} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {patients.map((p: any, i: number) => {
                const fee = Math.round((p.totalPaid || 0) * 0.10);
                return (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/admin/patients/${p.id}`)}
                        className="text-blue-600 hover:underline text-sm font-medium"
                      >
                        {p.name || '—'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{p.email || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{p.appointments || 0}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">₦{(p.totalPaid || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-purple-600">₦{fee.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-medium text-green-600">₦{((p.totalPaid || 0) - fee).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-200">
              <tr>
                <td className="px-6 py-3 text-sm font-bold text-gray-900" colSpan={3}>Totals</td>
                <td className="px-6 py-3 text-sm font-bold text-gray-900">₦{(data.totalRevenue || 0).toLocaleString()}</td>
                <td className="px-6 py-3 text-sm font-bold text-purple-600">₦{(data.platformFees || 0).toLocaleString()}</td>
                <td className="px-6 py-3 text-sm font-bold text-green-600">₦{((data.totalRevenue || 0) - (data.platformFees || 0)).toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
};

export default AllPatientPayments;
