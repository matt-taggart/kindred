# Kindred Deployment Guide

## Overview

This document provides a comprehensive guide for deploying the Kindred app through all stages: development, sandbox testing (Test Flight/Beta), and production. It covers backend API deployment, iOS/Android app deployment, and purchase endpoint testing.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Stage 1: Development & Local Testing](#stage-1-development--local-testing)
3. [Stage 2: Sandbox Testing (Test Flight)](#stage-2-sandbox-testing-test-flight)
4. [Stage 3: Production Deployment](#stage-3-production-deployment)
5. [Testing Purchase Endpoints](#testing-purchase-endpoints)
6. [Troubleshooting](#troubleshooting)
7. [Post-Deployment Checklist](#post-deployment-checklist)

---

## Prerequisites

### Required Accounts

- [ ] **Vercel Account** - For backend deployment (https://vercel.com)
- [ ] **GitHub Account** - For code hosting
- [ ] **Apple Developer Account** - For iOS deployment ($99/year)
- [ ] **Google Play Console Account** - For Android deployment ($25 one-time)

### Required Tools

```bash
# Install Node.js if not present
node --version  # Should be v18 or higher

# Install Expo CLI globally
npm install -g expo-cli

# Install Vercel CLI globally
npm install -g vercel

# Install EAS CLI for iOS builds
npm install -g eas-cli
```

### Required Environment Variables

You will need to collect these credentials:

#### Apple App Store Connect
- Bundle ID: `com.kindred.app`
- Issuer ID: From App Store Connect > Users and Access > Keys
- Private Key ID: Created in App Store Connect > Users and Access > Keys
- Private Key: Downloaded as `.p8` file
- Shared Secret: From App Store Connect > App Information

#### Google Play Console
- Package Name: `com.kindred.app`
- Service Account JSON: Created in Google Cloud Console
  - Private Key
  - Client Email

---

## Stage 1: Development & Local Testing

### Step 1.1: Backend Development Setup

#### Option A: Local Development Server

1. **Install dependencies:**
   ```bash
   cd /path/to/kindred
   npm install
   ```

2. **Create `.env.local` file in project root:**
   ```bash
   # Copy example if exists, otherwise create new
   touch .env.local
   ```

3. **Add environment variables to `.env.local`:**
   ```bash
   # Apple App Store (Sandbox)
   APPLE_BUNDLE_ID=com.kindred.app
   APPLE_ISSUER_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   APPLE_PRIVATE_KEY_ID=XXXXXXXXXX
   APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
   MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
   -----END PRIVATE KEY-----"
   
   # Google Play (Test)
   GOOGLE_PLAY_PACKAGE_NAME=com.kindred.app
   GOOGLE_PLAY_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
   MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
   -----END PRIVATE KEY-----"
   GOOGLE_PLAY_CLIENT_EMAIL=kindred-in-app-purchases@project-id.iam.gserviceaccount.com
   
   # Ensure .env.local is in .gitignore
   echo ".env.local" >> .gitignore
   ```

4. **Run backend locally:**
   ```bash
   # Start Expo dev server (runs on port 8081)
   npm start
   ```

The backend API will be available at: `http://localhost:8081/api/validate-purchase`

#### Option B: Vercel Development Deployment

1. **Deploy to Vercel Preview:**
   ```bash
   vercel
   # Follow prompts to link to GitHub repo
   # This creates a preview deployment
   ```

2. **Add environment variables to Vercel:**
   - Go to https://vercel.com/dashboard
   - Select your project
   - Go to Settings > Environment Variables
   - Add all variables from `.env.local`
   - Make sure to add them to:
     - **Production** environment
     - **Preview** environment
     - **Development** environment

3. **Redeploy after adding variables:**
   ```bash
   vercel --prod
   ```

### Step 1.2: Frontend Development

#### Run on Development Device

```bash
# Start development server
npm start

# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web Browser
npm run web
```

#### Test In-App Purchase (Mock Mode)

In development mode (`__DEV__`), the IAP automatically uses mock mode:
- Purchase flow is simulated
- No real payment processing
- Backend validation is skipped
- Instant success response

### Step 1.3: Local Testing Checklist

- [ ] Backend API is running (localhost:8081 or Vercel preview)
- [ ] Frontend loads successfully
- [ ] Development IAP mock works (purchase completes instantly)
- [ ] `isPro` state changes after successful purchase
- [ ] Paywall modal appears when contact limit reached

### Step 1.4: Test Purchase Endpoint Locally

Test your backend endpoint before deploying to production.

#### Using curl (iOS):

```bash
curl -X POST http://localhost:8081/api/validate-purchase \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "ios",
    "productId": "com.kindred.lifetime",
    "transactionId": "2000000123456789",
    "receipt": "base64-encoded-receipt"
  }'
```

#### Using curl (Android):

```bash
curl -X POST http://localhost:8081/api/validate-purchase \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "android",
    "productId": "com.kindred.lifetime",
    "purchaseToken": "purchase-token-here"
  }'
```

#### Expected Response (Success):

```json
{
  "valid": true,
  "productId": "com.kindred.lifetime",
  "platform": "ios",
  "isTestEnvironment": true
}
```

#### Expected Response (Configuration Missing):

```json
{
  "valid": false,
  "error": "iOS configuration missing",
  "productId": "com.kindred.lifetime",
  "platform": "ios",
  "isTestEnvironment": true
}
```

If you see "configuration missing", your environment variables aren't loaded correctly. Check:
- `.env.local` file exists in project root
- Environment variables are set correctly in Vercel Dashboard

---

## Stage 2: Sandbox Testing (Test Flight)

Sandbox testing allows you to test real IAP purchases with Apple/Google in a test environment without charging real money.

### Step 2.1: Prepare App Stores

#### Apple App Store Connect

1. **Create App Record:**
   - Go to App Store Connect
   - Create new app: Bundle ID `com.kindred.app`
   - Fill in app information

2. **Create In-App Purchase:**
   - Go to App Store Connect > Your App > In-App Purchases
   - Create new Non-Consumable product
   - Product ID: `com.kindred.lifetime`
   - Price: $4.99
   - Submit for review (takes 24-48 hours)

3. **Create Sandbox Tester Account:**
   - Go to App Store Connect > Users and Access > Sandbox Testers
   - Create new sandbox tester
   - Use a different email than your main Apple ID

#### Google Play Console

1. **Create App:**
   - Go to Google Play Console
   - Create new app: Package name `com.kindred.app`
   - Complete app listing (can be minimal for testing)

2. **Create In-App Product:**
   - Go to Play Console > Your App > Monetize > Products > In-app products
   - Create new managed product
   - Product ID: `com.kindred.lifetime`
   - Price: $4.99
   - Activate product

3. **Create License Tester Account:**
   - Go to Play Console > Settings > Developer account
   - Add license testers
   - Use email addresses that can make test purchases

### Step 2.2: Deploy Backend to Production Environment

Deploy your backend API to production Vercel before Test Flight testing.

#### Using Vercel CLI:

```bash
# Deploy to production
vercel --prod

# Note URL returned, e.g.:
# https://kindred-backend.vercel.app
```

#### Configure Production Environment Variables:

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add these to **Production** environment:

```bash
# Apple App Store (Production)
APPLE_BUNDLE_ID=com.kindred.app
APPLE_ISSUER_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
APPLE_PRIVATE_KEY_ID=XXXXXXXXXX
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
-----END PRIVATE KEY-----"

# Google Play Console (Production)
GOOGLE_PLAY_PACKAGE_NAME=com.kindred.app
GOOGLE_PLAY_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
-----END PRIVATE KEY-----"
GOOGLE_PLAY_CLIENT_EMAIL=kindred-in-app-purchases@project-id.iam.gserviceaccount.com
```

5. Click **Save**
6. Click **Redeploy** in Deployments tab

### Step 2.3: Update Frontend API URL

Edit `services/iapService.ts`:

```typescript
const VALIDATION_API_URL = __DEV__
  ? 'http://localhost:8081/api/validate-purchase'
  : 'https://kindred-backend.vercel.app/api/validate-purchase'; // Update this
```

### Step 2.4: Build iOS Test Flight Build

1. **Configure EAS Build:**

```bash
# Install EAS CLI if not installed
npm install -g eas-cli

# Login to Expo
eas login

# Initialize EAS (first time only)
eas build:configure
```

The CLI will guide you through:
- Signing up for an EAS subscription (if needed)
- Configuring build profiles

2. **Build for iOS Test Flight:**

```bash
# Build for iOS (simulator preview)
eas build --platform ios --profile preview

# For Test Flight submission, use production profile
eas build --platform ios --profile production
```

3. **Wait for build:**
   - First build takes 10-15 minutes
   - Subsequent builds are faster
   - You'll receive an email when build is complete

4. **Submit to Test Flight:**
   - Go to App Store Connect > TestFlight
   - Select your build
   - Add internal testers (yourself, QA team)
   - Distribute to testers

### Step 2.5: Build Android Beta

1. **Configure EAS for Android:**

```bash
# Android builds require Java JDK
# Ensure you have JDK 11 or higher installed
java -version

# Build for Android
eas build --platform android --profile preview
```

2. **Submit to Play Console Internal Testing:**

```bash
# Download the build artifacts from EAS
# The build URL will be provided after successful build

# Upload APK/AAB to Play Console:
# Play Console > Your App > Testing & release > Internal testing
# Upload build and add testers
```

### Step 2.6: Test Purchases in Sandbox

#### iOS Test Flight Testing:

1. **Install Test Flight on your device:**
   - Download Test Flight from App Store
   - Open Test Flight invitation from email
   - Install the test app

2. **Sign out of App Store:**
   - Open Settings > [Your Name] > Media & Purchases
   - Sign Out

3. **Sign in with Sandbox Tester:**
   - Open Test Flight app or your app
   - When prompted, sign in with your sandbox tester account
   - Use the sandbox email and password you created

4. **Make Test Purchase:**
   - Open your app
   - Navigate to Paywall
   - Tap "Purchase Pro"
   - Complete purchase flow (appears real but no charge)
   - Verify purchase completes successfully

5. **Verify in App:**  
   - `isPro` should be set to `true`
   - Contact limit should be removed
   - Pro features should be unlocked

#### Android Internal Testing:

1. **Add Device to License Testers:**
   - Go to Play Console > Your App > Setup > License testing
   - Add your Google account as a license tester

2. **Sign Up for Internal Testing:**
   - Use the opt-in URL provided in Play Console
   - Join internal testing on your device

3. **Download Test Build:**
   - Open Play Store app on device
   - Find "Kindred (Internal Testing)"
   - Download and install

4. **Make Test Purchase:**
   - Open your app
   - Navigate to Paywall
   - Tap "Purchase Pro"  
   - Complete purchase flow (test purchase, no charge)
   - Verify purchase completes successfully

### Step 2.7: Sandbox Testing Checklist

- [ ] Backend deployed to production Vercel URL
- [ ] Environment variables set in Vercel Production
- [ ] iOS Test Flight build created and distributed
- [ ] Android internal testing build installed
- [ ] Sandbox tester accounts created (Apple & Google)
- [ ] Test purchase successful on iOS Test Flight
- [ ] Test purchase successful on Android
- [ ] `isPro` state updates after purchase
- [ ] Restore purchases works correctly
- [ ] Backend logs show successful validation

---

## Stage 3: Production Deployment

### Step 3.1: Final Backend Verification

Before releasing to public, verify backend is production-ready:

```bash
# Verify backend is running
curl https://kindred-backend.vercel.app/api/validate-purchase

# Test with real sandbox receipt (from Test Flight testing)
curl -X POST https://kindred-backend.vercel.app/api/validate-purchase \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "ios",
    "productId": "com.kindred.lifetime",
    "transactionId": "real-sandbox-transaction-id",
    "receipt": "real-sandbox-receipt"
  }'
```

### Step 3.2: Prepare Stores for Production

#### Apple App Store Connect

1. **Complete App Information:**
   - App screenshots (required sizes)
   - App description
   - Privacy policy URL
   - App category
   - Age rating

2. **Verify In-App Purchase:**
   - Product must be approved by Apple review team
   - Check status: "Ready for Sale"

3. **Upload Production Build:**

```bash
# Build for App Store submission
eas build --platform ios --profile production
```

4. **Submit for Review:**
   - Go to App Store Connect > Your App
   - Select latest build
   - Complete submission questionnaire
   - Submit for App Review
   - Review typically takes 1-3 days

#### Google Play Console

1. **Complete Store Listing:**
   - App screenshots (phone and tablet if applicable)
   - App description
   - Privacy policy URL
   - Content ratings questionnaire
   - Data safety section

2. **Verify In-App Product:**
   - Product must be "Active" status
   - Price matches expected pricing

3. **Upload Production Build:**

```bash
# Build for Play Store submission
eas build --platform android --profile production
```

4. **Submit for Review:**
   - Go to Play Console > Your App
   - Upload production AAB build
   - Complete content rating questionnaire
   - Submit for review
   - Review typically takes 1-3 days

### Step 3.3: Production Deployment Checklist

- [ ] Backend API deployed and verified
- [ ] Environment variables include production keys (not sandbox)
- [ ] iOS build submitted to App Store Connect
- [ ] Android build submitted to Play Console
- [ ] App store listings completed (screenshots, descriptions, privacy policy)
- [ ] In-app purchases approved and active in both stores
- [ ] Privacy policy URL uploaded
- [ ] Content ratings completed
- [ ] Test purchases verified in both stores

### Step 3.4: Release to Public

#### iOS App Store:

1. **Wait for approval:**
   - Apple app review process (1-3 days)
   - Check email for approval notification

2. **Release:**
   - Once approved, go to App Store Connect > Pricing and Availability
   - Choose "Release Immediately" or schedule for later
   - Your app will be live within 24 hours

#### Google Play Store:

1. **Wait for approval:**
   - Google Play review process (1-3 days)
   - Check email for approval notification

2. **Release:**
   - Once approved, go to Play Console > Testing & release > Production
   - Click "Release" to make app public
   - Your app will be live within minutes

---

## Testing Purchase Endpoints

### Best Testing Strategy

#### 1. Purchase Endpoint Testing Flow

```
Development (Mock) → Sandbox (Test) → Production (Real)
```

#### 2. Development Testing (No Credentials Needed)

**Purpose:** Verify backend API routing and request handling

**Method:**
```bash
# Test endpoint structure without real credentials
curl -X POST http://localhost:8081/api/validate-purchase \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "ios",
    "productId": "com.kindred.lifetime",
    "transactionId": "test-id",
    "receipt": "test-receipt"
  }'

# Expected: 400 error (configuration missing)
# This confirms your endpoint is reachable and processing requests
```

**What this validates:**
- Endpoint exists and is accessible
- Request parsing works
- Error handling works
- CORS headers (if testing from browser)

#### 3. Sandbox Testing (Test Credentials)

**Purpose:** Test real IAP flow with Apple/Google in test environment

**Method A: Automated Testing with curl**

First, make a real sandbox purchase in Test Flight, then capture the receipt:

```bash
# iOS - Test with real sandbox receipt
curl -X POST https://kindred-backend.vercel.app/api/validate-purchase \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "ios",
    "productId": "com.kindred.lifetime",
    "transactionId": "2000000123456789",
    "receipt": "paste your sandbox receipt here"
  }'

# Android - Test with real test purchase token
curl -X POST https://kindred-backend.vercel.app/api/validate-purchase \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "android",
    "productId": "com.kindred.lifetime",
    "purchaseToken": "paste your test purchase token here"
  }'
```

**Method B: End-to-End Testing with Test Flight**

1. **Install Test Flight build**
2. **Make sandbox purchase**
3. **Check backend logs for validation result**

**Method C: Unit Testing**

Create test file `api/__tests__/validate-purchase.test.ts`:

```typescript
import { validateIOSReceipt, validateAndroidPurchase } from '../validate-purchase';

describe('Purchase Validation', () => {
  describe('iOS Validation', () => {
    it('should validate valid sandbox receipt', async () => {
      const result = await validateIOSReceipt({
        productId: 'com.kindred.lifetime',
        transactionId: '2000000123456789',
        receipt: 'real-sandbox-receipt',
      });

      expect(result.valid).toBe(true);
    });

    it('should reject invalid product ID', async () => {
      const result = await validateIOSReceipt({
        productId: 'com.wrong.product',
        transactionId: '2000000123456789',
        receipt: 'valid-receipt',
      });

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid product ID');
    });
  });

  describe('Android Validation', () => {
    it('should validate valid test purchase', async () => {
      const result = await validateAndroidPurchase({
        productId: 'com.kindred.lifetime',
        purchaseToken: 'real-test-token',
      });

      expect(result.valid).toBe(true);
    });
  });
});
```

**Run tests:**
```bash
npm test -- validate-purchase
```

#### 4. Production Testing (Before Launch)

**Purpose:** Final verification with production credentials

**Method:**

1. **Use a developer device to make a real purchase**
2. **Monitor backend logs for successful validation:**
   ```bash
   # Check Vercel logs
   vercel logs

   # Or use the Vercel Dashboard > Functions Logs
   ```

3. **Verify transaction appears in store dashboards:**
   - App Store Connect > Sales and Trends
   - Play Console > Financial reports

**Important:** Make test purchases using your own device only. Do not make real purchases from production using fake/test accounts.

### Complete Purchase Endpoint Testing Checklist

#### Development Phase:
- [ ] Backend endpoint starts successfully
- [ ] Endpoint responds to POST requests
- [ ] Returns proper error messages for missing configuration
- [ ] Request parsing works correctly
- [ ] CORS headers set (if needed)

#### Sandbox Phase:
- [ ] Backend deployed to production Vercel URL
- [ ] Sandbox environment variables configured
- [ ] iOS sandbox purchase validates successfully
- [ ] Android test purchase validates successfully
- [ ] Backend logs show successful validation
- [ ] Backend logs show failed validation (test with invalid receipt)
- [ ] Response times are acceptable (< 1 second)

#### Production Phase:
- [ ] Production environment variables configured
- [ ] Backend deployed to production Vercel URL
- [ ] Real purchase validates successfully
- [ ] Failed purchase returns appropriate error
- [ ] Backend logs show production transactions
- [ ] Vercel monitoring shows no errors
- [ ] Store dashboards show transactions

### Testing Best Practices

1. **Never commit credentials to Git**
2. **Use separate credentials for sandbox and production**
3. **Test with both valid and invalid receipts**
4. **Monitor backend logs during all testing phases**
5. **Verify error handling for edge cases**
6. **Test network timeouts and retries**
7. **Validate response format matches expected schema**

### Common Testing Issues and Solutions

| Issue | Symptom | Solution |
|-------|---------|----------|
| Credentials not loading | "Configuration missing" error | Check environment variables in Vercel Dashboard |
| Wrong environment | Purchase fails validation | Verify `isTestEnvironment` matches testing scenario |
| Invalid product ID | "Invalid product ID" error | Ensure product ID matches store exactly |
| Network timeout | Slow or failed validation | Check Vercel function timeout settings |
| CORS error | Browser cannot access API | Add CORS headers to API response |

---

## Troubleshooting

### Backend Deployment Issues

#### Vercel Build Fails

**Error:** Build timeout or dependency issues

**Solution:**
```bash
# Check build logs in Vercel Dashboard
# Ensure all dependencies are in package.json
# Try rebuilding with verbose logs
vercel --prod --debug
```

#### Environment Variables Not Loading

**Error:** "Configuration missing" in backend logs

**Solution:**
1. Verify variables set in correct environment (Production)
2. Redeploy after adding variables
3. Check variable names match code exactly
4. Ensure no extra whitespace in values

### iOS Deployment Issues

#### EAS Build Fails

**Error:** "Failed to resolve bundle identifier"

**Solution:**
```bash
# Ensure app.json has correct bundle ID
# Verify app exists in App Store Connect
eas build --platform ios --profile preview --verbose
```

#### Test Flight Not Installing

**Error:** "This app is not available for your device"

**Solution:**
1. Add device UDID to TestFlight testers
2. Ensure device OS version matches minimum requirements
3. Check that app is distributed to correct testers

### Android Deployment Issues

#### EAS Build Fails

**Error:** "Failed to configure build"

**Solution:**
```bash
# Ensure Java JDK 11+ installed
java -version

# Check app.json has correct package name
eas build --platform android --profile preview --verbose
```

#### Play Console Build Rejected

**Error:** "Invalid package name"

**Solution:**
1. Verify package name matches Play Console app
2. Check signing certificate is correct
3. Ensure app.json and build.gradle are consistent

### Purchase Validation Issues

#### Validation Always Fails

**Error:** "Validation failed" in backend logs

**Solution:**
```bash
# 1. Verify environment variables are set correctly
# 2. Check that bundle ID/package name matches store
# 3. Ensure you're using sandbox credentials for sandbox testing
# 4. Verify API keys are not expired
```

#### Sandbox Purchase Not Validating

**Error:** "Purchase not found" in backend logs

**Solution:**
```bash
# 1. Ensure backend uses sandbox environment
# 2. Verify sandbox tester account is signed in on device
# 3. Check that receipt is not corrupted
# 4. Make new sandbox purchase and test again
```

#### Production Purchase Not Validating

**Error:** "Purchase not found" or "Invalid product"

**Solution:**
```bash
# 1. Verify backend uses production credentials
# 2. Check that purchase is not in test environment
# 3. Ensure product is approved and active
# 4. Monitor backend logs for specific error
```

### Monitoring Solutions

#### Vercel Dashboard

- **Build Logs:** Deployments and build errors
- **Function Logs:** API execution logs
- **Analytics:** Request counts, response times
- **Deployments:** Version history and rollback

#### Testing Commands

```bash
# Check Vercel logs in real-time
vercel logs

# View all function logs
vercel logs --follow

# Check environment variables
vercel env ls

# Test endpoint health
curl https://kindred-backend.vercel.app/api/validate-purchase
```

---

## Post-Deployment Checklist

### Backend Deployment

- [ ] Backend deployed to production Vercel URL
- [ ] All environment variables set in Production environment
- [ ] Dashboard shows no build errors
- [ ] Function logs show no errors
- [ ] API responds to health checks

### iOS Deployment

- [ ] App approved by Apple review team
- [ ] App released to App Store
- [ ] In-app purchases active and approved
- [ ] Store listing complete (screenshots, description)
- [ ] Privacy policy URL set
- [ ] Test link works

### Android Deployment

- [ ] App approved by Google Play review team
- [ ] App released to Google Play Store
- [ ] In-app purchases active
- [ ] Store listing complete
- [ ] Content rating completed
- [ ] Data safety section completed
- [ ] Test link works

### Monitoring Setup

- [ ] Vercel Analytics configured
- [ ] Error tracking set up (Sentry or similar)
- [ ] Store analytics configured
- [ ] Revenue tracking set up

### User Support

- [ ] Support email configured in stores
- [ ] FAQ created for common issues
- [ ] Refund policy documented
- [ ] Data deletion process documented

### Next Steps

After successful deployment:

1. **Monitor first week:**
   - Check Vercel logs for validation errors
   - Monitor store analytics for downloads
   - Track purchase conversion rate
   - Watch for crash reports

2. **Gather user feedback:**
   - Review App Store ratings
   - Check Play Store reviews
   - Monitor support emails
   - Analyze feature usage

3. **Plan updates:**
   - Address bug reports
   - Implement requested features
   - Optimize performance
   - Update marketing materials

---

## Security Considerations

### API Security

1. **Never expose API keys in client code**
2. **Use environment variables for all secrets**
3. **Implement rate limiting if needed**
4. **Monitor for suspicious activity in logs**

### Store Security

1. **Rotate API keys periodically**
2. **Use separate sandbox and production credentials**
3. **Limit permissions on service accounts**
4. **Monitor for fraudulent transactions**

### Code Security

1. **Never commit `.env*` files to Git**
2. **Use `.gitignore` to exclude sensitive files**
3. **Regularly audit dependencies for vulnerabilities**
4. **Keep dependencies updated**

---

## Support Resources

### Documentation

- [Expo Documentation](https://docs.expo.dev)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction)
- [Apple App Store Server API](https://developer.apple.com/documentation/appstoreserverapi)
- [Google Play Billing API](https://developer.android.com/google/play/billing)
- [Vercel Documentation](https://vercel.com/docs)

### Community

- [Expo Forums](https://forums.expo.dev)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/expo)
- [React Native Community](https://reactnative.dev/)

### Project Files

- `DEPLOYMENT.md` - This file
- `IAP_IMPLEMENTATION.md` - IAP implementation details
- `BACKEND_SETUP.md` - Backend setup guide
- `ARCHITECTURE.md` - System architecture

---

## Quick Reference

### Essential Commands

```bash
# Development
npm start                    # Start dev server
npm run ios                  # iOS simulator
npm run android              # Android emulator
npm test                     # Run tests

# Backend
vercel                       # Deploy to Vercel (preview)
vercel --prod                # Deploy to Vercel (production)
vercel logs                  # View logs
vercel env ls                # List environment variables

# EAS Builds
eas build --platform ios --profile production      # iOS Test Flight
eas build --platform android --profile production # Android Play Store
eas build --platform ios --profile preview        # iOS simulator build
```

### Environment Variables

```bash
# Apple
APPLE_BUNDLE_ID
APPLE_ISSUER_ID
APPLE_PRIVATE_KEY_ID
APPLE_PRIVATE_KEY

# Google Play
GOOGLE_PLAY_PACKAGE_NAME
GOOGLE_PLAY_PRIVATE_KEY
GOOGLE_PLAY_CLIENT_EMAIL
GOOGLE_PLAY_PUBLIC_KEY
```

### URLs

- Vercel Dashboard: https://vercel.com/dashboard
- App Store Connect: https://appstoreconnect.apple.com
- Google Play Console: https://play.google.com/console
- Expo Dashboard: https://expo.dev

---

This deployment guide is part of the Kindred project. For questions or issues, refer to the project documentation or contact the development team.
