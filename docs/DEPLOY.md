# Deploy EV Charging – Backend + Frontend

## Recommendation

| Part | Platform | Why |
|------|----------|-----|
| **Frontend (web)** | **Vercel** | Free tier, great for Vite/React, automatic HTTPS, preview deployments. |
| **Backend (API)** | **Render** | Free tier for Node.js, works well with MongoDB Atlas. Your repo already has `backend/render.yaml`. |
| **Database** | **MongoDB Atlas** | Free tier (M0). Required for both local and production. |

**Other free backend options** (if you prefer): **Railway** (trial/credits), **Fly.io** (small free VMs), **Cyclic** (Node.js). Render is the simplest for a standard Express + MongoDB API.

---

## 1. MongoDB Atlas (database)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Create a **free M0 cluster** (e.g. in a region close to your backend).
3. **Database Access** → Add user (username + password). Note the password.
4. **Network Access** → Add IP: `0.0.0.0/0` (allow from anywhere; required for Render/Vercel serverless).
5. **Connect** → Drivers → copy the connection string. It looks like:
   ```text
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/DATABASE?retryWrites=true&w=majority
   ```
   Replace `USER`, `PASSWORD`, and optionally `DATABASE` (e.g. `ev-charging`). This is your **MONGODB_URI**.

---

## 2. Backend on Render

1. Push your repo to **GitHub** (if not already).
2. Go to [render.com](https://render.com) → Sign up / Log in (e.g. with GitHub).
3. **New** → **Web Service**.
4. Connect the repo and choose the same GitHub repo.
5. Configure:
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. **Environment** (add variables):
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = your Atlas connection string
   - `JWT_SECRET` = a long random string (e.g. generate one: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
   - Optional (for emails): `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`
7. **Create Web Service**. Render will build and deploy. Note the URL, e.g. `https://ev-charging-api.onrender.com`.

**Free tier note:** The service may **spin down after ~15 minutes** of no traffic. The first request after that can take 30–60 seconds (cold start). After that it stays warm for a while.

**Seed data (optional):** After first deploy, run the seed script once. In Render Dashboard → **Shell** (if available) or run locally with `MONGODB_URI` set to the same Atlas URI:
```bash
cd backend && npm run seed
```

---

## 3. Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → Sign up / Log in (e.g. with GitHub).
2. **Add New** → **Project** → Import your GitHub repo.
3. Configure:
   - **Root Directory:** `web` (click Edit, set to `web`)
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. **Environment Variables** (add):
   - `VITE_API_URL` = your Render API URL **including** `/api`, e.g. `https://ev-charging-api.onrender.com/api`
5. **Deploy**. Vercel will build and give you a URL like `https://your-project.vercel.app`.

The web app will call the backend at `VITE_API_URL` for all `/api` requests.

---

## 4. Mobile app (production API URL)

In the React Native app, update the API base URL so it points to your **live backend** (Render URL), not `10.0.2.2`:

- **File:** `mobile/src/services/api.js`
- Set:
  ```javascript
  const API_BASE = 'https://ev-charging-api.onrender.com/api';  // your Render URL + /api
  ```
  Or use a config / env so you can switch between dev and prod.

---

## 5. Checklist

- [ ] MongoDB Atlas cluster created; user and network access set; MONGODB_URI copied.
- [ ] Render: Web Service created from `backend`, env vars set (MONGODB_URI, JWT_SECRET, optional SMTP).
- [ ] Render backend URL works: open `https://YOUR-RENDER-URL/health` → `{"status":"ok"}`.
- [ ] Vercel: Project created from repo with Root Directory `web`; `VITE_API_URL` set to `https://YOUR-RENDER-URL/api`.
- [ ] Partner web app on Vercel: login/register and API calls work.
- [ ] Mobile: `api.js` (or config) updated to use Render API URL for production builds.

---

## Optional: Render Blueprint (render.yaml)

The repo has `backend/render.yaml` for a **Blueprint** deploy. If you use **Render Blueprint** (New → Blueprint, connect repo, select the YAML), Render will create the service from that file. You still must set **secret** env vars (e.g. MONGODB_URI, JWT_SECRET) in the Render dashboard; the YAML only defines the service shape.
