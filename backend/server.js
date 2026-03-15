require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const { hasSmtpConfig, verifySmtp } = require('./src/config/mail');

const authRoutes = require('./src/routes/authRoutes');
const stationRoutes = require('./src/routes/stationRoutes');
const chargingRoutes = require('./src/routes/chargingRoutes');
const partnerRoutes = require('./src/routes/partnerRoutes');
const feedbackRoutes = require('./src/routes/feedbackRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const termsRoutes = require('./src/routes/termsRoutes');

connectDB();

// Log SMTP status at startup so you can see if email will work
(async () => {
  if (!hasSmtpConfig()) {
    console.log('SMTP: not configured (emails will be skipped). Set SMTP_USER and SMTP_PASSWORD in .env for OTP/welcome emails.');
    return;
  }
  const ok = await verifySmtp();
  if (ok) console.log('SMTP: connected successfully');
  else console.log('SMTP: configured but connection failed. Check SMTP_* in .env (Gmail needs App Password).');
})();

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/', (req, res) => {
  res.json({
    name: 'EV Charging API',
    version: '1.0',
    endpoints: {
      health: '/health',
      auth: [
        'POST /api/auth/register',
        'POST /api/auth/login',
        'POST /api/auth/send-verification-otp',
        'POST /api/auth/verify-email',
        'POST /api/auth/forgot-password',
        'POST /api/auth/reset-password',
      ],
      stations: '/api/stations',
      charging: '/api/charging/start, /api/charging/stop, /api/charging/history',
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/charging', chargingRoutes);
app.use('/api/partner', partnerRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/terms', termsRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Catch-all: return JSON 404 for any other path
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `No route for ${req.method} ${req.path}`,
    try: ['GET /', 'GET /health', 'GET /api/stations'],
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
