/**
 * Plans Management Page
 * Super-admin creates and manages subscription plans for all user types.
 * Reflects the PHP planConfig class behaviour: create, update, toggle,
 * duplicate, set-default, delete, and assign a plan to a specific user.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  FiPlus, FiEdit2, FiTrash2, FiCopy, FiToggleLeft, FiToggleRight,
  FiStar, FiUserCheck, FiX, FiCheck, FiAlertCircle,
} from 'react-icons/fi';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const API = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Plan {
  id: string;
  planName: string;
  description: string;
  regularPrice: number;
  promotionalPrice: number;
  currency: string;
  billingInterval: string;
  durationMonths: number;
  status: string;
  isDefault: boolean;
  eligibility: string;
  maxJobPostings: number;
  maxServices: number;
  maxAppointmentsPerMonth: number;
  features: Record<string, boolean>;
  popular: boolean;
  sortOrder: number;
  createdAt: string;
}

interface PlanOptions {
  billingInterval: string[];
  status: string[];
  eligibility: string[];
  resetPolicy: string[];
  unusedCreditsPolicy: string[];
  limitAction: string[];
  featuresByRole: Record<string, { key: string; label: string }[]>;
}

const EMPTY_FORM = {
  planName: '',
  description: '',
  regularPrice: '',
  promotionalPrice: '',
  currency: 'NGN',
  billingInterval: 'monthly',
  trialPeriodDays: '0',
  status: 'draft',
  eligibility: 'all',
  maxJobPostings: '-1',
  maxServices: '-1',
  maxAppointmentsPerMonth: '-1',
  storageAllowanceMB: '0',
  resetPolicy: 'reset_every_billing_cycle',
  unusedCreditsPolicy: 'expire_at_cycle_end',
  limitAction: 'warn_only',
  sortOrder: '0',
  popular: false,
  isDefault: false,
  features: {} as Record<string, boolean>,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number, currency = 'NGN') =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    active:   'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-700',
    draft:    'bg-blue-100 text-blue-800',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${map[status] || 'bg-gray-100 text-gray-700'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const EligibilityBadge: React.FC<{ eligibility: string }> = ({ eligibility }) => (
  <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700 capitalize">
    {eligibility === 'all' ? 'All users' : eligibility}
  </span>
);

// ─── Plan Form Modal ──────────────────────────────────────────────────────────

interface PlanFormProps {
  initial?: Plan | null;
  options: PlanOptions;
  token: string;
  onDone: (plan: Plan) => void;
  onClose: () => void;
}

const PlanForm: React.FC<PlanFormProps> = ({ initial, options, token, onDone, onClose }) => {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...(initial ? {
    planName:            initial.planName,
    description:         initial.description,
    regularPrice:        String(initial.regularPrice),
    promotionalPrice:    String(initial.promotionalPrice),
    currency:            initial.currency,
    billingInterval:     initial.billingInterval,
    status:              initial.status,
    eligibility:         initial.eligibility,
    maxJobPostings:      String(initial.maxJobPostings),
    maxServices:         String(initial.maxServices),
    maxAppointmentsPerMonth: String(initial.maxAppointmentsPerMonth),
    popular:             initial.popular,
    isDefault:           initial.isDefault,
    sortOrder:           String(initial.sortOrder),
    features:            { ...initial.features },
  } : {}) });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const toggleFeature = (key: string) =>
    setForm(f => ({ ...f, features: { ...f.features, [key]: !f.features[key] } }));

  const handleSubmit = async () => {
    if (!form.planName.trim()) { setError('Plan name is required'); return; }
    if (!form.regularPrice)    { setError('Price is required'); return; }
    setSaving(true);
    setError('');
    try {
      const url    = initial ? `${API}/admin/plans/${initial.id}` : `${API}/admin/plans`;
      const method = initial ? 'PUT' : 'POST';
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          regularPrice:        Number(form.regularPrice),
          promotionalPrice:    Number(form.promotionalPrice) || 0,
          trialPeriodDays:     Number(form.trialPeriodDays) || 0,
          maxJobPostings:      Number(form.maxJobPostings),
          maxServices:         Number(form.maxServices),
          maxAppointmentsPerMonth: Number(form.maxAppointmentsPerMonth),
          storageAllowanceMB:  Number(form.storageAllowanceMB) || 0,
          sortOrder:           Number(form.sortOrder) || 0,
        }),
      });
      const json = await res.json();
      if (!res.ok || json.statuscode !== 0) throw new Error(json.message || 'Failed to save plan');
      onDone(json.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none';
  const labelCls = 'block text-xs font-semibold text-gray-600 mb-1';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">{initial ? 'Edit Plan' : 'Create Plan'}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><FiX className="h-5 w-5 text-gray-500" /></button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-4 space-y-5 flex-1">

          {/* Basic info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Plan Name *</label>
              <input value={form.planName} onChange={e => set('planName', e.target.value)} className={inputCls} placeholder="e.g. Professional Monthly" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Description</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} className={inputCls} placeholder="Short description shown to users" />
            </div>
          </div>

          {/* Pricing */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">Pricing</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Regular Price (₦) *</label>
                <input type="number" min="0" value={form.regularPrice} onChange={e => set('regularPrice', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Promotional Price (₦)</label>
                <input type="number" min="0" value={form.promotionalPrice} onChange={e => set('promotionalPrice', e.target.value)} className={inputCls} placeholder="0 = no promo" />
              </div>
              <div>
                <label className={labelCls}>Billing Interval</label>
                <select value={form.billingInterval} onChange={e => set('billingInterval', e.target.value)} className={inputCls}>
                  {options.billingInterval.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">Availability</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Status</label>
                <select value={form.status} onChange={e => set('status', e.target.value)} className={inputCls}>
                  {options.status.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Eligibility (who can subscribe)</label>
                <select value={form.eligibility} onChange={e => set('eligibility', e.target.value)} className={inputCls}>
                  {options.eligibility.map(e => <option key={e} value={e}>{e === 'all' ? 'All users' : e}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Sort Order</label>
                <input type="number" min="0" value={form.sortOrder} onChange={e => set('sortOrder', e.target.value)} className={inputCls} />
              </div>
            </div>
            <div className="flex items-center gap-6 mt-3">
              <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
                <input type="checkbox" checked={form.popular} onChange={e => set('popular', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600" />
                Mark as "Most Popular"
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
                <input type="checkbox" checked={form.isDefault} onChange={e => set('isDefault', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600" />
                Set as default plan
              </label>
            </div>
          </div>

          {/* Limits */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">Limits <span className="font-normal text-gray-400 text-xs">(-1 = unlimited)</span></p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Max Job Postings</label>
                <input type="number" min="-1" value={form.maxJobPostings} onChange={e => set('maxJobPostings', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Max Services</label>
                <input type="number" min="-1" value={form.maxServices} onChange={e => set('maxServices', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Max Appointments/Month</label>
                <input type="number" min="-1" value={form.maxAppointmentsPerMonth} onChange={e => set('maxAppointmentsPerMonth', e.target.value)} className={inputCls} />
              </div>
            </div>
          </div>

          {/* Feature flags */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">Feature Flags</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {options.suggestedFeatures.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={!!form.features[key]}
                    onChange={() => toggleFeature(key)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <FiAlertCircle className="h-4 w-4 flex-shrink-0" />{error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Saving…' : initial ? 'Save Changes' : 'Create Plan'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Assign Plan Modal ────────────────────────────────────────────────────────

const ROLES = [
  { value: 'client',       label: 'Patient / Client' },
  { value: 'professional', label: 'Professional' },
  { value: 'hospital',     label: 'Hospital' },
  { value: 'ambulance',    label: 'Ambulance Provider' },
  { value: 'gym-physio',   label: 'Gym & Physio Provider' },
];

interface AssignModalProps {
  plans: Plan[];
  token: string;
  onDone: () => void;
  onClose: () => void;
}

const AssignModal: React.FC<AssignModalProps> = ({ plans, token, onDone, onClose }) => {
  const [mode, setMode]       = useState<'user' | 'role'>('user');
  const [form, setForm]       = useState({ targetUserId: '', targetRole: '', planId: '', reason: '' });
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    if (mode === 'user' && !form.targetUserId.trim()) { setError('User ID is required'); return; }
    if (mode === 'role' && !form.targetRole)           { setError('Select a role'); return; }
    if (!form.planId)                                  { setError('Select a plan'); return; }
    if (!form.reason.trim())                           { setError('Reason is required'); return; }
    setSaving(true); setError('');
    try {
      const body: any = { planId: form.planId, reason: form.reason };
      if (mode === 'user') body.targetUserId = form.targetUserId.trim();
      else                 body.targetRole   = form.targetRole;

      const res  = await fetch(`${API}/admin/plans/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || json.statuscode !== 0) throw new Error(json.message || 'Assignment failed');
      setSuccess(json.message);
      setTimeout(() => { onDone(); onClose(); }, 2000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">Assign Plan</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><FiX className="h-5 w-5 text-gray-500" /></button>
        </div>
        <div className="px-6 py-5 space-y-4">

          {/* Mode toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setMode('user')}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === 'user' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Specific User
            </button>
            <button
              onClick={() => setMode('role')}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === 'role' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Entire Role
            </button>
          </div>

          {/* Input based on mode */}
          {mode === 'user' ? (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">User ID (MongoDB _id)</label>
              <input
                value={form.targetUserId}
                onChange={e => setForm(f => ({ ...f, targetUserId: e.target.value }))}
                className={inputCls}
                placeholder="6b044a858e74ce165f0c5305"
              />
              <p className="mt-1 text-xs text-gray-400">Find the ID in Admin → Patients / Professionals list</p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Assign to all users of role</label>
              <select
                value={form.targetRole}
                onChange={e => setForm(f => ({ ...f, targetRole: e.target.value }))}
                className={inputCls}
              >
                <option value="">— Select role —</option>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              {form.targetRole && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                  ⚠️ This assigns the plan to <strong>all active {ROLES.find(r => r.value === form.targetRole)?.label}</strong> accounts and cancels their current subscriptions.
                </div>
              )}
            </div>
          )}

          {/* Plan selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Plan</label>
            <select value={form.planId} onChange={e => setForm(f => ({ ...f, planId: e.target.value }))} className={inputCls}>
              <option value="">— Select plan —</option>
              {plans.filter(p => p.status === 'active').map(p => (
                <option key={p.id} value={p.id}>
                  {p.planName} ({p.eligibility}) — {(p as any).isFree ? 'Free' : fmt((p as any).effectivePrice ?? p.regularPrice, p.currency)}
                </option>
              ))}
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Reason (audit log)</label>
            <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} rows={2} className={inputCls} placeholder="e.g. Compensation for downtime" />
          </div>

          {error   && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}
        </div>
        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Assigning…' : 'Assign Plan'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

const Plans: React.FC = () => {
  const { admin } = useAdminAuth();
  const isSuperAdmin = admin?.role === 'super_admin';
  const token = localStorage.getItem('admin_access_token') || localStorage.getItem('authToken') || '';

  const [plans, setPlans]           = useState<Plan[]>([]);
  const [options, setOptions]       = useState<PlanOptions | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [editModal, setEditModal]   = useState<Plan | null | 'new'>(null);
  const [assignModal, setAssignModal] = useState(false);
  const [delModal, setDelModal]     = useState<Plan | null>(null);
  const [deleting, setDeleting]     = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [plansRes, optsRes] = await Promise.all([
        fetch(`${API}/admin/plans`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/admin/plans/options`),
      ]);
      const plansJson = await plansRes.json();
      const optsJson  = await optsRes.json();
      if (plansJson.statuscode === 0) setPlans(plansJson.data);
      if (optsJson.statuscode  === 0) setOptions(optsJson.data);
    } catch {
      setError('Failed to load plans');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const flash = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(''), 4000); };

  const handleToggle = async (plan: Plan) => {
    try {
      const res  = await fetch(`${API}/admin/plans/${plan.id}/toggle`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (json.statuscode !== 0) throw new Error(json.message);
      setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, status: json.data.status } : p));
      flash(`${plan.planName} is now ${json.data.status}`);
    } catch (e: any) { setError(e.message); }
  };

  const handleSetDefault = async (plan: Plan) => {
    try {
      const res  = await fetch(`${API}/admin/plans/${plan.id}/default`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (json.statuscode !== 0) throw new Error(json.message);
      setPlans(prev => prev.map(p => ({ ...p, isDefault: p.id === plan.id })));
      flash(`${plan.planName} is now the default plan`);
    } catch (e: any) { setError(e.message); }
  };

  const handleDuplicate = async (plan: Plan) => {
    const name = prompt(`New plan name (copy of "${plan.planName}"):`);
    if (!name) return;
    try {
      const res  = await fetch(`${API}/admin/plans/${plan.id}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ newPlanName: name }),
      });
      const json = await res.json();
      if (json.statuscode !== 0) throw new Error(json.message);
      setPlans(prev => [json.data, ...prev]);
      flash(`"${name}" created as draft`);
    } catch (e: any) { setError(e.message); }
  };

  const handleDelete = async () => {
    if (!delModal) return;
    setDeleting(true);
    try {
      const res  = await fetch(`${API}/admin/plans/${delModal.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (json.statuscode !== 0) throw new Error(json.message);
      setPlans(prev => prev.filter(p => p.id !== delModal.id));
      setDelModal(null);
      flash('Plan deleted');
    } catch (e: any) { setError(e.message); setDelModal(null); }
    finally { setDeleting(false); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
          <p className="text-sm text-gray-500 mt-1">Manage plans for all user types. Changes take effect for new subscriptions.</p>
        </div>
        {isSuperAdmin && (
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => setAssignModal(true)} className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              <FiUserCheck className="h-4 w-4" /> Assign Plan
            </button>
            <button onClick={() => setEditModal('new')} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              <FiPlus className="h-4 w-4" /> New Plan
            </button>
          </div>
        )}
      </div>

      {/* Alerts */}
      {error   && <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"><FiAlertCircle className="h-4 w-4 flex-shrink-0" />{error}</div>}
      {success && <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700"><FiCheck className="h-4 w-4 flex-shrink-0" />{success}</div>}

      {/* Plans grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-56" />)}
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <p className="text-gray-500 text-sm">No plans yet. Create your first plan.</p>
          {isSuperAdmin && (
            <button onClick={() => setEditModal('new')} className="mt-4 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">
              Create Plan
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map(plan => (
            <div key={plan.id} className={`relative bg-white rounded-2xl border-2 p-5 flex flex-col gap-3 ${plan.isDefault ? 'border-blue-500' : 'border-gray-200'}`}>
              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={plan.status} />
                <EligibilityBadge eligibility={plan.eligibility} />
                {plan.popular    && <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">Popular</span>}
                {plan.isDefault  && <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800"><FiStar className="h-3 w-3 mr-1" />Default</span>}
              </div>

              {/* Name & price */}
              <div>
                <h3 className="text-base font-bold text-gray-900">{plan.planName}</h3>
                {plan.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{plan.description}</p>}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-gray-900">{fmt(plan.promotionalPrice > 0 ? plan.promotionalPrice : plan.regularPrice, plan.currency)}</span>
                <span className="text-xs text-gray-500">/{plan.billingInterval}</span>
                {plan.promotionalPrice > 0 && (
                  <span className="text-xs text-gray-400 line-through">{fmt(plan.regularPrice, plan.currency)}</span>
                )}
              </div>

              {/* Features */}
              {Object.keys(plan.features).length > 0 && (
                <ul className="space-y-0.5">
                  {Object.entries(plan.features).filter(([, v]) => v).slice(0, 4).map(([k]) => (
                    <li key={k} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <FiCheck className="h-3 w-3 text-green-500 flex-shrink-0" />
                      {k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                    </li>
                  ))}
                  {Object.values(plan.features).filter(Boolean).length > 4 && (
                    <li className="text-xs text-gray-400">+{Object.values(plan.features).filter(Boolean).length - 4} more</li>
                  )}
                </ul>
              )}

              {/* Actions */}
              {isSuperAdmin && (
                <div className="flex items-center gap-1 pt-1 border-t border-gray-100 mt-auto flex-wrap">
                  <button onClick={() => setEditModal(plan)} title="Edit" className="p-1.5 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600">
                    <FiEdit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleToggle(plan)} title={plan.status === 'active' ? 'Deactivate' : 'Activate'} className="p-1.5 rounded-lg text-gray-500 hover:bg-green-50 hover:text-green-600">
                    {plan.status === 'active' ? <FiToggleRight className="h-4 w-4" /> : <FiToggleLeft className="h-4 w-4" />}
                  </button>
                  <button onClick={() => handleDuplicate(plan)} title="Duplicate" className="p-1.5 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600">
                    <FiCopy className="h-4 w-4" />
                  </button>
                  {!plan.isDefault && plan.status === 'active' && (
                    <button onClick={() => handleSetDefault(plan)} title="Set as default" className="p-1.5 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600">
                      <FiStar className="h-4 w-4" />
                    </button>
                  )}
                  {!plan.isDefault && plan.status !== 'active' && (
                    <button onClick={() => setDelModal(plan)} title="Delete" className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600">
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      {editModal && options && (
        <PlanForm
          initial={editModal === 'new' ? null : editModal}
          options={options}
          token={token}
          onDone={plan => {
            setPlans(prev =>
              editModal === 'new'
                ? [plan, ...prev]
                : prev.map(p => p.id === plan.id ? plan : p)
            );
            setEditModal(null);
            flash(editModal === 'new' ? 'Plan created' : 'Plan updated');
          }}
          onClose={() => setEditModal(null)}
        />
      )}

      {/* Assign modal */}
      {assignModal && (
        <AssignModal plans={plans} token={token} onDone={fetchAll} onClose={() => setAssignModal(false)} />
      )}

      {/* Delete confirmation */}
      {delModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Delete Plan</h3>
            <p className="text-sm text-gray-600">Delete <strong>{delModal.planName}</strong>? This cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDelModal(null)} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plans;
