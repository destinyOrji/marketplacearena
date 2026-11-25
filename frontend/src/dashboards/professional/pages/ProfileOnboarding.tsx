/**
 * Professional Profile & Onboarding Page
 *
 * Tabs:
 *   Profile     — personal info, specialization, bio, location, consultation fee
 *   Credentials — qualifications, certifications, skills (tag inputs)
 *   Password    — change password with strength meter
 *
 * Validation:
 *   - Required: firstName, lastName, phone, professionalType, specialization, licenseNumber
 *   - Phone: must start with + or 0, digits only after country code
 *   - ConsultationFee: must be ≥ 0
 *   - Password: 8+ chars, uppercase, lowercase, number, special char
 */
import React, { useState, useEffect, KeyboardEvent } from 'react';
import { toast } from 'react-toastify';
import { FiSave, FiPlus, FiX } from 'react-icons/fi';
import apiClient from '../services/apiClient';
import PasswordStrengthMeter, { getPasswordStrength } from '../../../components/PasswordStrengthMeter';

// ─── Tag input component ──────────────────────────────────────────────────────

interface TagInputProps {
  label: string;
  hint?: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

const TagInput: React.FC<TagInputProps> = ({ label, hint, tags, onChange, placeholder }) => {
  const [input, setInput] = useState('');

  const add = () => {
    const val = input.trim();
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
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {hint && <span className="ml-1 text-xs text-gray-400 font-normal">({hint})</span>}
      </label>
      <div className="min-h-[42px] flex flex-wrap gap-1.5 px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 bg-white">
        {tags.map((tag, i) => (
          <span key={i} className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
            {tag}
            <button type="button" onClick={() => remove(i)} className="hover:text-blue-600">
              <FiX className="h-3 w-3" />
            </button>
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
      {input.trim() && (
        <button type="button" onClick={add}
          className="mt-1 flex items-center gap-1 text-xs text-blue-600 hover:underline">
          <FiPlus className="h-3 w-3" /> Add "{input.trim()}"
        </button>
      )}
    </div>
  );
};

// ─── Validation ───────────────────────────────────────────────────────────────

interface ProfileForm {
  firstName: string; lastName: string; email: string; phone: string;
  specialization: string; licenseNumber: string; yearsOfExperience: number;
  professionalType: string; bio: string; city: string; state: string;
  address: string; consultationFee: number;
  qualifications: string[]; certifications: string[]; skills: string[];
}

const validateProfile = (f: ProfileForm): Record<string, string> => {
  const e: Record<string, string> = {};
  if (!f.firstName.trim())        e.firstName        = 'First name is required';
  if (!f.lastName.trim())         e.lastName         = 'Last name is required';
  if (!f.phone.trim())            e.phone            = 'Phone number is required';
  else if (!/^\+?[0-9\s\-()]{7,15}$/.test(f.phone.trim()))
                                  e.phone            = 'Enter a valid phone number';
  if (!f.professionalType)        e.professionalType = 'Professional type is required';
  if (!f.specialization.trim())   e.specialization   = 'Specialization is required';
  if (!f.licenseNumber.trim())    e.licenseNumber    = 'License number is required';
  if (f.yearsOfExperience < 0)   e.yearsOfExperience = 'Years of experience cannot be negative';
  if (f.consultationFee < 0)     e.consultationFee  = 'Consultation fee cannot be negative';
  return e;
};

// ─── Main component ───────────────────────────────────────────────────────────

type Tab = 'profile' | 'credentials' | 'password';

const ProfileOnboarding: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [errors, setErrors]       = useState<Record<string, string>>({});

  const [form, setForm] = useState<ProfileForm>({
    firstName: '', lastName: '', email: '', phone: '',
    specialization: '', licenseNumber: '', yearsOfExperience: 0,
    professionalType: '', bio: '', city: '', state: '', address: '',
    consultationFee: 0,
    qualifications: [], certifications: [], skills: [],
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/professionals/profile');
      const d = res.data?.data || res.data;
      setIsVerified(d.isVerified || false);
      setForm({
        firstName:        d.user?.firstName    || d.firstName    || '',
        lastName:         d.user?.lastName     || d.lastName     || '',
        email:            d.user?.email        || d.email        || '',
        phone:            d.phone              || '',
        specialization:   d.specialization     || '',
        licenseNumber:    d.licenseNumber      || '',
        yearsOfExperience: d.yearsOfExperience || 0,
        professionalType: d.professionalType   || '',
        bio:              d.bio                || '',
        city:             d.city               || '',
        state:            d.state              || '',
        address:          d.address            || '',
        consultationFee:  d.consultationFee    || 0,
        qualifications:   Array.isArray(d.qualifications)  ? d.qualifications  : [],
        certifications:   Array.isArray(d.certifications)  ? d.certifications  : [],
        skills:           Array.isArray(d.skills)          ? d.skills          : [],
      });
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const set = (k: keyof ProfileForm, v: any) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(e => { const n = { ...e }; delete n[k]; return n; });
  };

  // ── Save profile ────────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateProfile(form);
    if (Object.keys(errs).length) { setErrors(errs); toast.error('Please fix the errors below'); return; }
    setSaving(true);
    try {
      await apiClient.put('/professionals/profile/update', form);
      toast.success('Profile updated successfully');
      setErrors({});
    } catch (ex: any) {
      toast.error(ex.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // ── Change password ─────────────────────────────────────────────────────────
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const pe: Record<string, string> = {};
    if (!passwords.currentPassword)                                           pe.currentPassword  = 'Current password is required';
    if (getPasswordStrength(passwords.newPassword) < 5)                       pe.newPassword      = 'Password does not meet strength requirements';
    if (passwords.newPassword !== passwords.confirmPassword)                  pe.confirmPassword  = 'Passwords do not match';
    if (Object.keys(pe).length) { setPwErrors(pe); return; }

    setSaving(true);
    try {
      await apiClient.put('/professionals/profile/password', {
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Photo must be under 5 MB'); return; }
    const fd = new FormData();
    fd.append('photo', file);
    try {
      await apiClient.post('/professionals/upload-photo', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Photo uploaded');
      loadProfile();
    } catch {
      toast.error('Failed to upload photo');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
    </div>
  );

  const ic  = (err?: string) => `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${err ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'}`;
  const lc  = 'block text-sm font-medium text-gray-700 mb-1';
  const err = (k: string) => errors[k] ? <p className="mt-1 text-xs text-red-600">{errors[k]}</p> : null;

  const TABS: { id: Tab; label: string }[] = [
    { id: 'profile',     label: '👤 Profile' },
    { id: 'credentials', label: '🎓 Credentials' },
    { id: 'password',    label: '🔒 Password' },
  ];

  const PROF_TYPES = [
    'doctor', 'nurse', 'technician', 'therapist',
    'pharmacist', 'physiotherapist', 'other',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header card */}
      <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-6 border border-gray-100">
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-bold select-none">
            {form.firstName?.[0]?.toUpperCase()}{form.lastName?.[0]?.toUpperCase()}
          </div>
          <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 cursor-pointer hover:bg-blue-700 text-xs" title="Upload photo">
            📷
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </label>
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{form.firstName} {form.lastName}</h1>
          <p className="text-sm text-gray-500">{form.email}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
              {form.professionalType || 'Professional'}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isVerified ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
              {isVerified ? '✓ Verified' : '⏳ Pending Verification'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs + content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Tab bar */}
        <div className="border-b border-gray-200 flex overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === t.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">

          {/* ── PROFILE TAB ─────────────────────────────────────────────────── */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSave} noValidate className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className={lc}>First Name *</label>
                  <input className={ic(errors.firstName)} value={form.firstName}
                    onChange={e => set('firstName', e.target.value)} placeholder="John" />
                  {err('firstName')}
                </div>

                <div>
                  <label className={lc}>Last Name *</label>
                  <input className={ic(errors.lastName)} value={form.lastName}
                    onChange={e => set('lastName', e.target.value)} placeholder="Doe" />
                  {err('lastName')}
                </div>

                <div>
                  <label className={lc}>Email (read-only)</label>
                  <input className={`${ic()} bg-gray-50 cursor-not-allowed`} value={form.email} disabled />
                </div>

                <div>
                  <label className={lc}>Phone *</label>
                  <input className={ic(errors.phone)} value={form.phone}
                    onChange={e => set('phone', e.target.value)} placeholder="+234 800 000 0000" />
                  {err('phone')}
                </div>

                <div>
                  <label className={lc}>Professional Type *</label>
                  <select className={ic(errors.professionalType)} value={form.professionalType}
                    onChange={e => set('professionalType', e.target.value)}>
                    <option value="">— Select type —</option>
                    {PROF_TYPES.map(t => (
                      <option key={t} value={t} className="capitalize">{t}</option>
                    ))}
                  </select>
                  {err('professionalType')}
                </div>

                <div>
                  <label className={lc}>Specialization *</label>
                  <input className={ic(errors.specialization)} value={form.specialization}
                    onChange={e => set('specialization', e.target.value)} placeholder="e.g. Cardiologist, Surgeon" />
                  {err('specialization')}
                </div>

                <div>
                  <label className={lc}>License Number *</label>
                  <input className={ic(errors.licenseNumber)} value={form.licenseNumber}
                    onChange={e => set('licenseNumber', e.target.value)} placeholder="e.g. MDCN-12345" />
                  {err('licenseNumber')}
                </div>

                <div>
                  <label className={lc}>Years of Experience</label>
                  <input type="number" min="0" max="60" className={ic(errors.yearsOfExperience)}
                    value={form.yearsOfExperience}
                    onChange={e => set('yearsOfExperience', parseInt(e.target.value) || 0)} />
                  {err('yearsOfExperience')}
                </div>

                <div>
                  <label className={lc}>Consultation Fee (₦)</label>
                  <input type="number" min="0" className={ic(errors.consultationFee)}
                    value={form.consultationFee}
                    onChange={e => set('consultationFee', parseFloat(e.target.value) || 0)} />
                  {err('consultationFee')}
                </div>

                <div>
                  <label className={lc}>City</label>
                  <input className={ic()} value={form.city}
                    onChange={e => set('city', e.target.value)} placeholder="Port Harcourt" />
                </div>

                <div>
                  <label className={lc}>State</label>
                  <input className={ic()} value={form.state}
                    onChange={e => set('state', e.target.value)} placeholder="Rivers State" />
                </div>

                <div className="md:col-span-2">
                  <label className={lc}>Address</label>
                  <input className={ic()} value={form.address}
                    onChange={e => set('address', e.target.value)} placeholder="Street address" />
                </div>

                <div className="md:col-span-2">
                  <label className={lc}>Bio</label>
                  <textarea rows={4} maxLength={1000} className={ic()}
                    value={form.bio}
                    onChange={e => set('bio', e.target.value)}
                    placeholder="Tell patients about your experience, approach, and specialties…" />
                  <p className="mt-1 text-xs text-gray-400 text-right">{form.bio.length}/1000</p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-sm">
                  <FiSave className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Profile'}
                </button>
              </div>
            </form>
          )}

          {/* ── CREDENTIALS TAB ─────────────────────────────────────────────── */}
          {activeTab === 'credentials' && (
            <form onSubmit={handleSave} noValidate className="space-y-6">
              <p className="text-sm text-gray-500">
                Add your qualifications, certifications, and skills. Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">Enter</kbd> after each item.
              </p>

              <TagInput
                label="Qualifications"
                hint="Degrees, diplomas, academic credentials"
                tags={form.qualifications}
                onChange={v => set('qualifications', v)}
                placeholder="e.g. MBBS, MD, B.Pharm"
              />

              <TagInput
                label="Certifications"
                hint="Professional certificates and board certifications"
                tags={form.certifications}
                onChange={v => set('certifications', v)}
                placeholder="e.g. FMCP, Fellowship in Cardiology"
              />

              <TagInput
                label="Skills"
                hint="Clinical skills, procedures, software"
                tags={form.skills}
                onChange={v => set('skills', v)}
                placeholder="e.g. ECG interpretation, Surgical suturing"
              />

              {/* Profile completion indicator */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-sm font-semibold text-blue-900 mb-2">Profile completeness boost</p>
                <div className="space-y-1 text-xs text-blue-800">
                  <div className="flex items-center gap-2">
                    <span className={form.qualifications.length > 0 ? 'text-green-600' : 'text-gray-400'}>
                      {form.qualifications.length > 0 ? '✓' : '○'}
                    </span>
                    Qualifications (+10%)
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={form.certifications.length > 0 ? 'text-green-600' : 'text-gray-400'}>
                      {form.certifications.length > 0 ? '✓' : '○'}
                    </span>
                    Certifications (+10%)
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={form.skills.length > 0 ? 'text-green-600' : 'text-gray-400'}>
                      {form.skills.length > 0 ? '✓' : '○'}
                    </span>
                    Skills (+5%)
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-sm">
                  <FiSave className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Credentials'}
                </button>
              </div>
            </form>
          )}

          {/* ── PASSWORD TAB ─────────────────────────────────────────────────── */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} noValidate className="space-y-4 max-w-md">
              <div>
                <label className={lc}>Current Password *</label>
                <input type="password" className={ic(pwErrors.currentPassword)}
                  value={passwords.currentPassword}
                  onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))} />
                {pwErrors.currentPassword && <p className="mt-1 text-xs text-red-600">{pwErrors.currentPassword}</p>}
              </div>

              <div>
                <label className={lc}>New Password *</label>
                <input type="password" className={ic(pwErrors.newPassword)}
                  value={passwords.newPassword}
                  onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))} />
                <PasswordStrengthMeter password={passwords.newPassword} />
                {pwErrors.newPassword && <p className="mt-1 text-xs text-red-600">{pwErrors.newPassword}</p>}
              </div>

              <div>
                <label className={lc}>Confirm New Password *</label>
                <input type="password" className={ic(pwErrors.confirmPassword)}
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

export default ProfileOnboarding;
