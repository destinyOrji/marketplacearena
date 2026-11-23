/**
 * Central Email Service
 * All outgoing emails go through here.
 * Configure via environment variables — never hardcode credentials.
 *
 * Required .env keys:
 *   EMAIL_USER   — the Gmail address that sends (e.g. noreply@healthmarketarena.com)
 *   EMAIL_PASS   — the Gmail App Password (16-char, no spaces)
 *   EMAIL_FROM   — display name shown to recipients (default: "Health Market Arena")
 *   EMAIL_HOST   — SMTP host (default: smtp.gmail.com)
 *   EMAIL_PORT   — SMTP port (default: 587)
 */

const nodemailer = require('nodemailer');

// ─── Transporter (created once, reused) ──────────────────────────────────────

let _transporter = null;

const getTransporter = () => {
    if (_transporter) return _transporter;

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        return null; // dev mode — emails logged to console
    }

    _transporter = nodemailer.createTransport({
        host:   process.env.EMAIL_HOST || 'smtp.gmail.com',
        port:   parseInt(process.env.EMAIL_PORT || '587'),
        secure: false, // TLS via STARTTLS
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        // Reconnect if the connection drops
        pool: true,
        maxConnections: 5,
    });

    return _transporter;
};

// ─── From address ─────────────────────────────────────────────────────────────

const fromAddress = () => {
    const name = process.env.EMAIL_FROM || 'Health Market Arena';
    const user = process.env.EMAIL_USER || 'noreply@healthmarketarena.com';
    return `"${name}" <${user}>`;
};

// ─── Core send function ───────────────────────────────────────────────────────

/**
 * Send an email.
 * @param {object} opts  - { to, subject, html, text }
 * @returns {Promise<void>}
 */
const sendEmail = async ({ to, subject, html, text }) => {
    const transporter = getTransporter();

    if (!transporter) {
        // Dev / no-credentials mode — log instead of sending
        console.log('\n📧 [EMAIL - no credentials configured]');
        console.log(`   To:      ${to}`);
        console.log(`   Subject: ${subject}`);
        if (text) console.log(`   Body:    ${text}`);
        console.log('');
        return;
    }

    await transporter.sendMail({
        from:    fromAddress(),
        to,
        subject,
        html,
        text: text || undefined,
    });

    console.log(`📧 Email sent → ${to} | "${subject}"`);
};

// ─── Branded HTML wrapper ─────────────────────────────────────────────────────

const brandedHtml = (bodyHtml) => `
<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px;">
  <div style="text-align:center;margin-bottom:24px;">
    <h2 style="color:#2563eb;margin:0;">Health Market Arena</h2>
    <p style="color:#6b7280;margin:4px 0 0;">healthmarketarena.com</p>
  </div>
  <div style="background:#ffffff;border-radius:8px;padding:24px;">
    ${bodyHtml}
  </div>
  <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:20px;">
    © ${new Date().getFullYear()} Health Market Arena · You received this because you have an account with us.
  </p>
</div>`;

// ─── Pre-built email types ────────────────────────────────────────────────────

/**
 * Send email OTP verification code.
 */
const sendOTPEmail = async (email, otpCode) => {
    await sendEmail({
        to: email,
        subject: 'Your Health Market Arena Verification Code',
        html: brandedHtml(`
          <p style="color:#374151;margin-top:0;">Use the code below to verify your email address.
          It expires in <strong>10 minutes</strong>.</p>
          <div style="text-align:center;margin:24px 0;">
            <div style="font-size:38px;font-weight:bold;letter-spacing:14px;color:#2563eb;
                        background:#eff6ff;border-radius:8px;padding:16px 24px;display:inline-block;">
              ${otpCode}
            </div>
          </div>
          <p style="color:#6b7280;font-size:13px;text-align:center;margin-bottom:0;">
            If you did not request this code, you can safely ignore this email.
          </p>`),
        text: `Your Health Market Arena verification code is: ${otpCode}\n\nIt expires in 10 minutes.`,
    });
};

/**
 * Send password reset OTP.
 */
const sendPasswordResetEmail = async (email, otpCode) => {
    await sendEmail({
        to: email,
        subject: 'Password Reset Code — Health Market Arena',
        html: brandedHtml(`
          <p style="color:#374151;margin-top:0;">
            You requested a password reset. Use the code below — it expires in <strong>10 minutes</strong>.
          </p>
          <div style="text-align:center;margin:24px 0;">
            <div style="font-size:38px;font-weight:bold;letter-spacing:14px;color:#2563eb;
                        background:#eff6ff;border-radius:8px;padding:16px 24px;display:inline-block;">
              ${otpCode}
            </div>
          </div>
          <p style="color:#6b7280;font-size:13px;text-align:center;margin-bottom:0;">
            If you did not request a password reset, please ignore this email.
            Your password will not change.
          </p>`),
        text: `Your Health Market Arena password reset code is: ${otpCode}\n\nIt expires in 10 minutes.\n\nIf you did not request this, ignore this email.`,
    });
};

/**
 * Verify the SMTP connection — useful for a health-check endpoint.
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
const verifyConnection = async () => {
    const transporter = getTransporter();
    if (!transporter) return { ok: false, error: 'EMAIL_USER / EMAIL_PASS not configured' };
    try {
        await transporter.verify();
        return { ok: true };
    } catch (err) {
        return { ok: false, error: err.message };
    }
};

module.exports = {
    sendEmail,
    sendOTPEmail,
    sendPasswordResetEmail,
    verifyConnection,
};
