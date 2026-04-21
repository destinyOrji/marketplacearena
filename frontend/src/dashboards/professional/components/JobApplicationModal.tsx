// Job Application Modal - Apply for job postings

import React, { useState } from 'react';
import { JobPosting } from '../types';
import { jobApplicationSchema, formatValidationErrors } from '../utils/validation';
import DocumentUpload from './DocumentUpload';

interface JobApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { coverLetter: string; attachments: File[] }) => Promise<void>;
  job: JobPosting | null;
}

const JobApplicationModal: React.FC<JobApplicationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  job,
}) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleUpload = async (file: File) => {
    const mockDoc = {
      id: Date.now().toString(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      uploadedAt: new Date(),
    };
    setDocuments([...documents, mockDoc]);
    setAttachments([...attachments, file]);
    return mockDoc;
  };

  const handleRemoveDoc = (id: string) => {
    const index = documents.findIndex((doc) => doc.id === id);
    if (index !== -1) {
      setDocuments(documents.filter((doc) => doc.id !== id));
      setAttachments(attachments.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate cover letter
    const validationResult = jobApplicationSchema.safeParse({ coverLetter });
    if (!validationResult.success) {
      setErrors(formatValidationErrors(validationResult.error));
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ coverLetter, attachments });
      // Reset form
      setCoverLetter('');
      setAttachments([]);
      setDocuments([]);
      onClose();
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to submit application' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCoverLetter('');
    setAttachments([]);
    setDocuments([]);
    setErrors({});
    onClose();
  };

  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Apply for Job</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Job Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">{job.title}</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>{job.location}</p>
              <p>
                {job.jobType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} • {job.specialty}
              </p>
              <p className="text-gray-500">
                Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Cover Letter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Letter *
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={10}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Explain why you're a great fit for this position. Include your relevant experience, skills, and what you can bring to the role..."
            />
            {errors.coverLetter && (
              <p className="text-red-600 text-sm mt-1">{errors.coverLetter}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {coverLetter.length} / 2000 characters (minimum 50 required)
            </p>
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Documents (Optional)
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Attach references, portfolio items, or other relevant documents
            </p>
            <DocumentUpload
              documents={documents}
              onUpload={handleUpload}
              onRemove={handleRemoveDoc}
              label="Add Document"
              maxSizeMB={10}
            />
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errors.submit}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobApplicationModal;
