# Environment Variables Setup Guide

## Overview

This document provides a comprehensive guide for setting up all environment variables required for the Kindred IAP validation system.

## Architecture

```
Frontend (Expo App) ←→ Backend API (Vercel) ←→ Apple/Google Stores
```

### Frontend Environment Variables
- Used by the mobile app
- Configuration is optional (most values are hardcoded)
- Set in app build configuration if needed

### Backend Environment Variables
- Used by the Vercel Serverless Function
- **Required for production**
- Set in Vercel Dashboard, never in local files

---

## Backend Variables (Set in Vercel Dashboard)

These variables are **required** for the backend API to function correctly. Add them in:
**Vercel > Your Project > Settings > Environment Variables**

### Apple App Store Variables

#### `APPLE_BUNDLE_ID`
- **Required**: ✅ Yes
- **Description**: Your app's bundle ID from App Store Connect
- **Example**: `com.kindred.app`
- **Where to find**: App Store Connect > App Information > Bundle ID

#### `APPLE_ISSUER_ID`
- **Required**: ✅ Yes
- **Description**: Unique identifier for your Apple Developer team
- **Example**: `aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee`
- **Where to find**: App Store Connect > Users and Access > Keys > Issuer ID (top right)

#### `APPLE_PRIVATE_KEY_ID`
- **Required**: ✅ Yes
- **Description**: Key ID for your App Store Connect API key
- **Example**: `ABC123XYZ4`
- **Where to find**: App Store Connect > Users and Access > Keys > (select your key) > Key ID

#### `APPLE_PRIVATE_KEY`
- **Required**: ✅ Yes
- **Description**: Private key content in PEM format
- **Example**:
  ```
  -----BEGIN PRIVATE KEY-----
  MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
  -----END PRIVATE KEY-----
  ```
- **Where to find**: App Store Connect > Users and Access > Keys > (select your key) > Download .p8 file
- **Important**: Download immediately - you cannot access it again!

### Google Play Store Variables

#### `GOOGLE_PLAY_PACKAGE_NAME`
- **Required**: ✅ Yes
- **Description**: Your app's package name from Google Play Console
- **Example**: `com.kindred.app`
- **Where to find**: Google Play Console > Your App > Dashboard > Package name

#### `GOOGLE_PLAY_PRIVATE_KEY`
- **Required**: ✅ Yes
- **Description**: Private key for your Google Play service account
- **Example**:
  ```
  -----BEGIN PRIVATE KEY-----
  MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
  -----END PRIVATE KEY-----
  ```
- **Where to find**: Google Play Console > Setup > API access > Create service account > Download JSON key file
- **Important**: Copy the `private_key` field from the JSON file

#### `GOOGLE_PLAY_CLIENT_EMAIL`
- **Required**: ✅ Yes
- **Description**: Service account email address
- **Example**: `kindred-in-app-purchases@project-id.iam.gserviceaccount.com`
- **Where to find**: Same JSON file as above, copy the `client_email` field

---

## Frontend Variables (Optional)

These variables are used by the mobile app. Most are hardcoded and optional.

### `DEV_MODE`
- **Required**: ❌ No (hardcoded check for `__DEV__`)
- **Description**: Enable development mode features
- **Default**: Determined by `__DEV__` global
- **Usage**: Controls mock IAP behavior in development

---

## How to Add Variables in Vercel

### Step 1: Access Environment Variables

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** > **Environment Variables**

### Step 2: Add Each Variable

For each variable:

1. Click **Add New**
2. Enter the **Key** (e.g., `APPLE_BUNDLE_ID`)
3. Enter the **Value** (e.g., `com.kindred.app`)
4. Select **Environments**:
   - `Production` ✅ (checked)
   - `Preview` ✅ (checked)
   - `Development` ✅ (checked)
5. Click **Save**

### Step 3: Redeploy

After adding environment variables, you must redeploy:

1. Go to **Deployments**
2. Find your latest production deployment
3. Click the three dots (⋮) > **Redeploy**

---

## Variable Format Guidelines

### Multi-Line Variables (Private Keys)

When adding private keys in Vercel:

1. **Copy the entire key** including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
2. **Preserve line breaks** - Vercel handles multi-line values correctly
3. **No escaping needed** for newlines

Example:
```
-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg
abc123xyz456...
-----END PRIVATE KEY-----
```

### Special Characters

- **Quotes**: Don't add extra quotes - Vercel handles them
- **Newlines**: Keep them in multi-line values like keys
- **Trailing spaces**: Trim any whitespace

---

## Security Best Practices

### ✅ DO

- Add variables only to Vercel dashboard
- Use separate variable values for Production vs Development
- Rotate credentials periodically
- Use least-privilege service accounts
- Monitor Vercel activity logs

### ❌ DON'T

- Commit `.env` files with secrets
- Share credentials in chat/email
- Hardcode secrets in code
- Use production credentials in development
- Expose secrets in client-side code
- Reuse the same `.p8` key across multiple apps

---

## Verification Checklist

Before deploying to production, verify:

- [ ] All 7 required backend variables are set in Vercel
- [ ] Production environment is selected for each variable
- [ ] API key has correct permissions (App Store Connect API role)
- [ ] Service account has "View financial data" permission in Google Play
- [ ] Bundle ID / Package ID matches store configuration
- [ ] Credentials are valid and not expired
- [ ] No credentials in Git repository

---

## Troubleshooting

### Error: "iOS configuration missing"

**Cause**: One or more Apple environment variables missing.

**Solution**:
1. Check Vercel dashboard for all 4 required variables
2. Ensure Production environment is selected
3. Redeploy after adding variables

### Error: "Android configuration missing"

**Cause**: One or more Google Play environment variables missing.

**Solution**:
1. Check Vercel dashboard for all 3 required variables
2. Ensure Production environment is selected
3. Redeploy after adding variables

### Error: "Failed to decode transaction"

**Cause**: Invalid or malformed private key.

**Solution**:
1. Ensure you copied the entire key including BEGIN/END lines
2. Verify no extra whitespace or quotes were added
3. Redownload the `.p8` file if needed

### Error: "401 Unauthorized" (Google Play)

**Cause**: Service account lacks proper permissions.

**Solution**:
1. Go to Google Play Console > Setup > API access
2. Verify service account has "View financial data" permission
3. Grant access to the Google Cloud project

---

## Related Documentation

- [BACKEND_DEPLOYMENT.md](./BACKEND_DEPLOYMENT.md) - Backend deployment guide
- [BACKEND_SETUP.md](./BACKEND_SETUP.md) - Store configuration guide
- [.env.example](./.env.example) - Template file with all variables

---

## Quick Reference

### Required Variables (7 total)

**Apple (4):**
- `APPLE_BUNDLE_ID`
- `APPLE_ISSUER_ID`
- `APPLE_PRIVATE_KEY_ID`
- `APPLE_PRIVATE_KEY`

**Google Play (3):**
- `GOOGLE_PLAY_PACKAGE_NAME`
- `GOOGLE_PLAY_PRIVATE_KEY`
- `GOOGLE_PLAY_CLIENT_EMAIL`

### Where to Set

**Backend**: Vercel Dashboard > Settings > Environment Variables

**Frontend**: Optional - hardcoded in app or build config
