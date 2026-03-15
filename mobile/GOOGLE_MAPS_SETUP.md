# Google Maps API Key Setup

Use this key for **react-native-maps** on Android and iOS.

**Key:** `AIzaSyAYGD3yJpTg4zAmurIHXV5CCS4ON9ctLZU`

**Security:** In Google Cloud Console, restrict this key to your app (Android package name / iOS bundle ID) and enable only Maps SDK for Android and Maps SDK for iOS.

---

## Android

When you have the `android/` folder (e.g. after `npx react-native init`):

1. **API key file (already in repo):**  
   `android/app/src/main/res/values/google_maps_api.xml` defines `google_maps_key`.  
   If that path doesn’t exist yet, create it and add:
   ```xml
   <?xml version="1.0" encoding="utf-8"?>
   <resources>
       <string name="google_maps_key" templateMergeStrategy="preserve" translatable="false">AIzaSyAYGD3yJpTg4zAmurIHXV5CCS4ON9ctLZU</string>
   </resources>
   ```

2. Open **`android/app/src/main/AndroidManifest.xml`** and add **inside** the `<application>` tag (before `</application>`):

```xml
<meta-data
  android:name="com.google.android.geo.API_KEY"
  android:value="@string/google_maps_key"/>
```

   If you don’t use the resource file, you can set the key directly:  
   `android:value="AIzaSyAYGD3yJpTg4zAmurIHXV5CCS4ON9ctLZU"`.

---

## iOS

When you have the `ios/` folder:

1. Open **`ios/YourAppName/AppDelegate.mm`** (or `.mm` / `.m`).

2. At the top, add:
```objc
#import <GoogleMaps/GoogleMaps.h>
```

3. Inside `application:didFinishLaunchingWithOptions:`, add as the **first line**:
```objc
[GMSServices provideAPIKey:@"AIzaSyAYGD3yJpTg4zAmurIHXV5CCS4ON9ctLZU"];
```

4. Install pods if needed:
```bash
cd ios && pod install && cd ..
```

---

## Verify

Run the app and open the Map tab. The map should load; if you see a blank or “Google” watermark with errors, check the key and restrictions in Google Cloud Console.
