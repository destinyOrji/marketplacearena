/**
 * Gym & Physio Settings / Profile Page
 *
 * Tabs:
 *   Business     — name, type, phone, location, bio, years in business, fees
 *   Credentials  — certifications, facilities (tag inputs)
 *   Notifications — email/sms/in-app toggles
 *   Password     — change password with strength meter
 */
import React, { useState, useEffect, KeyboardEvent } from 'react';
import { toast } from 'react-toastify';
import { FiSave, FiPlus, FiX } from 'react-icons/fi';
import { changePassword, getProfile, updateProfile, uploadPhoto } from '../services/api';
import PasswordStrengthMeter, { getPasswordStrength } from '../../../components/PasswordStrengthMeter';
import DocumentsTab, { DocSlot } from '../../../components/DocumentsTab';

const API_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'https://healthmarketarena.com';

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

// ─── Suggestions ──────────────────────────────────────────────────────────────

const CERT_SUGGESTIONS = [
  'ACSM Certified', 'NASM-CPT', 'ACE Certified', 'NSCA-CSCS', 'CrossFit Level 1',
  'First Aid / CPR', 'Sports Nutrition Certificate', 'Yoga Teacher Training (200hr)',
  'Pilates Instructor', 'Physiotherapy Degree', 'BPT', 'MPT', 'MCSP', 'SRP',
];

const FACILITY_SUGGESTIONS = [
  'Free Weights', 'Cardio Equipment', 'Swimming Pool', 'Sauna', 'Steam Room',
  'Group Class Studio', 'Spin Room', 'Boxing Ring', 'Stretching Area',
  'Physio Treatment Room', 'Ultrasound Machine', 'TENS Machine', 'Hydrotherapy Pool',
  'Changing Rooms', 'Lockers', 'Parking', 'WiFi', 'Café / Juice Bar',
  'Personal Training Studio', 'Massage Room',
];

// ─── Validation ───────────────────────────────────────────────────────────────

const validateBusiness = (f: any) => {
  const e: Record<string, string> = {};
  if (!f.businessName?.trim()) e.businessName = 'Business name is required';
  if (!f.businessType)         e.businessType = 'Business type is required';
  if (!f.phone?.trim())        e.phone        = 'Phone number is required';
  else if (!/^\+?[0-9\s\-()]{7,15}$/.test(f.phone.trim())) e.phone = 'Enter a valid phone number';
  if (f.consultationFee < 0)   e.consultationFee = 'Fee cannot be negative';
  if (f.yearsInBusiness < 0)   e.yearsInBusiness = 'Cannot be negative';
  return e;
};

// ─── Main component ───────────────────────────────────────────────────────────

