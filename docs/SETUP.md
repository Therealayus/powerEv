# EV Charging App – Environment & Installation

Use this guide to install everything needed to run the backend, web app, and mobile app (including Android emulator) on your PC.

---

## Quick setup (after prerequisites)

From the **project root** (e.g. `d:\Power Delivery`):

```powershell
.\scripts\setup.ps1
```

This will:

- Check Node.js is installed
- Run `npm install` in **backend** and **web**; in **mobile** use `npm install --legacy-peer-deps` (for react-native-maps peer)
- Create **backend\.env** from `.env.example` if missing (you must edit it to set `MONGODB_URI` and `JWT_SECRET`)
- Run the **seed** script (requires MongoDB running; if it fails, run `cd backend; npm run seed` later)

Then start services manually (see [Run the app](#run-the-app) below).

### JDK + Android Studio + Emulator (Windows, automated)

1. **Install JDK 17 and Android Studio** (if not already):
   ```powershell
   winget install ojdkbuild.openjdk.17.jdk --accept-package-agreements --accept-source-agreements
   winget install Google.AndroidStudio --accept-package-agreements --accept-source-agreements
   ```
2. **Set environment** (User): `JAVA_HOME` = JDK folder (e.g. `C:\Program Files\ojdkbuild\java-17-openjdk-17.0.3.0.6-1`); `ANDROID_HOME` = `%LOCALAPPDATA%\Android\Sdk`; add to Path: `%ANDROID_HOME%\platform-tools` and `%ANDROID_HOME%\emulator`. (Project script may have set these.)
3. **Open Android Studio once** from the Start Menu and complete the setup wizard (Standard install). This creates the SDK.
4. **Create emulator:** From project root run `.\scripts\setup-android-emulator.ps1` to install platform-tools, API 34, system image, and AVD `EV_Charging_Device`.
5. **Start emulator:** In Android Studio → Tools → Device Manager → run the device, or: `emulator -avd EV_Charging_Device`.

---

## Prerequisites

### 1. Node.js (required for all three)

- **Version:** 18 or higher (LTS recommended).
- **Install:** [https://nodejs.org](https://nodejs.org) — choose “LTS”.
- **Check:** `node -v` and `npm -v` in a new terminal.

### 2. MongoDB (required for backend)

- **Options:**
  - **Local:** [MongoDB Community Server](https://www.mongodb.com/try/download/community) — install and start the service.
  - **Cloud:** [MongoDB Atlas](https://www.mongodb.com/atlas) — create a free cluster and copy the connection string.
- **Backend config:** Set `MONGODB_URI` in `backend\.env` (e.g. `mongodb://localhost:27017/ev-charging` or your Atlas URI).

### 3. Backend only (web works with just Node + MongoDB)

- Node.js 18+
- MongoDB (local or Atlas)
- Run `.\scripts\setup.ps1` then edit `backend\.env` and start backend (see below).

### 4. Web app only

- Same as backend (Node + MongoDB for API).
- After setup script: `cd web; npm run dev` — open http://localhost:3000.

### 5. Mobile app on Android emulator (full environment)

**Official React Native CLI docs:** [Set up your environment](https://reactnative.dev/docs/set-up-your-environment) (Windows) and [Troubleshooting](https://reactnative.dev/docs/troubleshooting). For project-specific fixes (pinned deps, Gradle, MainApplication), see **`docs/REACT_NATIVE_CLI.md`**.

You need **Node.js**, **MongoDB**, and the **Android development environment**:

| Requirement | Purpose |
|-------------|--------|
| **Node.js 18+** | Run Metro and JS tooling |
| **Java Development Kit (JDK) 17** | Build Android app (React Native 0.73 default) |
| **Android Studio** | SDK, emulator (AVD), and `adb` |
| **Android SDK** | Build tools and platform-tools (`adb`) |
| **Android Virtual Device (AVD)** | Emulator to run the app |

#### 5.1 Install Java (JDK 17)

- **Install:** [Eclipse Temurin 17](https://adoptium.net/temurin/releases/?version=17&os=windows) or use the JDK bundled with Android Studio.
- **Set JAVA_HOME:**
  - Windows: System Properties → Environment Variables → New “JAVA_HOME” = JDK folder (e.g. `C:\Program Files\Eclipse Adoptium\jdk-17.x.x`).
  - Add `%JAVA_HOME%\bin` to **Path**.
- **Check:** `java -version` and `echo %JAVA_HOME%`.

#### 5.2 Install Android Studio

- **Download:** [Android Studio](https://developer.android.com/studio).
- **Install** and open Android Studio.
- **SDK:** Tools → SDK Manager → install:
  - **Android SDK Platform** (e.g. API 34)
  - **Android SDK Build-Tools**
  - **Android SDK Platform-Tools** (includes `adb`)
- **Path:** Add to system **Path**:
  - `%LOCALAPPDATA%\Android\Sdk\platform-tools` (for `adb`)
  - Optional: `%LOCALAPPDATA%\Android\Sdk\emulator` (for `emulator`).
- **Check:** `adb version` in a new terminal.

#### 5.3 Create an emulator (AVD)

- In Android Studio: **Tools → Device Manager** (or **More Actions → Virtual Device Manager**).
- **Create Device** → pick a phone (e.g. Pixel 6) → **Next**.
- Select a system image (e.g. API 34) → **Next** → **Finish**.
- Start the AVD from Device Manager so it’s running before `npm run android`.

#### 5.4 Mobile API URL for emulator

- The app is configured to use **`http://10.0.2.2:5000/api`** for the Android emulator (so it reaches the backend on your PC).
- To use a different backend URL, edit `mobile\src\services\api.js`.

---

## Run the app

Do these in **separate** terminals (from project root).

### 1. Backend

```powershell
cd backend
npm run dev
```

- Server: **http://localhost:5000**
- Ensure `backend\.env` has correct `MONGODB_URI` and `JWT_SECRET`.

### 2. Web (partner dashboard)

```powershell
cd web
npm run dev
```

- Open **http://localhost:3000**
- Backend must be running; Vite proxies `/api` to port 5000.

### 3. Mobile (Android emulator)

**Terminal A – Metro:**

```powershell
cd mobile
npm start
```

**Terminal B – Build and run on emulator:**

- Start the AVD from Android Studio Device Manager if it’s not already running.
- Then:

```powershell
cd mobile
npm run android
```

- First run may take several minutes (Gradle build).

### 3b. Mobile on physical Android device

1. **Connect the phone** via USB and enable **USB debugging** (Settings → Developer options).
2. **Check device:** `adb devices` (from Android SDK platform-tools).
3. **Run the app on the device:**
   ```powershell
   cd mobile
   npm start
   ```
   In a second terminal:
   ```powershell
   cd mobile
   npm run android
   ```
   If multiple devices/emulators are connected, use: `npx react-native run-android --deviceId=<id>` (list IDs with `adb devices`).
4. **API URL:** The app talks to your PC’s backend. In `mobile\src\services\api.js` set `API_BASE` to your PC’s LAN IP, e.g. `http://192.168.1.100:5000/api`. Use `10.0.2.2` only for the emulator. Ensure the phone and PC are on the same Wi‑Fi and that your firewall allows port 5000.

---

## Troubleshooting

| Issue | What to do |
|-------|------------|
| `JAVA_HOME is not set` | Set JAVA_HOME to JDK 17 folder and add `%JAVA_HOME%\bin` to Path. |
| `'adb' is not recognized` | Add Android SDK `platform-tools` folder to Path (see 5.2). |
| `No emulators found` | Create an AVD in Android Studio (see 5.3) and start it. |
| `No route for POST /api/auth/...` | Restart the backend so it loads the latest routes. |
| Seed fails | Ensure MongoDB is running and `MONGODB_URI` in `backend\.env` is correct. |
| Mobile can’t reach API | Emulator: `http://10.0.2.2:5000/api` in `mobile\src\services\api.js`. Physical device: use your PC’s LAN IP (e.g. `http://192.168.1.x:5000/api`). |
| Mobile `npm install` fails (ERESOLVE) | Run `npm install --legacy-peer-deps` in the `mobile` folder. |

---

## Summary checklist

- [ ] Node.js 18+ installed
- [ ] MongoDB running (local or Atlas); `MONGODB_URI` in `backend\.env`
- [ ] Ran `.\scripts\setup.ps1` from project root
- [ ] Edited `backend\.env`: `JWT_SECRET` (and optional SMTP_*)
- [ ] For **mobile on emulator:** JDK 17, JAVA_HOME, Android Studio, SDK, AVD created and started
- [ ] Backend: `cd backend; npm run dev`
- [ ] Web: `cd web; npm run dev` → http://localhost:3000
- [ ] Mobile: `cd mobile; npm start` + in another terminal `npm run android`

For API and app structure, see **`docs/APP_REFERENCE.md`**.
