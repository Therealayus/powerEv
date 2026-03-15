/**
 * Branded HTML email layout for EV Charging.
 * Uses BRANDING colors: dark bg #0F172A, card #1E293B, primary #22C55E, accent #3B82F6.
 */

const BRAND = {
  background: '#0F172A',
  card: '#1E293B',
  primary: '#22C55E',
  accent: '#3B82F6',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: '#334155',
};

/**
 * Wrap content in full branded HTML email.
 * @param {string} contentHtml - Inner HTML (body content)
 * @param {{ title?: string, preheader?: string }} options - Optional title for header, preheader for inbox preview
 * @returns {string} Full HTML document
 */
function wrapEmail(contentHtml, options = {}) {
  const title = options.title || 'EV Charging';
  const preheader = options.preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${options.preheader}</div>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(title)}</title>
  ${preheader}
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; background-color: ${BRAND.background}; }
    table { border-collapse: collapse; mso-table-lspace: 0; mso-table-rspace: 0; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    a { color: ${BRAND.primary}; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.background};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen-Sans,Ubuntu,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:${BRAND.background};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" style="max-width:560px;" cellspacing="0" cellpadding="0">
          <!-- Header -->
          <tr>
            <td style="padding:24px 24px 20px;background:linear-gradient(135deg,${BRAND.card} 0%,#0F172A 100%);border-radius:12px 12px 0 0;border:1px solid ${BRAND.border};border-bottom:none;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="display:inline-block;width:10px;height:10px;background-color:${BRAND.primary};border-radius:50%;margin-right:10px;vertical-align:middle;"></span>
                    <span style="font-size:20px;font-weight:700;color:${BRAND.text};letter-spacing:-0.02em;">EV Charging</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:28px 24px;background-color:${BRAND.card};border:1px solid ${BRAND.border};border-top:none;border-radius:0 0 12px 12px;">
              ${contentHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 24px;text-align:center;">
              <p style="margin:0;font-size:12px;color:${BRAND.textSecondary};">
                © ${new Date().getFullYear()} EV Charging. Find stations. Charge. Go.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(s) {
  if (typeof s !== 'string') return '';
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Helper: primary CTA button HTML
 */
function buttonHtml(text, url) {
  return `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:24px 0 0;"><tr><td style="border-radius:8px;background:linear-gradient(135deg,${BRAND.primary},#16A34A);"><a href="${escapeHtml(url)}" target="_blank" style="display:inline-block;padding:14px 28px;font-size:16px;font-weight:600;color:${BRAND.text};">${escapeHtml(text)}</a></td></tr></table>`;
}

/**
 * Helper: single stat row (label + value)
 */
function statRow(label, value) {
  return `<tr><td style="padding:8px 0;border-bottom:1px solid ${BRAND.border};"><span style="color:${BRAND.textSecondary};font-size:14px;">${escapeHtml(label)}</span></td><td style="padding:8px 0;border-bottom:1px solid ${BRAND.border};text-align:right;"><strong style="color:${BRAND.text};font-size:16px;">${escapeHtml(value)}</strong></td></tr>`;
}

module.exports = { wrapEmail, escapeHtml, buttonHtml, statRow, BRAND };
