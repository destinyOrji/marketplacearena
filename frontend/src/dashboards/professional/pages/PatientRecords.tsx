// Patient Records Page — Professional Dashboard
// Shows all completed appointments as patient records with notes/prescription management

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import apiClient from '../services/apiClient';

const MODE_LABELS: Record<string, string> = {
  video_call: '📹 Video Call',
  video: '📹 Video Call',
  phone_call: '📞 Phone Call',
  chat: '💬 Chat',
  in_person: '🏥 In-Person',
  'in-person': '🏥 In-Person',
  home_visit: '🏠 Home Visit',
};

const PAYMENT_BADGE: Record<string, string> = {
  paid: 'bg-green-100 text-green-700 border-green-200',
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  failed: 'bg-red-100 text-red-700 border-red-200',
};

// ─── Print Modal ──────────────────────────────────────────────────────────────
const RecordModal: React.FC<{
  record: any;
  onClose: () => void;
  onSave: (id: string, notes: string, prescription: any[]) => Promise<void>;
}> = ({ record, onClose, onSave }) => {
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  const [notes, setNotes] = useState(record.notes || '');
  const [prescription, setPrescription] = useState<any[]>(
    record.prescription?.length ? record.prescription : [{ medicationName: '', dosage: '', frequency: '', duration: '' }]
  );
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'view' | 'edit'>('view');

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>Patient Record — ${record.patient.name}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #111; }
        h1 { color: #2563eb; font-size: 20px; margin-bottom: 4px; }
        .label { color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 16px; }
        .value { font-weight: 600; margin-top: 4px; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th { background: #f9fafb; padding: 8px 12px; text-align: left; font-size: 12px; color: #6b7280; }
        td { padding: 8px 12px; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
        .footer { margin-top: 40px; text-align: center; color: #9ca3af; font-size: 11px; border-top: 1px solid #f3f4f6; padding-top: 16px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px; }
        .notes-box { background: #f9fafb; border-left: 4px solid #2563eb; padding: 12px; border-radius: 4px; margin-top: 8px; font-size: 13px; }
      </style></head><body>${content}</body></html>
    `);
    win.document.close();
    win.print();
  };

  const addPrescriptionRow = () =>
    setPrescription(prev => [...prev, { medicationName: '', dosage: '', frequency: '', duration: '' }]);

  const removePrescriptionRow = (i: number) =>
    setPrescription(prev => prev.filter((_, idx) => idx !== i));

  const updatePrescriptionRow = (i: number, field: string, value: string) =>
    setPrescription(prev => prev.map((row, idx) => idx === i ? { ...row, [field]: value } : row));

  const handleSave = async () => {
    setSaving(true);
    try {
      const cleanPrescription = prescription.filter(p => p.medicationName?.trim());
      await onSave(record.id, notes, cleanPrescription);
      toast.success('Notes saved successfully');
      setTab('view');
    } catch {
      toast.error('Failed to save notes');
    } finally {
      setSaving(false);
    }
  };

  const initials = record.patient.initials || record.patient.name.charAt(0).toUpperCase();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">{initials}</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">{record.patient.name}</h3>
              <p className="text-xs text-gray-500">{record.date ? format(new Date(record.date), 'MMMM d, yyyy') : '—'}</p>
            </div>
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
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          {(['view', 'edit'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${
                tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {t === 'view' ? '📋 View Record' : '✏️ Edit Notes'}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {tab === 'view' ? (
            <div ref={printRef}>
              <h1 style={{ color: '#2563eb', fontSize: '20px', marginBottom: '4px' }}>Health Market Arena</h1>
              <p style={{ color: '#6b7280', fontSize: '12px' }}>Patient Record — Professional Copy</p>

              <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '16px', paddingTop: '16px' }}>
                <div className="grid grid-cols-2 gap-4 text-sm mb-5">
                  {[
                    { label: 'Patient', value: record.patient.name },
                    { label: 'Date', value: record.date ? format(new Date(record.date), 'MMMM d, yyyy') : '—' },
                    { label: 'Service / Reason', value: record.service },
                    { label: 'Consultation Mode', value: MODE_LABELS[record.appointmentMode] || record.appointmentMode || '—' },
                    { label: 'Diagnosis / Reason', value: record.diagnosis },
                    { label: 'Fee', value: record.fee > 0 ? `₦${record.fee.toLocaleString()}` : 'Free' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
                      <p className="font-semibold text-gray-900 mt-0.5 text-sm">{value}</p>
                    </div>
                  ))}
                </div>

                {record.patient.email && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Patient Contact</p>
                    <p className="text-sm text-gray-700 mt-0.5">{record.patient.email}{record.patient.phone ? ` · ${record.patient.phone}` : ''}</p>
                  </div>
                )}

                {notes && (
                  <div className="mb-5">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">Clinical Notes</p>
                    <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{notes}</p>
                    </div>
                  </div>
                )}

                {prescription.filter(p => p.medicationName?.trim()).length > 0 && (
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
                        {prescription.filter(p => p.medicationName?.trim()).map((p: any, i: number) => (
                          <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '8px 12px', fontSize: '13px', fontWeight: 600 }}>{p.medicationName}</td>
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
          ) : (
            <div className="space-y-5">
              {/* Clinical Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                  Clinical Notes
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={5}
                  placeholder="Enter clinical notes, observations, diagnosis details..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              {/* Prescriptions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-800">Prescriptions</label>
                  <button onClick={addPrescriptionRow}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Row
                  </button>
                </div>
                <div className="space-y-2">
                  {prescription.map((row, i) => (
                    <div key={i} className="grid grid-cols-4 gap-2 items-center">
                      <input value={row.medicationName} onChange={e => updatePrescriptionRow(i, 'medicationName', e.target.value)}
                        placeholder="Medication" className="col-span-1 px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500" />
                      <input value={row.dosage} onChange={e => updatePrescriptionRow(i, 'dosage', e.target.value)}
                        placeholder="Dosage" className="px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500" />
                      <input value={row.frequency} onChange={e => updatePrescriptionRow(i, 'frequency', e.target.value)}
                        placeholder="Frequency" className="px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500" />
                      <div className="flex gap-1">
                        <input value={row.duration} onChange={e => updatePrescriptionRow(i, 'duration', e.target.value)}
                          placeholder="Duration" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500" />
                        {prescription.length > 1 && (
                          <button onClick={() => removePrescriptionRow(i)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1.5">Leave medication name empty to exclude a row.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {tab === 'edit' && (
          <div className="px-6 py-4 border-t border-gray-200 flex gap-3 bg-gray-50 rounded-b-2xl">
            <button onClick={() => setTab('view')} disabled={saving}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {saving ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              Save Notes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const PatientRecords: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [total, setTotal] = useState(0);

  const fetchRecords = useCallback(async (q = '') => {
    try {
      setLoading(true);
      const params: any = { limit: 50 };
      if (q) params.search = q;
      const res = await apiClient.get('/professionals/patient-records', { params });
      const payload = res.data?.data ?? res.data ?? [];
      setRecords(Array.isArray(payload) ? payload : []);
      setTotal(res.data?.pagination?.total ?? payload.length);
    } catch {
      toast.error('Failed to load patient records');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => fetchRecords(search), 400);
    return () => clearTimeout(t);
  }, [search, fetchRecords]);

  const handleSaveNotes = async (id: string, notes: string, prescription: any[]) => {
    await apiClient.put(`/professionals/patient-records/${id}/notes`, { notes, prescription });
    // Update local state
    setRecords(prev => prev.map(r => r.id === id ? { ...r, notes, prescription } : r));
    if (selectedRecord?.id === id) {
      setSelectedRecord((prev: any) => prev ? { ...prev, notes, prescription } : prev);
    }
  };

  const uniquePatients = new Set(records.map(r => r.patient?.id)).size;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">Patient Records</h1>
            </div>
            <p className="text-blue-100 text-sm">Completed consultations with clinical notes and prescriptions</p>
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium">{total} Total Records</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm font-medium">{uniquePatients} Unique Patients</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by patient name, diagnosis, service, or notes..."
          className="w-full pl-12 pr-10 py-4 bg-white border-2 border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-gray-300 transition-colors"
        />
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
          <p className="text-sm text-gray-500 mt-4">Loading patient records...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-dashed border-gray-300 p-16 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-5xl">📋</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {search ? 'No records match your search' : 'No patient records yet'}
          </h3>
          <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
            {search
              ? 'Try adjusting your search terms or clear the search to see all records.'
              : 'Patient records will appear here after you complete appointments. Mark appointments as completed to generate records.'}
          </p>
          {search && (
            <button onClick={() => setSearch('')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition-colors">
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {records.map(record => {
            const hasPrescription = record.prescription?.filter((p: any) => p.medicationName?.trim()).length > 0;
            const hasNotes = !!record.notes?.trim();

            return (
              <div key={record.id}
                className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-blue-300 hover:shadow-xl transition-all transform hover:-translate-y-0.5">
                {/* Accent bar */}
                <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

                <div className="p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    {/* Patient avatar */}
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
                      <span className="text-white font-bold text-lg">{record.patient.initials}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900 text-base sm:text-lg">{record.patient.name}</h3>
                          {record.patient.email && (
                            <p className="text-xs text-gray-500 mt-0.5">{record.patient.email}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 flex-shrink-0">
                          <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-xs font-semibold text-gray-700">
                            {record.date ? format(new Date(record.date), 'MMM d, yyyy') : '—'}
                          </span>
                        </div>
                      </div>

                      {/* Service & diagnosis */}
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span className="text-sm font-semibold text-blue-600">{record.service}</span>
                        {record.diagnosis !== record.service && (
                          <>
                            <span className="text-gray-300">·</span>
                            <span className="text-sm text-gray-600 truncate">{record.diagnosis}</span>
                          </>
                        )}
                      </div>

                      {/* Chips */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {record.appointmentMode && (
                          <span className="inline-flex items-center gap-1 text-xs bg-gray-50 border border-gray-200 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                            {MODE_LABELS[record.appointmentMode] || record.appointmentMode}
                          </span>
                        )}
                        {record.fee > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs bg-green-50 border border-green-200 text-green-700 px-2.5 py-1 rounded-full font-semibold">
                            💰 ₦{record.fee.toLocaleString()}
                          </span>
                        )}
                        {record.paymentStatus && (
                          <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium border capitalize ${PAYMENT_BADGE[record.paymentStatus] || PAYMENT_BADGE.pending}`}>
                            {record.paymentStatus}
                          </span>
                        )}
                        {hasPrescription && (
                          <span className="inline-flex items-center gap-1 text-xs bg-purple-50 border border-purple-200 text-purple-700 px-2.5 py-1 rounded-full font-semibold">
                            💊 {record.prescription.filter((p: any) => p.medicationName?.trim()).length} Rx
                          </span>
                        )}
                        {hasNotes && (
                          <span className="inline-flex items-center gap-1 text-xs bg-blue-50 border border-blue-200 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                            📝 Notes
                          </span>
                        )}
                      </div>

                      {/* Notes preview */}
                      {hasNotes && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-3 mb-4">
                          <p className="text-xs text-gray-600 italic line-clamp-2">"{record.notes}"</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={() => setSelectedRecord(record)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm hover:shadow-md">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Record
                        </button>
                        <button onClick={() => setSelectedRecord({ ...record, _openTab: 'edit' })}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 text-xs font-semibold rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          {hasNotes ? 'Edit Notes' : 'Add Notes'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Record Modal */}
      {selectedRecord && (
        <RecordModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onSave={handleSaveNotes}
        />
      )}
    </div>
  );
};

export default PatientRecords;
