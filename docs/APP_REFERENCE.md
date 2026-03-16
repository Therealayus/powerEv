# EV Charging Platform – Complete App Reference

**Use this as the single source of truth.** When making any change to the app (backend, mobile, or web), update this doc to match. Before implementing further features, read this doc first so you have full context.

- **Update this file** whenever you add/change: routes, screens, pages, models, env vars, auth flows, or structure.
- **Read this file first** before starting new work so you don’t re-analyze the codebase.

---

## 1. Overview

| Part | Purpose | Users |
|------|---------|--------|
| **Backend** | REST API, MongoDB, JWT, charging simulation | Serves both apps |
| **Mobile** | React Native CLI app (driver) | EV drivers: find stations, charge, history |
| **Web** | Vite + React (partner dashboard) | Station owners: manage stations, view sessions/revenue |

**Design:** Dark theme (#0F172A, #1E293B), primary green #22C55E, accent blue #3B82F6. Rounded cards (20px), soft shadows, Reanimated for animations. **Logo & branding:** see **docs/BRANDING.md** (assets in `assets/`, `web/public/`, `mobile/src/assets/`).

---

## 2. Monorepo Structure

```
d:\Power Delivery\
├── backend/                 # Node.js API
│   ├── server.js            # Entry: Express, routes, DB
│   ├── .env / .env.example
│   ├── package.json
│   ├── render.yaml          # Render deploy
│   └── src/
│       ├── config/
│       │   ├── db.js        # Mongoose connect
│       │   └── mail.js     # Nodemailer SMTP
│       ├── models/
│       │   ├── User.js      # name, email, password, vehicleType, role (user|partner), emailVerified
│       │   ├── Otp.js       # email, otp, type (email_verification|password_reset), expiresAt
│       │   ├── Station.js  # name, address, lat/lng, pricePerKwh, totalChargers, ownerId
│       │   ├── Charger.js   # stationId, chargerType, powerKw, status
│       │   └── ChargingSession.js  # userId, stationId, chargerId, start/end, units, cost, status
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── stationController.js
│       │   ├── chargerController.js
│       │   ├── chargingController.js
│       │   └── partnerController.js
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── stationRoutes.js
│       │   ├── chargingRoutes.js
│       │   └── partnerRoutes.js
│       ├── middleware/
│       │   ├── auth.js      # JWT protect
│       │   └── partnerAuth.js  # role === 'partner'
│       ├── services/
│       │   ├── chargingSimulation.js  # 10s interval: unitsConsumed, cost
│       │   └── emailService.js         # welcome, verification OTP, password reset OTP, session complete, partner notification
│       └── scripts/
│           └── seed.js      # Stations + chargers for map
│
├── mobile/                   # React Native CLI (user app)
│   ├── App.js, index.js, app.json
│   ├── package.json, babel.config.js, metro.config.js
│   ├── GOOGLE_MAPS_SETUP.md
│   ├── android/app/src/main/res/values/google_maps_api.xml  # Maps key
│   └── src/
│       ├── theme/           # colors, spacing, typography, shadows
│       ├── context/          # AuthContext (login, register, logout, user/token)
│       ├── services/         # api.js (Axios + JWT from AsyncStorage)
│       ├── navigation/      # AppNavigator: Stack (Login/Register | Main tabs + StationDetail)
│       ├── screens/
│       │   ├── LoginScreen.js       # "Forgot password?" → ForgotPassword
│       │   ├── RegisterScreen.js    # On success → VerifyEmail (email param)
│       │   ├── VerifyEmailScreen.js # Email + 6-digit OTP; Verify, Resend; completeVerification → main app
│       │   ├── ForgotPasswordScreen.js # Email → send OTP → navigate to ResetPassword
│       │   ├── ResetPasswordScreen.js  # Email + OTP + new password → then Login
│       │   ├── MapScreen.js       # Map, floating search, draggable bottom sheet, FABs
│       │   ├── StationDetailScreen.js
│       │   ├── ChargingScreen.js   # Live dashboard, stop charging
│       │   └── HistoryScreen.js
│       ├── components/      # PrimaryButton, Card, StationCard, ChargingCard, SectionHeader, Loader
│       └── hooks/            # useChargingSession (optional)
│
├── web/                      # Partner dashboard (Vite + React)
│   ├── index.html
│   ├── package.json, vite.config.js (proxy /api → backend)
│   ├── tailwind.config.js, postcss.config.js
│   └── src/
│       ├── main.jsx, App.jsx
│       ├── index.css
│       ├── api.js            # Axios, baseURL /api, JWT from localStorage
│       ├── context/          # AuthContext (partner only)
│       ├── components/       # Layout, StatCard
│       └── pages/             # Login, Register, VerifyEmail, ForgotPassword, ResetPassword, Dashboard, Stations, Sessions
│
├── docs/
│   ├── APP_REFERENCE.md      # This file
│   ├── SETUP.md               # Environment & installation (Node, MongoDB, Java, Android, script)
│   └── UI_ANALYSIS_AND_IMPROVEMENTS.md
├── scripts/
│   └── setup.ps1              # One-time: npm install (backend, web, mobile), .env from example, seed
├── README.md
├── .gitignore
└── package.json              # Root (no workspaces)
```

---

## 3. API Reference

Base URL: `http://localhost:5000` (or Render URL). All JSON.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | / | No | API info |
| GET | /health | No | { status: 'ok' } |
| POST | /api/auth/register | No | Body: name, email, password, role?, vehicleType?. Sends verification OTP; does not require verify to get token (token returned for verify step). |
| POST | /api/auth/login | No | Body: email, password. Returns token, user (incl. emailVerified). |
| POST | /api/auth/send-verification-otp | No | Body: email. Sends 6-digit OTP for email verification (10 min expiry). |
| POST | /api/auth/verify-email | No | Body: email, otp. Marks email verified; returns token, user. |
| POST | /api/auth/forgot-password | No | Body: email. Sends 6-digit OTP for password reset (10 min expiry). |
| POST | /api/auth/reset-password | No | Body: email, otp, newPassword. Sets new password; no token returned. |
| GET | /api/auth/profile | JWT | Current user profile (incl. profilePhoto, phone, vehicleNumber, connectorType, termsAcceptedAt). |
| PUT | /api/auth/profile | JWT | Body: name?, phone?, vehicleNumber?, connectorType? (Bharat AC, Bharat DC, CCS 2, CHAdeMO, Type 2 AC). |
| POST | /api/auth/terms-accept | JWT | Record terms acceptance. |
| POST | /api/auth/profile/photo | JWT | Body: base64 (data:image/...;base64,...). Max 3MB. Saves to uploads/profiles. |
| DELETE | /api/auth/account | JWT | Delete user and related data (sessions, feedback). |
| POST | /api/feedback | JWT | Body: message, rating? (1–5). Submit user feedback. |
| GET | /api/stations | No | List stations + availableChargers, markerColor |
| GET | /api/stations/:id | No | One station + chargers |
| GET | /api/stations/:id/chargers | No | Chargers for station |
| GET | /api/charging/active | JWT | Current user active session |
| POST | /api/charging/start | JWT | Body: stationId, chargerId |
| POST | /api/charging/stop | JWT | Stop active session |
| GET | /api/charging/history | JWT | User completed sessions |
| GET | /api/partner/dashboard | JWT + partner | stationCount, sessionCount, totalRevenue, recentSessions |
| GET | /api/partner/stations | JWT + partner | Partner's stations |
| POST | /api/partner/stations | JWT + partner | Body: name, address, latitude, longitude, pricePerKwh, totalChargers |
| PUT | /api/partner/stations/:id | JWT + partner | Body: name?, address?, latitude?, longitude?, pricePerKwh? |
| GET | /api/partner/sessions | JWT + partner | Sessions at partner's stations |
| GET | /api/admin/dashboard | JWT + admin | Platform stats: userCount, partnerCount, stationCount, totalRevenue, recentSessions |
| GET | /api/admin/users | JWT + admin | All users (drivers) |
| GET | /api/admin/partners | JWT + admin | All partners |
| GET | /api/admin/stations | JWT + admin | All stations (with ownerId, chargers) |
| GET | /api/admin/sessions | JWT + admin | All completed charging sessions |
| PUT | /api/admin/terms | JWT + admin | Body: { content: string }. Update Terms and Conditions (shown in app). |
| GET | /api/terms | No | Current Terms and Conditions { content }. |

Protected: `Authorization: Bearer <token>`. Partner routes require `user.role === 'partner'`. Admin routes require `user.role === 'admin'`. Admin cannot be created via register; set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in backend `.env` and run `node src/scripts/create-admin.js` from the backend folder.

---

## 4. Data Models (MongoDB)

- **User:** name, email, password (hashed), vehicleType, role (user|partner|admin), emailVerified (boolean), profile fields, timestamps.
- **Otp:** email, otp (string), type (`email_verification` | `password_reset`), expiresAt. One-time use; deleted after verify/reset.
- **Station:** ownerId (ref User, optional), name, address, latitude, longitude, pricePerKwh, totalChargers, timestamps.
- **Charger:** stationId (ref Station), chargerType, powerKw, status (available|charging|offline), timestamps.
- **ChargingSession:** userId, stationId, chargerId, startTime, endTime, unitsConsumed, cost, status (active|completed), timestamps.

Charging simulation: when a session is active, every 10s `unitsConsumed` and `cost` (from station pricePerKwh) are updated until stop.

---

## 5. Auth & Roles

- **User (driver):** role `user`. Registers from mobile → backend sends verification OTP → user goes to **Verify email** (email + 6-digit OTP) → `completeVerification` stores token/user → main app. Login returns `emailVerified`; no gate (optional: block unverified in future). Forgot password: email → OTP → Reset password (email + OTP + new password) → Login.
- **Partner:** role `partner`. Same OTP flows on web: Register → Verify email → Dashboard. Forgot/Reset password via /forgot-password and /reset-password.
- JWT in mobile: AsyncStorage (`token`, `user`). Web: localStorage. Backend: `protect` middleware; partner routes use `partnerOnly`.
- **AuthContext (mobile):** login, register (returns data, does not set user until verified), completeVerification(token, user), logout.
- **AuthContext (web):** login, register (returns data, does not set user until verified), completeVerification(payload), logout.

---

## 6. Mobile App Flow

1. **Unauthenticated:** Stack → LoginScreen, RegisterScreen, VerifyEmailScreen, ForgotPasswordScreen, ResetPasswordScreen (no header). After register → navigate to VerifyEmail with email; user is not logged in until verify. Login has "Forgot password?" → ForgotPassword → send OTP → ResetPassword (email prefilled) → Login.
2. **Authenticated:** Stack → Main (tabs: Map, Charging, History) + StationDetailScreen.
3. **Map:** Stations from API, markers by availability (green/orange/red). Floating search, draggable bottom sheet (handle only), FABs: My location, Fit stations.
4. **StationDetail:** Station info + chargers list; "Start Charging" → picks first available charger, POST /charging/start, navigate to Charging tab.
5. **Charging:** Polls /charging/active every 5s. Shows timer, units, cost, speed, battery bar. "Stop Charging" → POST /charging/stop.
6. **History:** GET /charging/history, cards with station, date, units, cost, duration. Sign out in header.

**API base:** `mobile/src/services/api.js` — default `http://localhost:5000/api`; for Android emulator use `http://10.0.2.2:5000/api`.

---

## 7. Web App Flow

1. **Auth:** Login, Register, Verify email (`/verify-email?email=...`), Forgot password (`/forgot-password`), Reset password (`/reset-password?email=...`). Partner only; login and verify-email both require `role === 'partner'`. After register → redirect to verify-email (email from response or form); after verify → Dashboard. Reset password shows success then redirects to login. API response interceptor clears token/user on 401.
2. Dashboard: StatCards (stations, sessions, revenue), recent sessions list.
3. Stations: List partner stations, Add station / Edit (modal). createStation creates default chargers.
4. Sessions: List completed sessions at partner stations, total revenue summary.
5. Vite dev proxy: `/api` → `http://localhost:5000`. Production: set API base or same-origin.

---

## 8. Configuration

**Backend (.env):** PORT, MONGODB_URI, JWT_SECRET, NODE_ENV, SMTP_* (optional, for emails).

**Mobile:**  
- API base in `src/services/api.js`.  
- Google Maps: `GOOGLE_MAPS_SETUP.md` + `android/app/src/main/res/values/google_maps_api.xml`.  
- Android manifest: add `<meta-data android:name="com.google.android.geo.API_KEY" android:value="@string/google_maps_key"/>`.  
- iOS: AppDelegate `[GMSServices provideAPIKey:@"..."]`.

**Web:** Vite proxy in `vite.config.js`; production may need env for API URL.

---

## 9. Run & Deploy

- **One-time setup:** From repo root run `.\scripts\setup.ps1` (PowerShell). See **`docs/SETUP.md`** for full environment/installation (Node, MongoDB, Java, Android Studio, emulator).
- **Backend:** `cd backend` → ensure `.env` exists (from `.env.example`) → `npm run dev`. Seed: `npm run seed`.
- **Mobile:** `cd mobile` → `npm start`; other terminal: `npm run android` (or `npm run ios`). Requires JDK, Android SDK, AVD (see SETUP.md).
- **Web:** Backend running → `cd web` → `npm run dev` → http://localhost:3000.
- **Render:** Backend as Web Service; rootDir backend; env MONGODB_URI, JWT_SECRET. See README and backend/render.yaml.

---

## 10. Key File Index (path → purpose)

| Path | Purpose |
|------|--------|
| backend/server.js | Express app, mount routes, 404 handler |
| backend/src/config/db.js | Mongoose connect |
| backend/src/config/mail.js | Nodemailer, sendMail helper |
| backend/src/middleware/auth.js | JWT protect, req.user |
| backend/src/middleware/partnerAuth.js | partnerOnly after protect |
| backend/src/services/chargingSimulation.js | 10s interval for active sessions |
| backend/src/models/Otp.js | OTP records for email_verification, password_reset |
| backend/src/services/emailService.js | Partner/user welcome, verification OTP, password reset OTP, session complete, partner notification |
| mobile/src/context/AuthContext.js | user, token, login, register, completeVerification, logout, AsyncStorage |
| mobile/src/context/AlertContext.js | AlertProvider, useAlert(); showAlert(title, message, variant?, onDismiss?) for themed in-app alerts |
| mobile/src/components/AppAlert.js | Themed alert modal (error/success/info); used via useAlert() |
| mobile/src/navigation/AppNavigator.js | Stack + tabs; auth stack: Login, Register, VerifyEmail, ForgotPassword, ResetPassword |
| mobile/src/services/api.js | Axios, JWT; register, login, sendVerificationOtp, verifyEmail, forgotPassword, resetPassword, stations, charging, etc. |
| mobile/src/theme/index.js | colors, spacing, typography, shadows |
| web/src/components/Alert.jsx | In-app alert banner (type: error/success/info), optional onDismiss; matches app theme |
| web/src/context/AuthContext.jsx | Partner auth, completeVerification, localStorage |
| web/src/api.js | Axios, JWT; auth + partner endpoints; response interceptor clears token on 401 |
| web/vite.config.js | Dev server, /api proxy |
| scripts/setup.ps1 | One-time setup: install deps, .env, seed (run from repo root) |
| docs/SETUP.md | Full environment & installation guide |
| docs/REACT_NATIVE_CLI.md | React Native CLI setup, official docs links, troubleshooting (pinned deps, Android build fixes) |

---

## 11. Design Tokens (shared)

- **Colors:** background #0F172A, card #1E293B, primary #22C55E, accent #3B82F6, text #F8FAFC, textSecondary #94A3B8, border #334155, marker green/orange/red.
- **Spacing:** xs 4, sm 8, md 16, lg 24, xl 32, xxl 48; cardRadius 20, buttonRadius 18, inputHeight 56.
- **Shadows:** card, button, float (theme/shadows.js in mobile).

---

## 12. Email (SMTP)

When SMTP_* is set: partner welcome and user welcome on register; **verification OTP** and **password reset OTP** (6-digit, 10 min expiry) via sendEmailVerificationOtp and sendPasswordResetOtp; on charging stop, user gets session receipt and station owner (if ownerId) gets session notification. All sends are non-blocking (catch and log).

**If email is not working:** (1) Set `SMTP_USER` and `SMTP_PASSWORD` in `backend/.env`. (2) On startup the server logs either "SMTP: connected successfully", "SMTP: not configured", or "SMTP: configured but connection failed". (3) For Gmail, use an [App Password](https://myaccount.google.com/apppasswords) (2-Step Verification required), not your normal password. (4) Failed sends are logged with `[SMTP] Send failed:` and the error message in the backend console.

---

**Doc maintenance:** When you change the app, update this file. Before doing further changes, read this doc first.
