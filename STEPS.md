# Kindred: App Store & TestFlight Deployment Guide

This guide outlines the steps to take your Expo app from local development to TestFlight and the App Store, including RevenueCat integration.

## 0. Generate the App Store Connect API Key
Both Expo and RevenueCat need a "Master Key" to talk to Apple on your behalf.

1.  Log in to **[App Store Connect](https://appstoreconnect.apple.com)**.
2.  Go to **Users and Access** > **Integrations** (top tab) > **App Store Connect API**.
3.  Click the **"+"** icon to generate a new API Key.
    *   **Name:** "Expo/RevenueCat Key"
    *   **Access:** **Admin** (Recommended for full control; includes all App Manager permissions).
4.  **Important:**
    *   **Download the API Key (.p8 file):** You can only download this once. Store it safely.
    *   **Copy the Issuer ID:** A long string found at the top of the page.
    *   **Copy the Key ID:** Found in the table next to your new key.

## 1. App Store Connect Setup
Before uploading any code, you must create a record for your app on Apple's servers.

1. **Log in to [App Store Connect](https://appstoreconnect.apple.com)**.
2. **Create New App**: Click the "+" icon > "New App".
3. **App Name**: Choose a unique name (e.g., "Kindred: Stay Connected"). App names must be globally unique.
4. **Bundle ID**: Select `com.redelklabs.kindred` from the dropdown.
5. **SKU**: A unique internal ID (e.g., `kindred-ios-production`).
6. **User Access**: Ensure you have Admin or App Manager access.

## 2. RevenueCat Configuration
To enable In-App Purchases (IAP), RevenueCat needs to talk to Apple.

1. **In App Store Connect**:
   - Go to **Apps** > **[Your App]** > **In-App Purchases**.
   - Create a "Non-Consumable" purchase with the Product ID: `com.kindred.lifetime`.
2. **In RevenueCat Dashboard**:
   - Create a new Project.
   - Add an iOS App and provide your Bundle ID.
   - **App Store Connect API Key**: Upload your `.p8` key file, Issuer ID, and Key ID.
   - **Products**: Map your `com.kindred.lifetime` Product ID to a RevenueCat "Offering".

## 3. Configure Expo API Keys
Store your Apple credentials in Expo so you don't have to provide 2FA codes during every build.

1. Run: `eas credentials`
2. Select **iOS** > **production**.
3. Follow the prompts to upload your **App Store Connect API Key** (the `.p8` file, Key ID, and Issuer ID).

## 4. Build and Submit to TestFlight
Now you are ready to upload the actual app binary.

### Step A: Generate the Build
Run this command to create a production-ready `.ipa` file on Expo's servers:
```bash
eas build --platform ios --profile production
```

### Step B: Submit to Apple
Once the build is finished, upload it:
```bash
eas submit --platform ios --profile production
```
- Select the latest build ID.
- Expo will push the file to App Store Connect.

## 5. Enable TestFlight Testing
1. Go to **App Store Connect** > **TestFlight**.
2. Wait for the build to finish "Processing" (10–30 mins).
3. **Missing Compliance**: If prompted, click it and select "No" for encryption (this is already handled in your `app.json` but may need a one-time confirmation).
4. **Add Testers**:
   - On the left, click **Internal Testing** > **+**.
   - Create a group called "Internal".
   - Add your email.
5. **Install**: Open the **TestFlight** app on your iPhone and install Kindred.

## FAQ
- **Do I need screenshots now?** No. Screenshots are only required for the **final App Store submission**. TestFlight does not require them.
- **Is the Ad Hoc profile enough?** No. You need the App Store Connect record to test In-App Purchases and use TestFlight.
- **Will I be charged for testing?** No. TestFlight uses "Sandbox" mode for RevenueCat, so purchases are free.
- **How do I configure for local development?**
  - Use the **same RevenueCat API Key** for both development and production. RevenueCat automatically detects the environment.
  - Development builds use the **Apple Sandbox** environment automatically. You do NOT need a separate test store configuration.
  - To test purchases on a physical device, create a **Sandbox Tester** account in App Store Connect (Users and Access > Sandbox Testers).

