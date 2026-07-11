/**
 * Admin — All Hospital Job Applications
 * Full detail view with documents, images and professional info
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import axios from 'axios';
import { format } from 'date-fns';
import {
  FiX, FiDownload, FiExternalLink, FiFileText,
  FiMail, FiPhone, FiUser, FiAward, FiCheckCircle,
  FiSearch, FiRefreshCw
} from 'react-icons/fi';

const API = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';
const BASE = API.replace('/api', '');

const h = () => ({ headers: { Authorization: `Bearer ${authService.getAccessToken()}` } });

const STATUS_STYLES: Record<string, string> = {
  pending:     'bg-yellow-100 text-yellow-800',
  reviewing:   'bg-blue-100 text-blue-800',
  shortlisted: 'bg-purple-100 text-purple-800',
  offered:     'bg-indigo-100 text-indigo-800',
  accepted:    'bg-green-100 text-green-800',
  rejected:    'bg-red-100 text-red-800',
  withdrawn:   'bg-gray-100 text-gray-800',
};

const fullUrl = (p: string) => (!p ? '' : p.startsWith('http') ? p : `${BASE}${p.startsWith('/') ? '' : '/'}${p}`);
const isImg = (u: string) => /\.(jpe?g|png|gif|webp|svg|bmp)(\?.*)?$/i.test(u);
const docName = (u: string, fb: string) => { try { return decodeURIComponent(u.split('/').pop()?.split('?')[0] || '') || fb; } catch { return fb; } };

// ── Document card ─────────────────────────────────────────────────────────────
const DocCard: React.FC<{ url: string; label: string; tag: string }> = ({ url, label, tag }) => {
  const href = fullUrl(url);
  const img  = isImg(url);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      {img ? (
        <a href={href} target="_blank" rel="noopener noreferrer">
          <img src={href} alt={label} className="w-full h-36 object-cover bg-gray-100"
            onError={e => { (e.target as HTMLImageElement).src = '/placeholder-doc.png'; }} />
        </a>
      ) : (
        <div className="w-full h-36 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <FiFileText className="h-12 w-12 text-blue-400" />
        </div>
      )}
      <div className="p-2.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">{tag}</span>
        <p className="mt-1 text-xs font-medium text-gray-700 truncate" title={label}>{label}</p>
        <a href={href} target="_blank" rel="noopener noreferrer"
          className="mt-1 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
          {img ? <FiExternalLink className="h-3 w-3" /> : <FiDownload className="h-3 w-3" />}
          {img ? 'View' : 'Download'}
        </a>
      </div>
    </div>
  );
};

// ── Detail slide-over panel ──────────────────────────────────────────────────
const DetailPanel: React.FC<{ app: any; onClose: () => void }> = ({ app, onClose }) => {
  const prof = app.professional || {};
  const user = prof.user || {};
  const name = user.firstName ? `${user.firstName} ${user.lastName}`.trim() : 'N/A';
  const email = user.email || '';
  const phone = user.phone || prof.phone || '';
  const type  = prof.professionalType || '';
  const spec  = prof.specialization || '';
  const yrs   = prof.yearsOfExperience ?? 0;
  const lic   = prof.licenseNumber || '';
  const bio   = prof.bio || '';
  const skills: string[] = Array.isArray(prof.skills) ? prof.skills : [];
  const quals: any[]  = Array.isArray(prof.qualifications) ? prof.qualifications : [];
  const certs: any[]  = Array.isArray(prof.certifications) ? prof.certifications : [];
  const jobTitle = app.job?.jobTitle || '';
  const jobDept  = app.job?.department || '';
  const status   = app.status || 'pending';
  const coverLetter = app.coverLetter || '';
  const appliedAt   = app.createdAt;

  // Collect all docs
  const docs: { url: string; label: string; tag: string }[] = [];
  if (prof.resumeFile)      docs.push({ url: prof.resumeFile,      label: docName(prof.resumeFile, 'Resume'),         tag: 'Resume'      });
  if (prof.licenseDocument) docs.push({ url: prof.licenseDocument, label: docName(prof.licenseDocument, 'License'),   tag: 'License'     });
  if (prof.profilePicture)  docs.push({ url: prof.profilePicture,  label: 'Profile Photo',                           tag: 'Photo'       });
  certs.forEach((c: any, i: number) => {
    if (c.certificateUrl) docs.push({ url: c.certificateUrl, label: c.name || `Certificate ${i+1}`, tag: 'Cert' });
  });
  (app.attachments || []).forEach((u: string, i: number) =>
    docs.push({ url: u, label: docName(u, `Attachment ${i+1}`), tag: 'Attachment' })
  );

  return (
    <div className="fixed inset-0 z-50 flex" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-2xl bg-white shadow-2xl flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{name}</h2>
            <p className="text-sm text-blue-600 capitalize">{type}{spec ? ` · ${spec}` : ''}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><FiX className="h-5 w-5" /></button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Applied for */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-xs text-blue-500 font-semibold uppercase tracking-wide mb-1">Applied For</p>
            <p className="text-base font-bold text-blue-900">{jobTitle || '—'}{jobDept ? ` · ${jobDept}` : ''}</p>
            {appliedAt && <p className="text-xs text-blue-600 mt-1">Applied {format(new Date(appliedAt), 'MMM d, yyyy')}</p>}
          </div>

          {/* Contact info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {email && <div className="flex items-center gap-2 text-gray-700"><FiMail className="h-4 w-4 text-gray-400 flex-shrink-0" /><span className="truncate">{email}</span></div>}
            {phone && <div className="flex items-center gap-2 text-gray-700"><FiPhone className="h-4 w-4 text-gray-400 flex-shrink-0" /><span>{phone}</span></div>}
            {yrs > 0 && <div className="flex items-center gap-2 text-gray-700"><FiUser className="h-4 w-4 text-gray-400 flex-shrink-0" /><span>{yrs} yr{yrs !== 1 ? 's' : ''} experience</span></div>}
            {lic && <div className="flex items-center gap-2 text-gray-700"><FiFileText className="h-4 w-4 text-gray-400 flex-shrink-0" /><span className="truncate">Lic: {lic}</span></div>}
          </div>

          {/* Documents */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <FiFileText className="h-4 w-4 text-blue-600" /> Documents &amp; Files
              <span className="ml-auto text-xs font-normal text-gray-400">{docs.length} file{docs.length !== 1 ? 's' : ''}</span>
            </h3>
            {docs.length === 0 ? (
              <div className="text-center py-8 text-gray-400 border border-dashed border-gray-200 rounded-xl">
                <FiFileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs">No documents uploaded</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {docs.map((d, i) => <DocCard key={i} url={d.url} label={d.label} tag={d.tag} />)}
              </div>
            )}
          </div>

          {/* Cover letter */}
          {coverLetter && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-2">Cover Letter</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-xl p-4 border border-gray-100 leading-relaxed">{coverLetter}</p>
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((s, i) => <span key={i} className="px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-100">{s}</span>)}
              </div>
            </div>
          )}

          {/* Qualifications */}
          {quals.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-2">Qualifications</h3>
              <ul className="space-y-1.5">
                {quals.map((q: any, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <FiCheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{typeof q === 'string' ? q : `${q.degree || ''}${q.institution ? ` — ${q.institution}` : ''}${q.year ? ` (${q.year})` : ''}`}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Certifications */}
          {certs.filter((c: any) => c.name).length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2"><FiAward className="h-4 w-4 text-blue-600" /> Certifications</h3>
              <div className="space-y-2">
                {certs.map((c: any, i: number) => (
                  <div key={i} className="flex items-start justify-between gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                      {c.issuingBody && <p className="text-xs text-gray-500">by {c.issuingBody}</p>}
                      {c.issueDate && <p className="text-xs text-gray-400">{format(new Date(c.issueDate), 'MMM yyyy')}{c.expiryDate ? ` → ${format(new Date(c.expiryDate), 'MMM yyyy')}` : ''}</p>}
                    </div>
                    {c.certificateUrl && (
                      <a href={fullUrl(c.certificateUrl)} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 flex-shrink-0">
                        <FiExternalLink className="h-3.5 w-3.5" /> View
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bio */}
          {bio && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-2">Bio</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{bio}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const AllHospitalApplications: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch]             = useState('');
  const [selected, setSelected]         = useState<any | null>(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      // Fetch all hospitals then fan out for their applications
      const hRes = await axios.get(`${API}/admin/hospitals?page_size=200`, h());
      const hospitals: any[] = hRes.data?.data || [];
      const all: any[] = [];

      await Promise.allSettled(
        hospitals.slice(0, 50).map(async (hosp: any) => {
          try {
            const aRes = await axios.get(`${API}/admin/hospitals/${hosp.id}/applications`, h());
            const apps: any[] = aRes.data?.data || [];
            apps.forEach(a => all.push({ ...a, _hospitalName: hosp.hospitalName || '—', _hospitalId: hosp.id }));
          } catch { /* skip hospitals with errors */ }
        })
      );

      // Sort newest first
      all.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setApplications(all);
    } catch {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = applications.filter(a => {
    const matchStatus = !statusFilter || a.status === statusFilter;
    if (!matchStatus) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    const profName = a.professional?.user?.firstName
      ? `${a.professional.user.firstName} ${a.professional.user.lastName}`.toLowerCase()
      : '';
    const job = (a.job?.jobTitle || '').toLowerCase();
    const hosp = (a._hospitalName || '').toLowerCase();
    return profName.includes(q) || job.includes(q) || hosp.includes(q);
  });

  // Count docs for a given application
  const docCount = (a: any) => {
    const p = a.professional || {};
    let n = 0;
    if (p.resumeFile)      n++;
    if (p.licenseDocument) n++;
    if (p.profilePicture)  n++;
    if (Array.isArray(p.certifications)) n += p.certifications.filter((c: any) => c.certificateUrl).length;
    if (Array.isArray(a.attachments))    n += a.attachments.length;
    return n;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hospital Job Applications</h1>
          <p className="text-sm text-gray-500 mt-0.5">All applications across all hospitals</p>
        </div>
        <button onClick={fetchAll} disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
          <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-52">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name, job or hospital..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Status</option>
          {['pending','reviewing','shortlisted','offered','accepted','rejected','withdrawn'].map(s => (
            <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <span className="text-sm text-gray-500 ml-auto">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <FiFileText className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium">No applications found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {['Professional','Type','Position','Hospital','Applied','Docs','Status',''].map(col => (
                    <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((a: any, i: number) => {
                  const p = a.professional || {};
                  const u = p.user || {};
                  const name = u.firstName ? `${u.firstName} ${u.lastName}`.trim() : '—';
                  const type = p.professionalType || '—';
                  const job  = a.job?.jobTitle || '—';
                  const hosp = a._hospitalName || '—';
                  const hospId = a._hospitalId;
                  const applied = a.createdAt ? format(new Date(a.createdAt), 'MMM d, yyyy') : '—';
                  const docs = docCount(a);
                  const status = a.status || 'pending';

                  return (
                    <tr key={i} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelected(a)}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          {p.profilePicture ? (
                            <img src={fullUrl(p.profilePicture)} alt={name}
                              className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-gray-200" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-xs font-bold">
                                {name.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{name}</p>
                            <p className="text-xs text-gray-400">{u.email || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 capitalize whitespace-nowrap">{type}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800 whitespace-nowrap">{job}</td>
                      <td className="px-4 py-3">
                        <button onClick={e => { e.stopPropagation(); navigate(`/admin/hospitals/${hospId}`); }}
                          className="text-sm text-blue-600 hover:underline whitespace-nowrap">{hosp}</button>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{applied}</td>
                      <td className="px-4 py-3">
                        {docs > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
                            <FiFileText className="h-3 w-3" /> {docs}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">None</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={e => { e.stopPropagation(); setSelected(a); }}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 whitespace-nowrap">
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selected && <DetailPanel app={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default AllHospitalApplications;
