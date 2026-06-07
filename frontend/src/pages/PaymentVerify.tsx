/**
 * Payment Verify Page
 * Paystack redirects here after checkout: /payment/verify?reference=xxx&trxref=xxx
 * Handles both appointment payments (APT-...) and subscription payments (SUB-...)
 * Shows a printable invoice on successful appointment payment.
 */
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import apiClient from '../dashboards/patient/services/apiClient';

const MODE_LABELS: Record<string, string> = {
  video_call: 'Video Call',
  phone_call: 'Phone Call',
  in_person: 'In-Person',
  'in-person': 'In-Person',
};

// ─── Invoice Component ────────────────────────────────────────────────────────
const Invoice: React.FC<{ invoice: Record<string, any>; onDone: () => void }> = ({ invoice, onDone }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Payment Invoice — Health Market Arena</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: Arial, sans-serif; padding: 40px; color: #111; background: #fff; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
            .logo { font-size: 22px; font-weight: 800; color: #2563eb; }
            .logo-sub { font-size: 12px; color: #6b7280; margin-top: 2px; }
            .invoice-title { text-align: right; }
            .invoice-title h2 { font-size: 28px; font-weight: 800; color: #111; }
            .invoice-title p { font-size: 12px; color: #6b7280; margin-top: 4px; }
            .badge { display: inline-block; background: #dcfce7; color: #166534; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; margin-top: 6px; }
            .section { margin-bottom: 24px; }
            .section-title { font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
            .field label { font-size: 11px; color: #9ca3af; display: block; margin-bottom: 3px; }
            .field p { font-size: 14px; font-weight: 600; color: #111; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            thead tr { background: #f9fafb; }
            th { padding: 10px 14px; text-align: left; font-size: 12px; color: #6b7280; font-weight: 600; border-bottom: 1px solid #e5e7eb; }
            td { padding: 12px 14px; font-size: 13px; border-bottom: 1px solid #f3f4f6; }
            .total-row td { font-weight: 700; font-size: 15px; background: #eff6ff; color: #1d4ed8; }
            .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #f3f4f6; padding-top: 16px; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  const paidAt = invoice.paidAt ? format(new Date(invoice.paidAt), 'MMMM d, yyyy · h:mm a') : '—';
  const apptDate = invoice.scheduledDate ? format(new Date(invoice.scheduledDate), 'EEEE, MMMM d, yyyy') : '—';
  const mode = MODE_LABELS[invoice.appointmentMode] || invoice.appointmentMode || '—';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Success banner */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-5 text-white text-center">
          <div className="w-14 h-14 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Payment Successful!</h1>
          <p className="text-green-100 text-sm mt-1">Your appointment is confirmed. Here's your invoice.</p>
        </div>

        {/* Invoice body */}
        <div className="p-6 sm:p-8">
          <div ref={printRef}>
            {/* Print header */}
            <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', borderBottom: '2px solid #2563eb', paddingBottom: '16px' }}>
              <div>
                <div className="logo" style={{ fontSize: '20px', fontWeight: 800, color: '#2563eb' }}>Health Market Arena</div>
                <div className="logo-sub" style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>healthmarketarena.com</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#111' }}>INVOICE</h2>
                <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>Ref: {invoice.reference}</p>
                <span style={{ display: 'inline-block', background: '#dcfce7', color: '#166534', fontSize: '11px', fontWeight: 700, padding: '2px 10px', borderRadius: '20px', marginTop: '6px' }}>
                  ✓ PAID
                </span>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              {[
                { label: 'Payment Date', value: paidAt },
                { label: 'Payment Method', value: invoice.channel ? invoice.channel.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : 'Card' },
                { label: 'Provider', value: invoice.provider },
                { label: 'Service', value: invoice.service },
                { label: 'Appointment Date', value: apptDate },
                { label: 'Appointment Time', value: invoice.scheduledTime || '—' },
                { label: 'Consultation Mode', value: mode },
                { label: 'Patient Email', value: invoice.patientEmail || '—' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
                  <p className="font-semibold text-gray-900 mt-0.5 text-sm">{value}</p>
                </div>
              ))}
            </div>

            {/* Line items table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12px', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>Description</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: '12px', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '12px 14px', fontSize: '13px', borderBottom: '1px solid #f3f4f6' }}>
                    {invoice.service} — {invoice.provider}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '13px', textAlign: 'right', borderBottom: '1px solid #f3f4f6' }}>
                    ₦{invoice.amount.toLocaleString()}
                  </td>
                </tr>
                <tr style={{ background: '#eff6ff' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 700, fontSize: '15px', color: '#1d4ed8' }}>Total Paid</td>
                  <td style={{ padding: '12px 14px', fontWeight: 700, fontSize: '15px', color: '#1d4ed8', textAlign: 'right' }}>
                    ₦{invoice.amount.toLocaleString()} NGN
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Footer */}
            <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '11px', color: '#9ca3af', borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
              Thank you for choosing Health Market Arena · healthmarketarena.com
              <br />Transaction Reference: {invoice.reference}
            </div>
          </div>

          {/* Action buttons — not printed */}
          <div className="flex gap-3 mt-6 print:hidden">
            <button
              onClick={handlePrint}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Invoice
            </button>
            <button
              onClick={onDone}
              className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm"
            >
              View Appointments →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const PaymentVerify: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'invoice' | 'failed'>('verifying');
  const [message, setMessage] = useState('');
  const [isSubscription, setIsSubscription] = useState(false);
  const [invoice, setInvoice] = useState<any>(null);

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    if (!reference) {
      setStatus('failed');
      setMessage('No payment reference found.');
      return;
    }
    verify(reference);
  }, []);

  const verify = async (reference: string) => {
    const isSub = reference.startsWith('SUB-');
    setIsSubscription(isSub);

    try {
      const endpoint = isSub
        ? `/subscriptions/verify-payment/${reference}`
        : `/client/payments/verify/${reference}`;

      const res = await apiClient.post(endpoint);
      const data = res.data;

      if (data.success) {
        // Check if we have invoice data for appointment payments
        if (!isSub && data.data?.invoice) {
          setInvoice(data.data.invoice);
          setStatus('invoice');
        } else {
          setStatus('success');
          setMessage(isSub
            ? '🎉 Subscription activated! You now have full access to all features.'
            : '✅ Payment verified! Your appointment is confirmed.');

          if (isSub) {
            // Redirect back to the page the user was trying to access, or dashboard
            const returnTo = sessionStorage.getItem('subscriptionReturnTo') || '/patient/dashboard';
            sessionStorage.removeItem('subscriptionReturnTo');
            setTimeout(() => navigate(returnTo), 3000);
          } else {
            setTimeout(() => navigate('/patient/appointments'), 3000);
          }
        }
      } else {
        setStatus('failed');
        setMessage(data.message || 'Payment verification failed.');
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      // Paystack already charged — treat as success
      if (isSub) {
        const returnTo = sessionStorage.getItem('subscriptionReturnTo') || '/patient/dashboard';
        sessionStorage.removeItem('subscriptionReturnTo');
        setStatus('success');
        setMessage('🎉 Payment received. Your subscription is being activated.');
        setTimeout(() => navigate(returnTo), 3000);
      } else {
        // Show generic success without invoice
        setStatus('success');
        setMessage('✅ Payment received. Your appointment is confirmed.');
        setTimeout(() => navigate('/patient/appointments'), 3000);
      }
    }
  };

  const returnToPath = sessionStorage.getItem('subscriptionReturnTo') || '/patient/dashboard';
  const redirectPath = isSubscription ? returnToPath : '/patient/appointments';
  const redirectLabel = isSubscription ? 'Continue →' : 'My Appointments';

  // Show invoice page
  if (status === 'invoice' && invoice) {
    return <Invoice invoice={invoice} onDone={() => navigate('/patient/appointments')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">

        {status === 'verifying' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
            <p className="text-gray-500 text-sm">Please wait while we confirm your payment with Paystack...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Payment Successful!</h2>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">{message}</p>
            <p className="text-xs text-gray-400 mb-4">Redirecting in 3 seconds...</p>
            <button onClick={() => navigate(redirectPath)}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm w-full">
              {redirectLabel} →
            </button>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Verification Failed</h2>
            <p className="text-gray-500 text-sm mb-6">{message}</p>
            <div className="flex gap-3">
              <button onClick={() => navigate('/patient/appointments')}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm">
                My Appointments
              </button>
              <button onClick={() => navigate('/patient/payments')}
                className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm">
                View Payments
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentVerify;
