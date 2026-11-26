/**
 * Hospital Staff Management Page
 *
 * Features:
 *   - View all staff linked to this hospital
 *   - Add single staff member (manual form)
 *   - Add multiple staff via Excel upload (download template first)
 *   - Remove staff from hospital (account stays on platform)
 */
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { FiUserPlus, FiUpload, FiDownload, FiTrash2, FiSearch, FiX, FiCheck, FiAlertCircle, FiMail } from 'react-icons/fi';

const API_URL  = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';
const BASE_URL = `${API_URL}/hospitals/staff`;

const PROF_TYPES = [
  'doctor','nurse','pharmacist','dentist','physiotherapist','radiologist',
  'laboratory scientist','optometrist','dietitian','psychologist','surgeon',
  'cardiologist','dermatologist','pediatrician','gynecologist','technician','therapist','other',
];

interface StaffMember {
  _id:              string;
  userId:           string;
  firstName:        string;
  lastName:         string;
  email:            string;
  professionalType: string;
  specialization:   string;
  licenseNumber:    string;
  phone:            string;
  department:       string;
  isVerified:       boolean;
  profileComplete:  boolean;
  accountStatus:    string;
  emailVerified:    boolean;
  addedAt:          string;
}

const emptyForm = {
  firstName: '', lastName: '', email: '', phone: '',
  professionalType: 'doctor', specialization: '', licenseNumber: '', department: '',
};

