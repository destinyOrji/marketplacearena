// Client Records Page — Gym & Physiotherapy Dashboard
// Mobile-first: compact cards, bottom-sheet modal on mobile

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import apiClient from '../services/api';

const MODE_LABELS: Record<string, string> = {
  in_person: '🏋️ In-Person',
  'in-person': '🏋️ In-Person',
  video_call: '📹 Video',
  video: '📹 Video',
  phone_call: '📞 Phone',
  home_visit: '🏠 Home Visit',
  online: '💻 Online',
};

const PAYMENT_BADGE: Record<string, string> = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  failed: 'bg-red-100 text-red-700',
};

// ─── Record Modal (bottom-sheet on mobile, centered on desktop) ───────────────
const RecordModal: React.FC<{
  record: any;
  onClose: () => void;
  onSave: (id: string, notes: string, exercises: any[]) => Promise<void>;
}> = ({ record, onClose, onSave }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [notes, setNotes] = useState(record.notes || '');
  const [exercises, setExercises] = useState<any[]>(
    record.exercises?.length
      ? record.exercises
      : [{ name: '', sets: '', reps: '', duration: '' }]
  );
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'view' | 'edit'>(record._openTab === 'edit' ? 'edit' : 'view');

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
      <html><head><title>Client Record — ${record.client.name}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:32px;color:#111}
        h1{color:#16a34a;font-size:18px;margin-bottom:2px}
        table{width:100%;border-collapse:collapse;margin-top:8px}
        th{background:#f9fafb;padding:7px 10px;text-align:left;font-size:11px;color:#6b7280}
        td{padding:7px 10px;border-bottom:1px solid #f3f4f6;font-size:12px}
        .notes{background:#f0fdf4;border-left:3px solid #16a34a;padding:10px;border-radius:4px;font-size:12px}
        .footer{margin-top:28px;text-align:center;color:#9ca3af;font-size:10px;border-top:1px solid #f3f4f6;padding-top:12px}
      </style></head><body>${content}</body></html>
    `);
    win.document.close();
    win.print();
  };

  const addRow = () => setExercises(e => [...e, { name: '', sets: '', reps: '', duration: '' }]);
  const removeRow = (i: number) => setExercises(e => e.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: string, value: string) =>
    setExercises(e => e.map((row, idx) => idx === i ? { ...row, [field]: value } : row));

  const handleSave = async () => {
    setSaving(true);
    try {
      const clean = exercises.filter(e => e.name?.trim());
      await onSave(record.id, notes, clean);
      toast.success('Session notes saved');
      setTab('view');
    } catch { toast.error('Failed to save notes'); }
    finally { setSaving(false); }
  };

  const initials = record.client.initials || record.client.name.charAt(0).toUpperCase();
  const cleanExercises = exercises.filter((e: any) => e.name?.trim());

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full sm:max-w-xl sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[92vh]">

        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">{initials}</span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-tight">{record.client.name}</p>
              <p className="text-xs text-gray-500">{record.date ? format(new Date(record.date), 'MMM d, yyyy') : '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={handlePrint}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
            <button onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-4 sm:px-6 flex-shrink-0">
          {(['view', 'edit'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
                tab === t ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {t === 'view' ? '📋 View' : '✏️ Edit Notes'}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-4 sm:px-6 py-4">
          {tab === 'view' ? (
            <div ref={printRef}>
              <h1 style={{ color: '#16a34a', fontSize: '17px', marginBottom: '2px' }}>Health Market Arena</h1>
              <p style={{ color: '#6b7280', fontSize: '11px' }}>Client Record — Gym &amp; Physiotherapy</p>

              <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '12px', paddingTop: '12px' }}>
                <div className="grid grid-cols-2 gap-2.5 mb-4">
                  {[
                    { label: 'Client', value: record.client.name },
                    { label: 'Date', value: record.date ? format(new Date(record.date), 'MMM d, yyyy') : '—' },
                    { label: 'Service', value: record.service },
                    { label: 'Mode', value: MODE_LABELS[record.appointmentMode] || record.appointmentMode || '—' },
                    { label: 'Session Type', value: record.sessionType || record.diagnosis || '—' },
                    { label: 'Fee', value: record.fee > 0 ? `₦${record.fee.toLocaleString()}` : 'Free' },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-xl p-2.5">
                      <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
                      <p className="font-semibold text-gray-900 text-xs sm:text-sm mt-0.5 leading-snug">{value}</p>
                    </div>
                  ))}
                </div>

                {record.client.email && (
                  <div className="mb-3 text-xs text-gray-500">
                    <span className="font-medium text-gray-700">Contact:</span> {record.client.email}
                    {record.client.phone ? ` · ${record.client.phone}` : ''}
                  </div>
                )}

                {notes && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">Session Notes</p>
                    <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-3">
                      <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{notes}</p>
                    </div>
                  </div>
                )}

                {cleanExercises.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                      Exercise Plan ({cleanExercises.length})
                    </p>
                    {/* Mobile: stacked cards */}
                    <div className="space-y-2 sm:hidden">
                      {cleanExercises.map((e: any, i: number) => (
                        <div key={i} className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                          <p className="font-semibold text-gray-900 text-sm">{e.name}</p>
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                            {e.sets && <span className="text-xs text-gray-500">Sets: {e.sets}</span>}
                            {e.reps && <span className="text-xs text-gray-500">Reps: {e.reps}</span>}
                            {e.duration && <span className="text-xs text-gray-500">Duration: {e.duration}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Desktop: table */}
                    <div className="hidden sm:block overflow-x-auto">
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: '#f9fafb' }}>
                            {['Exercise', 'Sets', 'Reps', 'Duration'].map(h => (
                              <th key={h} style={{ padding: '7px 10px', textAlign: 'left', fontSize: '11px', color: '#6b7280' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {cleanExercises.map((e: any, i: number) => (
                            <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                              <td style={{ padding: '7px 10px', fontSize: '12px', fontWeight: 600 }}>{e.name}</td>
                              <td style={{ padding: '7px 10px', fontSize: '12px' }}>{e.sets || '—'}</td>
                              <td style={{ padding: '7px 10px', fontSize: '12px' }}>{e.reps || '—'}</td>
                              <td style={{ padding: '7px 10px', fontSize: '12px' }}>{e.duration || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div style={{ marginTop: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '10px', borderTop: '1px solid #f3f4f6', paddingTop: '12px' }}>
                  Health Market Arena · healthmarketarena.com
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Session Notes</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Enter session notes, progress observations, client feedback..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-800">Exercise Plan</label>
                  <button onClick={addRow}
                    className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add
                  </button>
                </div>
                <div className="space-y-2">
                  {exercises.map((row, i) => (
                    <div key={i} className="space-y-1.5 bg-gray-50 rounded-xl p-3 relative">
                      <input
                        value={row.name}
                        onChange={e => updateRow(i, 'name', e.target.value)}
                        placeholder="Exercise name"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-green-500 bg-white"
                      />
                      <div className="grid grid-cols-3 gap-1.5">
                        <input value={row.sets} onChange={e => updateRow(i, 'sets', e.target.value)}
                          placeholder="Sets" className="px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-green-500 bg-white" />
                        <input value={row.reps} onChange={e => updateRow(i, 'reps', e.target.value)}
                          placeholder="Reps" className="px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-green-500 bg-white" />
                        <input value={row.duration} onChange={e => updateRow(i, 'duration', e.target.value)}
                          placeholder="Duration" className="px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-green-500 bg-white" />
                      </div>
                      {exercises.length > 1 && (
                        <button onClick={() => removeRow(i)}
                          className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-gray-100 flex gap-2 flex-shrink-0">
          {tab === 'edit' ? (
            <>
              <button onClick={() => setTab('view')} disabled={saving}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors">
                {saving
                  ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                }
                Save Notes
              </button>
            </>
          ) : (
            <button onClick={onClose}
              className="flex-1 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Record Card ──────────────────────────────────────────────────────────────
const RecordCard: React.FC<{
  record: any;
  onView: () => void;
  onEdit: () => void;
}> = ({ record, onView, onEdit }) => {
  const hasExercises = record.exercises?.filter((e: any) => e.name?.trim()).length > 0;
  const hasNotes = !!record.notes?.trim();
  const exCount = hasExercises ? record.exercises.filter((e: any) => e.name?.trim()).length : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-green-200 transition-all active:scale-[0.99]">
      <div className="h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500" />

      <div className="p-4">
        {/* Top: avatar + name + date */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white font-bold text-sm">{record.client.initials || record.client.name?.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-bold text-gray-900 text-sm leading-tight truncate">{record.client.name}</p>
                {record.client.email && (
                  <p className="text-xs text-gray-400 truncate mt-0.5">{record.client.email}</p>
                )}
              </div>
              <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-lg whitespace-nowrap flex-shrink-0">
                {record.date ? format(new Date(record.date), 'MMM d, yy') : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Service + session type */}
        <p className="text-xs font-semibold text-green-600 mb-1 truncate">{record.service}</p>
        {record.sessionType && record.sessionType !== record.service && (
          <p className="text-xs text-gray-500 mb-2 truncate">{record.sessionType}</p>
        )}

        {/* Chips */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {record.appointmentMode && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {MODE_LABELS[record.appointmentMode] || record.appointmentMode}
            </span>
          )}
          {record.fee > 0 && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
              ₦{record.fee.toLocaleString()}
            </span>
          )}
          {record.paymentStatus && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${PAYMENT_BADGE[record.paymentStatus] || PAYMENT_BADGE.pending}`}>
              {record.paymentStatus}
            </span>
          )}
          {hasExercises && (
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
              🏋️ {exCount} exercises
            </span>
          )}
          {hasNotes && (
            <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
              📝 Notes
            </span>
          )}
        </div>

        {/* Notes preview */}
        {hasNotes && (
          <div className="bg-green-50 border-l-4 border-green-400 rounded-lg px-3 py-2 mb-3">
            <p className="text-xs text-gray-600 italic line-clamp-2">"{record.notes}"</p>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onView}
            className="flex items-center justify-center gap-1.5 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View
          </button>
          <button
            onClick={onEdit}
            className="flex items-center justify-center gap-1.5 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {hasNotes ? 'Edit' : 'Add Notes'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const ClientRecords: React.FC = () => {
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
      const res = await apiClient.get('/gym-physio/client-records', { params });
      const payload = res.data?.data ?? res.data ?? [];
      setRecords(Array.isArray(payload) ? payload : []);
      setTotal(res.data?.pagination?.total ?? (Array.isArray(payload) ? payload.length : 0));
    } catch {
      toast.error('Failed to load client records');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  useEffect(() => {
    const t = setTimeout(() => fetchRecords(search), 400);
    return () => clearTimeout(t);
  }, [search, fetchRecords]);

  const handleSaveNotes = async (id: string, notes: string, exercises: any[]) => {
    await apiClient.put(`/gym-physio/client-records/${id}/notes`, { notes, exercises });
    setRecords(prev => prev.map(r => r.id === id ? { ...r, notes, exercises } : r));
    if (selectedRecord?.id === id) {
      setSelectedRecord((prev: any) => prev ? { ...prev, notes, exercises } : prev);
    }
  };

  const uniqueClients = new Set(records.map(r => r.client?.id)).size;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">

      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-5 sm:p-7 text-white shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold">Client Records</h1>
            </div>
            <p className="text-green-100 text-xs sm:text-sm">Completed sessions with notes &amp; exercise plans</p>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-pulse" />
                <span className="text-xs sm:text-sm font-medium">{total} Sessions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs sm:text-sm font-medium">{uniqueClients} Clients</span>
              </div>
            </div>
          </div>
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
          placeholder="Search client, service, session type..."
          className="w-full pl-10 pr-9 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
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
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-600 border-t-transparent" />
          <p className="text-sm text-gray-500 mt-3">Loading records...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-10 sm:p-14 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🏋️</span>
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-2">
            {search ? 'No results' : 'No client records yet'}
          </h3>
          <p className="text-sm text-gray-500 mb-5 max-w-xs mx-auto">
            {search
              ? 'Try different search terms'
              : 'Records appear after you complete sessions'}
          </p>
          {search && (
            <button onClick={() => setSearch('')}
              className="px-5 py-2.5 bg-gray-600 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition-colors">
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {records.map(record => (
            <RecordCard
              key={record.id}
              record={record}
              onView={() => setSelectedRecord(record)}
              onEdit={() => setSelectedRecord({ ...record, _openTab: 'edit' })}
            />
          ))}
        </div>
      )}

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

export default ClientRecords;
