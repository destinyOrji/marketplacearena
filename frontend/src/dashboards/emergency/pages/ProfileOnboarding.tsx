/**
 * Ambulance / Emergency Provider Profile Page
 *
 * Tabs:
 *   Profile       — service name, type, phones, email, address
 *   Certifications — certifications (tag inputs)
 *   Password      — change password with strength meter
 *
 * Validation:
 *   - Required: serviceName, serviceType, phone, emergencyNumber
 *   - Phone format validated
 *   - Password strength policy enforced
 */
import React, { useState, useEffect, KeyboardEvent } from 'react';
import { toast } from 'react-toastify';
import { FiSave, FiPlus, FiX } from 'react-icons/fi';
import apiClient from '../services/apiClient';
import PasswordStrengthMeter, { getPasswordStrength } from '../../../components/PasswordStrengthMeter';
import DocumentsTab, { DocSlot } from '../../../components/DocumentsTab';
import ErrorBoundary from '../components/ErrorBoundary';

// ─── Tag input ────────────────────────────────────────────────────────────────

interface TagInputProps {
  label: string; hint?: string; tags: string[];
  onChange: (t: string[]) => void; placeholder?: string; suggestions?: string[];
}

const TagInput: React.FC<TagInputProps> = ({ label, hint, tags, onChange, placeholder, suggestions = [] }) => {
  const [input, setInput] = useState('');
  const filtered = suggestions.filter(s => s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s));

  const add = (val: string = input.trim()) => {
    if (!val || tags.includes(val)) { setInput(''); return; }
    onChange([...tags, val]); setInput('');
  };
  const remove = (i: number) => onChange(tags.filter((_, idx) => idx !== i));
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); add(); }
    if (e.key === 'Backspace' && !input && tags.length) remove(tags.length - 1);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{hint && <span className="ml-1 text-xs text-gray-400 font-normal">({hint})</span>}
      </label>
      <div className="min-h-[42px] flex flex-wrap gap-1.5 px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 bg-white">
        {tags.map((tag, i) => (
          <span key={i} className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
            {tag}<button type="button" onClick={() => remove(i)} className="hover:text-blue-600"><FiX className="h-3 w-3" /></button>
          </span>
        ))}
        <input className="flex-1 min-w-[140px] outline-none text-sm bg-transparent placeholder-gray-400"
          value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey}
          placeholder={tags.length === 0 ? placeholder : 'Add more…'} />
      </div>
      {input.trim() && filtered.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
          {filtered.slice(0, 8).map(s => (
            <button key={s} type="button" onClick={() => add(s)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700">{s}</button>
          ))}
        </div>
      )}
      {input.trim() && (
        <button type="button" onClick={() => add()}
          className="mt-1 flex items-center gap-1 text-xs text-blue-600 hover:underline">
          <FiPlus className="h-3 w-3" /> Add "{input.trim()}"
        </button>
      )}
    </div>
  );
};

// ─── Suggested certifications ─────────────────────────────────────────────────

const CERT_SUGGESTIONS = [
  'Basic Life Support (BLS)', 'Advanced Life Support (ALS)',
  'Pediatric Advanced Life Support (PALS)', 'Emergency Medical Technician (EMT)',
  'Paramedic Certification', 'First Responder Certification',
  'CPR/AED Certified', 'Trauma Life Support (ATLS)',
  'Hazmat Operations', 'Incident Command Training',
  'ACLS (Advanced Cardiac Life Support)', 'NAEMSP Certification',
];

// ─── Validation ───────────────────────────────────────────────────────────────

const validateProfile = (f: any) => {
  const e: Record<string, string> = {};
  if (!f.serviceName?.trim())    e.serviceName    = 'Service name is required';
  if (!f.serviceType)            e.serviceType    = 'Service type is required';
  if (!f.phone?.trim())          e.phone          = 'Phone number is required';
  else if (!/^\+?[0-9\s\-()]{7,15}$/.test(f.phone.trim())) e.phone = 'Enter a valid phone number';
  if (!f.emergencyNumber?.trim()) e.emergencyNumber = 'Emergency number is required';
  else if (!/^\+?[0-9\s\-()]{7,15}$/.test(f.emergencyNumber.trim())) e.emergencyNumber = 'Enter a valid emergency number';
  return e;
};

// ─── Main component ───────────────────────────────────────────────────────────

type Tab = 'profile' | 'certifications' | 'documents' | 'password';

