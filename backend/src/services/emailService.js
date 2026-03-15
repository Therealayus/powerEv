const { sendMail } = require('../config/mail');
const { wrapEmail, escapeHtml, statRow, BRAND } = require('../templates/emailLayout');

/**
 * Send welcome email after partner registration
 */
async function sendPartnerWelcome(to, name) {
  const n = escapeHtml(name);
  const content = `
    <h2 style="margin:0 0 16px;font-size:22px;font-weight:700;color:${BRAND.text};">Welcome, ${n}!</h2>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.5;color:${BRAND.textSecondary};">
      Your partner account is ready. You can now add stations and view sessions at the dashboard.
    </p>
    <p style="margin:0;font-size:15px;color:${BRAND.text};">
      Best,<br><strong>EV Charging Team</strong>
    </p>
  `;
  return sendMail({
    to,
    subject: 'Welcome to EV Charging Partner',
    text: `Hi ${name},\n\nYour partner account is ready. You can now add stations and view sessions at the dashboard.\n\nBest,\nEV Charging Team`,
    html: wrapEmail(content, { title: 'Welcome to EV Charging Partner', preheader: 'Your partner account is ready.' }),
  });
}

/**
 * Send welcome email after user (driver) registration
 */
async function sendUserWelcome(to, name) {
  const n = escapeHtml(name);
  const content = `
    <h2 style="margin:0 0 16px;font-size:22px;font-weight:700;color:${BRAND.text};">Welcome, ${n}!</h2>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.5;color:${BRAND.textSecondary};">
      Use the app to find charging stations, start charging, and view your history.
    </p>
    <p style="margin:0;font-size:15px;color:${BRAND.text};">
      Best,<br><strong>EV Charging Team</strong>
    </p>
  `;
  return sendMail({
    to,
    subject: 'Welcome to EV Charging',
    text: `Hi ${name},\n\nWelcome! Use the app to find charging stations, start charging, and view your history.\n\nBest,\nEV Charging Team`,
    html: wrapEmail(content, { title: 'Welcome to EV Charging', preheader: 'Find stations. Charge. Go.' }),
  });
}

/**
 * Send receipt to user when a charging session completes
 */
async function sendSessionComplete(to, { stationName, unitsConsumed, cost }) {
  const station = escapeHtml(stationName);
  const units = escapeHtml(String(unitsConsumed));
  const costStr = escapeHtml(String(cost));
  const content = `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:${BRAND.text};">Charging complete</h2>
    <p style="margin:0 0 20px;font-size:14px;color:${BRAND.textSecondary};">${station}</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0;">
      ${statRow('Units', `${units} kWh`)}
      ${statRow('Cost', `$${costStr}`)}
    </table>
    <p style="margin:20px 0 0;font-size:14px;color:${BRAND.textSecondary};">
      Thanks for charging with us.
    </p>
  `;
  return sendMail({
    to,
    subject: `Charging complete at ${stationName}`,
    text: `Charging session completed.\nStation: ${stationName}\nUnits: ${unitsConsumed} kWh\nCost: $${cost}`,
    html: wrapEmail(content, { title: `Charging complete at ${stationName}`, preheader: `${unitsConsumed} kWh · $${cost}` }),
  });
}

/**
 * Notify station owner (partner) when a session completes at their station
 */
async function sendPartnerSessionNotification(to, { stationName, unitsConsumed, cost }) {
  const station = escapeHtml(stationName);
  const units = escapeHtml(String(unitsConsumed));
  const costStr = escapeHtml(String(cost));
  const content = `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:${BRAND.primary};">New session</h2>
    <p style="margin:0 0 20px;font-size:14px;color:${BRAND.textSecondary};">A charging session just completed at your station.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0;">
      ${statRow('Station', station)}
      ${statRow('Units', `${units} kWh`)}
      ${statRow('Revenue', `$${costStr}`)}
    </table>
  `;
  return sendMail({
    to,
    subject: `New charging session at ${stationName}`,
    text: `A charging session just completed at your station ${stationName}.\nUnits: ${unitsConsumed} kWh\nRevenue: $${cost}`,
    html: wrapEmail(content, { title: `New session at ${stationName}`, preheader: `+$${cost} revenue` }),
  });
}

/**
 * Send 6-digit OTP for email verification
 */
async function sendEmailVerificationOtp(to, otp) {
  const code = escapeHtml(String(otp));
  const content = `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:${BRAND.text};">Verify your email</h2>
    <p style="margin:0 0 20px;font-size:15px;color:${BRAND.textSecondary};">
      Use this code in the app to confirm your email address.
    </p>
    <div style="background:${BRAND.background};border:2px solid ${BRAND.primary};border-radius:12px;padding:20px 24px;text-align:center;margin:0 0 20px;">
      <span style="font-size:28px;font-weight:700;letter-spacing:8px;color:${BRAND.primary};font-family:ui-monospace,monospace;">${code}</span>
    </div>
    <p style="margin:0 0 8px;font-size:13px;color:${BRAND.textSecondary};">Expires in 10 minutes.</p>
    <p style="margin:0;font-size:13px;color:${BRAND.textSecondary};">If you didn't request this, you can ignore this email.</p>
  `;
  return sendMail({
    to,
    subject: 'Verify your email - EV Charging',
    text: `Your verification code is: ${otp}\n\nIt expires in 10 minutes.\n\nIf you didn't request this, ignore this email.`,
    html: wrapEmail(content, { title: 'Verify your email', preheader: `Your code: ${otp}` }),
  });
}

/**
 * Send 6-digit OTP for password reset
 */
async function sendPasswordResetOtp(to, otp) {
  const code = escapeHtml(String(otp));
  const content = `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:${BRAND.text};">Reset your password</h2>
    <p style="margin:0 0 20px;font-size:15px;color:${BRAND.textSecondary};">
      Use this code in the app to set a new password.
    </p>
    <div style="background:${BRAND.background};border:2px solid ${BRAND.accent};border-radius:12px;padding:20px 24px;text-align:center;margin:0 0 20px;">
      <span style="font-size:28px;font-weight:700;letter-spacing:8px;color:${BRAND.accent};font-family:ui-monospace,monospace;">${code}</span>
    </div>
    <p style="margin:0 0 8px;font-size:13px;color:${BRAND.textSecondary};">Expires in 10 minutes.</p>
    <p style="margin:0;font-size:13px;color:${BRAND.textSecondary};">If you didn't request this, you can ignore this email.</p>
  `;
  return sendMail({
    to,
    subject: 'Password reset - EV Charging',
    text: `Your password reset code is: ${otp}\n\nIt expires in 10 minutes.\n\nIf you didn't request this, ignore this email.`,
    html: wrapEmail(content, { title: 'Password reset', preheader: `Your code: ${otp}` }),
  });
}

module.exports = {
  sendPartnerWelcome,
  sendUserWelcome,
  sendSessionComplete,
  sendPartnerSessionNotification,
  sendEmailVerificationOtp,
  sendPasswordResetOtp,
};
