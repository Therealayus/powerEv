# powerEv — EV Charging Mobile Application

A full-stack EV charging app with a React Native CLI frontend and Node.js/MongoDB backend. Modern dark UI with map, station details, live charging dashboard, and session history.

**Docs:** For a complete, up-to-date reference (structure, API, auth flows, models, file index), see **`docs/APP_REFERENCE.md`**. That doc is updated whenever the app changes; read it first before making further changes.

**Setup:** For a one-command install (dependencies, env, seed) and full environment/installation guide (Node, MongoDB, Java, Android Studio, emulator), see **`docs/SETUP.md`**. From project root run: **`.\scripts\setup.ps1`** (PowerShell).

---

## Project structure

```
root
├── backend/          # Node.js + Express + MongoDB API
│   ├── src/
│   │   ├── config/   # DB connection
│   │   ├── models/   # User, Station, Charger, ChargingSession
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/  # JWT auth, partner role
│   │   ├── services/    # Charging simulation
│   │   └── scripts/     # seed.js
│   ├── server.js
│   └── package.json
├── mobile/           # React Native CLI (user app)
│   ├── src/ ... App.js, index.js, package.json
├── web/              # Partner dashboard (Vite + React)
│   ├── src/
│   │   ├── pages/    # Login, Register, Dashboard, Stations, Sessions
│   │   ├── components/ context/ api
│   │   └── ...
│   ├── index.html
│   └── package.json
└── README.md
```

---

## Tech stack

| Layer     | Stack |
|----------|--------|
| User app (mobile) | React Native CLI, React Navigation, react-native-maps, Axios, AsyncStorage, etc. |
| Partner app (web) | Vite, React, React Router, Tailwind CSS, Axios |
| Backend           | Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, dotenv, cors |

---

## 1. Backend setup

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Install and run locally

**Option A – One-time setup script (recommended):** From project root run `.\scripts\setup.ps1` then edit `backend\.env`. See **`docs/SETUP.md`** for full steps.

**Option B – Manual:**

```bash
cd backend
# Copy .env only if it doesn't exist (Windows: copy .env.example .env)
npm install
# Create .env from .env.example if needed; edit MONGODB_URI and JWT_SECRET
npm run dev
```

Server runs at `http://localhost:5000`.

### Seed database (stations + chargers)

```bash
cd backend
npm run seed
```

### Environment variables

