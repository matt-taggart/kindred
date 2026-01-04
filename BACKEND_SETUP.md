# Backend Receipt Validation Setup

This document explains how to set up backend receipt validation for the Kindred app's In-App Purchases.

## Overview

The app validates purchases with Apple App Store and Google Play to prevent fraud and ensure purchases are legitimate.

## Architecture

```
App (Expo) -> Backend API -> Apple App Store / Google Play
```

## Setup Instructions

### 1. Apple App Store (iOS)

#### Step 1: Create App in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Create your app (or use existing one)
3. Configure your Bundle ID to match `APPLE_BUNDLE_ID`

#### Step 2: Create In-App Purchase Product

1. Navigate to Features > In-App Purchases
2. Create a new Non-Consumable product with ID: `com.kindred.lifetime`
3. Set the price and complete the review process
4. Submit for review (can be done during app review)

#### Step 3: Generate API Keys for Receipt Validation

1. Go to Users and Access > Keys
2. Click the + button to create a new key
3. Select "App Store Connect API" role
4. Name the key (e.g., "Kindred IAP Validation")
5. Click Generate
6. **Important**: Download the `.p8` file - you won't be able to access it again!
7. Save the `Key ID` and `Issuer ID` displayed

Add these to your environment (in Vercel Dashboard):

```bash
APPLE_BUNDLE_ID=com.kindred.app
APPLE_ISSUER_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
APPLE_PRIVATE_KEY_ID=XXXXXXXXXX
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
-----END PRIVATE KEY-----"
```

**Important**: Add these environment variables to your Vercel project settings, not in local `.env` files. See `BACKEND_DEPLOYMENT.md` for deployment instructions.

### 2. Google Play Store (Android)

#### Step 1: Create App in Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Create your app
3. Configure your package name to match `GOOGLE_PLAY_PACKAGE_NAME`

#### Step 2: Create In-App Purchase Product

1. Navigate to Monetize > Products > In-app products
2. Create a new In-app product with ID: `com.kindred.lifetime`
3. Set the price (one-time purchase)
4. Activate the product

#### Step 3: Create Service Account for API Access

1. Go to Google Play Console > Setup > API access
2. Click Link Service Account
3. Follow instructions to create a service account or use existing one
4. Grant permission: "View financial data"
5. Download the JSON service account key file

6. From the JSON file, copy:
   - `private_key`
   - `client_email`

Add these to your environment:

```bash
GOOGLE_PLAY_PACKAGE_NAME=com.kindred.app
GOOGLE_PLAY_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
-----END PRIVATE KEY-----"
GOOGLE_PLAY_CLIENT_EMAIL=kindred-in-app-purchases@project.iam.gserviceaccount.com
```

### 3. Environment Configuration

**IMPORTANT**: All backend environment variables must be configured in your Vercel project settings, not in local `.env` files.

1. Go to your Vercel project > Settings > Environment Variables
2. Add each variable with its value
3. Make sure to select the correct environment (Production, Preview, Development)

See `.env.example` for a complete list of required variables.

**WARNING**: Never commit actual secret values to Git or expose them in client-side code!

### 4. Backend API Deployment

The backend API code is already implemented in `api/validate-purchase.ts`. See `BACKEND_DEPLOYMENT.md` for detailed deployment instructions.

**Quick Start:**

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login and deploy:
   ```bash
   vercel login
   vercel --prod
   ```

3. Set environment variables in Vercel dashboard (see `.env.example` for complete list)

See `BACKEND_DEPLOYMENT.md` for detailed instructions, testing, and troubleshooting.

#### Update Validation API URL in App

Update `services/iapService.ts` with your deployed API URL:

```typescript
const VALIDATION_API_URL = __DEV__
  ? 'http://localhost:8081/api/validate-purchase'
  : 'https://your-project-name.vercel.app/api/validate-purchase'; // Update this
```

### 5. Testing

#### Development Mode

In development mode, purchases are automatically accepted without validation:

```typescript
if (__DEV__) {
  // Skips real validation
  return { valid: true };
}
```

#### Production Testing

1. Create a test product in App Store Connect / Play Console
2. Build a production/preview version of your app
3. Install on a test device (not simulator)
4. Complete a test purchase
5. Check logs for validation errors

**Sandbox Testing (iOS):**
- Add your test account in App Store Connect > Sandbox Testers
- Use that Apple ID in Settings on your test device
- Test purchases require payment method (even in sandbox)

**License Testing (Android):**
- Add test accounts in Play Console > License Testing
- Test accounts can make purchases without being charged

## Security Considerations

1. **Never expose API keys** in client-side code
2. **Use HTTPS** for all API communications
3. **Validate all receipts** on the backend, not client-side
4. **Rate limit** the validation endpoint to prevent abuse
5. **Monitor logs** for suspicious validation failures
6. **Implement receipt expiration** checks where applicable

## Troubleshooting

### Common Issues

**Error: "Transaction not found"**
- Verify product ID in App Store Connect matches `com.kindred.lifetime`
- Check if product is approved and active
- Ensure correct environment (Sandbox vs Production)

**Error: "Invalid product type"**
- Verify product is Non-Consumable (not subscription/consumable)
- Check product configuration in store

**Error: "No purchases found" (Restore)**
- Make sure purchase was completed successfully
- Check if purchase was refunded or canceled
- Verify same Apple ID/Google account is used

**503 Service Unavailable**
- Apple/Google API may be temporarily down
- Implement retry logic with exponential backoff

## Monitoring

Track these metrics to ensure validation is working:

- Successful validation rate
- Failed validations (by error type)
- API response times
- Platform-specific error rates

## Support

- [Apple In-App Purchase Documentation](https://developer.apple.com/documentation/storekit/in-app_purchase)
- [Google Play Billing Documentation](https://developer.android.com/google/play/billing)
- [Expo In-App Purchases](https://docs.expo.dev/versions/latest/sdk/in-app-purchases/)
