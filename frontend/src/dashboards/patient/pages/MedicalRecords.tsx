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

// ─── Record Modal ─────────────────────────────────────────────────────────────
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
        body{font-family:Arial,sans-serif;padding:32px;color:#111}
        h1{color:#2563eb;font-size:18px;margin-bottom:2px}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0}
        .lbl{color:#6b7280;font-size:10px;text-transform:uppercase;letter-spacing:.05em}
        .val{font-weight:600;font-size:13px;margin-top:2px}
        table{width:100%;border-collapse:collapse;margin-top:8px}
        th{background:#f9fafb;padding:7px 10px;text-align:left;font-size:11px;color:#6b7280}
        td{padding:7px 10px;border-bottom:1px solid #f3f4f6;font-size:12px}
        .notes{background:#eff6ff;border-left:3px solid #2563eb;padding:10px;border-radius:4px;font-size:12px}
        .footer{margin-top:32px;text-align:center;color:#9ca3af;font-size:10px;border-top:1px solid #f3f4f6;padding-top:12px}
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

  const hasPrescription = record.prescription?.length > 0;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h3 className="text-base font-bold text-gray-900">Medical Record</h3>
            <p className="text-xs text-gray-500 mt-0.5">{record.date ? format(new Date(record.date), 'MMMM d, yyyy') : '—'}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
            <button onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-4 sm:px-6 py-5">
          <div ref={printRef}>
            <h1 style={{ color: '#2563eb', fontSize: '18px', marginBottom: '2px' }}>Health Market Arena</h1>
            <p style={{ color: '#6b7280', fontSize: '11px' }}>Medical Record</p>

            <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '14px', paddingTop: '14px' }}>
              {/* 2-col grid on print, stacked on mobile */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'Date', value: record.date ? format(new Date(record.date), 'MMM d, yyyy') : '—' },
                  { label: 'Provider', value: record.provider },
                  { label: 'Diagnosis', value: record.diagnosis || 'General Consultation' },
                  { label: 'Mode', value: MODE_LABELS[record.appointmentMode] || record.appointmentMode || '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
                    <p className="font-semibold text-gray-900 text-sm mt-0.5 leading-snug">{value}</p>
                  </div>
                ))}
              </div>

              {record.notes && (
                <div className="mb-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">Clinical Notes</p>
                  <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-3">
                    <p className="text-sm text-gray-700 leading-relaxed">{record.notes}</p>
                  </div>
                </div>
              )}

              {hasPrescription && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                    Prescriptions ({record.prescription.length})
                  </p>
                  {/* Mobile: stacked cards; Print: table */}
                  <div className="space-y-2 sm:hidden">
                    {record.prescription.map((p: any, i: number) => (
                      <div key={i} className="bg-purple-50 border border-purple-100 rounded-xl p-3">
                        <p className="font-semibold text-gray-900 text-sm">{p.medicationName || p.medication || '—'}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                          {p.dosage && <span className="text-xs text-gray-500">Dose: {p.dosage}</span>}
                          {p.frequency && <span className="text-xs text-gray-500">Freq: {p.frequency}</span>}
                          {p.duration && <span className="text-xs text-gray-500">Duration: {p.duration}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="hidden sm:block overflow-x-auto">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f9fafb' }}>
                          {['Medication', 'Dosage', 'Frequency', 'Duration'].map(h => (
                            <th key={h} style={{ padding: '7px 10px', textAlign: 'left', fontSize: '11px', color: '#6b7280' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {record.prescription.map((p: any, i: number) => (
                          <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '7px 10px', fontSize: '12px', fontWeight: 600 }}>{p.medicationName || p.medication || '—'}</td>
                            <td style={{ padding: '7px 10px', fontSize: '12px' }}>{p.dosage || '—'}</td>
                            <td style={{ padding: '7px 10px', fontSize: '12px' }}>{p.frequency || '—'}</td>
                            <td style={{ padding: '7px 10px', fontSize: '12px' }}>{p.duration || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div style={{ marginTop: '28px', textAlign: 'center', color: '#9ca3af', fontSize: '10px', borderTop: '1px solid #f3f4f6', paddingTop: '12px' }}>
                Health Market Arena · healthmarketarena.com
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose}
            className="w-full py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Record Card ──────────────────────────────────────────────────────────────
const RecordCard: React.FC<{ record: any; onView: () => void }> = ({ record, onView }) => {
  const hasPrescription = record.prescription?.length > 0;
  const hasNotes = !!record.notes;
  const id = record.id || record._id;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden active:scale-[0.99] transition-all hover:shadow-md hover:border-blue-200">
      {/* Top accent */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

      <div className="p-4 sm:p-5">
        {/* Top row: diagnosis + date */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-snug truncate">
              {record.diagnosis || 'General Consultation'}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-2.5 h-2.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-xs text-blue-600 font-medium truncate">{record.provider}</p>
            </div>
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="text-xs font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg whitespace-nowrap">
              {record.date ? format(new Date(record.date), 'MMM d, yyyy') : '—'}
            </p>
          </div>
        </div>

        {/* Chips row */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {record.appointmentMode && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
              {MODE_LABELS[record.appointmentMode] || record.appointmentMode}
            </span>
          )}
          {hasPrescription && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
              💊 {record.prescription.length} Rx
            </span>
          )}
          {hasNotes && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              📝 Notes
            </span>
          )}
        </div>

        {/* Notes preview */}
        {hasNotes && (
          <div className="bg-blue-50 border-l-3 border-blue-400 rounded-lg px-3 py-2 mb-3">
            <p className="text-xs text-gray-600 italic line-clamp-2">"{record.notes}"</p>
          </div>
        )}

        {/* Action */}
        <button
          onClick={onView}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View Full Record
        </button>
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
      <div className="space-y-4 sm:space-y-6">

        {/* ── Header ── */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 sm:p-8 text-white shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-9 h-9 sm:w-11 sm:h-11 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold leading-tight">Medical Records</h1>
              </div>
              <p className="text-blue-100 text-xs sm:text-sm">Your complete health history</p>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs sm:text-sm font-medium">{records.length} Records</span>
                </div>
                {records.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs sm:text-sm">
                      Last: {format(new Date(records[0]?.date || new Date()), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => navigate('/patient/appointments')}
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-white text-blue-600 text-xs sm:text-sm font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="hidden sm:inline">Appointments</span>
              <span className="sm:hidden">Appts</span>
            </button>
          </div>
        </div>

        {/* ── Search ── */}
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search diagnosis, provider, notes..."
            className="w-full pl-10 pr-9 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-52 bg-white rounded-2xl border border-gray-200">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent" />
            <p className="text-sm text-gray-500 mt-3">Loading records...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-10 sm:p-16 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📋</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
              {records.length === 0 ? 'No records yet' : 'No results'}
            </h3>
            <p className="text-sm text-gray-500 mb-5 max-w-xs mx-auto">
              {records.length === 0
                ? 'Records appear after completed appointments'
                : 'Try different search terms'}
            </p>
            {records.length === 0 ? (
              <button onClick={() => navigate('/patient/browse-services')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors">
                Book Consultation
              </button>
            ) : (
              <button onClick={() => setSearch('')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-600 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition-colors">
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {filtered.map((record: any) => (
              <RecordCard
                key={record.id || record._id}
                record={record}
                onView={() => setSelectedRecord(record)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedRecord && (
        <RecordModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
      )}
    </DashboardLayout>
  );
};

export default MedicalRecords;