| Variable       | Description |
|----------------|-------------|
| PORT           | Server port (default 5000) |
| MONGODB_URI    | MongoDB connection string |
| JWT_SECRET     | Secret for signing JWTs |
| NODE_ENV       | development / production |
| SMTP_HOST      | SMTP server (e.g. smtp.gmail.com) |
| SMTP_PORT      | SMTP port (587 for TLS) |
| SMTP_USER      | Sender email (e.g. ayushgupta2429@gmail.com) |
| SMTP_PASSWORD  | Gmail: use [App Password](https://support.google.com/accounts/answer/185833) |
| SMTP_FROM      | From address (optional, defaults to SMTP_USER) |

When SMTP is set: partner/user welcome on register; **email verification OTP** and **password reset OTP** (6-digit, 10 min). Leave SMTP_* unset to skip email.

---

## 2. Mobile app setup (React Native CLI)

### Environment setup (do this first)

Set up your machine for React Native development using the **official guide**:

**[Set Up Your Environment — React Native](https://reactnative.dev/docs/environment-setup)**

You’ll need:

- **Node.js** 18+
- **Android:** Android Studio, SDK, and an emulator or device
- **iOS (mac only):** Xcode and simulator or device

The guide walks through installing the right versions and configuring Android Studio/Xcode.

### Prerequisites (after environment setup)

- Node.js 18+
- Android Studio (for Android) or Xcode (for iOS)
- React Native CLI environment from the [environment setup guide](https://reactnative.dev/docs/environment-setup) above

### Mobile app (single folder: `mobile/`)

The **`mobile`** folder is the only mobile app: it contains the React Native source and the native **`android/`** project (and optionally **`ios/`** if you add it). Run `.\scripts\setup.ps1` then install dependencies:

```bash
cd mobile
npm install --legacy-peer-deps
```

See **`docs/SETUP.md`** for JDK, Android Studio, and emulator setup. For React Native CLI environment checks and build troubleshooting (official docs + project fixes), see **`docs/REACT_NATIVE_CLI.md`**.

### Configure API base URL

- Edit `mobile/src/services/api.js`.
- For **Android emulator**, use `http://10.0.2.2:5000/api` instead of `localhost`.
- For **physical device**, use your machine’s LAN IP, e.g. `http://192.168.1.x:5000/api`.

### Run the app

```bash
cd mobile
npm start
```

In another terminal:

```bash
cd mobile
npm run android   # or  npm run ios
```

---

## 3. Web app (Partner dashboard)

Partner dashboard for station owners: sign in as partner, view dashboard stats, add/edit stations, view charging sessions and revenue.

### Run the web app locally

1. **Backend must be running** on `http://localhost:5000` (see Backend setup above).

2. **Install and start the web app:**

   ```bash
   cd web
   npm install
   npm run dev
   ```

3. Open **http://localhost:3000** in your browser.

4. **Register as partner:** use the Register link and create an account (stored with `role: 'partner'`). Then sign in. Only partner accounts can access the dashboard.

5. **Add stations** from “My Stations” → “Add station”. Stations you create appear on the map in the mobile app for users to find and charge at.

---

## 4. Deploy backend on Render

1. Create a **Web Service** on [Render](https://render.com).

2. **Connect** your repo (or push this backend to a Git repo).

3. **Build & run**:
   - Root directory: `backend` (or set root to repo and start command from `backend`).
   - Build: `npm install`.
   - Start: `npm start` (runs `node server.js`).

4. **Environment** (Render dashboard → Environment):
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = your MongoDB Atlas (or other) connection string.
   - `JWT_SECRET` = a long random secret (e.g. `openssl rand -hex 32`).

5. **MongoDB**: Use [MongoDB Atlas](https://www.mongodb.com/atlas) and set `MONGODB_URI` in Render. After first deploy, run the seed script once (e.g. from your machine with `MONGODB_URI` set to the same Atlas URI):

   ```bash
   cd backend
   npm run seed
   ```

6. **API URL**: After deploy, Render gives a URL like `https://your-service.onrender.com`. In the mobile app set the API base URL in `mobile/src/services/api.js` to `https://your-service.onrender.com/api` (or use a config/env for different builds).

---

## API routes

| Method | Route | Auth | Description |
|--------|--------|------|-------------|
| POST   | /api/auth/register | No  | Register user (sends verification OTP) |
| POST   | /api/auth/login    | No  | Login, returns JWT |
| POST   | /api/auth/send-verification-otp | No  | Body: email. Send 6-digit verification OTP |
| POST   | /api/auth/verify-email | No  | Body: email, otp. Verify email; returns token, user |
| POST   | /api/auth/forgot-password | No  | Body: email. Send 6-digit reset OTP |
| POST   | /api/auth/reset-password | No  | Body: email, otp, newPassword. Set new password |
| GET    | /api/stations      | No  | List stations (with availability) |
| GET    | /api/stations/:id  | No  | Station detail + chargers |
| GET    | /api/stations/:id/chargers | No | Chargers for station |
| GET    | /api/charging/active | Yes | Current active session |
| POST   | /api/charging/start | Yes | Start session (body: stationId, chargerId) |
| POST   | /api/charging/stop  | Yes | Stop active session |
| GET    | /api/charging/history | Yes | User’s completed sessions |
| GET    | /api/partner/dashboard | Yes (partner) | Partner stats (stations, sessions, revenue) |
| GET    | /api/partner/stations | Yes (partner) | Partner’s stations |
| POST   | /api/partner/stations | Yes (partner) | Create station |
| PUT    | /api/partner/stations/:id | Yes (partner) | Update own station |
| GET    | /api/partner/sessions | Yes (partner) | Sessions at partner’s stations |

Protected routes require header: `Authorization: Bearer <token>`. Partner routes require user `role: 'partner'`.

---

## Features

- **Auth**: Register → verify email (6-digit OTP) → then main app. Login; forgot password → OTP → reset password. JWT stored in AsyncStorage (mobile) or localStorage (web).
- **Map**: Stations as markers (green / orange / red by availability).
- **Station detail**: Name, address, price, chargers, “Start charging”.
- **Charging**: Live dashboard (timer, kWh, cost, speed, battery-style progress); stop charging.
- **History**: Past sessions (station, date, units, cost, duration).
- **Charging simulation**: Backend increments `unitsConsumed` every 10s and computes cost from `pricePerKwh` until stop.
- **Partner web app**: Dashboard (stats, stations CRUD, sessions list). Register with `role: 'partner'` to access.

---

## License

MIT.
