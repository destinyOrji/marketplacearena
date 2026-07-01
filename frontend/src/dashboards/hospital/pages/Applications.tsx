import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFileText, FiCheckCircle, FiXCircle, FiSearch, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axios from 'axios';
import { format, formatDistanceToNow } from 'date-fns';

const API_URL = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'offered', label: 'Offered' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
];

const STATUS_STYLES: Record<string, { badge: string; dot: string }> = {
  pending:     { badge: 'bg-amber-100 text-amber-700 border-amber-200',    dot: 'bg-amber-400' },
  reviewed:    { badge: 'bg-blue-100 text-blue-700 border-blue-200',       dot: 'bg-blue-400' },
  shortlisted: { badge: 'bg-purple-100 text-purple-700 border-purple-200', dot: 'bg-purple-400' },
  offered:     { badge: 'bg-indigo-100 text-indigo-700 border-indigo-200', dot: 'bg-indigo-400' },
  accepted:    { badge: 'bg-green-100 text-green-700 border-green-200',    dot: 'bg-green-400' },
  rejected:    { badge: 'bg-red-100 text-red-700 border-red-200',          dot: 'bg-red-400' },
  withdrawn:   { badge: 'bg-gray-100 text-gray-600 border-gray-200',       dot: 'bg-gray-400' },
};

// Quick message templates
const QUICK_MESSAGES = [
  'Congratulations! We are pleased to offer you the position. Please confirm your availability for an onboarding call.',
  'Thank you for your application. We would like to schedule an interview. Please let us know your available times.',
  'We have reviewed your application and would like to discuss the next steps. Please contact us at your earliest convenience.',
  'We are pleased to inform you that your application has been shortlisted. We will be in touch shortly.',
];

interface AcceptModalProps {
  app: any;
  onClose: () => void;
  onAccepted: () => void;
}

