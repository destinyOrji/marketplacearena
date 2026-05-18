import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '../components';
import StarRating from '../components/StarRating';
import { feedbackApi, appointmentsApi } from '../services/api';
import { format } from 'date-fns';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import { useNavigate } from 'react-router-dom';

// ─── Types ────────────────────────────────────────────────────────────────────
interface CompletedApt {
  id: string;
  providerName: string;
  providerSpecialty: string;
  providerInitials: string;
  date: string;
  time: string;
  service: string;
}

interface FeedbackItem {
  id: string;
  provider: string;
  date: string;
  rating: number;
  review: string;
  editable: boolean;
}

interface FormData {
  rating: number;
  review: string;
  categories: string[];
}

const CATEGORIES = [
  { id: 'professionalism', label: 'Professionalism' },
  { id: 'communication', label: 'Communication' },
  { id: 'punctuality', label: 'Punctuality' },
  { id: 'cleanliness', label: 'Cleanliness' },
  { id: 'effectiveness', label: 'Effectiveness' },
];

const BLANK_FORM: FormData = { rating: 0, review: '', categories: [] };

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar: React.FC<{ initials: string; size?: string }> = ({ initials, size = 'w-12 h-12' }) => (
  <div className={`${size} rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm`}>
    <span className="text-white font-bold text-sm">{initials}</span>
  </div>
);

