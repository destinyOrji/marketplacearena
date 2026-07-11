/**
 * Application Detail Page — Hospital Dashboard
 * Shows full professional profile + all uploaded documents/images
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FiDownload, FiCheckCircle, FiXCircle, FiArrowLeft,
  FiUser, FiMail, FiPhone, FiFileText, FiImage, FiExternalLink,
  FiAward, FiBook, FiStar
} from 'react-icons/fi';
import { format } from 'date-fns';

const BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'https://healthmarketarena.com';
const API_URL  = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';

// ── helpers ──────────────────────────────────────────────────────────────────

const fullUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

const isImage = (url: string) =>
  /\.(jpe?g|png|gif|webp|svg|bmp)(\?.*)?$/i.test(url);

const docLabel = (url: string, fallback: string) => {
  try {
    const parts = url.split('/');
    const name = parts[parts.length - 1].split('?')[0];
    return decodeURIComponent(name) || fallback;
  } catch {
    return fallback;
  }
};

// ── Document viewer card ──────────────────────────────────────────────────────

const DocCard: React.FC<{ url: string; label: string; tag?: string }> = ({ url, label, tag }) => {
  const href = fullUrl(url);
  const img  = isImage(url);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      {img ? (
        <a href={href} target="_blank" rel="noopener noreferrer">
          <img
            src={href}
            alt={label}
            className="w-full h-48 object-cover bg-gray-100"
            onError={e => { (e.target as HTMLImageElement).src = '/placeholder-doc.png'; }}
          />
        </a>
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <FiFileText className="h-16 w-16 text-blue-400" />
        </div>
      )}
      <div className="p-3">
        {tag && (
          <span className="text-xs font-semibold uppercase tracking-wide text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            {tag}
          </span>
        )}
        <p className="mt-1.5 text-sm font-medium text-gray-800 truncate" title={label}>{label}</p>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          {img ? <FiExternalLink className="h-3.5 w-3.5" /> : <FiDownload className="h-3.5 w-3.5" />}
          {img ? 'View full size' : 'Download'}
        </a>
      </div>
    </div>
  );
};

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  pending:     'bg-yellow-100 text-yellow-800',
  reviewing:   'bg-blue-100 text-blue-800',
  reviewed:    'bg-blue-100 text-blue-800',
  shortlisted: 'bg-purple-100 text-purple-800',
  offered:     'bg-indigo-100 text-indigo-800',
  accepted:    'bg-green-100 text-green-800',
  rejected:    'bg-red-100 text-red-800',
  withdrawn:   'bg-gray-100 text-gray-800',
};

// ── Main component ────────────────────────────────────────────────────────────

const ApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const getToken = () =>
    localStorage.getItem('hospitalToken') || localStorage.getItem('authToken') || '';

  useEffect(() => { loadApplication(); }, [id]);

  const loadApplication = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/hospitals/applications/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to load');
      setApplication(json.data || json);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load application');
      navigate('/hospital/applications');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: string) => {
    try {
      setActionLoading(true);
      const res = await fetch(`${API_URL}/hospitals/applications/${id}/${status === 'rejected' ? 'reject' : status === 'accepted' ? 'accept' : 'status'}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        // fallback: try generic status endpoint
        await fetch(`${API_URL}/hospitals/applications/${id}/status`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });
      }
      toast.success('Application status updated');
      loadApplication();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!application) return null;

  // ── Normalise fields (backend uses camelCase from Mongoose) ──────────────
  const app  = application;
  const prof = app.professional || {};
  const user = prof.user || {};

  const profName   = user.firstName ? `${user.firstName} ${user.lastName}`.trim() : prof.user_name || 'N/A';
  const profEmail  = user.email  || prof.user_email  || 'N/A';
  const profPhone  = user.phone  || prof.phone       || '';
  const profType   = prof.professionalType || prof.professional_type || '';
  const profSpec   = prof.specialization   || '';
  const profYears  = prof.yearsOfExperience ?? prof.years_of_experience ?? 0;
  const profLicense = prof.licenseNumber   || prof.license_number    || '';
  const profBio    = prof.bio || '';
  const profSkills: string[] = Array.isArray(prof.skills) ? prof.skills : [];
  const profCity   = prof.city  || '';
  const profState  = prof.state || '';

  const jobTitle  = app.job?.jobTitle  || app.job?.job_title  || app.vacancy_title  || '';
  const jobDept   = app.job?.department || app.vacancy_department || '';
  const coverLetter = app.coverLetter || app.cover_letter || '';
  const status    = app.status || app.application_status || 'pending';
  const appliedAt = app.createdAt || app.applied_at;
  const reviewNotes = app.reviewNotes || app.review_notes || '';

  // ── Collect all documents ─────────────────────────────────────────────────
  const docs: { url: string; label: string; tag: string }[] = [];

  if (prof.resumeFile)      docs.push({ url: prof.resumeFile,      label: docLabel(prof.resumeFile, 'Resume / CV'),            tag: 'Resume'   });
  if (prof.licenseDocument) docs.push({ url: prof.licenseDocument, label: docLabel(prof.licenseDocument, 'Medical License'),   tag: 'License'  });
  if (prof.profilePicture)  docs.push({ url: prof.profilePicture,  label: 'Profile Photo',                                    tag: 'Photo'    });

  // Certification documents
  if (Array.isArray(prof.certifications)) {
    prof.certifications.forEach((c: any, i: number) => {
      if (c.certificateUrl) {
        docs.push({ url: c.certificateUrl, label: c.name || `Certificate ${i + 1}`, tag: 'Certificate' });
      }
    });
  }

  // Attachments submitted with the application itself
  if (Array.isArray(app.attachments)) {
    app.attachments.forEach((url: string, i: number) => {
      docs.push({ url, label: docLabel(url, `Attachment ${i + 1}`), tag: 'Attachment' });
    });
  }

  // ── Qualifications ────────────────────────────────────────────────────────
  const quals: any[] = Array.isArray(prof.qualifications) ? prof.qualifications : [];
  const certs: any[] = Array.isArray(prof.certifications) ? prof.certifications : [];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={() => navigate('/hospital/applications')}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft className="h-4 w-4" /> Back to Applications
        </button>
        <div className="flex gap-2 flex-wrap">
          {(status === 'pending' || status === 'reviewing') && (
            <>
              <button
                onClick={() => updateStatus('rejected')}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-red-300 text-red-700 text-sm font-medium rounded-lg hover:bg-red-50 disabled:opacity-50"
              >
                <FiXCircle className="h-4 w-4" /> Reject
              </button>
              <button
                onClick={() => updateStatus('shortlisted')}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                <FiCheckCircle className="h-4 w-4" /> Shortlist
              </button>
              <button
                onClick={() => updateStatus('accepted')}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <FiCheckCircle className="h-4 w-4" /> Accept
              </button>
            </>
          )}
          {status === 'shortlisted' && (
            <button
              onClick={() => updateStatus('accepted')}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <FiCheckCircle className="h-4 w-4" /> Accept Candidate
            </button>
          )}
        </div>
      </div>

      {/* ── Header card ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start gap-5 flex-wrap">
          {/* Avatar */}
          {prof.profilePicture ? (
            <img src={fullUrl(prof.profilePicture)} alt={profName}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-100 flex-shrink-0" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-2xl font-bold">
                {profName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-bold text-gray-900">{profName}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${STATUS_STYLES[status] || STATUS_STYLES.pending}`}>
                {status}
              </span>
            </div>
            <p className="mt-1 text-sm text-blue-600 font-medium capitalize">
              {profType}{profSpec ? ` · ${profSpec}` : ''}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-gray-600">
              <span className="flex items-center gap-1.5"><FiMail className="h-3.5 w-3.5 text-gray-400" />{profEmail}</span>
              {profPhone && <span className="flex items-center gap-1.5"><FiPhone className="h-3.5 w-3.5 text-gray-400" />{profPhone}</span>}
              {profCity && <span className="flex items-center gap-1.5">📍 {profCity}{profState ? `, ${profState}` : ''}</span>}
            </div>
          </div>
          <div className="text-right text-sm text-gray-500 flex-shrink-0">
            <p className="font-medium text-gray-700">Applied for</p>
            <p className="text-blue-700 font-semibold">{jobTitle}</p>
            {jobDept && <p className="text-gray-500">{jobDept}</p>}
            {appliedAt && <p className="mt-1">{format(new Date(appliedAt), 'MMM d, yyyy')}</p>}
          </div>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left column: professional details ── */}
        <div className="lg:col-span-1 space-y-4">

          {/* Quick stats */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Professional Details</h3>
            <dl className="space-y-3">
              {profYears > 0 && (
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Experience</dt>
                  <dd className="text-sm font-semibold text-gray-900">{profYears} yr{profYears !== 1 ? 's' : ''}</dd>
                </div>
              )}
              {profLicense && (
                <div className="flex justify-between gap-2">
                  <dt className="text-sm text-gray-500">License No.</dt>
                  <dd className="text-sm font-semibold text-gray-900 text-right break-all">{profLicense}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Type</dt>
                <dd className="text-sm font-semibold text-gray-900 capitalize">{profType || '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Specialization</dt>
                <dd className="text-sm font-semibold text-gray-900">{profSpec || '—'}</dd>
              </div>
            </dl>
          </div>

          {/* Skills */}
          {profSkills.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <FiStar className="h-4 w-4" /> Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {profSkills.map((s: string, i: number) => (
                  <span key={i} className="px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bio */}
          {profBio && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <FiUser className="h-4 w-4" /> Bio
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">{profBio}</p>
            </div>
          )}
        </div>

        {/* ── Right column: docs, cover letter, qualifications ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Documents & Files */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiFileText className="h-5 w-5 text-blue-600" />
              Documents & Files
              <span className="ml-auto text-xs font-normal text-gray-400">{docs.length} file{docs.length !== 1 ? 's' : ''}</span>
            </h3>

            {docs.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <FiFileText className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No documents uploaded by this professional</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {docs.map((doc, i) => (
                  <DocCard key={i} url={doc.url} label={doc.label} tag={doc.tag} />
                ))}
              </div>
            )}
          </div>

          {/* Cover Letter */}
          {coverLetter && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FiBook className="h-5 w-5 text-blue-600" /> Cover Letter
              </h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-xl p-4 border border-gray-100">
                {coverLetter}
              </p>
            </div>
          )}

          {/* Qualifications */}
          {quals.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FiBook className="h-5 w-5 text-blue-600" /> Qualifications
              </h3>
              <ul className="space-y-2">
                {quals.map((q: any, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <FiCheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>
                      {typeof q === 'string' ? q : `${q.degree || ''}${q.institution ? ` — ${q.institution}` : ''}${q.year ? ` (${q.year})` : ''}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Certifications list (without URLs — those are in the docs grid) */}
          {certs.filter((c: any) => c.name).length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FiAward className="h-5 w-5 text-blue-600" /> Certifications
              </h3>
              <div className="space-y-3">
                {certs.map((c: any, i: number) => (
                  <div key={i} className="flex items-start justify-between gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                      {c.issuingBody && <p className="text-xs text-gray-500 mt-0.5">Issued by: {c.issuingBody}</p>}
                      {c.issueDate && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {format(new Date(c.issueDate), 'MMM yyyy')}
                          {c.expiryDate ? ` → ${format(new Date(c.expiryDate), 'MMM yyyy')}` : ''}
                        </p>
                      )}
                    </div>
                    {c.certificateUrl && (
                      <a href={fullUrl(c.certificateUrl)} target="_blank" rel="noopener noreferrer"
                        className="flex-shrink-0 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
                        <FiExternalLink className="h-3.5 w-3.5" /> View
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review Notes */}
          {reviewNotes && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <h3 className="text-base font-semibold text-amber-900 mb-2">Review Notes</h3>
              <p className="text-sm text-amber-800">{reviewNotes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailPage;
