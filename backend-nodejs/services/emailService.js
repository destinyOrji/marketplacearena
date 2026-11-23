/**
 * Central Email Service
 * All outgoing emails go through here.
 *
 * Required .env keys:
 *   EMAIL_USER   — Gmail address that sends  (e.g. healthmarketarena@gmail.com)
 *   EMAIL_PASS   — Gmail App Password (16 chars, no spaces)
 *   EMAIL_FROM   — Display name shown to recipients (default: Health Market Arena)
 *   EMAIL_HOST   — SMTP host (default: smtp.gmail.com)
 *   EMAIL_PORT   — SMTP port (default: 587)
 */

const nodemailer = require('nodemailer');

// ─── Transporter (singleton) ──────────────────────────────────────────────────

let _transporter = null;

const getTransporter = () => {
    if (_transporter) return _transporter;
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;

    _transporter = nodemailer.createTransport({
        host:   process.env.EMAIL_HOST || 'smtp.gmail.com',
        port:   parseInt(process.env.EMAIL_PORT || '587'),
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        pool: true,
        maxConnections: 5,
    });

    return _transporter;
};

const fromAddress = () => {
    const name = process.env.EMAIL_FROM || 'Health Market Arena';
    const user = process.env.EMAIL_USER || 'noreply@healthmarketarena.com';
    return `"${name}" <${user}>`;
};

// ─── Core send ────────────────────────────────────────────────────────────────

const sendEmail = async ({ to, subject, html, text }) => {
    const transporter = getTransporter();

    if (!transporter) {
        console.log('\n📧 [EMAIL - credentials not configured]');
        console.log(`   To:      ${to}`);
        console.log(`   Subject: ${subject}`);
        if (text) console.log(`   Body:    ${text}`);
        console.log('');
        return;
    }

    await transporter.sendMail({ from: fromAddress(), to, subject, html, text: text || undefined });
    console.log(`📧 Email sent → ${to} | "${subject}"`);
};

// ─── Shared design tokens ─────────────────────────────────────────────────────

const BRAND_BLUE   = '#2563EB';
const BRAND_DARK   = '#1E3A5F';
const LIGHT_BG     = '#F0F4FF';
const WHITE        = '#FFFFFF';
const GRAY_TEXT    = '#6B7280';
const DARK_TEXT    = '#111827';
const BORDER_COLOR = '#E5E7EB';
const SITE_URL     = process.env.FRONTEND_URL || 'https://healthmarketarena.com';
const YEAR         = new Date().getFullYear();

// ─── Base wrapper ─────────────────────────────────────────────────────────────

