# React Native CLI – Setup & Troubleshooting

This project uses **React Native without a Framework** (bare CLI). Follow the official docs for environment setup, then use this page for project-specific notes and fixes.

---

## Official documentation

- **[Set up your environment](https://reactnative.dev/docs/set-up-your-environment)** – Node, JDK, Android Studio, SDK, `ANDROID_HOME`, Path. **Use the Windows section** if you’re on Windows.
- **[Get started without a framework](https://reactnative.dev/docs/getting-started-without-a-framework)** – Create app, start Metro, run `npm run android`.
- **[Troubleshooting](https://reactnative.dev/docs/troubleshooting)** – Port 8081, ADB, Gradle, etc.

---

## Environment checklist (from official docs)

| Requirement | Notes |
|-------------|--------|
| **Node.js** | 22.11.0 or newer recommended ([set-up-your-environment](https://reactnative.dev/docs/set-up-your-environment)). |
| **JDK** | **JDK 17** recommended. Higher versions can cause problems. Set `JAVA_HOME`. |
| **Android Studio** | Install with Android Virtual Device, Android SDK Platform, Android SDK. |
| **Android SDK** | This project (RN 0.73) uses **compileSdk 34**. In SDK Manager install **Android SDK Platform 34** and **Build-Tools** (e.g. 34.0.0). |
| **ANDROID_HOME** | Windows: `%LOCALAPPDATA%\Android\Sdk`. Add to user environment. |
| **Path** | Add `%ANDROID_HOME%\platform-tools` and `%ANDROID_HOME%\emulator`. |

---

## Validate environment

From the **mobile** folder run:

```bash
npx react-native doctor
```

Fix any errors it reports (e.g. missing SDK version, JDK). If **Android SDK** shows “N/A”, ensure SDK Platform 34 and Build-Tools are installed in Android Studio → SDK Manager.

---

## Project-specific configuration (RN 0.73.2)

This app is on **React Native 0.73.2**. Newer library versions often target the New Architecture and break the build. We use **pinned** versions and one Gradle fix:

### 1. Pinned dependencies (mobile/package.json)

- **react-native-reanimated**: `3.6.1` (newer 3.x requires RN 78+).
- **react-native-gesture-handler**: `2.14.1`.
- **react-native-maps**: `1.8.3`.
- **react-native-screens**: `3.29.0`.

Install with:

```bash
cd mobile
npm install --legacy-peer-deps
```

### 2. Android: androidx resolution (mobile/android/app/build.gradle)

A dependency pulls in `androidx.core` 1.16+, which needs compileSdk 35. We force an older version so the app keeps compileSdk 34:

```gradle
configurations.all {
  resolutionStrategy {
    force 'androidx.core:core:1.13.1'
    force 'androidx.core:core-ktx:1.13.1'
  }
}
```

### 3. Android: cleartext traffic (mobile/android/app/src/main/AndroidManifest.xml)

`android:usesCleartextTraffic="true"` is set so the emulator can talk to the backend at `http://10.0.2.2:5000`.

### 4. MainApplication.kt

`MainApplication.kt` follows the **React Native 0.73** template: `DefaultReactNativeHost`, `SoLoader.init`, optional New Architecture `load()` when enabled. Do not replace it with the newer “ReactHost”/entry-point style used in RN 0.76+.

---

## Common issues (from official Troubleshooting)

### Port 8081 already in use

- **Windows:** Find the process using [Resource Monitor](https://stackoverflow.com/questions/48198/how-can-you-find-out-which-process-is-listening-on-a-port-on-windows) and stop it, or use another port:
  ```bash
  npm start -- --port=8088
  ```
  (You’d then need to point the app at 8088 when running on device/emulator if applicable.)

### ShellCommandUnresponsiveException / ADB issues

Restart ADB:

```bash
adb kill-server
adb start-server
```

### Error: spawnSync ./gradlew EACCES

Make `gradlew` executable. On Windows this is less common; ensure no antivirus or permission issue is blocking `android\gradlew.bat`.

### Build fails: “Unsupported React Native version” (Reanimated)

You’re on a Reanimated version that expects RN 78+. Pin **react-native-reanimated** to `3.6.1` in `package.json` and run `npm install --legacy-peer-deps`.

### Build fails: androidx.core or compileSdk 35

Add the `resolutionStrategy` block in `mobile/android/app/build.gradle` as in [section 2](#2-android-androidx-resolution-mobileandroidappbuildgradle) above.

### Build fails: MainApplication “Unresolved reference”

Ensure `MainApplication.kt` matches the **0.73** template (e.g. from `node_modules/react-native/template/android/...`), not the newer ReactHost/entry-point style.

---

## Run the app

1. **Start backend** (from repo root or backend folder): `npm run dev`.
2. **Start Metro** (from mobile folder): `npm start`.
3. **Start emulator** (Android Studio Device Manager or `emulator -avd <AVD_NAME>`).
4. **Build and run** (new terminal, from mobile folder): `npm run android`.

See **docs/SETUP.md** for full run instructions and API URL configuration.
