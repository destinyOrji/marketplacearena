/**
 * DocumentsTab — shared across all provider profile pages.
 *
 * Shows upload slots that are contextual to the user's profile data:
 *   - licenceNumber present  → show Licence Document slot
 *   - certifications[]       → show one slot per certification
 *   - registrationNumber     → show Registration Certificate slot
 *   - ambulance specific     → Insurance Document slot
 *   - hospital specific      → Accreditation slot
 *
 * Props:
 *   uploadUrl          POST endpoint e.g. '/professionals/documents/upload'
 *   getProfileUrl      GET endpoint to reload profile after upload
 *   token              Bearer token
 *   slots              Array of document slot definitions (drives the UI)
 *   existingDocs       Map of documentType → current URL (from profile)
 *   onUploaded         Called after any successful upload
 */
import React, { useRef, useState } from 'react';
import { FiUpload, FiCheck, FiExternalLink, FiFile, FiAlertCircle } from 'react-icons/fi';

const API_BASE = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';
const STATIC   = API_BASE.replace('/api', '');

export interface DocSlot {
  key:         string;   // documentType field name e.g. 'licenseDocument'
  label:       string;   // display name e.g. 'Licence / Registration'
  hint?:       string;   // hint text (alias: description)
  description?: string;  // alias for hint
  required?:   boolean;
  accept?:     string;   // file accept string, default 'application/pdf,image/*'
}

interface Props {
  uploadEndpoint:  string;          // e.g. '/professionals/documents/upload'
  uploadUrl?:      string;          // alias for uploadEndpoint (legacy)
  token?:          string;          // optional — component reads from localStorage if not passed
  slots:           DocSlot[];
  existingDocs:    Record<string, string | undefined>;
  onUploadSuccess?: (key: string, url: string) => void;
  onUploaded?:     (key: string, url: string) => void;  // alias
}

const DocumentsTab: React.FC<Props> = ({
  uploadEndpoint,
  uploadUrl,
  token: tokenProp,
  slots,
  existingDocs,
  onUploadSuccess,
  onUploaded,
}) => {
  const endpoint   = uploadEndpoint || uploadUrl || '';
  const callback   = onUploadSuccess || onUploaded || (() => {});
  // Read token from props or fall back to localStorage (works for all dashboards)
  const getToken   = () =>
    tokenProp ||
    localStorage.getItem('professionalToken') ||
    localStorage.getItem('hospitalToken') ||
    localStorage.getItem('gymPhysioToken') ||
    localStorage.getItem('ambulanceToken') ||
    localStorage.getItem('authToken') ||
    '';

  const [uploading, setUploading] = useState<string | null>(null);
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const refs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleUpload = async (slot: DocSlot, file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setErrors(e => ({ ...e, [slot.key]: 'File must be under 10 MB' }));
      return;
    }

    const allowed = (slot.accept || 'application/pdf,image/jpeg,image/png,image/webp').split(',');
    const isAllowed = allowed.some(type => {
      if (type.endsWith('/*')) return file.type.startsWith(type.replace('/*', '/'));
      return file.type === type || file.name.toLowerCase().endsWith(type.replace('application/', '.'));
    });
    if (!isAllowed) {
      setErrors(e => ({ ...e, [slot.key]: 'Invalid file type. Use PDF or image.' }));
      return;
    }

    setUploading(slot.key);
    setErrors(e => { const n = { ...e }; delete n[slot.key]; return n; });

    try {
      const fd = new FormData();
      fd.append('document', file);
      fd.append('documentType', slot.key);

      const res  = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Upload failed');
      callback(slot.key, json.data.documentUrl);
    } catch (ex: any) {
      setErrors(e => ({ ...e, [slot.key]: ex.message || 'Upload failed' }));
    } finally {
      setUploading(null);
    }
  };

  const openFile = (url: string) => {
    window.open(`${STATIC}${url}`, '_blank', 'noopener');
  };

  if (slots.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <FiFile className="h-7 w-7 text-gray-400" />
        </div>
        <p className="text-gray-500 text-sm font-medium">No document slots yet</p>
        <p className="text-gray-400 text-xs mt-1">
          Complete your profile (add your licence number, certifications, etc.) and document upload slots will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Upload PDF or image files (max 10 MB each). Documents are reviewed by admin during verification.
      </p>

      {slots.map(slot => {
        const existing    = existingDocs[slot.key];
        const isUploading = uploading === slot.key;

        return (
          <div key={slot.key}
            className={`border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-colors ${
              existing ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
            }`}>

            {/* Icon */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
              existing ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              {existing
                ? <FiCheck className="h-5 w-5 text-green-600" />
                : <FiFile className="h-5 w-5 text-gray-400" />}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-gray-900">{slot.label}</p>
                {slot.required && !existing && (
                  <span className="text-xs font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">Required</span>
                )}
                {existing && (
                  <span className="text-xs font-medium text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">✓ Uploaded</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{slot.hint || slot.description}</p>
              {errors[slot.key] && (
                <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                  <FiAlertCircle className="h-3 w-3 flex-shrink-0" /> {errors[slot.key]}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {existing && (
                <button
                  type="button"
                  onClick={() => openFile(existing)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <FiExternalLink className="h-3.5 w-3.5" /> View
                </button>
              )}
              <button
                type="button"
                disabled={isUploading}
                onClick={() => refs.current[slot.key]?.click()}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
                  existing
                    ? 'text-gray-700 border border-gray-200 hover:bg-gray-50'
                    : 'text-white bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Uploading…
                  </>
                ) : (
                  <>
                    <FiUpload className="h-3.5 w-3.5" />
                    {existing ? 'Replace' : 'Upload'}
                  </>
                )}
              </button>
              <input
                ref={el => { refs.current[slot.key] = el; }}
                type="file"
                accept={slot.accept || 'application/pdf,image/jpeg,image/png,image/webp'}
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(slot, file);
                  e.target.value = '';
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DocumentsTab;