const baseTemplate = ({ preheader = '', body }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Health Market Arena</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${LIGHT_BG};font-family:'Segoe UI',Helvetica,Arial,sans-serif;-webkit-text-size-adjust:100%;">

  <!-- Preheader (hidden preview text) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${LIGHT_BG};padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;margin:0 auto;">

          <!-- Logo header -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:${BRAND_BLUE};border-radius:12px;padding:14px 28px;">
                    <span style="color:${WHITE};font-size:20px;font-weight:700;letter-spacing:-0.3px;text-decoration:none;">
                      &#9679; Health Market Arena
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:${WHITE};border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden;">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:28px 20px 0;">
              <p style="margin:0 0 8px;font-size:13px;color:${GRAY_TEXT};">
                &copy; ${YEAR} Health Market Arena &nbsp;&bull;&nbsp;
                <a href="${SITE_URL}" style="color:${BRAND_BLUE};text-decoration:none;">healthmarketarena.com</a>
              </p>
              <p style="margin:0;font-size:12px;color:#9CA3AF;">
                You received this email because you have an account with us.<br/>
                If you did not request this, you can safely ignore it.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

// ─── OTP Verification Email ───────────────────────────────────────────────────

const otpEmailHtml = (otpCode) => baseTemplate({
    preheader: `Your verification code is ${otpCode} — expires in 10 minutes.`,
    body: `
      <!-- Blue top bar -->
      <div style="background:linear-gradient(135deg,${BRAND_BLUE} 0%,${BRAND_DARK} 100%);padding:36px 40px 32px;text-align:center;">
        <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:50%;width:64px;height:64px;line-height:64px;font-size:28px;margin-bottom:16px;">
          ✉️
        </div>
        <h1 style="margin:0;color:${WHITE};font-size:24px;font-weight:700;letter-spacing:-0.3px;">
          Verify Your Email
        </h1>
        <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:15px;">
          Health Market Arena Account Verification
        </p>
      </div>

      <!-- Body -->
      <div style="padding:36px 40px;">
        <p style="margin:0 0 20px;color:${DARK_TEXT};font-size:16px;line-height:1.6;">
          Hi there! You requested to verify your email address. Use the code below to complete your verification.
        </p>

        <!-- OTP Box -->
        <div style="background:${LIGHT_BG};border:2px solid ${BRAND_BLUE};border-radius:12px;padding:28px 20px;text-align:center;margin:0 0 24px;">
          <p style="margin:0 0 8px;color:${GRAY_TEXT};font-size:13px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">
            Your Verification Code
          </p>
          <div style="font-size:48px;font-weight:800;letter-spacing:16px;color:${BRAND_BLUE};font-family:'Courier New',monospace;padding:8px 0;">
            ${otpCode}
          </div>
          <p style="margin:12px 0 0;color:${GRAY_TEXT};font-size:13px;">
            ⏱ Expires in <strong>10 minutes</strong>
          </p>
        </div>

        <!-- Steps -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          <tr>
            <td style="background:#F9FAFB;border-radius:8px;padding:16px 20px;border-left:4px solid ${BRAND_BLUE};">
              <p style="margin:0;color:${DARK_TEXT};font-size:14px;line-height:1.6;">
                <strong>How to use this code:</strong><br/>
                1. Go back to the Health Market Arena app<br/>
                2. Enter the 6-digit code shown above<br/>
                3. Your account will be verified instantly
              </p>
            </td>
          </tr>
        </table>

        <p style="margin:0;color:${GRAY_TEXT};font-size:13px;line-height:1.6;border-top:1px solid ${BORDER_COLOR};padding-top:20px;">
          🔒 <strong>Security tip:</strong> Never share this code with anyone. Health Market Arena staff will never ask for your verification code.
        </p>
      </div>
    `
});

// ─── Password Reset Email ─────────────────────────────────────────────────────

const passwordResetHtml = (otpCode) => baseTemplate({
    preheader: `Your password reset code is ${otpCode} — expires in 10 minutes.`,
    body: `
      <!-- Orange/warning top bar -->
      <div style="background:linear-gradient(135deg,#D97706 0%,#B45309 100%);padding:36px 40px 32px;text-align:center;">
        <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:50%;width:64px;height:64px;line-height:64px;font-size:28px;margin-bottom:16px;">
          🔑
        </div>
        <h1 style="margin:0;color:${WHITE};font-size:24px;font-weight:700;letter-spacing:-0.3px;">
          Reset Your Password
        </h1>
        <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:15px;">
          Health Market Arena Password Recovery
        </p>
      </div>

      <!-- Body -->
      <div style="padding:36px 40px;">
        <p style="margin:0 0 20px;color:${DARK_TEXT};font-size:16px;line-height:1.6;">
          We received a request to reset the password for your Health Market Arena account. Use the code below to set a new password.
        </p>

        <!-- OTP Box -->
        <div style="background:#FFFBEB;border:2px solid #D97706;border-radius:12px;padding:28px 20px;text-align:center;margin:0 0 24px;">
          <p style="margin:0 0 8px;color:#92400E;font-size:13px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">
            Password Reset Code
          </p>
          <div style="font-size:48px;font-weight:800;letter-spacing:16px;color:#D97706;font-family:'Courier New',monospace;padding:8px 0;">
            ${otpCode}
          </div>
          <p style="margin:12px 0 0;color:#92400E;font-size:13px;">
            ⏱ Expires in <strong>10 minutes</strong>
          </p>
        </div>

        <!-- Warning box -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          <tr>
            <td style="background:#FEF2F2;border-radius:8px;padding:16px 20px;border-left:4px solid #DC2626;">
              <p style="margin:0;color:#991B1B;font-size:14px;line-height:1.6;">
                <strong>⚠️ Didn't request this?</strong><br/>
                If you did not request a password reset, ignore this email. Your password will not change and your account remains secure.
              </p>
            </td>
          </tr>
        </table>

        <p style="margin:0;color:${GRAY_TEXT};font-size:13px;line-height:1.6;border-top:1px solid ${BORDER_COLOR};padding-top:20px;">
          🔒 <strong>Security tip:</strong> Never share this code with anyone. Health Market Arena staff will never ask for your reset code.
        </p>
      </div>
    `
});

// ─── Welcome Email ────────────────────────────────────────────────────────────

const welcomeEmailHtml = (firstName, role) => {
    const roleLabel = {
        patient:     'Patient',
        professional:'Healthcare Professional',
        hospital:    'Hospital',
        ambulance:   'Emergency Service Provider',
        gym_physio:  'Gym & Physio Provider',
        'gym-physio':'Gym & Physio Provider',
    }[role] || 'Member';

    return baseTemplate({
        preheader: `Welcome to Health Market Arena, ${firstName}! Your account is ready.`,
        body: `
          <!-- Green top bar -->
          <div style="background:linear-gradient(135deg,#059669 0%,#047857 100%);padding:36px 40px 32px;text-align:center;">
            <div style="font-size:48px;margin-bottom:12px;">🎉</div>
            <h1 style="margin:0;color:${WHITE};font-size:24px;font-weight:700;letter-spacing:-0.3px;">
              Welcome to Health Market Arena!
            </h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:15px;">
              Your ${roleLabel} account is ready
            </p>
          </div>

          <!-- Body -->
          <div style="padding:36px 40px;">
            <p style="margin:0 0 20px;color:${DARK_TEXT};font-size:16px;line-height:1.6;">
              Hi <strong>${firstName}</strong>! 👋<br/><br/>
              Your Health Market Arena account has been created successfully. You can now log in and start using all the features available to you.
            </p>

            <!-- CTA Button -->
            <div style="text-align:center;margin:28px 0;">
              <a href="${SITE_URL}/auth/login"
                style="display:inline-block;background-color:#059669;color:${WHITE};font-size:16px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:8px;letter-spacing:0.2px;">
                Go to Dashboard →
              </a>
            </div>

            <!-- Features -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td style="background:#F9FAFB;border-radius:8px;padding:20px 24px;">
                  <p style="margin:0 0 12px;color:${DARK_TEXT};font-size:14px;font-weight:700;">What you can do:</p>
                  <p style="margin:0;color:${GRAY_TEXT};font-size:14px;line-height:2;">
                    ✅ &nbsp;Book and manage appointments<br/>
                    ✅ &nbsp;Access emergency services<br/>
                    ✅ &nbsp;View medical records<br/>
                    ✅ &nbsp;Connect with healthcare professionals
                  </p>
                </td>
              </tr>
            </table>

            <p style="margin:0;color:${GRAY_TEXT};font-size:13px;line-height:1.6;border-top:1px solid ${BORDER_COLOR};padding-top:20px;">
              Need help? Contact us at
              <a href="mailto:support@healthmarketarena.com" style="color:${BRAND_BLUE};text-decoration:none;">support@healthmarketarena.com</a>
            </p>
          </div>
        `
    });
};

// ─── Exported functions ───────────────────────────────────────────────────────

/**
 * Send email OTP verification code.
 */
const sendOTPEmail = async (email, otpCode) => {
    await sendEmail({
        to:      email,
        subject: `${otpCode} is your Health Market Arena verification code`,
        html:    otpEmailHtml(otpCode),
        text:    `Your Health Market Arena verification code is: ${otpCode}\n\nIt expires in 10 minutes.\n\nIf you did not request this, ignore this email.`,
    });
};

/**
 * Send password reset OTP.
 */
const sendPasswordResetEmail = async (email, otpCode) => {
    await sendEmail({
        to:      email,
        subject: `${otpCode} is your Health Market Arena password reset code`,
        html:    passwordResetHtml(otpCode),
        text:    `Your Health Market Arena password reset code is: ${otpCode}\n\nIt expires in 10 minutes.\n\nIf you did not request this, ignore this email.`,
    });
};

/**
 * Send welcome email after successful registration.
 * @param {string} email
 * @param {string} firstName
 * @param {string} role
 */
const sendWelcomeEmail = async (email, firstName, role) => {
    await sendEmail({
        to:      email,
        subject: `Welcome to Health Market Arena, ${firstName}!`,
        html:    welcomeEmailHtml(firstName, role),
        text:    `Hi ${firstName},\n\nWelcome to Health Market Arena! Your account has been created successfully.\n\nLog in at: ${SITE_URL}/auth/login\n\nIf you have any questions, contact support@healthmarketarena.com`,
    });
};

/**
 * Verify the SMTP connection.
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
    sendWelcomeEmail,
    verifyConnection,
};