const ProfileOnboarding: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [pwErrors, setPwErrors]   = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    serviceName: '', serviceType: '', phone: '', emergencyNumber: '',
    email: '', licenseNumber: '', responseTimeMinutes: 0,
    street: '', city: '', state: '', country: 'Nigeria',
    description: '', staffCount: 0, website: '',
    certifications: [] as string[],
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });

  const [existingDocs, setExistingDocs] = useState<Record<string, string | undefined>>({});

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/ambulance/profile');
      const d   = res.data?.data || res.data;
      setIsVerified(d.isVerified || d.verification_status === 'verified' || false);
      setExistingDocs({
        licenseDocument:  d.licenseDocument  || undefined,
        insuranceDocument: d.insuranceDocument || undefined,
      });
      setForm({
        serviceName:          d.serviceName      || d.provider_name     || '',
        serviceType:          d.serviceType      || d.service_type      || '',
        phone:                d.phone            || '',
        emergencyNumber:      d.emergencyNumber  || d.emergency_number  || '',
        email:                d.email            || d.user?.email       || '',
        licenseNumber:        d.licenseNumber    || d.registrationNumber|| '',
        responseTimeMinutes:  d.responseTimeMinutes || 0,
        street:               d.baseAddress?.street || d.address || '',
        city:                 d.baseAddress?.city   || d.city    || '',
        state:                d.baseAddress?.state  || d.state   || '',
        country:              d.baseAddress?.country|| d.country || 'Nigeria',
        description:          d.description || '',
        staffCount:           d.staffCount  || 0,
        website:              d.website     || '',
        certifications:       Array.isArray(d.certifications) ? d.certifications : [],
      });
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const set = (k: string, v: any) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(e => { const n = { ...e }; delete n[k]; return n; });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateProfile(form);
    if (Object.keys(errs).length) { setErrors(errs); toast.error('Please fix the errors below'); return; }
    setSaving(true);
    try {
      await apiClient.put('/ambulance/profile/update', {
        serviceName:         form.serviceName,
        serviceType:         form.serviceType,
        phone:               form.phone,
        emergencyNumber:     form.emergencyNumber,
        email:               form.email,
        licenseNumber:       form.licenseNumber,
        responseTimeMinutes: form.responseTimeMinutes,
        staffCount:          form.staffCount,
        website:             form.website,
        description:         form.description,
        baseAddress: { street: form.street, city: form.city, state: form.state, country: form.country },
      });
      toast.success('Profile updated successfully');
      setErrors({});
    } catch (ex: any) {
      toast.error(ex.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCerts = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.put('/ambulance/profile/update', { certifications: form.certifications });
      toast.success('Certifications updated');
    } catch (ex: any) {
      toast.error(ex.response?.data?.message || 'Failed to update certifications');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const pe: Record<string, string> = {};
    if (!passwords.currentPassword)                    pe.currentPassword = 'Current password is required';
    if (getPasswordStrength(passwords.newPassword) < 5) pe.newPassword    = 'Password does not meet strength requirements';
    if (passwords.newPassword !== passwords.confirmPassword) pe.confirmPassword = 'Passwords do not match';
    if (Object.keys(pe).length) { setPwErrors(pe); return; }
    setSaving(true);
    try {
      await apiClient.post('/ambulance/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword:     passwords.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPwErrors({});
    } catch (ex: any) {
      toast.error(ex.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
    </div>
  );

  const ic  = (k?: string) => `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${k && errors[k] ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'}`;
  const lc  = 'block text-sm font-medium text-gray-700 mb-1';
  const err = (k: string) => errors[k] ? <p className="mt-1 text-xs text-red-600">{errors[k]}</p> : null;

  const SaveBtn = () => (
    <div className="flex justify-end pt-4">
      <button type="submit" disabled={saving}
        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-sm">
        <FiSave className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Changes'}
      </button>
    </div>
  );

  const TABS: { id: Tab; label: string }[] = [
    { id: 'profile',        label: '🚑 Profile' },
    { id: 'certifications', label: '🎓 Certifications' },
    { id: 'documents',      label: '📄 Documents' },
    { id: 'password',       label: '🔒 Password' },
  ];

  const SERVICE_TYPES = [
    'Basic Life Support (BLS)', 'Advanced Life Support (ALS)',
    'Critical Care Transport', 'Air Ambulance',
    'Non-Emergency Medical Transport', 'Patient Transport',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-6 border border-gray-100">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-bold select-none flex-shrink-0">
          {form.serviceName?.[0]?.toUpperCase() || 'A'}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{form.serviceName || 'Ambulance Service'}</h1>
          <p className="text-sm text-gray-500">{form.email}</p>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
            isVerified ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
          }`}>
            {isVerified ? '✓ Verified' : '⏳ Pending Verification'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200 flex overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">

          {/* ── PROFILE ───────────────────────────────────────────────────── */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} noValidate className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className={lc}>Service Name *</label>
                  <input className={ic('serviceName')} value={form.serviceName}
                    onChange={e => set('serviceName', e.target.value)} placeholder="City Rescue Ambulance" />
                  {err('serviceName')}
                </div>

                <div>
                  <label className={lc}>Service Type *</label>
                  <select className={ic('serviceType')} value={form.serviceType}
                    onChange={e => set('serviceType', e.target.value)}>
                    <option value="">— Select type —</option>
                    {SERVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {err('serviceType')}
                </div>

                <div>
                  <label className={lc}>Phone *</label>
                  <input className={ic('phone')} value={form.phone}
                    onChange={e => set('phone', e.target.value)} placeholder="+234 800 000 0000" />
                  {err('phone')}
                </div>

                <div>
                  <label className={lc}>Emergency Number *</label>
                  <input className={ic('emergencyNumber')} value={form.emergencyNumber}
                    onChange={e => set('emergencyNumber', e.target.value)} placeholder="+234 800 911 0000" />
                  {err('emergencyNumber')}
                </div>

                <div>
                  <label className={lc}>Email (read-only)</label>
                  <input className={`${ic()} bg-gray-50 cursor-not-allowed`} value={form.email} disabled />
                </div>

                <div>
                  <label className={lc}>License / Registration Number</label>
                  <input className={ic()} value={form.licenseNumber}
                    onChange={e => set('licenseNumber', e.target.value)} placeholder="e.g. FMOH-AMB-12345" />
                </div>

                <div>
                  <label className={lc}>Avg Response Time (minutes)</label>
                  <input type="number" min="0" className={ic()} value={form.responseTimeMinutes}
                    onChange={e => set('responseTimeMinutes', parseInt(e.target.value) || 0)} />
                </div>

                <div>
                  <label className={lc}>Staff Count</label>
                  <input type="number" min="0" className={ic()} value={form.staffCount}
                    onChange={e => set('staffCount', parseInt(e.target.value) || 0)} />
                </div>

                <div>
                  <label className={lc}>Website</label>
                  <input className={ic()} value={form.website}
                    onChange={e => set('website', e.target.value)} placeholder="https://" />
                </div>

                <div className="md:col-span-2">
                  <label className={lc}>Street Address</label>
                  <input className={ic()} value={form.street}
                    onChange={e => set('street', e.target.value)} placeholder="Base station address" />
                </div>

                <div>
                  <label className={lc}>City</label>
                  <input className={ic()} value={form.city} onChange={e => set('city', e.target.value)} placeholder="Lagos" />
                </div>

                <div>
                  <label className={lc}>State</label>
                  <input className={ic()} value={form.state} onChange={e => set('state', e.target.value)} placeholder="Lagos State" />
                </div>

                <div className="md:col-span-2">
                  <label className={lc}>Description</label>
                  <textarea rows={3} maxLength={800} className={ic()} value={form.description}
                    onChange={e => set('description', e.target.value)}
                    placeholder="Describe your service, response area, and specialties…" />
                  <p className="mt-1 text-xs text-gray-400 text-right">{form.description.length}/800</p>
                </div>
              </div>
              <SaveBtn />
            </form>
          )}

          {/* ── CERTIFICATIONS ────────────────────────────────────────────── */}
          {activeTab === 'certifications' && (
            <form onSubmit={handleSaveCerts} noValidate className="space-y-6">
              <p className="text-sm text-gray-500">
                Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">Enter</kbd> after each item, or pick from suggestions.
              </p>
              <TagInput
                label="Certifications & Training"
                hint="Staff qualifications and service certifications"
                tags={form.certifications}
                onChange={v => set('certifications', v)}
                placeholder="e.g. BLS, Paramedic Certification, ACLS"
                suggestions={CERT_SUGGESTIONS}
              />
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                <p className="font-semibold mb-1">Why certifications matter</p>
                <p>Patients look for certified providers. Certifications increase trust and improve your visibility in emergency service searches.</p>
              </div>
              <SaveBtn />
            </form>
          )}

          {/* ── DOCUMENTS ──────────────────────────────────────────────────── */}
          {activeTab === 'documents' && (
            <DocumentsTab
              uploadEndpoint="/ambulance/documents/upload"
              slots={[
                { key: 'licenseDocument',   label: 'Ambulance / Service Operating License', required: true,  hint: 'License issued by the relevant transport or health authority' },
                { key: 'insuranceDocument', label: 'Vehicle / Service Insurance Certificate', required: true, hint: 'Third-party or comprehensive insurance document' },
              ] as DocSlot[]}
              existingDocs={existingDocs}
              onUploadSuccess={(key, url) => setExistingDocs(d => ({ ...d, [key]: url }))}
            />
          )}

          {/* ── PASSWORD ──────────────────────────────────────────────────── */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} noValidate className="space-y-4 max-w-md">
              <div>
                <label className={lc}>Current Password *</label>
                <input type="password" className={ic()}
                  value={passwords.currentPassword} onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))} />
                {pwErrors.currentPassword && <p className="mt-1 text-xs text-red-600">{pwErrors.currentPassword}</p>}
              </div>
              <div>
                <label className={lc}>New Password *</label>
                <input type="password" className={ic()}
                  value={passwords.newPassword} onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))} />
                <PasswordStrengthMeter password={passwords.newPassword} />
                {pwErrors.newPassword && <p className="mt-1 text-xs text-red-600">{pwErrors.newPassword}</p>}
              </div>
              <div>
                <label className={lc}>Confirm New Password *</label>
                <input type="password" className={ic()}
                  value={passwords.confirmPassword} onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))} />
                {pwErrors.confirmPassword && <p className="mt-1 text-xs text-red-600">{pwErrors.confirmPassword}</p>}
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-sm">
                  🔒 {saving ? 'Saving…' : 'Change Password'}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

const ProfileOnboardingWithBoundary: React.FC = () => (
  <ErrorBoundary>
    <ProfileOnboarding />
  </ErrorBoundary>
);

export default ProfileOnboardingWithBoundary;