const StaffManagement: React.FC = () => {
  const [staff,       setStaff]       = useState<StaffMember[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [showManual,  setShowManual]  = useState(false);
  const [showBulk,    setShowBulk]    = useState(false);
  const [form,        setForm]        = useState({ ...emptyForm });
  const [saving,      setSaving]      = useState(false);
  const [bulkFile,    setBulkFile]    = useState<File | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [removing,    setRemoving]    = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<StaffMember | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const getToken = () =>
    localStorage.getItem('hospitalToken') || localStorage.getItem('authToken') || '';

  const headers = () => ({ Authorization: `Bearer ${getToken()}` });

  useEffect(() => { fetchStaff(); }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res  = await fetch(BASE_URL, { headers: headers() });
      const data = await res.json();
      if (data.success) setStaff(data.data || []);
      else toast.error(data.message || 'Failed to load staff');
    } catch {
      toast.error('Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  // ── Manual add ───────────────────────────────────────────────────────────────
  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.professionalType) {
      toast.error('First name, last name, email and professional type are required');
      return;
    }
    setSaving(true);
    try {
      const res  = await fetch(`${BASE_URL}/add-manual`, {
        method:  'POST',
        headers: { ...headers(), 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setForm({ ...emptyForm });
        setShowManual(false);
        fetchStaff();
      } else {
        toast.error(data.message || 'Failed to add staff member');
      }
    } catch {
      toast.error('Network error — please try again');
    } finally {
      setSaving(false);
    }
  };

  // ── Bulk Excel upload ─────────────────────────────────────────────────────────
  const handleBulkUpload = async () => {
    if (!bulkFile) { toast.error('Please select an Excel file'); return; }
    setBulkLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', bulkFile);
      const res  = await fetch(`${BASE_URL}/add-bulk`, {
        method: 'POST', headers: headers(), body: fd,
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        if (data.data?.errors?.length) {
          data.data.errors.forEach((e: any) => toast.error(`${e.row}: ${e.reason}`));
        }
        setBulkFile(null);
        setShowBulk(false);
        fetchStaff();
      } else {
        toast.error(data.message || 'Upload failed');
      }
    } catch {
      toast.error('Upload failed — please try again');
    } finally {
      setBulkLoading(false);
    }
  };

  // ── Download template ─────────────────────────────────────────────────────────
  const downloadTemplate = () => {
    const a = document.createElement('a');
    a.href = `${BASE_URL}/template?token=${getToken()}`;
    // Use fetch with auth header instead
    fetch(`${BASE_URL}/template`, { headers: headers() })
      .then(r => r.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        a.href = url;
        a.download = 'staff-template.xlsx';
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => toast.error('Failed to download template'));
  };

  // ── Remove staff ──────────────────────────────────────────────────────────────
  const handleRemove = async (member: StaffMember) => {
    setRemoving(member._id);
    try {
      const res  = await fetch(`${BASE_URL}/${member._id}`, {
        method: 'DELETE', headers: headers(),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setStaff(s => s.filter(m => m._id !== member._id));
        setConfirmRemove(null);
      } else {
        toast.error(data.message || 'Failed to remove staff');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setRemoving(null);
    }
  };

  // ── Filter ────────────────────────────────────────────────────────────────────
  const filtered = staff.filter(m => {
    const q = search.toLowerCase();
    return !q ||
      m.firstName.toLowerCase().includes(q) ||
      m.lastName.toLowerCase().includes(q)  ||
      m.email.toLowerCase().includes(q)     ||
      m.professionalType.toLowerCase().includes(q) ||
      m.department.toLowerCase().includes(q);
  });

  const ic = (err?: boolean) =>
    `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${err ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'}`;
  const lc = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Add professionals to your hospital. They receive a login invite and complete their profile.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => { setShowBulk(true); setShowManual(false); }}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
            <FiUpload className="w-4 h-4" /> Upload Excel
          </button>
          <button onClick={() => { setShowManual(true); setShowBulk(false); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            <FiUserPlus className="w-4 h-4" /> Add Staff
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Staff',       value: staff.length },
          { label: 'Profile Complete',  value: staff.filter(s => s.profileComplete).length },
          { label: 'Verified',          value: staff.filter(s => s.isVerified).length },
          { label: 'Pending Setup',     value: staff.filter(s => !s.profileComplete).length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 px-5 py-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Manual Add Form ─────────────────────────────────────────────────── */}
      {showManual && (
        <div className="bg-white rounded-xl border border-blue-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <FiUserPlus className="w-4 h-4 text-blue-600" /> Add Staff Member
            </h2>
            <button onClick={() => setShowManual(false)} className="text-gray-400 hover:text-gray-600">
              <FiX className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleManualAdd} className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lc}>First Name *</label>
                <input className={ic()} value={form.firstName}
                  onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                  placeholder="e.g. John" />
              </div>
              <div>
                <label className={lc}>Last Name *</label>
                <input className={ic()} value={form.lastName}
                  onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                  placeholder="e.g. Doe" />
              </div>
              <div>
                <label className={lc}>Email Address *</label>
                <input type="email" className={ic()} value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="john.doe@example.com" />
              </div>
              <div>
                <label className={lc}>Phone Number</label>
                <input className={ic()} value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+234 800 000 0000" />
              </div>
              <div>
                <label className={lc}>Professional Type *</label>
                <select className={ic()} value={form.professionalType}
                  onChange={e => setForm(f => ({ ...f, professionalType: e.target.value }))}>
                  {PROF_TYPES.map(t => (
                    <option key={t} value={t} className="capitalize">{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={lc}>Department</label>
                <input className={ic()} value={form.department}
                  onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                  placeholder="e.g. Surgery, Paediatrics" />
              </div>
              <div>
                <label className={lc}>Specialization</label>
                <input className={ic()} value={form.specialization}
                  onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))}
                  placeholder="e.g. Cardiologist, General Surgeon" />
              </div>
              <div>
                <label className={lc}>License Number</label>
                <input className={ic()} value={form.licenseNumber}
                  onChange={e => setForm(f => ({ ...f, licenseNumber: e.target.value }))}
                  placeholder="e.g. MDCN-12345" />
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800 flex items-start gap-2">
              <FiMail className="w-4 h-4 flex-shrink-0 mt-0.5" />
              An invitation email with a temporary password will be sent to the professional. They log in and complete their profile.
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button type="button" onClick={() => setShowManual(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
                {saving ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> Sending…</> : <><FiCheck className="w-4 h-4" /> Add & Send Invite</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Bulk Upload Panel ───────────────────────────────────────────────── */}
      {showBulk && (
        <div className="bg-white rounded-xl border border-green-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <FiUpload className="w-4 h-4 text-green-600" /> Upload Excel File
            </h2>
            <button onClick={() => setShowBulk(false)} className="text-gray-400 hover:text-gray-600">
              <FiX className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 space-y-5">
            {/* Template download */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">Step 1 — Download the template</p>
                <p className="text-xs text-gray-500 mt-0.5">Fill in the Excel file with your staff data, then upload it below.</p>
              </div>
              <button onClick={downloadTemplate}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium flex-shrink-0">
                <FiDownload className="w-4 h-4" /> Download Template
              </button>
            </div>

            {/* Required columns info */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-amber-800 mb-2">Required columns in the Excel file:</p>
              <div className="flex flex-wrap gap-1.5">
                {['First Name *','Last Name *','Email *','Phone','Professional Type *','Specialization','License Number','Department'].map(c => (
                  <span key={c} className={`text-xs px-2 py-0.5 rounded-full ${c.includes('*') ? 'bg-amber-200 text-amber-900 font-semibold' : 'bg-white text-gray-700 border border-gray-200'}`}>{c}</span>
                ))}
              </div>
            </div>

            {/* File picker */}
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-2">Step 2 — Upload filled file</p>
              <div
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${bulkFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}>
                {bulkFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <FiCheck className="w-8 h-8 text-green-600" />
                    <p className="text-sm font-semibold text-green-800">{bulkFile.name}</p>
                    <p className="text-xs text-green-600">{(bulkFile.size / 1024).toFixed(1)} KB</p>
                    <button type="button" onClick={e => { e.stopPropagation(); setBulkFile(null); }}
                      className="text-xs text-red-500 hover:text-red-700 mt-1">Remove</button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <FiUpload className="w-8 h-8 text-gray-400" />
                    <p className="text-sm font-medium text-gray-600">Click to select .xlsx or .csv file</p>
                    <p className="text-xs text-gray-400">Max 5 MB</p>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) setBulkFile(f); e.target.value = ''; }} />
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowBulk(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">Cancel</button>
              <button onClick={handleBulkUpload} disabled={!bulkFile || bulkLoading}
                className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium">
                {bulkLoading ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> Uploading…</> : <><FiUpload className="w-4 h-4" /> Upload & Add Staff</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Staff Table ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Search bar */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search by name, email, type or department…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <span className="text-sm text-gray-500 whitespace-nowrap">{filtered.length} staff</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiUserPlus className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">
              {search ? 'No staff match your search' : 'No staff added yet'}
            </p>
            {!search && (
              <p className="text-gray-400 text-sm mt-1">
                Use "Add Staff" to add professionals one by one, or "Upload Excel" to add many at once.
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {['Name','Type / Department','Contact','Status','Profile','Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(m => (
                  <tr key={m._id} className="hover:bg-gray-50 transition-colors">
                    {/* Name */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm flex-shrink-0">
                          {m.firstName[0]?.toUpperCase()}{m.lastName[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{m.firstName} {m.lastName}</p>
                          <p className="text-xs text-gray-500">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    {/* Type / Department */}
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-900 capitalize">{m.professionalType}</p>
                      {m.department && <p className="text-xs text-gray-500 mt-0.5">{m.department}</p>}
                      {m.specialization && <p className="text-xs text-gray-400">{m.specialization}</p>}
                    </td>
                    {/* Contact */}
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-700">{m.phone || '—'}</p>
                      {m.licenseNumber && <p className="text-xs text-gray-400 mt-0.5">{m.licenseNumber}</p>}
                    </td>
                    {/* Account status */}
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          m.accountStatus === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {m.accountStatus}
                        </span>
                        {m.isVerified && (
                          <span className="block text-xs text-green-600 font-medium">✓ Verified</span>
                        )}
                      </div>
                    </td>
                    {/* Profile completeness */}
                    <td className="px-5 py-4">
                      {m.profileComplete ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-700 font-medium">
                          <FiCheck className="w-3.5 h-3.5" /> Complete
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
                          <FiAlertCircle className="w-3.5 h-3.5" /> Pending
                        </span>
                      )}
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setConfirmRemove(m)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Confirm Remove Modal ────────────────────────────────────────────── */}
      {confirmRemove && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiTrash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center">Remove Staff Member?</h3>
            <p className="text-sm text-gray-600 text-center mt-2">
              <strong>{confirmRemove.firstName} {confirmRemove.lastName}</strong> will be removed from your hospital.
              Their account and professional profile will <strong>remain on the platform</strong>.
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setConfirmRemove(null)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium">
                Cancel
              </button>
              <button
                onClick={() => handleRemove(confirmRemove)}
                disabled={removing === confirmRemove._id}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
              >
                {removing === confirmRemove._id ? 'Removing…' : 'Yes, Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
