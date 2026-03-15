/**
 * SMTP / Gmail config for nodemailer
 * For Gmail: use an App Password (not your normal password).
 * Create at: Google Account → Security → 2-Step Verification → App passwords
 */
const nodemailer = require('nodemailer');

const hasSmtpConfig = () =>
  process.env.SMTP_USER && process.env.SMTP_PASSWORD && process.env.SMTP_USER.trim() !== '' && process.env.SMTP_PASSWORD.trim() !== '';

const port = Number(process.env.SMTP_PORT) || 587;
const transporter = hasSmtpConfig()
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port,
      secure: process.env.SMTP_SECURE === 'true' || port === 465,
      requireTLS: port === 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      // Gmail: use App Password (Google Account → Security → 2-Step Verification → App passwords)
    })
  : null;

/**
 * Send an email. No-op if SMTP not configured. Logs errors so you can see why sends fail.
 * @param {Object} options - { to, subject, text, html? }
 */
async function sendMail(options) {
  if (!hasSmtpConfig()) {
    console.warn('[SMTP] Not configured (set SMTP_USER and SMTP_PASSWORD in .env). Email skipped.');
    return { skipped: true };
  }
  const mail = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html || options.text,
  };
  try {
    const info = await transporter.sendMail(mail);
    console.log('[SMTP] Sent:', options.subject, '→', options.to);
    return info;
  } catch (err) {
    console.error('[SMTP] Send failed:', err.message);
    if (err.response) console.error('[SMTP] Server response:', err.response);
    if (err.code) console.error('[SMTP] Code:', err.code);
    if (err.command) console.error('[SMTP] Command:', err.command);
    throw err;
  }
}

/**
 * Verify SMTP connection (e.g. at startup). Resolves to true if OK, false if not configured or failed.
 */
async function verifySmtp() {
  if (!hasSmtpConfig() || !transporter) return false;
  try {
    await transporter.verify();
    return true;
  } catch (err) {
    console.error('[SMTP] Verify failed:', err.message);
    if (err.response) console.error('[SMTP] Response:', err.response);
    return false;
  }
}

module.exports = { sendMail, transporter, hasSmtpConfig, verifySmtp };
