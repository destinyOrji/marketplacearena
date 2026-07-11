import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';
const h = () => ({ headers: { Authorization: `Bearer ${authService.getAccessToken()}` } });

const AllMedicalRecords: React.FC = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const pRes = await axios.get(`${API}/admin/patients?page_size=200`, h());
      const patients = pRes.data?.data || [];
      const all: any[] = [];
      await Promise.allSettled(patients.slice(0, 30).map(async (p: any) => {
        const rRes = await axios.get(`${API}/admin/patients/${p.id}/records`, h());
        (rRes.data?.data || []).forEach((r: any) => all.push({ ...r, patientName: `${p.firstName || ''} ${p.lastName || ''}`.trim(), patientId: p.id }));
      }));
      setRecords(all);
    } catch { setRecords([]); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">All Medical Records</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? <div className="flex justify-center items-center h-48"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
          : records.length === 0 ? <div className="text-center py-16 text-gray-400">No medical records found</div>
          : <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50"><tr>{['Patient','Type','Date','Provider','Description'].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {records.map((r: any, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4"><button onClick={() => navigate(`/admin/patients/${r.patientId}`)} className="text-blue-600 hover:underline text-sm font-medium">{r.patientName || '—'}</button></td>
                  <td className="px-6 py-4 text-sm text-gray-700">{r.record_type || r.condition || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{r.date ? new Date(r.date).toLocaleDateString() : '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{r.provider_name || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{r.description || r.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>}
      </div>
    </div>
  );
};
export default AllMedicalRecords;
