# Deployment Guide

## 1. iOS App Build & Deployment

Canonical iOS release instructions now live in `RELEASE_FLOW.md`.
Use that file for all build, submit, OTA, and versioning commands.

### Prerequisites
- Apple Developer Account ($99/year)
- App Store Connect access
- Xcode (for local builds/upload) or EAS CLI (for cloud builds)

### Configuration
The project is configured for Expo.

1.  **Update App Configuration**:
    - Ensure `app.config.js` has the correct `bundleIdentifier`.
    - Versioning and build numbers are managed with EAS remote app versions (`eas build:version:*`), not manual `app.json` edits.

2.  **Icons and Splash Screens**:
    - Verify assets in `./assets/images/` (icon.png, splash.png, etc.) match App Store requirements.

### Build Process (EAS - Recommended)
1.  **Install EAS CLI**: `npm install -g eas-cli`
2.  **Login**: `eas login`
3.  **Configure Project**: `eas build:configure`
4.  **Run lane-specific commands from `RELEASE_FLOW.md`**:
    - `preview` + `staging` for beta/TestFlight lane
    - `production` + `production` for production lane

### Build Process (Local)
1.  **Prebuild**: `npx expo prebuild` (generates `ios` directory)
2.  **Open in Xcode**: `xcodebuild -workspace ios/kindred.xcworkspace ...` or open manually.
3.  **Archive & Upload**: Use Xcode's "Product > Archive" and then "Distribute App".

### App Store Connect
1.  Create the app entry in App Store Connect.
2.  Set up In-App Purchases (IAP) if using the "Lifetime" product mentioned in the code (`com.kindred.lifetime`).
3.  Fill out privacy details and screenshots.
4.  Select the build uploaded via EAS/Xcode.
5.  Submit for review.

---

## 2. Backend Deployment (Vercel)

The backend is a set of Serverless Functions located in `api/`.

### Structure
- `api/validate-purchase.ts`: Validates IAP receipts.
- `vercel.json`: Configures the routing and runtime.

### Environment Variables
Set these in Vercel Project Settings:

**Apple (iOS) IAP**:
- `APPLE_BUNDLE_ID`: Your app's bundle ID.
- `APPLE_ISSUER_ID`: From App Store Connect API keys.
- `APPLE_PRIVATE_KEY_ID`: Key ID.
- `APPLE_PRIVATE_KEY`: The private key content (handle newlines correctly).

**Google Play (Android) IAP**:
- `GOOGLE_PLAY_PACKAGE_NAME`
- `GOOGLE_PLAY_PRIVATE_KEY`
- `GOOGLE_PLAY_CLIENT_EMAIL`

**General**:
- `NODE_ENV`: `production`

### Deployment Steps
1.  **Install Vercel CLI**: `npm i -g vercel`
2.  **Deploy**:
    ```bash
    vercel --prod
    ```
    Or connect the GitHub repository to Vercel for automatic deployments on push to `main`.

### Validation
Test the endpoint:
```bash
curl -X POST https://your-vercel-project.vercel.app/api/validate-purchase \
  -H "Content-Type: application/json" \
  -d '{"platform": "ios", "productId": "com.kindred.lifetime", "receipt": "test-receipt"}'
```

---

## 3. Database
The app uses a local SQLite database (`kindred.db`) via `expo-sqlite` and `drizzle-orm`.
- **No remote database deployment is required** for the core app data.
- Data lives on the user's device.
- Migrations are handled in `db/migrations.ts` (ensure this runs on app startup).