const AcceptModal: React.FC<AcceptModalProps> = ({ app, onClose, onAccepted }) => {
  const [formData, setFormData] = useState({
    startDate: '',
    interviewDate: '',
    interviewTime: '',
    interviewLocation: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    additionalNotes: '',
    documentsRequired: [] as string[],
    onboardingInstructions: ''
  });
  const [docInput, setDocInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const profName = app.professional?.user?.firstName
    ? `${app.professional.user.firstName} ${app.professional.user.lastName}`
    : app.professional_name || 'Professional';
  const jobTitle = app.job?.jobTitle || app.job?.job_title || 'N/A';
  const id = app._id || app.id;

  const getHeaders = () => {
    const token = localStorage.getItem('hospitalToken') || localStorage.getItem('authToken');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const handleAddDocument = () => {
    if (docInput.trim() && !formData.documentsRequired.includes(docInput.trim())) {
      setFormData(prev => ({
        ...prev,
        documentsRequired: [...prev.documentsRequired, docInput.trim()]
      }));
      setDocInput('');
    }
  };

  const handleRemoveDocument = (doc: string) => {
    setFormData(prev => ({
      ...prev,
      documentsRequired: prev.documentsRequired.filter(d => d !== doc)
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await axios.put(
        `${API_URL}/hospitals/applications/${id}/accept`,
        { onboarding: formData },
        getHeaders()
      );
      toast.success('Application accepted with onboarding details!');
      onAccepted();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to accept application');
    } finally {
      setSubmitting(false);
    }
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center">
              <FiCheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Accept Application</h3>
              <p className="text-xs text-gray-500">Accepting {profName} for {jobTitle}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm text-green-800">
              <strong>Add onboarding details</strong> to help the professional prepare for their new role. 
              This information will be visible in their "Approved Jobs" page.
            </p>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Start Date (Optional)
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Interview/Meeting Details */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-4">
            <h4 className="text-sm font-bold text-gray-900">Interview/Meeting Details (Optional)</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Interview Date</label>
                <input
                  type="date"
                  value={formData.interviewDate}
                  onChange={e => setFormData(prev => ({ ...prev, interviewDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Interview Time</label>
                <input
                  type="time"
                  value={formData.interviewTime}
                  onChange={e => setFormData(prev => ({ ...prev, interviewTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Interview Location</label>
              <input
                type="text"
                value={formData.interviewLocation}
                onChange={e => setFormData(prev => ({ ...prev, interviewLocation: e.target.value }))}
                placeholder="e.g., Main Office, Conference Room A, or Video Call Link"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Contact Person */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-4">
            <h4 className="text-sm font-bold text-gray-900">Primary Contact (Optional)</h4>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Contact Person Name</label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={e => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                placeholder="e.g., Dr. John Smith, HR Manager"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={e => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                  placeholder="+234..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={e => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="contact@hospital.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Documents Required */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Documents Required (Optional)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={docInput}
                onChange={e => setDocInput(e.target.value)}
                onKeyPress={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddDocument(); } }}
                placeholder="e.g., ID Card, Medical License, CV"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={handleAddDocument}
                type="button"
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
              >
                Add
              </button>
            </div>
            {formData.documentsRequired.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.documentsRequired.map((doc, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                    {doc}
                    <button onClick={() => handleRemoveDocument(doc)} className="hover:text-blue-900">
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Onboarding Instructions */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Onboarding Instructions (Optional)
            </label>
            <textarea
              value={formData.onboardingInstructions}
              onChange={e => setFormData(prev => ({ ...prev, onboardingInstructions: e.target.value }))}
              rows={3}
              placeholder="Provide detailed instructions for the first day, dress code, who to meet, etc."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Additional Notes (Optional)
            </label>
            <textarea
              value={formData.additionalNotes}
              onChange={e => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
              rows={3}
              placeholder="Any other information the professional should know..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm">
            {submitting ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Accepting...
              </>
            ) : (
              <>
                <FiCheckCircle className="w-4 h-4" />
                Accept Application
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

interface MessageModalProps {
  app: any;
  onClose: () => void;
  onSent: () => void;
}

const MessageModal: React.FC<MessageModalProps> = ({ app, onClose, onSent }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const profName = app.professional?.user?.firstName
    ? `${app.professional.user.firstName} ${app.professional.user.lastName}`
    : app.professional_name || 'Professional';
  const jobTitle = app.job?.jobTitle || app.job?.job_title || 'N/A';
  const id = app._id || app.id;

  const getHeaders = () => {
    const token = localStorage.getItem('hospitalToken') || localStorage.getItem('authToken');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }
    setSending(true);
    try {
      await axios.post(
        `${API_URL}/hospitals/applications/${id}/message`,
        { message: message.trim() },
        getHeaders()
      );
      toast.success('Message sent to professional!');
      onSent();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const applyTemplate = (tpl: string) => {
    setMessage(tpl);
    textareaRef.current?.focus();
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Message Professional</h3>
              <p className="text-xs text-gray-500">Sending to {profName}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Context */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900">{profName}</p>
              <p className="text-xs text-blue-600">Applied for: {jobTitle}</p>
            </div>
          </div>

          {/* Quick templates */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Quick Templates</p>
            <div className="space-y-1.5">
              {QUICK_MESSAGES.map((tpl, i) => (
                <button key={i} onClick={() => applyTemplate(tpl)}
                  className="w-full text-left text-xs text-gray-600 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 border border-gray-200 hover:border-blue-200 rounded-lg px-3 py-2 transition-colors line-clamp-1">
                  {tpl}
                </button>
              ))}
            </div>
          </div>

          {/* Message textarea */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Your Message <span className="text-red-500">*</span>
            </label>
            <textarea
              ref={textareaRef}
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={5}
              disabled={sending}
              placeholder="Type your message to the professional here..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none disabled:bg-gray-50 transition-colors"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{message.length} characters</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
            <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-amber-700">
              This message will be delivered to the professional's notification inbox immediately.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} disabled={sending}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSend} disabled={sending || !message.trim()}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm">
            {sending ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Sending...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send Message
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const Applications: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [messageApp, setMessageApp] = useState<any | null>(null);
  const [acceptApp, setAcceptApp] = useState<any | null>(null);

  const getHeaders = () => {
    const token = localStorage.getItem('hospitalToken') || localStorage.getItem('authToken');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => { loadApplications(); }, [statusFilter]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/hospitals/applications`, getHeaders());
      const data = res.data?.data || res.data || [];
      const list = Array.isArray(data) ? data : [];
      setApplications(statusFilter
        ? list.filter((a: any) => (a.status || a.application_status) === statusFilter)
        : list);
    } catch {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (appId: string) => {
    setActionLoading(appId + '_accept');
    try {
      await axios.put(`${API_URL}/hospitals/applications/${appId}/accept`, {}, getHeaders());
      toast.success('Application accepted!');
      setApplications(prev => prev.map(a =>
        (a._id || a.id) === appId ? { ...a, status: 'accepted' } : a
      ));
    } catch {
      toast.error('Failed to accept application');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (appId: string) => {
    setActionLoading(appId + '_reject');
    try {
      await axios.put(`${API_URL}/hospitals/applications/${appId}/reject`, {}, getHeaders());
      toast.success('Application rejected');
      setApplications(prev => prev.map(a =>
        (a._id || a.id) === appId ? { ...a, status: 'rejected' } : a
      ));
    } catch {
      toast.error('Failed to reject application');
    } finally {
      setActionLoading(null);
    }
  };

  const counts = STATUS_TABS.reduce((acc, tab) => {
    acc[tab.value] = tab.value === ''
      ? applications.length
      : applications.filter(a => (a.status || a.application_status) === tab.value).length;
    return acc;
  }, {} as Record<string, number>);

  const filtered = applications.filter(app => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name = app.professional?.user?.firstName
      ? `${app.professional.user.firstName} ${app.professional.user.lastName}`.toLowerCase()
      : (app.professional_name || '').toLowerCase();
    const job = (app.job?.jobTitle || app.job?.job_title || '').toLowerCase();
    return name.includes(q) || job.includes(q);
  });

  const getInitials = (name: string) =>
    name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Applications</h1>
          <p className="text-sm text-gray-500 mt-0.5">Review, manage and communicate with applicants</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-full">
            {applications.length} total
          </span>
          {counts['pending'] > 0 && (
            <span className="px-3 py-1.5 bg-amber-100 text-amber-700 text-sm font-semibold rounded-full border border-amber-200">
              {counts['pending']} pending
            </span>
          )}
          {counts['accepted'] > 0 && (
            <span className="px-3 py-1.5 bg-green-100 text-green-700 text-sm font-semibold rounded-full border border-green-200">
              {counts['accepted']} accepted
            </span>
          )}
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Status tabs */}
        <div className="flex overflow-x-auto border-b border-gray-200 scrollbar-hide">
          {STATUS_TABS.map(tab => (
            <button key={tab.value} onClick={() => setStatusFilter(tab.value)}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                statusFilter === tab.value
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}>
              {tab.label}
              {counts[tab.value] > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                  statusFilter === tab.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {counts[tab.value]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by applicant name or job title..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiFileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              {search ? 'No matching applications' : 'No applications yet'}
            </h3>
            <p className="text-sm text-gray-500">
              {search ? 'Try a different search term' : 'Applications will appear here when professionals apply to your vacancies.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((app: any) => {
              const id = app._id || app.id || app.application_id;
              const status = app.status || app.application_status || 'pending';
              const style = STATUS_STYLES[status] || STATUS_STYLES.withdrawn;
              const profName = app.professional?.user?.firstName
                ? `${app.professional.user.firstName} ${app.professional.user.lastName}`
                : app.professional_name || 'Professional';
              const profType = app.professional?.professionalType || app.professional_type || '';
              const profEmail = app.professional?.user?.email || '';
              const jobTitle = app.job?.jobTitle || app.job?.job_title || app.vacancy_title || 'N/A';
              const jobDept = app.job?.department || '';
              const appliedAt = app.createdAt || app.applied_at;
              const coverLetter = app.coverLetter || app.cover_letter || '';
              const isExpanded = expandedId === id;
              const isAccepting = actionLoading === id + '_accept';
              const isRejecting = actionLoading === id + '_reject';
              const isBusy = isAccepting || isRejecting;
              const canMessage = status === 'accepted' || status === 'shortlisted' || status === 'offered';

              return (
                <div key={id} className="hover:bg-gray-50 transition-colors">
                  <div className="px-5 py-4">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-white text-sm font-bold">{getInitials(profName)}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Top row: name + status + actions */}
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-base font-bold text-gray-900">{profName}</p>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border capitalize ${style.badge}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                                {status}
                              </span>
                            </div>
                            {profType && <p className="text-xs text-gray-500 mt-0.5 capitalize">{profType}</p>}
                            {profEmail && <p className="text-xs text-gray-400">{profEmail}</p>}
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                            {status === 'pending' && (
                              <>
                                <button onClick={() => setAcceptApp(app)} disabled={isBusy}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm">
                                  <FiCheckCircle className="w-3.5 h-3.5" />
                                  Accept
                                </button>
                                <button onClick={() => handleReject(id)} disabled={isBusy}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-red-600 text-xs font-semibold rounded-lg hover:bg-red-50 border border-red-200 disabled:opacity-50 transition-colors">
                                  {isRejecting ? (
                                    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                  ) : <FiXCircle className="w-3.5 h-3.5" />}
                                  Reject
                                </button>
                              </>
                            )}

                            {/* Message button — shown for accepted/shortlisted/offered */}
                            {canMessage && (
                              <button
                                onClick={() => setMessageApp(app)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                                Message
                              </button>
                            )}

                            {status === 'accepted' && (
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded-lg border border-green-200">
                                <FiCheckCircle className="w-3.5 h-3.5" /> Accepted
                              </span>
                            )}
                            {status === 'rejected' && (
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg border border-red-200">
                                <FiXCircle className="w-3.5 h-3.5" /> Rejected
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Job info */}
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="font-medium text-blue-600">{jobTitle}</span>
                            {jobDept && <span className="text-gray-400">· {jobDept}</span>}
                          </div>
                          {appliedAt && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {formatDistanceToNow(new Date(appliedAt), { addSuffix: true })}
                              <span className="text-gray-300">·</span>
                              {format(new Date(appliedAt), 'MMM d, yyyy')}
                            </span>
                          )}
                        </div>

                        {/* Cover letter */}
                        {coverLetter && (
                          <div className="mt-3">
                            <button onClick={() => setExpandedId(isExpanded ? null : id)}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                              <svg className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              {isExpanded ? 'Hide' : 'View'} cover letter
                            </button>
                            {isExpanded && (
                              <div className="mt-2 p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-700 leading-relaxed italic">
                                "{coverLetter}"
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {!loading && filtered.length > 0 && (
        <p className="text-center text-sm text-gray-400">
          Showing {filtered.length} of {applications.length} application{applications.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Message Modal */}
      {messageApp && (
        <MessageModal
          app={messageApp}
          onClose={() => setMessageApp(null)}
          onSent={() => setMessageApp(null)}
        />
      )}

      {/* Accept Modal */}
      {acceptApp && (
        <AcceptModal
          app={acceptApp}
          onClose={() => setAcceptApp(null)}
          onAccepted={() => {
            setAcceptApp(null);
            loadApplications();
          }}
        />
      )}
    </div>
  );
};

export default Applications;
