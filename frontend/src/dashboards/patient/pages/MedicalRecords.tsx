import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '../components';
import { medicalRecordsApi } from '../services/api';
import { format } from 'date-fns';
import { showErrorToast } from '../utils/toast';
import { useNavigate } from 'react-router-dom';

const MODE_LABELS: Record<string, string> = {
  video_call: '📹 Video Call', video: '📹 Video Call',
  phone_call: '📞 Phone', chat: '📞 Phone',
  in_person: '🏥 In-Person', 'in-person': '🏥 In-Person',
};

// ─── Print Invoice ────────────────────────────────────────────────────────────
const RecordModal: React.FC<{ record: any; onClose: () => void }> = ({ record, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>Medical Record</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #111; }
        h1 { color: #2563eb; font-size: 20px; }
        .label { color: #6b7280; font-size: 12px; text-transform: uppercase; margin-top: 16px; }
        .value { font-weight: 600; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th { background: #f9fafb; padding: 8px 12px; text-align: left; font-size: 12px; }
        td { padding: 8px 12px; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
        .footer { margin-top: 40px; text-align: center; color: #9ca3af; font-size: 11px; }
      </style></head><body>${content}</body></html>
    `);
    win.document.close();
    win.print();
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-base font-bold text-gray-900">Medical Record</h3>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
            <button onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          <div ref={printRef}>
            <h1 style={{ color: '#2563eb', fontSize: '20px', marginBottom: '4px' }}>Health Market Arena</h1>
            <p style={{ color: '#6b7280', fontSize: '12px' }}>Medical Record</p>

            <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '16px', paddingTop: '16px' }}>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Date</p>
                  <p className="font-semibold text-gray-900 mt-0.5">
                    {record.date ? format(new Date(record.date), 'MMMM d, yyyy') : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Provider</p>
                  <p className="font-semibold text-gray-900 mt-0.5">{record.provider}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Reason / Diagnosis</p>
                  <p className="font-semibold text-gray-900 mt-0.5">{record.diagnosis}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Mode</p>
                  <p className="font-semibold text-gray-900 mt-0.5">{MODE_LABELS[record.appointmentMode] || record.appointmentMode || '—'}</p>
                </div>
              </div>

              {record.notes && (
                <div className="mb-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Notes</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">{record.notes}</p>
                </div>
              )}

              {record.prescription?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Prescriptions</p>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb' }}>
                        {['Medication', 'Dosage', 'Frequency', 'Duration'].map(h => (
                          <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '12px', color: '#6b7280' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {record.prescription.map((p: any, i: number) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '8px 12px', fontSize: '13px', fontWeight: 600 }}>{p.medicationName || p.medication || '—'}</td>
                          <td style={{ padding: '8px 12px', fontSize: '13px' }}>{p.dosage || '—'}</td>
                          <td style={{ padding: '8px 12px', fontSize: '13px' }}>{p.frequency || '—'}</td>
                          <td style={{ padding: '8px 12px', fontSize: '13px' }}>{p.duration || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div style={{ marginTop: '32px', textAlign: 'center', color: '#9ca3af', fontSize: '11px', borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
                Health Market Arena · healthmarketarena.com
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const MedicalRecords: React.FC = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  useEffect(() => { fetchRecords(); }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await medicalRecordsApi.getRecords();
      const data = (res.data?.data as any) ?? res.data ?? [];
      setRecords(Array.isArray(data) ? data : []);
    } catch {
      showErrorToast('Failed to load medical records');
    } finally {
      setLoading(false);
    }
  };

  const filtered = records.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (r.diagnosis || '').toLowerCase().includes(q)
      || (r.provider || '').toLowerCase().includes(q)
      || (r.notes || '').toLowerCase().includes(q);
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-8 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold">Medical Records</h1>
              </div>
              <p className="text-blue-100 text-sm">Your complete health history and consultation records</p>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">{records.length} Total Records</span>
                </div>
                {records.length > 0 && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm">Last updated: {format(new Date(records[0]?.date || new Date()), 'MMM d, yyyy')}</span>
                  </div>
                )}
              </div>
            </div>
            <button onClick={() => navigate('/patient/appointments')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 text-sm font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              View Appointments
            </button>
          </div>
        </div>

        {/* Search with enhanced design */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by diagnosis, provider, or notes..."
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-gray-300 transition-colors" />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 bg-white rounded-2xl border border-gray-200">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
            <p className="text-sm text-gray-500 mt-4">Loading your medical records...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-dashed border-gray-300 p-16 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-5xl">📋</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {records.length === 0 ? 'No medical records yet' : 'No records match your search'}
            </h3>
            <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
              {records.length === 0
                ? 'Your medical records will appear here after you complete appointments with healthcare providers'
                : 'Try adjusting your search terms or clear the search to see all records'}
            </p>
            {records.length === 0 ? (
              <button onClick={() => navigate('/patient/browse-services')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Book Your First Consultation
              </button>
            ) : (
              <button onClick={() => setSearch('')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition-colors">
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((record: any) => {
              const id = record.id || record._id;
              const hasPrescription = record.prescription?.length > 0;
              const hasNotes = !!record.notes;

              return (
                <div key={id}
                  className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-blue-300 hover:shadow-xl transition-all transform hover:-translate-y-1">
                  {/* Gradient accent */}
                  <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

                  <div className="p-6">
                    <div className="flex items-start gap-5">
                      {/* Icon with gradient */}
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg mb-1">{record.diagnosis || 'General Consultation'}</h3>
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <p className="text-sm text-blue-600 font-semibold">{record.provider}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm font-semibold text-gray-700">
                              {record.date ? format(new Date(record.date), 'MMM d, yyyy') : '—'}
                            </span>
                          </div>
                        </div>

                        {/* Enhanced chips */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {record.appointmentMode && (
                            <span className="inline-flex items-center gap-1.5 text-xs bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 text-gray-700 px-3 py-1.5 rounded-full font-medium">
                              {MODE_LABELS[record.appointmentMode] || record.appointmentMode}
                            </span>
                          )}
                          {hasPrescription && (
                            <span className="inline-flex items-center gap-1.5 text-xs bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 text-green-700 px-3 py-1.5 rounded-full font-semibold">
                              💊 {record.prescription.length} Prescription{record.prescription.length !== 1 ? 's' : ''}
                            </span>
                          )}
                          {hasNotes && (
                            <span className="inline-flex items-center gap-1.5 text-xs bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-300 text-blue-700 px-3 py-1.5 rounded-full font-medium">
                              📝 Clinical Notes
                            </span>
                          )}
                        </div>

                        {/* Notes preview with better styling */}
                        {hasNotes && (
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4 mb-4">
                            <p className="text-sm text-gray-700 italic line-clamp-2">"{record.notes}"</p>
                          </div>
                        )}

                        {/* Enhanced action button */}
                        <button onClick={() => setSelectedRecord(record)}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Full Record & Print
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Record Modal */}
      {selectedRecord && (
        <RecordModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
      )}
    </DashboardLayout>
  );
};

export default MedicalRecords;