type Tab = 'business' | 'credentials' | 'notifications' | 'password' | 'documents';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('business');
  const [saving, setSaving]       = useState(false);
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [pwErrors, setPwErrors]   = useState<Record<string, string>>({});
  const [existingDocs, setExistingDocs] = useState<Record<string, string | undefined>>({});

  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState<{
    businessName: string; businessType: 'gym' | 'physiotherapy' | 'both';
    phone: string; email: string; city: string; state: string; address: string;
    country: string; bio: string; specialization: string; licenseNumber: string;
    yearsInBusiness: number; consultationFee: number; membershipFee: number;
    website: string; certifications: string[]; facilities: string[];
  }>({
    businessName: '', businessType: 'gym', phone: '', email: '',
    city: '', state: '', address: '', country: 'Nigeria',
    bio: '', specialization: '', licenseNumber: '',
    yearsInBusiness: 0, consultationFee: 0, membershipFee: 0,
    website: '',
    certifications: [] as string[],
    facilities:     [] as string[],
  });

  const [notifications, setNotifications] = useState({ email: true, sms: true, inApp: true });
  const [photoFile, setPhotoFile]         = useState<File | null>(null);
  const [photoPreview, setPhotoPreview]   = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const data = await getProfile();
      setProfile(data);
      if (data.profilePicture) setPhotoPreview(`${API_URL}${data.profilePicture}`);
      setExistingDocs({
        licenseDocument:      data.licenseDocument      || undefined,
        businessRegistration: data.businessRegistration || undefined,
      });
      setForm(f => ({
        ...f,
        businessName:    data.businessName    || '',
        businessType:    (['gym','physiotherapy','both'].includes(data.businessType) ? data.businessType : 'gym') as 'gym' | 'physiotherapy' | 'both',
        phone:           data.phone           || '',
        email:           data.email           || '',
        city:            data.city            || '',
        state:           data.state           || '',
        address:         data.address         || '',
        country:         data.country         || 'Nigeria',
        bio:             data.bio             || '',
        specialization:  data.specialization  || '',
        licenseNumber:   data.licenseNumber   || '',
        yearsInBusiness: data.yearsInBusiness || 0,
        consultationFee: data.consultationFee || 0,
        membershipFee:   data.membershipFee   || 0,
        website:         data.website         || '',
        certifications:  Array.isArray(data.certifications) ? data.certifications : [],
        facilities:      Array.isArray(data.facilities)     ? data.facilities     : [],
      }));
    } catch {
      toast.error('Failed to load profile');
    }
  };

  const set = (k: string, v: any) => {
    setForm(p => ({ ...p, [k]: v } as typeof p));
    if (errors[k]) setErrors(e => { const n = { ...e }; delete n[k]; return n; });
  };

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateBusiness(form);
    if (Object.keys(errs).length) { setErrors(errs); toast.error('Please fix the errors below'); return; }
    setSaving(true);
    try {
      await updateProfile(form);
      toast.success('Business profile updated');
      setErrors({});
    } catch (ex: any) {
      toast.error(ex.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ certifications: form.certifications, facilities: form.facilities });
      toast.success('Credentials updated');
    } catch (ex: any) {
      toast.error(ex.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be less than 5MB'); return; }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) return;
    setUploadingPhoto(true);
    try {
      const result = await uploadPhoto(photoFile);
      const photoUrl = (result as any).photoUrl || '';
      if (photoUrl) { await updateProfile({ profilePicture: photoUrl }); toast.success('Photo updated'); setPhotoFile(null); fetchProfile(); }
    } catch (ex: any) {
      toast.error(ex.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const pe: Record<string, string> = {};
    if (!passwords.current)                                  pe.current  = 'Current password is required';
    if (getPasswordStrength(passwords.newPass) < 5)          pe.newPass  = 'Password does not meet strength requirements';
    if (passwords.newPass !== passwords.confirm)             pe.confirm  = 'Passwords do not match';
    if (Object.keys(pe).length) { setPwErrors(pe); return; }
    setSaving(true);
    try {
      await changePassword(passwords.current, passwords.newPass);
      toast.success('Password changed successfully');
      setPasswords({ current: '', newPass: '', confirm: '' });
      setPwErrors({});
    } catch (ex: any) {
      toast.error(ex.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const ic  = (k?: string) => `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${k && errors[k] ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'}`;
  const lc  = 'block text-sm font-medium text-gray-700 mb-1';
  const err = (k: string) => errors[k] ? <p className="mt-1 text-xs text-red-600">{errors[k]}</p> : null;

  const SaveBtn = ({ label = 'Save Changes' }) => (
    <div className="flex justify-end pt-4">
      <button type="submit" disabled={saving}
        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-sm">
        <FiSave className="w-4 h-4" /> {saving ? 'Saving…' : label}
      </button>
    </div>
  );

  const TABS: { id: Tab; label: string }[] = [
    { id: 'business',      label: '🏢 Business' },
    { id: 'credentials',   label: '🎓 Credentials' },
    { id: 'documents',     label: '📄 Documents' },
    { id: 'notifications', label: '🔔 Notifications' },
    { id: 'password',      label: '🔒 Password' },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {/* Photo card */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Profile Photo</h2>
        <div className="flex items-center gap-6">
          <div className="relative flex-shrink-0">
            {photoPreview ? (
              <img src={photoPreview} alt="Profile" className="w-20 h-20 rounded-full object-cover border-4 border-blue-100" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-bold select-none">
                {form.businessName?.[0] || 'G'}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">JPG or PNG, max 5MB</p>
            <div className="flex gap-2">
              <label className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm cursor-pointer">
                Choose Photo
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>
              {photoFile && (
                <button onClick={handlePhotoUpload} disabled={uploadingPhoto}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm">
                  {uploadingPhoto ? 'Uploading…' : 'Upload'}
                </button>
              )}
            </div>
          </div>
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

          {/* ── BUSINESS ──────────────────────────────────────────────────── */}
          {activeTab === 'business' && (
            <form onSubmit={handleSaveBusiness} noValidate className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={lc}>Business Name *</label>
                  <input className={ic('businessName')} value={form.businessName}
                    onChange={e => set('businessName', e.target.value)} placeholder="FitZone Gym" />
                  {err('businessName')}
                </div>
                <div>
                  <label className={lc}>Business Type *</label>
                  <select className={ic('businessType')} value={form.businessType}
                    onChange={e => set('businessType', e.target.value)}>
                    <option value="gym">Gym</option>
                    <option value="physiotherapy">Physiotherapy</option>
                    <option value="both">Both (Gym + Physio)</option>
                  </select>
                  {err('businessType')}
                </div>
                <div>
                  <label className={lc}>Phone *</label>
                  <input className={ic('phone')} value={form.phone}
                    onChange={e => set('phone', e.target.value)} placeholder="+234 800 000 0000" />
                  {err('phone')}
                </div>
                <div>
                  <label className={lc}>Email (read-only)</label>
                  <input className={`${ic()} bg-gray-50 cursor-not-allowed`} value={form.email} disabled />
                </div>
                <div>
                  <label className={lc}>Website</label>
                  <input className={ic()} value={form.website}
                    onChange={e => set('website', e.target.value)} placeholder="https://fitzone.com" />
                </div>
                <div>
                  <label className={lc}>Specialization</label>
                  <input className={ic()} value={form.specialization}
                    onChange={e => set('specialization', e.target.value)} placeholder="e.g. Sports Rehabilitation, Weight Training" />
                </div>
                <div>
                  <label className={lc}>License Number</label>
                  <input className={ic()} value={form.licenseNumber}
                    onChange={e => set('licenseNumber', e.target.value)} placeholder="e.g. CPCN-12345" />
                </div>
                <div>
                  <label className={lc}>Years in Business</label>
                  <input type="number" min="0" className={ic('yearsInBusiness')} value={form.yearsInBusiness}
                    onChange={e => set('yearsInBusiness', parseInt(e.target.value) || 0)} />
                  {err('yearsInBusiness')}
                </div>
                <div>
                  <label className={lc}>Consultation Fee (₦)</label>
                  <input type="number" min="0" className={ic('consultationFee')} value={form.consultationFee}
                    onChange={e => set('consultationFee', parseFloat(e.target.value) || 0)} />
                  {err('consultationFee')}
                </div>
                <div>
                  <label className={lc}>Membership Fee (₦/month)</label>
                  <input type="number" min="0" className={ic()} value={form.membershipFee}
                    onChange={e => set('membershipFee', parseFloat(e.target.value) || 0)} />
                </div>
                <div>
                  <label className={lc}>City</label>
                  <input className={ic()} value={form.city} onChange={e => set('city', e.target.value)} placeholder="Port Harcourt" />
                </div>
                <div>
                  <label className={lc}>State</label>
                  <input className={ic()} value={form.state} onChange={e => set('state', e.target.value)} placeholder="Rivers State" />
                </div>
                <div className="md:col-span-2">
                  <label className={lc}>Address</label>
                  <input className={ic()} value={form.address} onChange={e => set('address', e.target.value)} placeholder="Street address" />
                </div>
                <div className="md:col-span-2">
                  <label className={lc}>Bio</label>
                  <textarea rows={4} maxLength={1000} className={ic()} value={form.bio}
                    onChange={e => set('bio', e.target.value)}
                    placeholder="Tell clients about your gym/physio centre, approach, and specialties…" />
                  <p className="mt-1 text-xs text-gray-400 text-right">{form.bio.length}/1000</p>
                </div>
              </div>
              <SaveBtn />
            </form>
          )}

          {/* ── CREDENTIALS ───────────────────────────────────────────────── */}
          {activeTab === 'credentials' && (
            <form onSubmit={handleSaveCredentials} noValidate className="space-y-6">
              <p className="text-sm text-gray-500">
                Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">Enter</kbd> after each item, or pick from suggestions.
              </p>
              <TagInput
                label="Certifications"
                hint="Professional certificates and trainer qualifications"
                tags={form.certifications}
                onChange={v => set('certifications', v)}
                placeholder="e.g. NASM-CPT, Physiotherapy Degree"
                suggestions={CERT_SUGGESTIONS}
              />
              <TagInput
                label="Facilities & Equipment"
                hint="What your centre has available"
                tags={form.facilities}
                onChange={v => set('facilities', v)}
                placeholder="e.g. Free Weights, Physio Treatment Room, Swimming Pool"
                suggestions={FACILITY_SUGGESTIONS}
              />
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                <p className="font-semibold mb-1">Why this matters</p>
                <p>Clients search by certifications and available facilities. The more you add, the more visible you are in search results.</p>
              </div>
              <SaveBtn label="Save Credentials" />
            </form>
          )}

          {/* ── DOCUMENTS ─────────────────────────────────────────────────── */}
          {activeTab === 'documents' && (
            <DocumentsTab
              uploadEndpoint="/gym-physio/documents/upload"
              slots={[
                { key: 'licenseDocument',      label: 'Business License / Practice Certificate', required: true,  hint: 'Issued by relevant regulatory or licensing body' },
                { key: 'businessRegistration', label: 'Business Registration Certificate',       required: true,  hint: 'CAC registration or equivalent' },
              ] as DocSlot[]}
              existingDocs={existingDocs}
              onUploadSuccess={(key, url) => setExistingDocs(d => ({ ...d, [key]: url }))}
            />
          )}

          {/* ── NOTIFICATIONS ─────────────────────────────────────────────── */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              {[
                { key: 'email', label: 'Email Notifications', desc: 'Booking confirmations and updates via email' },
                { key: 'sms',   label: 'SMS Notifications',   desc: 'Appointment reminders via SMS' },
                { key: 'inApp', label: 'In-App Notifications', desc: 'Alerts inside the dashboard' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={notifications[key as keyof typeof notifications]}
                      onChange={e => setNotifications(p => ({ ...p, [key]: e.target.checked }))}
                      className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                  </label>
                </div>
              ))}
              <div className="flex justify-end pt-2">
                <button onClick={() => toast.success('Preferences saved')}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* ── PASSWORD ──────────────────────────────────────────────────── */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} noValidate className="space-y-4 max-w-md">
              <div>
                <label className={lc}>Current Password *</label>
                <input type="password" className={ic()}
                  value={passwords.current} onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} />
                {pwErrors.current && <p className="mt-1 text-xs text-red-600">{pwErrors.current}</p>}
              </div>
              <div>
                <label className={lc}>New Password *</label>
                <input type="password" className={ic()}
                  value={passwords.newPass} onChange={e => setPasswords(p => ({ ...p, newPass: e.target.value }))} />
                <PasswordStrengthMeter password={passwords.newPass} />
                {pwErrors.newPass && <p className="mt-1 text-xs text-red-600">{pwErrors.newPass}</p>}
              </div>
              <div>
                <label className={lc}>Confirm New Password *</label>
                <input type="password" className={ic()}
                  value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} />
                {pwErrors.confirm && <p className="mt-1 text-xs text-red-600">{pwErrors.confirm}</p>}
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

export default Settings;
