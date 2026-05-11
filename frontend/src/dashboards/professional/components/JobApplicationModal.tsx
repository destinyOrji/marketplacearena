// Job Application Modal - Fixed auto-submit bug + improved design

import React, { useState, useEffect } from 'react';
import { JobPosting } from '../types';
import DocumentUpload from './DocumentUpload';

interface JobApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { coverLetter: string; attachments: File[] }) => Promise<void>;
  job: JobPosting | null;
}

const MIN_COVER_LETTER = 50;
const MAX_COVER_LETTER = 2000;

const JobApplicationModal: React.FC<JobApplicationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  job,
}) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset form whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setCoverLetter('');
      setAttachments([]);
      setDocuments([]);
      setError('');
      setLoading(false);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !loading) handleClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, loading]);

  const handleUpload = async (file: File) => {
    const doc = {
      id: Date.now().toString(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      uploadedAt: new Date(),
    };
    setDocuments(prev => [...prev, doc]);
    setAttachments(prev => [...prev, file]);
    return doc;
  };

  const handleRemoveDoc = (id: string) => {
    const idx = documents.findIndex(d => d.id === id);
    if (idx !== -1) {
      setDocuments(prev => prev.filter(d => d.id !== id));
      setAttachments(prev => prev.filter((_, i) => i !== idx));
    }
  };

  // Manual submit — NOT tied to a <form> to prevent any accidental auto-submit
  const handleSubmit = async () => {
    setError('');

    if (coverLetter.trim().length < MIN_COVER_LETTER) {
      setError(`Cover letter must be at least ${MIN_COVER_LETTER} characters (currently ${coverLetter.trim().length}).`);
      return;
    }
    if (coverLetter.length > MAX_COVER_LETTER) {
      setError(`Cover letter must be under ${MAX_COVER_LETTER} characters.`);
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ coverLetter: coverLetter.trim(), attachments });
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setCoverLetter('');
    setAttachments([]);
    setDocuments([]);
    setError('');
    onClose();
  };

  if (!isOpen || !job) return null;

  const charCount = coverLetter.length;
  const charOk = charCount >= MIN_COVER_LETTER;
  const jobTypeLabel = job.jobType
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget && !loading) handleClose(); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Apply for Position</h2>
            <p className="text-sm text-gray-500 mt-0.5">Fill in your details below</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Job summary card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-base">{job.title}</h3>
                {(job as any).hospitalName && (
                  <p className="text-sm text-blue-700 font-medium mt-0.5">🏥 {(job as any).hospitalName}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs bg-white text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">
                    📍 {job.location}
                  </span>
                  <span className="text-xs bg-white text-blue-600 px-2 py-0.5 rounded-full border border-blue-200 font-medium">
                    {jobTypeLabel}
                  </span>
                  <span className="text-xs bg-white text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">
                    🗓 Deadline: {new Date(job.applicationDeadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cover Letter */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-800">
                Cover Letter <span className="text-red-500">*</span>
              </label>
              <span className={`text-xs font-medium ${charOk ? 'text-green-600' : 'text-gray-400'}`}>
                {charCount} / {MAX_COVER_LETTER}
                {charOk && ' ✓'}
              </span>
            </div>
            <textarea
              value={coverLetter}
              onChange={(e) => { setCoverLetter(e.target.value); setError(''); }}
              rows={9}
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors disabled:bg-gray-50 disabled:text-gray-500"
              placeholder={`Dear Hiring Manager,\n\nI am writing to express my interest in the ${job.title} position. With my background in ${job.specialty || 'healthcare'}, I believe I would be a strong fit for this role...\n\n(Minimum ${MIN_COVER_LETTER} characters required)`}
            />
            {!charOk && charCount > 0 && (
              <p className="text-xs text-amber-600 mt-1">
                {MIN_COVER_LETTER - charCount} more characters needed
              </p>
            )}
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Additional Documents <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Attach your CV, certificates, or portfolio — up to 10MB per file
            </p>
            <DocumentUpload
              documents={documents}
              onUpload={handleUpload}
              onRemove={handleRemoveDoc}
              label="Attach Document"
              maxSizeMB={10}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}
        </div>

        {/* Footer actions — outside scroll area */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between gap-3 flex-shrink-0 bg-gray-50 rounded-b-2xl">
          <p className="text-xs text-gray-500 hidden sm:block">
            Your application will be sent directly to the employer.
          </p>
          <div className="flex gap-3 ml-auto">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || charCount < MIN_COVER_LETTER}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Submit Application
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobApplicationModal;
