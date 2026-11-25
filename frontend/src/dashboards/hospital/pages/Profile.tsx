/**
 * Hospital Profile Page
 *
 * Tabs:
 *   Basic Info    — name, type, emergency services, description
 *   Contact       — phone, email, website, full address
 *   Beds & Units  — total beds, available beds, ICU beds
 *   Services      — facilities, departments, accepted insurance, payment methods (tag inputs)
 *   Password      — change password with strength meter
 *
 * Validation:
 *   - Required: hospitalName, phone, email, hospitalType
 *   - Email format
 *   - Phone format
 *   - Beds: non-negative, available ≤ total
 *   - Password: 8+ chars, uppercase, lowercase, number, special char
 */
import React, { useState, useEffect, KeyboardEvent } from 'react';
import { toast } from 'react-toastify';
import { FiSave, FiPlus, FiX } from 'react-icons/fi';
import { useHospital } from '../contexts/HospitalContext';
import { hospitalApi } from '../services/api';
import PasswordStrengthMeter, { getPasswordStrength } from '../../../components/PasswordStrengthMeter';
import DocumentsTab, { DocSlot } from '../../../components/DocumentsTab';
import ErrorBoundary from '../../professional/components/ErrorBoundary';

// ─── Shared tag input (same as professional) ──────────────────────────────────

interface TagInputProps {
  label: string;
  hint?: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
}

const TagInput: React.FC<TagInputProps> = ({ label, hint, tags, onChange, placeholder, suggestions = [] }) => {
  const [input, setInput] = useState('');
  const filtered = suggestions.filter(s => s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s));

  const add = (val: string = input.trim()) => {
    if (!val || tags.includes(val)) { setInput(''); return; }
    onChange([...tags, val]);
    setInput('');
  };

  const remove = (i: number) => onChange(tags.filter((_, idx) => idx !== i));

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); add(); }
    if (e.key === 'Backspace' && !input && tags.length) remove(tags.length - 1);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {hint && <span className="ml-1 text-xs text-gray-400 font-normal">({hint})</span>}
      </label>
      <div className="min-h-[42px] flex flex-wrap gap-1.5 px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 bg-white">
        {tags.map((tag, i) => (
          <span key={i} className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
            {tag}
            <button type="button" onClick={() => remove(i)} className="hover:text-blue-600"><FiX className="h-3 w-3" /></button>
          </span>
        ))}
        <input
          className="flex-1 min-w-[140px] outline-none text-sm bg-transparent placeholder-gray-400"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder={tags.length === 0 ? placeholder : 'Add more…'}
        />
      </div>
      {/* Suggestions dropdown */}
      {input.trim() && filtered.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
          {filtered.slice(0, 8).map(s => (
            <button key={s} type="button" onClick={() => add(s)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700">
              {s}
            </button>
          ))}
        </div>
      )}
      {input.trim() && !filtered.includes(input.trim()) && (
        <button type="button" onClick={() => add()}
          className="mt-1 flex items-center gap-1 text-xs text-blue-600 hover:underline">
          <FiPlus className="h-3 w-3" /> Add "{input.trim()}"
        </button>
      )}
    </div>
  );
};

// ─── Suggested values ─────────────────────────────────────────────────────────

const FACILITY_SUGGESTIONS = [
  'ICU', 'Neonatal ICU', 'Maternity Ward', 'Operating Theatre', 'X-Ray',
  'MRI Scanner', 'CT Scanner', 'Ultrasound', 'Laboratory', 'Blood Bank',
  'Pharmacy', 'Physiotherapy', 'Dialysis Unit', 'Oncology Unit', 'Cardiac Unit',
  'Emergency Room', 'Outpatient Clinic', 'Ambulance Service', 'Mortuary',
];

const DEPARTMENT_SUGGESTIONS = [
  'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Obstetrics & Gynecology',
  'General Surgery', 'Internal Medicine', 'Dermatology', 'Ophthalmology', 'ENT',
  'Urology', 'Oncology', 'Psychiatry', 'Radiology', 'Anesthesiology',
  'Emergency Medicine', 'Family Medicine', 'Hematology', 'Nephrology', 'Pulmonology',
];

