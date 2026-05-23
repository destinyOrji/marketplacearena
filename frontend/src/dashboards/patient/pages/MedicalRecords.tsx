import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '../components';
import { medicalRecordsApi } from '../services/api';
import { format, formatDistanceToNow } from 'date-fns';
import { showErrorToast } from '../utils/toast';
import { useNavigate } from 'react-router-dom';

const MODE_META: Record<string, { label: string; icon: string; color: string }> = {
  video_call: { label: 'Video Call',  icon: '📹', color: 'bg-violet-100 text-violet-700' },
  video:      { label: 'Video Call',  icon: '📹', color: 'bg-violet-100 text-violet-700' },
  phone_call: { label: 'Phone',       icon: '📞', color: 'bg-sky-100 text-sky-700' },
  chat:       { label: 'Phone',       icon: '📞', color: 'bg-sky-100 text-sky-700' },
  in_person:  { label: 'In-Person',   icon: '🏥', color: 'bg-emerald-100 text-emerald-700' },
  'in-person':{ label: 'In-Person',   icon: '🏥', color: 'bg-emerald-100 text-emerald-700' },
};

const safeDate = (d: any) => {
  try { return d ? new Date(d) : null; } catch { return null; }
};

// ─── Record Detail Modal ──────────────────────────────────────────────────────
const RecordModal: React.FC<{ record: any; onClose: () => void }> = ({ record, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const date = safeDate(record.date);
  const mode = MODE_META[record.appointmentMode] || null;
  const hasPrescription = record.prescription?.length > 0;

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
    win.document.write(`<html><head><title>Medical Record</title><style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:Arial,sans-serif;padding:36px;color:#111;background:#fff}
      .brand{font-size:20px;font-weight:800;color:#2563eb}
      .sub{font-size:11px;color:#6b7280;margin-top:2px}
      .divider{border-top:1px solid #e5e7eb;margin:16px 0}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px}
      .field label{font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em}
      .field p{font-size:13px;font-weight:600;color:#111;margin-top:3px}
      .notes{background:#eff6ff;border-left:3px solid #2563eb;padding:12px;border-radius:4px;font-size:12px;color:#374151;margin-bottom:16px}
      table{width:100%;border-collapse:collapse}
      th{background:#f9fafb;padding:8px 10px;text-align:left;font-size:11px;color:#6b7280;border-bottom:1px solid #e5e7eb}
      td{padding:8px 10px;font-size:12px;border-bottom:1px solid #f3f4f6}
      .footer{margin-top:36px;text-align:center;font-size:10px;color:#9ca3af;border-top:1px solid #f3f4f6;padding-top:12px}
    </style></head><body>${content}</body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden">

        {/* Drag handle */}
        <div className="flex justify-center pt-3 sm:hidden flex-shrink-0">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">Medical Record</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {date ? format(date, 'MMMM d, yyyy') : '—'}
            </p>
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
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 sm:px-6 pb-6">
          <div ref={printRef}>
            {/* Brand */}
            <div className="brand" style={{ fontSize: '18px', fontWeight: 800, color: '#2563eb' }}>Health Market Arena</div>
            <div className="sub" style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>Official Medical Record</div>

            <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '14px', paddingTop: '14px' }}>
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: 'Date', value: date ? format(date, 'MMM d, yyyy') : '—' },
                  { label: 'Provider', value: record.provider || '—' },
                  { label: 'Diagnosis', value: record.diagnosis || 'General Consultation' },
                  { label: 'Mode', value: mode ? `${mode.icon} ${mode.label}` : record.appointmentMode || '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-2xl p-3">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">{label}</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1 leading-snug">{value}</p>
                  </div>
                ))}
              </div>

              {/* Notes */}
              {record.notes && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Clinical Notes</p>
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                    <p className="text-sm text-gray-700 leading-relaxed">{record.notes}</p>
                  </div>
                </div>
              )}

              {/* Prescriptions */}
              {hasPrescription && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Prescriptions · {record.prescription.length}
                  </p>
                  <div className="space-y-2">
                    {record.prescription.map((p: any, i: number) => (
                      <div key={i} className="flex items-start gap-3 bg-purple-50 border border-purple-100 rounded-2xl p-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-base">💊</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900">{p.medicationName || p.medication || '—'}</p>
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                            {p.dosage && <span className="text-xs text-purple-600 font-medium">{p.dosage}</span>}
                            {p.frequency && <span className="text-xs text-gray-500">{p.frequency}</span>}
                            {p.duration && <span className="text-xs text-gray-400">{p.duration}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
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
        <div className="px-5 sm:px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose}
            className="w-full py-3 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Record Card ──────────────────────────────────────────────────────────────
const RecordCard: React.FC<{ record: any; index: number; onView: () => void }> = ({ record, index, onView }) => {
  const date = safeDate(record.date);
  const mode = MODE_META[record.appointmentMode] || null;
  const hasPrescription = record.prescription?.length > 0;
  const hasNotes = !!record.notes?.trim();

  // Cycle through accent colors
  const accents = [
    { from: 'from-blue-500', to: 'to-indigo-600', ring: 'ring-blue-200', dot: 'bg-blue-500' },
    { from: 'from-violet-500', to: 'to-purple-600', ring: 'ring-violet-200', dot: 'bg-violet-500' },
    { from: 'from-emerald-500', to: 'to-teal-600', ring: 'ring-emerald-200', dot: 'bg-emerald-500' },
    { from: 'from-rose-500', to: 'to-pink-600', ring: 'ring-rose-200', dot: 'bg-rose-500' },
    { from: 'from-amber-500', to: 'to-orange-600', ring: 'ring-amber-200', dot: 'bg-amber-500' },
  ];
  const accent = accents[index % accents.length];

  return (
    <div
      onClick={onView}
      className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Colored top strip */}
      <div className={`h-1.5 bg-gradient-to-r ${accent.from} ${accent.to}`} />

      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${accent.from} ${accent.to} flex items-center justify-center flex-shrink-0 shadow-md ring-4 ${accent.ring}`}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>

          {/* Date badge */}
          <div className="text-right flex-shrink-0">
            <p className="text-xs font-bold text-gray-700">
              {date ? format(date, 'MMM d, yyyy') : '—'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {date ? formatDistanceToNow(date, { addSuffix: true }) : ''}
            </p>
          </div>
        </div>

        {/* Diagnosis */}
        <h3 className="font-bold text-gray-900 text-base leading-snug mb-1 group-hover:text-blue-700 transition-colors">
          {record.diagnosis || 'General Consultation'}
        </h3>

        {/* Provider */}
        <div className="flex items-center gap-1.5 mb-3">
          <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <p className="text-xs text-gray-500 font-medium truncate">{record.provider || 'Healthcare Provider'}</p>
        </div>

        {/* Chips */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {mode && (
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${mode.color}`}>
              {mode.icon} {mode.label}
            </span>
          )}
          {hasPrescription && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">
              💊 {record.prescription.length} Rx
            </span>
          )}
          {hasNotes && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
              📝 Notes
            </span>
          )}
        </div>

        {/* Notes preview */}
        {hasNotes && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl px-3.5 py-2.5 mb-4 border border-blue-100">
            <p className="text-xs text-gray-600 italic line-clamp-2 leading-relaxed">"{record.notes}"</p>
          </div>
        )}

        {/* CTA */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Tap to view full record</span>
          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${accent.from} ${accent.to} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Stats Bar ────────────────────────────────────────────────────────────────
const StatsBar: React.FC<{ records: any[] }> = ({ records }) => {
  const withPrescription = records.filter(r => r.prescription?.length > 0).length;
  const withNotes = records.filter(r => r.notes?.trim()).length;
  const lastDate = records[0]?.date ? safeDate(records[0].date) : null;

  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { label: 'Total Records', value: records.length, icon: '📋', color: 'bg-blue-50 text-blue-600' },
        { label: 'With Prescriptions', value: withPrescription, icon: '💊', color: 'bg-purple-50 text-purple-600' },
        { label: 'With Notes', value: withNotes, icon: '📝', color: 'bg-emerald-50 text-emerald-600' },
      ].map(s => (
        <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-4 text-center">
          <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center text-lg mx-auto mb-2`}>
            {s.icon}
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{s.value}</p>
          <p className="text-xs text-gray-400 mt-0.5 leading-tight">{s.label}</p>
        </div>
      ))}
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
      <div className="space-y-5 sm:space-y-6 max-w-4xl mx-auto">

        {/* ── Hero Header ── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute -bottom-12 -left-6 w-52 h-52 bg-white/5 rounded-full" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold leading-tight">Medical Records</h1>
                  <p className="text-blue-200 text-xs sm:text-sm mt-0.5">Your complete health history</p>
                </div>
              </div>

              {records.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-xs font-semibold">{records.length} Records</span>
                  </div>
                  {records[0]?.date && (
                    <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs font-semibold">
                        Last: {format(new Date(records[0].date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => navigate('/patient/appointments')}
              className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-white text-blue-700 text-xs sm:text-sm font-bold rounded-2xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="hidden sm:inline">Appointments</span>
              <span className="sm:hidden">Appts</span>
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        {!loading && records.length > 0 && <StatsBar records={records} />}

        {/* ── Search ── */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by diagnosis, provider, or notes..."
            className="w-full pl-11 pr-10 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm placeholder-gray-400"
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-indigo-100 border-t-indigo-500 animate-spin" style={{ animationDirection: 'reverse' }} />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500 mt-5">Loading your health records...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 sm:p-16 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-inner">
              <span className="text-4xl">{records.length === 0 ? '🏥' : '🔍'}</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {records.length === 0 ? 'No records yet' : 'No results found'}
            </h3>
            <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto leading-relaxed">
              {records.length === 0
                ? 'Your medical records will appear here after you complete appointments with healthcare providers.'
                : `No records match "${search}". Try a different search term.`}
            </p>
            {records.length === 0 ? (
              <button onClick={() => navigate('/patient/browse-services')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl active:scale-95">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Book a Consultation
              </button>
            ) : (
              <button onClick={() => setSearch('')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 text-sm font-bold rounded-2xl hover:bg-gray-200 transition-colors">
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            {search && (
              <p className="text-sm text-gray-500 px-1">
                {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "<span className="font-semibold text-gray-700">{search}</span>"
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((record: any, i: number) => (
                <RecordCard
                  key={record.id || record._id}
                  record={record}
                  index={i}
                  onView={() => setSelectedRecord(record)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {selectedRecord && (
        <RecordModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
      )}
    </DashboardLayout>
  );
};

export default MedicalRecords;
