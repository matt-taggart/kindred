# Backend API Deployment Guide

## Overview

This document explains how to deploy the Kindred IAP receipt validation backend to Vercel.

## Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **Git Repository** - Your code should be in a Git repository (GitHub, GitLab, or Bitbucket)
3. **App Store Connect** - Apple app and IAP product configured
4. **Google Play Console** - Android app and IAP product configured

## Environment Variables

You need to set these environment variables in Vercel:

### Apple App Store

```
APPLE_BUNDLE_ID=com.kindred.app
APPLE_ISSUER_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
APPLE_PRIVATE_KEY_ID=XXXXXXXXXX
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
-----END PRIVATE KEY-----"
```

### Google Play Store

```
GOOGLE_PLAY_PACKAGE_NAME=com.kindred.app
GOOGLE_PLAY_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
-----END PRIVATE KEY-----"
GOOGLE_PLAY_CLIENT_EMAIL=kindred-in-app-purchases@project.iam.gserviceaccount.com
```

## Deployment Steps

### Method 1: Vercel CLI (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables:**
   
   Go to your project in Vercel Dashboard:
   - Settings > Environment Variables
   - Add all the variables listed above
   - Redeploy after adding variables

### Method 2: Vercel Dashboard

1. **Import Project:**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your Git repository

2. **Configure Project:**
   - Root Directory: `/`
   - Framework Preset: Next.js
   - Build Command: Leave empty (default)
   - Output Directory: `.next`

3. **Add Environment Variables:**
   - In Project Settings > Environment Variables
   - Add all variables listed above

4. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete

## API Endpoint

After deployment, your validation API will be available at:

```
https://your-project-name.vercel.app/api/validate-purchase
```

**Note**: The API code is implemented in `api/validate-purchase.ts` as a Vercel Serverless Function.

Update the `VALIDATION_API_URL` in `services/iapService.ts`:

```typescript
const VALIDATION_API_URL = __DEV__
  ? 'http://localhost:8081/api/validate-purchase'
  : 'https://your-project-name.vercel.app/api/validate-purchase';
```

## Testing the API

### With curl:

```bash
# iOS
curl -X POST https://your-project-name.vercel.app/api/validate-purchase \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "ios",
    "productId": "com.kindred.lifetime",
    "transactionId": "2000000123456789",
    "receipt": "base64-encoded-receipt"
  }'

# Android
curl -X POST https://your-project-name.vercel.app/api/validate-purchase \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "android",
    "productId": "com.kindred.lifetime",
    "purchaseToken": "purchase-token-here"
  }'
```

### Expected Response:

```json
{
  "valid": true,
  "productId": "com.kindred.lifetime",
  "platform": "ios",
  "isTestEnvironment": false
}
```

## Troubleshooting

### Error: "iOS configuration missing"

- Check that all Apple environment variables are set in Vercel
- Verify the variables are in the correct environment (Production, not Preview)

### Error: "Android configuration missing"

- Check that all Google Play environment variables are set
- Verify the service account JSON values are correct

### Error: "Purchase not found"

- Verify the product ID matches exactly in both stores
- For iOS: Check that the transaction ID is correct
- For Android: Check that the purchase token is not expired
- Ensure the product is active and approved in the store

### 404 Not Found

- Check that the `vercel.json` file is in your repository
- Verify the API directory structure: `api/validate-purchase/route.ts`

### 500 Internal Server Error

- Check Vercel deployment logs
- Verify all environment variables are set
- Check that the package includes the required dependencies

## Monitoring

Check Vercel Dashboard for:
- **Build Logs**: Deployment and build errors
- **Function Logs**: API execution logs and errors
- **Analytics**: Request counts and response times
- **Deployments**: Version history and rollback options

## Security Best Practices

1. **Never commit environment variables** to Git
2. **Use separate environments** for development and production
3. **Rotate credentials** periodically
4. **Monitor for suspicious activity** in Vercel logs
5. **Limit API access** to only your app domains if needed

## Cost

Vercel Free Tier includes:
- **Unlimited projects**
- **100GB bandwidth/month** (plenty for IAP validation)
- **6,000 minutes execution time/month**
- **No credit card required**

This should be sufficient for most apps during initial launch.

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [App Store Server API Docs](https://developer.apple.com/documentation/appstoreserverapi)
- [Google Play Billing API Docs](https://developer.android.com/google/play/billing)