const INSURANCE_SUGGESTIONS = [
  'NHIS', 'Leadway Health', 'AXA Mansard', 'Hygeia HMO', 'Reliance HMO',
  'Avon HMO', 'Total Health Trust', 'Clearline HMO', 'Allianz HMO',
  'Sterling Health', 'Metrohealth HMO', 'ProHealth HMO',
];

const PAYMENT_SUGGESTIONS = [
  'Cash', 'Bank Transfer', 'POS/Card', 'Mobile Money', 'NHIS',
  'HMO', 'Paystack', 'Insurance', 'Cheque',
];

// ─── Validation ───────────────────────────────────────────────────────────────

const validateBasic = (f: any) => {
  const e: Record<string, string> = {};
  if (!f.hospitalName.trim())  e.hospitalName  = 'Hospital name is required';
  if (!f.hospitalType)         e.hospitalType  = 'Hospital type is required';
  return e;
};

const validateContact = (f: any) => {
  const e: Record<string, string> = {};
  if (!f.phone.trim())         e.phone  = 'Phone number is required';
  else if (!/^\+?[0-9\s\-()]{7,15}$/.test(f.phone.trim())) e.phone = 'Enter a valid phone number';
  if (!f.email.trim())         e.email  = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Enter a valid email address';
  if (f.website && !/^https?:\/\/.+/.test(f.website)) e.website = 'Website must start with http:// or https://';
  return e;
};

const validateBeds = (f: any) => {
  const e: Record<string, string> = {};
  if (f.totalBeds < 0)      e.totalBeds     = 'Cannot be negative';
  if (f.availableBeds < 0)  e.availableBeds = 'Cannot be negative';
  if (f.icuBeds < 0)        e.icuBeds       = 'Cannot be negative';
  if (f.availableBeds > f.totalBeds) e.availableBeds = 'Cannot exceed total beds';
  if (f.icuBeds > f.totalBeds)       e.icuBeds       = 'Cannot exceed total beds';
  return e;
};

// ─── Main component ───────────────────────────────────────────────────────────

type Tab = 'basic' | 'contact' | 'beds' | 'services' | 'documents' | 'password';

