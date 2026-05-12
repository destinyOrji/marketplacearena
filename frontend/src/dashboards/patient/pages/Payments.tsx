import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '../components';
import { paymentsApi } from '../services/api';
import { format } from 'date-fns';
import { showErrorToast } from '../utils/toast';
import { useNavigate } from 'react-router-dom';

type PaymentStatus = 'all' | 'completed' | 'pending' | 'failed';

const STATUS_STYLES: Record<string, { badge: string; dot: string; icon: string }> = {
  completed: { badge: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500', icon: '✅' },
  pending:   { badge: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500', icon: '⏳' },
  failed:    { badge: 'bg-red-100 text-red-600 border-red-200',       dot: 'bg-red-500',   icon: '❌' },
};

// ─── Invoice Modal ────────────────────────────────────────────────────────────
const InvoiceModal: React.FC<{ payment: any; onClose: () => void }> = ({ payment, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>Invoice - ${payment.reference || payment.id}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #111; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
        .logo { font-size: 22px; font-weight: bold; color: #2563eb; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .paid { background: #dcfce7; color: #15803d; }
        .pending { background: #fef3c7; color: #b45309; }
        .failed { background: #fee2e2; color: #dc2626; }
        table { width: 100%; border-collapse: collapse; margin-top: 24px; }
        th { background: #f9fafb; padding: 10px 16px; text-align: left; font-size: 12px; text-transform: uppercase; color: #6b7280; }
        td { padding: 12px 16px; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
        .total-row td { font-weight: bold; font-size: 16px; border-top: 2px solid #e5e7eb; }
        .footer { margin-top: 40px; text-align: center; color: #9ca3af; font-size: 12px; }
      </style></head><body>${content}</body></html>
    `);
    win.document.close();
    win.print();
  };

  const statusStyle = STATUS_STYLES[payment.status] || STATUS_STYLES.pending;
  const invoiceNum = `INV-${String(payment.id).slice(-8).toUpperCase()}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-base font-bold text-gray-900">Payment Invoice</h3>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
            <button onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Invoice content */}
        <div className="overflow-y-auto flex-1 p-6">
          <div ref={printRef}>
            {/* Invoice header */}
            <div className="header flex items-start justify-between mb-6">
              <div>
                <div className="logo text-xl font-bold text-blue-600">Health Market Arena</div>
                <p className="text-xs text-gray-500 mt-1">healthmarketarena.com</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{invoiceNum}</p>
                <span className={`badge inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${statusStyle.badge}`}>
                  {payment.status}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-4" />

            {/* Details */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Date</p>
                <p className="font-semibold text-gray-900">
                  {payment.date ? format(new Date(payment.date), 'MMMM d, yyyy') : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Reference</p>
                <p className="font-mono font-semibold text-gray-900 text-xs">{payment.reference || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Provider</p>
                <p className="font-semibold text-gray-900">{payment.provider || 'Healthcare Provider'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Payment Method</p>
                <p className="font-semibold text-gray-900 capitalize">{payment.method || 'Paystack'}</p>
              </div>
            </div>

            {/* Line items */}
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 text-gray-800">{payment.service || 'Consultation'}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">₦{(payment.amount || 0).toLocaleString()}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200">
                  <td className="px-4 py-3 font-bold text-gray-900">Total</td>
                  <td className="px-4 py-3 text-right font-bold text-blue-600 text-lg">₦{(payment.amount || 0).toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>

            {/* Footer */}
            <div className="footer mt-6 text-center text-xs text-gray-400 border-t border-gray-100 pt-4">
              <p>Thank you for using Health Market Arena</p>
              <p className="mt-1">For support: support@healthmarketarena.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const Payments: React.FC = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<PaymentStatus>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [invoicePayment, setInvoicePayment] = useState<any | null>(null);

  useEffect(() => { fetchPayments(); }, [statusFilter, dateRange]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (dateRange.start) params.startDate = dateRange.start;
      if (dateRange.end) params.endDate = dateRange.end;

      const res = await paymentsApi.getPayments(params);
      const data = (res.data?.data as any) ?? res.data ?? [];
      setPayments(Array.isArray(data) ? data : []);
    } catch {
      showErrorToast('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  // Summary stats
  const totalPaid = payments.filter(p => p.status === 'completed').reduce((s, p) => s + (p.amount || 0), 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + (p.amount || 0), 0);
  const countCompleted = payments.filter(p => p.status === 'completed').length;
  const countPending = payments.filter(p => p.status === 'pending').length;

  const hasFilters = statusFilter !== 'all' || dateRange.start || dateRange.end;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
            <p className="text-sm text-gray-500 mt-0.5">Your payment history and invoices</p>
          </div>
          <button onClick={() => navigate('/patient/browse-services')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Book Consultation
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Paid', value: `₦${totalPaid.toLocaleString()}`, icon: '💳', color: 'bg-green-50 text-green-600' },
            { label: 'Pending', value: `₦${totalPending.toLocaleString()}`, icon: '⏳', color: 'bg-amber-50 text-amber-600' },
            { label: 'Completed', value: countCompleted, icon: '✅', color: 'bg-blue-50 text-blue-600' },
            { label: 'Pending Count', value: countPending, icon: '🔔', color: 'bg-purple-50 text-purple-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-4">
              <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center text-lg mb-2`}>{s.icon}</div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Status</label>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as PaymentStatus)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="all">All Payments</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">From</label>
              <input type="date" value={dateRange.start} onChange={e => setDateRange(d => ({ ...d, start: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">To</label>
              <input type="date" value={dateRange.end} onChange={e => setDateRange(d => ({ ...d, end: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
          {hasFilters && (
            <button onClick={() => { setStatusFilter('all'); setDateRange({ start: '', end: '' }); }}
              className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium">
              Clear filters
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            </div>
          ) : payments.length === 0 ? (
            <div className="p-16 text-center">
              <div className="text-5xl mb-4">💳</div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">No payments found</h3>
              <p className="text-sm text-gray-500">
                {hasFilters ? 'Try adjusting your filters' : 'Your payment history will appear here after booking'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    {['Date', 'Service', 'Provider', 'Amount', 'Method', 'Status', 'Invoice'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {payments.map((p: any) => {
                    const style = STATUS_STYLES[p.status] || STATUS_STYLES.pending;
                    return (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">
                          {p.date ? format(new Date(p.date), 'MMM d, yyyy') : '—'}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-800 max-w-[160px] truncate">
                          {p.service || 'Consultation'}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                          {p.provider || '—'}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-gray-900">₦{(p.amount || 0).toLocaleString()}</span>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap capitalize">
                          {p.method || 'Paystack'}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${style.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                            {p.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          {p.status === 'completed' ? (
                            <button onClick={() => setInvoicePayment(p)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Invoice
                            </button>
                          ) : p.status === 'pending' ? (
                            <button onClick={() => navigate('/patient/book-consultation')}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors">
                              Pay Now
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Modal */}
      {invoicePayment && (
        <InvoiceModal payment={invoicePayment} onClose={() => setInvoicePayment(null)} />
      )}
    </DashboardLayout>
  );
};

export default Payments;
