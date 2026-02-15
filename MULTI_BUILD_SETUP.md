# Guide: Concurrent Development and TestFlight Builds

For release versioning/build/submit/OTA commands, use `RELEASE_FLOW.md` as the source of truth.

To run both the **Development Build** and **TestFlight Build** on the same device, you must use different **Bundle Identifiers**. This prevents Apple from seeing them as the same app and overwriting one with the other.

## Recommendation
I recommend using `com.redelklabs.kindred` for Production/TestFlight and `com.redelklabs.kindred.dev` for Development.

---

## Step 1: Update `eas.json`
Modify your `eas.json` to specify a unique bundle identifier for the development profile.

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "bundleIdentifier": "com.redelklabs.kindred.dev"
      }
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

## Step 2: RevenueCat Configuration
RevenueCat tracks apps by Bundle ID. Since you now have two IDs, you need to register both.

1.  **RevenueCat Dashboard**: Go to your Project Settings > Apps.
2.  **Add New App**: Click "Add App" and select **iOS**.
3.  **App Name**: "Kindred (Dev)"
4.  **Bundle ID**: `com.redelklabs.kindred.dev`
5.  **API Key**: Note the new API Key generated for the Dev app.

## Step 3: Handle API Keys in Code
Update your `app.json` or environment variables to use the correct RevenueCat key based on the build profile. 

In `app.json`, you can use the `ios.bundleIdentifier` to distinguish, but the most common way is to use `expo-constants` or environment variables during the build.

### Option A: `app.config.js` (Recommended)
Rename `app.json` to `app.config.js` to use dynamic logic:

```javascript
const IS_DEV = process.env.APP_VARIANT === 'development';

export default {
  expo: {
    name: IS_DEV ? "Kindred (Dev)" : "Kindred",
    ios: {
      bundleIdentifier: IS_DEV ? "com.redelklabs.kindred.dev" : "com.redelklabs.kindred"
    },
    extra: {
      revenueCatApiKey: IS_DEV 
        ? "DEV_REVENUECAT_KEY" 
        : "PROD_REVENUECAT_KEY",
    }
  }
};
```

## Step 4: Rebuild the Development Client
Since the Bundle ID changed, your old development build is invalid.

1.  **Generate new credentials**: `eas credentials` (select iOS > development).
2.  **Rebuild**: `eas build --platform ios --profile development`.
3.  **Install**: Install the new build via the QR code.

## Step 5: Install TestFlight
1.  Run your production build: `eas build --platform ios --profile production`.
2.  Submit to Apple: `eas submit --platform ios --profile production`.
3.  Install via the **TestFlight** app.

You will now see two icons on your home screen: "Kindred" and "Kindred (Dev)".