// ─── Star display (read-only inline) ─────────────────────────────────────────
const Stars: React.FC<{ value: number }> = ({ value }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(s => (
      <svg key={s} className={`w-4 h-4 ${s <= value ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

// ─── Feedback Form (shared for new + edit) ────────────────────────────────────
const FeedbackForm: React.FC<{
  title: string;
  subtitle: string;
  initials: string;
  form: FormData;
  onChange: (f: FormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitting: boolean;
  submitLabel: string;
}> = ({ title, subtitle, initials, form, onChange, onSubmit, onCancel, submitting, submitLabel }) => (
  <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
    onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
    <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[92vh]">
      {/* Drag handle */}
      <div className="flex justify-center pt-3 pb-1 sm:hidden">
        <div className="w-10 h-1 bg-gray-300 rounded-full" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Avatar initials={initials} size="w-10 h-10" />
          <div>
            <p className="text-sm font-bold text-gray-900">{title}</p>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>
        <button onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <form onSubmit={onSubmit} className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
        {/* Rating */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Overall Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-3">
            <StarRating
              value={form.rating}
              onChange={r => onChange({ ...form, rating: r })}
              size="lg"
            />
            {form.rating > 0 && (
              <span className="text-sm font-semibold text-gray-700">{form.rating}/5</span>
            )}
          </div>
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            What stood out? <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button key={c.id} type="button"
                onClick={() => onChange({
                  ...form,
                  categories: form.categories.includes(c.id)
                    ? form.categories.filter(x => x !== c.id)
                    : [...form.categories, c.id],
                })}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  form.categories.includes(c.id)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Review */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Your Review <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.review}
            onChange={e => onChange({ ...form, review: e.target.value })}
            rows={4}
            placeholder="Share your experience with this provider..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
          <p className={`text-xs mt-1 ${form.review.length < 10 ? 'text-gray-400' : 'text-green-600'}`}>
            {form.review.length}/10 minimum characters
          </p>
        </div>
      </form>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-100 flex gap-2 flex-shrink-0">
        <button type="button" onClick={onCancel} disabled={submitting}
          className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors">
          Cancel
        </button>
        <button
          type="submit"
          form="feedback-form-inner"
          disabled={submitting || form.rating === 0 || form.review.trim().length < 10}
          onClick={onSubmit}
          className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {submitting ? (
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {submitting ? 'Submitting...' : submitLabel}
        </button>
      </div>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const Feedback: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'pending' | 'history'>('pending');
  const [completed, setCompleted] = useState<CompletedApt[]>([]);
  const [history, setHistory] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [newFor, setNewFor] = useState<CompletedApt | null>(null);
  const [editItem, setEditItem] = useState<FeedbackItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(BLANK_FORM);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'pending') {
        const res = await appointmentsApi.getAppointments({ status: 'completed' });
        // Handle all possible response shapes
        const raw: any[] = (res as any).data?.data?.data
          ?? (res as any).data?.data
          ?? (res as any).data
          ?? [];
        const list = Array.isArray(raw) ? raw : [];
        setCompleted(list.map((a: any) => {
          const pName = a.provider?.name || a.professionalName || 'Healthcare Provider';
          const initials = pName.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase() || 'P';
          return {
            id: a.id || a._id,
            providerName: pName,
            providerSpecialty: a.provider?.specialty || a.provider?.type || '',
            providerInitials: initials,
            date: a.date || a.scheduledDate || '',
            time: a.time || a.scheduledTime || '',
            service: a.service?.title || a.reasonForVisit || 'Consultation',
          };
        }));
      } else {
        const res = await feedbackApi.getFeedback();
        const raw: any[] = (res as any).data?.data ?? (res as any).data ?? [];
        const list = Array.isArray(raw) ? raw : [];
        const now = Date.now();
        setHistory(list.map((f: any) => ({
          id: f.id || f._id,
          provider: f.provider?.name || f.providerName || f.provider || 'Provider',
          date: f.createdAt || f.date || '',
          rating: f.rating || 0,
          review: f.review || '',
          editable: now - new Date(f.createdAt || f.date || 0).getTime() < 48 * 3600 * 1000,
        })));
      }
    } catch (err) {
      console.error('Feedback load error:', err);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const handleSubmitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFor) return;
    if (form.rating === 0) { showErrorToast('Please select a rating'); return; }
    if (form.review.trim().length < 10) { showErrorToast('Review must be at least 10 characters'); return; }
    setSubmitting(true);
    try {
      await feedbackApi.submitFeedback({
        appointmentId: newFor.id,
        rating: form.rating,
        review: form.review,
        categories: form.categories,
      });
      showSuccessToast('Feedback submitted!');
      setNewFor(null);
      setForm(BLANK_FORM);
      load();
    } catch { showErrorToast('Failed to submit feedback'); }
    finally { setSubmitting(false); }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    if (form.rating === 0) { showErrorToast('Please select a rating'); return; }
    if (form.review.trim().length < 10) { showErrorToast('Review must be at least 10 characters'); return; }
    setSubmitting(true);
    try {
      await feedbackApi.updateFeedback(editItem.id, {
        appointmentId: editItem.id,
        rating: form.rating,
        review: form.review,
        categories: form.categories,
      });
      showSuccessToast('Feedback updated!');
      setEditItem(null);
      setForm(BLANK_FORM);
      load();
    } catch { showErrorToast('Failed to update feedback'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await feedbackApi.deleteFeedback(deleteId);
      showSuccessToast('Feedback deleted');
      setDeleteId(null);
      load();
    } catch { showErrorToast('Failed to delete feedback'); }
  };

  const safeDate = (d: string) => {
    try { return d ? format(new Date(d), 'MMM d, yyyy') : '—'; } catch { return '—'; }
  };

  return (
    <DashboardLayout>
      <div className="space-y-5 sm:space-y-6">

        {/* ── Header ── */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Feedback</h1>
          <p className="text-sm text-gray-500 mt-0.5">Rate your consultations and help improve our services</p>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {(['pending', 'history'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all capitalize ${
                tab === t ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {t === 'pending' ? '⏳ Pending' : '📋 History'}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-52 bg-white rounded-2xl border border-gray-200">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent" />
            <p className="text-sm text-gray-500 mt-3">Loading...</p>
          </div>
        ) : tab === 'pending' ? (
          completed.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-10 sm:p-14 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">⭐</span>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">No pending feedback</h3>
              <p className="text-sm text-gray-500 mb-5">Complete a consultation to leave a review</p>
              <button onClick={() => navigate('/patient/appointments')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors">
                View Appointments
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {completed.map(apt => (
                <div key={apt.id} className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 hover:shadow-md hover:border-blue-200 transition-all">
                  <div className="flex items-start gap-3">
                    <Avatar initials={apt.providerInitials} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 text-sm sm:text-base truncate">{apt.providerName}</p>
                          {apt.providerSpecialty && (
                            <p className="text-xs text-gray-500 capitalize mt-0.5">{apt.providerSpecialty}</p>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg whitespace-nowrap flex-shrink-0">
                          {safeDate(apt.date)}
                        </span>
                      </div>
                      <p className="text-xs text-blue-600 font-medium mt-1">{apt.service}</p>
                      <button
                        onClick={() => { setNewFor(apt); setForm(BLANK_FORM); }}
                        className="mt-3 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Leave Review
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          history.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-10 sm:p-14 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📋</span>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">No feedback yet</h3>
              <p className="text-sm text-gray-500">Your submitted reviews will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map(f => {
                const initials = f.provider.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'P';
                return (
                  <div key={f.id} className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar initials={initials} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <p className="font-bold text-gray-900 text-sm sm:text-base truncate">{f.provider}</p>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg whitespace-nowrap flex-shrink-0">
                            {safeDate(f.date)}
                          </span>
                        </div>
                        <Stars value={f.rating} />
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 leading-relaxed mb-3">{f.review}</p>

                    {f.editable ? (
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-400">Editable for 48h</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setEditItem(f); setForm({ rating: f.rating, review: f.review, categories: [] }); }}
                            className="px-3 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteId(f.id)}
                            className="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                            Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-400">Edit window expired</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      {/* ── New Feedback Modal ── */}
      {newFor && (
        <FeedbackForm
          title={newFor.providerName}
          subtitle={`${newFor.service} · ${safeDate(newFor.date)}`}
          initials={newFor.providerInitials}
          form={form}
          onChange={setForm}
          onSubmit={handleSubmitNew}
          onCancel={() => { setNewFor(null); setForm(BLANK_FORM); }}
          submitting={submitting}
          submitLabel="Submit Review"
        />
      )}

      {/* ── Edit Feedback Modal ── */}
      {editItem && (
        <FeedbackForm
          title={editItem.provider}
          subtitle={safeDate(editItem.date)}
          initials={editItem.provider.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'P'}
          form={form}
          onChange={setForm}
          onSubmit={handleSubmitEdit}
          onCancel={() => { setEditItem(null); setForm(BLANK_FORM); }}
          submitting={submitting}
          submitLabel="Update Review"
        />
      )}

      {/* ── Delete Confirm ── */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={e => { if (e.target === e.currentTarget) setDeleteId(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">Delete Review?</h3>
            <p className="text-sm text-gray-500 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete}
                className="flex-1 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Feedback;