const Profile: React.FC = () => {
  const { hospital, updateHospital, loading } = useHospital();
  const [activeTab, setActiveTab] = useState<Tab>('basic');
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [pwErrors, setPwErrors]   = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    // Basic
    hospitalName: '', hospitalType: '', emergencyServices: false, description: '',
    // Contact
    phone: '', email: '', website: '', street: '', city: '', state: '', country: '', zipCode: '',
    // Beds
    totalBeds: 0, availableBeds: 0, icuBeds: 0,
    // Services
    facilities: [] as string[], departments: [] as string[],
    acceptedInsurance: [] as string[], paymentMethods: [] as string[],
    // Other (read-only display)
    registrationNumber: '',
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });

  const [existingDocs, setExistingDocs] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    if (!hospital) return;
    const h = hospital as any;
    setForm({
      hospitalName:       h.hospitalName || h.hospital_name || '',
      hospitalType:       h.hospitalType || h.facility_type || '',
      emergencyServices:  h.emergencyServices || false,
      description:        h.description || '',
      phone:              h.phone || '',
      email:              h.email || '',
      website:            h.website || '',
      street:  (typeof h.address === 'object' ? h.address?.street  : '') || h.address || '',
      city:    (typeof h.address === 'object' ? h.address?.city    : '') || h.city    || '',
      state:   (typeof h.address === 'object' ? h.address?.state   : '') || h.state   || '',
      country: (typeof h.address === 'object' ? h.address?.country : '') || h.country || '',
      zipCode: (typeof h.address === 'object' ? h.address?.zipCode : '') || '',
      totalBeds:         h.totalBeds     || 0,
      availableBeds:     h.availableBeds || 0,
      icuBeds:           h.icuBeds       || 0,
      facilities:        Array.isArray(h.facilities)        ? h.facilities        : [],
      departments:       Array.isArray(h.departments)
                           ? h.departments.map((d: any) => typeof d === 'string' ? d : (d.name || d))
                           : [],
      acceptedInsurance: Array.isArray(h.acceptedInsurance) ? h.acceptedInsurance : [],
      paymentMethods:    Array.isArray(h.paymentMethods)    ? h.paymentMethods    : [],
      registrationNumber: h.registrationNumber || '',
    });
    setExistingDocs({
      licenseDocument:         (h as any).licenseDocument         || undefined,
      registrationCertificate: (h as any).registrationCertificate || undefined,
      accreditationDocument:   (h as any).accreditationDocument   || undefined,
    });
  }, [hospital]);

  const set = (k: string, v: any) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(e => { const n = { ...e }; delete n[k]; return n; });
  };

  const buildPayload = () => ({
    hospitalName:       form.hospitalName,
    hospitalType:       form.hospitalType,
    emergencyServices:  form.emergencyServices,
    description:        form.description,
    phone:              form.phone,
    email:              form.email,
    website:            form.website,
    address: { street: form.street, city: form.city, state: form.state, country: form.country, zipCode: form.zipCode },
    totalBeds:          form.totalBeds,
    availableBeds:      form.availableBeds,
    icuBeds:            form.icuBeds,
    facilities:         form.facilities,
    departments:        form.departments,
    acceptedInsurance:  form.acceptedInsurance,
    paymentMethods:     form.paymentMethods,
  });

  const validate = () => {
    if (activeTab === 'basic')   return validateBasic(form);
    if (activeTab === 'contact') return validateContact(form);
    if (activeTab === 'beds')    return validateBeds(form);
    return {};
  };

  const handleSave = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); toast.error('Please fix the errors below'); return; }
    setSaving(true);
    try {
      await updateHospital(buildPayload() as any);
      toast.success('Profile updated successfully');
      setErrors({});
    } catch (ex: any) {
      toast.error(ex.response?.data?.message || ex.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const pe: Record<string, string> = {};
    if (!passwords.currentPassword)                    pe.currentPassword = 'Current password is required';
    if (getPasswordStrength(passwords.newPassword) < 5) pe.newPassword    = 'Password does not meet strength requirements';
    if (passwords.newPassword !== passwords.confirmPassword) pe.confirmPassword = 'Passwords do not match';
    if (Object.keys(pe).length) { setPwErrors(pe); return; }
    setSaving(true);
    try {
      await hospitalApi.changePassword(passwords.currentPassword, passwords.newPassword);
      toast.success('Password changed successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPwErrors({});
    } catch (ex: any) {
      toast.error(ex.response?.data?.message || ex.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return; }
    setUploading(true);
    try {
      await hospitalApi.uploadImage(file, 'logo');
      toast.success('Logo uploaded successfully');
      window.location.reload();
    } catch {
      toast.error('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  if (loading || !hospital) return (
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
    { id: 'basic',     label: '🏥 Basic Info' },
    { id: 'contact',   label: '📞 Contact' },
    { id: 'beds',      label: '🛏️ Beds & Units' },
    { id: 'services',  label: '🏷️ Services' },
    { id: 'documents', label: '📄 Documents' },
    { id: 'password',  label: '🔒 Password' },
  ];

  const HOSPITAL_TYPES = [
    'General Hospital', 'Specialist Hospital', 'Teaching Hospital',
    'Private Hospital', 'Clinic', 'Medical Center',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-6 border border-gray-100">
        <div className="relative flex-shrink-0">
          {(hospital as any).logo ? (
            <img src={(hospital as any).logo} alt="Logo" className="w-20 h-20 rounded-xl object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-bold select-none">
              {form.hospitalName?.[0] || 'H'}
            </div>
          )}
          <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 cursor-pointer hover:bg-blue-700 text-xs" title="Upload logo">
            📷
            <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
          </label>
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{form.hospitalName || 'Hospital Profile'}</h1>
          <p className="text-sm text-gray-500 capitalize">{form.hospitalType}</p>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
            (hospital as any).isVerified ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
          }`}>
            {(hospital as any).isVerified ? '✓ Verified' : '⏳ Pending Verification'}
          </span>
        </div>
      </div>

      {/* Tabs + content */}
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

          {/* ── BASIC TAB ──────────────────────────────────────────────────── */}
          {activeTab === 'basic' && (
            <form onSubmit={handleSave} noValidate className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={lc}>Hospital Name *</label>
                  <input className={ic('hospitalName')} value={form.hospitalName}
                    onChange={e => set('hospitalName', e.target.value)} placeholder="General Hospital Lagos" />
                  {err('hospitalName')}
                </div>
                <div>
                  <label className={lc}>Registration Number (read-only)</label>
                  <input className={`${ic()} bg-gray-50 cursor-not-allowed`} value={form.registrationNumber} disabled />
                </div>
                <div>
                  <label className={lc}>Hospital Type *</label>
                  <select className={ic('hospitalType')} value={form.hospitalType}
                    onChange={e => set('hospitalType', e.target.value)}>
                    <option value="">— Select type —</option>
                    {HOSPITAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {err('hospitalType')}
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <input type="checkbox" id="emergency" checked={form.emergencyServices}
                    onChange={e => set('emergencyServices', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded" />
                  <label htmlFor="emergency" className="text-sm font-medium text-gray-700">Emergency Services Available</label>
                </div>
                <div className="md:col-span-2">
                  <label className={lc}>Description</label>
                  <textarea rows={4} maxLength={1000} className={ic()}
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                    placeholder="Tell patients about your hospital, specialties, and mission…" />
                  <p className="mt-1 text-xs text-gray-400 text-right">{form.description.length}/1000</p>
                </div>
              </div>
              <SaveBtn />
            </form>
          )}

          {/* ── CONTACT TAB ───────────────────────────────────────────────── */}
          {activeTab === 'contact' && (
            <form onSubmit={handleSave} noValidate className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={lc}>Phone *</label>
                  <input className={ic('phone')} value={form.phone}
                    onChange={e => set('phone', e.target.value)} placeholder="+234 800 000 0000" />
                  {err('phone')}
                </div>
                <div>
                  <label className={lc}>Email *</label>
                  <input type="email" className={ic('email')} value={form.email}
                    onChange={e => set('email', e.target.value)} placeholder="info@hospital.com" />
                  {err('email')}
                </div>
                <div className="md:col-span-2">
                  <label className={lc}>Website</label>
                  <input className={ic('website')} value={form.website}
                    onChange={e => set('website', e.target.value)} placeholder="https://www.hospital.com" />
                  {err('website')}
                </div>
                <div className="md:col-span-2">
                  <label className={lc}>Street Address</label>
                  <input className={ic()} value={form.street}
                    onChange={e => set('street', e.target.value)} placeholder="123 Hospital Road" />
                </div>
                <div>
                  <label className={lc}>City</label>
                  <input className={ic()} value={form.city} onChange={e => set('city', e.target.value)} placeholder="Lagos" />
                </div>
                <div>
                  <label className={lc}>State</label>
                  <input className={ic()} value={form.state} onChange={e => set('state', e.target.value)} placeholder="Lagos State" />
                </div>
                <div>
                  <label className={lc}>Country</label>
                  <input className={ic()} value={form.country} onChange={e => set('country', e.target.value)} placeholder="Nigeria" />
                </div>
                <div>
                  <label className={lc}>Zip Code</label>
                  <input className={ic()} value={form.zipCode} onChange={e => set('zipCode', e.target.value)} placeholder="100001" />
                </div>
              </div>
              <SaveBtn />
            </form>
          )}

          {/* ── BEDS TAB ──────────────────────────────────────────────────── */}
          {activeTab === 'beds' && (
            <form onSubmit={handleSave} noValidate className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={lc}>Total Beds</label>
                  <input type="number" min="0" className={ic('totalBeds')} value={form.totalBeds}
                    onChange={e => set('totalBeds', parseInt(e.target.value) || 0)} />
                  {err('totalBeds')}
                </div>
                <div>
                  <label className={lc}>Available Beds</label>
                  <input type="number" min="0" className={ic('availableBeds')} value={form.availableBeds}
                    onChange={e => set('availableBeds', parseInt(e.target.value) || 0)} />
                  {err('availableBeds')}
                </div>
                <div>
                  <label className={lc}>ICU Beds</label>
                  <input type="number" min="0" className={ic('icuBeds')} value={form.icuBeds}
                    onChange={e => set('icuBeds', parseInt(e.target.value) || 0)} />
                  {err('icuBeds')}
                </div>
              </div>
              {/* Bed occupancy summary */}
              {form.totalBeds > 0 && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-sm font-semibold text-blue-900 mb-2">Occupancy summary</p>
                  <div className="flex gap-6 text-sm text-blue-800">
                    <span>Occupied: <strong>{form.totalBeds - form.availableBeds}</strong></span>
                    <span>Occupancy rate: <strong>{Math.round(((form.totalBeds - form.availableBeds) / form.totalBeds) * 100)}%</strong></span>
                    <span>ICU: <strong>{form.icuBeds}</strong></span>
                  </div>
                </div>
              )}
              <SaveBtn />
            </form>
          )}

          {/* ── SERVICES TAB ──────────────────────────────────────────────── */}
          {activeTab === 'services' && (
            <form onSubmit={handleSave} noValidate className="space-y-6">
              <p className="text-sm text-gray-500">
                Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">Enter</kbd> to add each item, or pick from suggestions.
              </p>

              <TagInput
                label="Facilities"
                hint="Medical equipment and units available"
                tags={form.facilities}
                onChange={v => set('facilities', v)}
                placeholder="e.g. ICU, MRI Scanner, Operating Theatre"
                suggestions={FACILITY_SUGGESTIONS}
              />

              <TagInput
                label="Departments"
                hint="Medical departments / specialties"
                tags={form.departments}
                onChange={v => set('departments', v)}
                placeholder="e.g. Cardiology, Pediatrics, Surgery"
                suggestions={DEPARTMENT_SUGGESTIONS}
              />

              <TagInput
                label="Accepted Insurance"
                hint="HMO and insurance providers accepted"
                tags={form.acceptedInsurance}
                onChange={v => set('acceptedInsurance', v)}
                placeholder="e.g. NHIS, Hygeia HMO, AXA Mansard"
                suggestions={INSURANCE_SUGGESTIONS}
              />

              <TagInput
                label="Payment Methods"
                hint="How patients can pay"
                tags={form.paymentMethods}
                onChange={v => set('paymentMethods', v)}
                placeholder="e.g. Cash, Bank Transfer, POS/Card"
                suggestions={PAYMENT_SUGGESTIONS}
              />

              <SaveBtn />
            </form>
          )}

          {/* ── DOCUMENTS TAB ─────────────────────────────────────────────── */}
          {activeTab === 'documents' && (
            <DocumentsTab
              uploadEndpoint="/hospitals/documents/upload"
              slots={[
                { key: 'licenseDocument',         label: 'Hospital Operating License',          required: true,  hint: 'License issued by the relevant health ministry or authority' },
                { key: 'registrationCertificate', label: 'CAC / Business Registration Certificate', required: true,  hint: 'Corporate Affairs Commission or equivalent' },
                { key: 'accreditationDocument',   label: 'Accreditation Certificate',           required: false, hint: 'NHIS, ISO, or any professional accreditation body' },
              ] as DocSlot[]}
              existingDocs={existingDocs}
              onUploadSuccess={(key, url) => setExistingDocs(d => ({ ...d, [key]: url }))}
            />
          )}

          {/* ── PASSWORD TAB ──────────────────────────────────────────────── */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} noValidate className="space-y-4 max-w-md">
              <div>
                <label className={lc}>Current Password *</label>
                <input type="password" className={ic()}
                  value={passwords.currentPassword}
                  onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))} />
                {pwErrors.currentPassword && <p className="mt-1 text-xs text-red-600">{pwErrors.currentPassword}</p>}
              </div>
              <div>
                <label className={lc}>New Password *</label>
                <input type="password" className={ic()}
                  value={passwords.newPassword}
                  onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))} />
                <PasswordStrengthMeter password={passwords.newPassword} />
                {pwErrors.newPassword && <p className="mt-1 text-xs text-red-600">{pwErrors.newPassword}</p>}
              </div>
              <div>
                <label className={lc}>Confirm New Password *</label>
                <input type="password" className={ic()}
                  value={passwords.confirmPassword}
                  onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))} />
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

const ProfileWithBoundary: React.FC = () => (
  <ErrorBoundary>
    <Profile />
  </ErrorBoundary>
);

export default ProfileWithBoundary;
