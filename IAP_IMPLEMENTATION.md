# IAP Implementation with Backend Receipt Validation

## Overview

This document summarizes the complete In-App Purchase (IAP) implementation with backend receipt validation for the Kindred app.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│  Kindred App    │────▶│  Backend API     │────▶│  Apple / Google     │
│  (Expo/React    │     │  (Validation)    │     │  Store Validation   │
│   Native)       │     │                  │     │                     │
└─────────────────┘     └──────────────────┘     └─────────────────────┘
```

## Components

### 1. Backend API (`app/api/validate-purchase/route.ts`)

**Purpose**: Validates purchase receipts with Apple App Store and Google Play

**Features**:
- Accepts purchase receipts from iOS (Apple) and Android (Google)
- Validates with respective store APIs
- Returns validation result with product verification
- Supports both sandbox and production environments

### 2. IAP Service (`services/iapService.ts`)

**Purpose**: Handles all IAP operations including validation

**Key Methods**:
- `initialize()` - Sets up purchase listener
- `purchaseLifetime()` - Initiates purchase flow
- `restorePurchases()` - Restores existing purchases
- `checkCurrentPurchase()` - Verifies current purchase status

**Validation Flow**:
1. Purchase completes in client
2. Receipt is extracted from purchase
3. Receipt sent to backend API for validation
4. Backend validates with Apple/Google
5. Result returned to client
6. Purchase completed only if validated

### 3. User Store (`lib/userStore.ts`)

**Purpose**: Manages purchase state and UI state

**State**:
```typescript
{
  isPro: boolean;
  purchaseState: {
    isPurchasing: boolean;
    isRestoring: boolean;
    error: string | null;
  };
}
```

**Actions**:
- `purchasePro()` - Triggers purchase flow
- `restorePurchase()` - Restores purchases
- `clearError()` - Clears error messages

### 4. Paywall Modal (`components/PaywallModal.tsx`)

**Purpose**: Displays purchase/restore UI

**Features**:
- Shows purchase button for new users
- Shows restore button for existing customers
- Displays loading states
- Shows error messages
- Auto-closes on successful purchase

## Development vs Production

### Development Mode (`__DEV__`)

```typescript
// IAP Service
if (__DEV__) {
  console.log('[IAP] Development mode detected - using mock IAP');
  return { success: true };
}

// Validation
if (__DEV__) {
  console.log('[IAP] Development mode - skipping receipt validation');
  return { valid: true };
}
```

**Behavior**:
- Mocks purchase flow
- Skips real validation
- Instant success response
- No store connection required

### Production Mode

**Behavior**:
- Real Apple App Store / Google Play integration
- Backend receipt validation
- Secure transactions
- Real payment processing

## Security Features

1. **Backend Validation**: All receipts verified on server
2. **No Client-Side Secrets**: API keys stored in environment variables
3. **HTTPS Only**: All API communications encrypted
4. **Receipt Verification**: Product ID and purchase type checked
5. **Environment Isolation**: Secrets never exposed in development builds

## Environment Configuration

### Required Variables

```bash
# Apple App Store
APPLE_BUNDLE_ID=com.kindred.app
APPLE_ISSUER_ID=xxxxxxxx-xxxx-xxxx-xxxx
APPLE_PRIVATE_KEY_ID=XXXXXXXXXX
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
APPLE_SHARED_SECRET=xxxxxxxxxxxxxxxx

# Google Play Store
GOOGLE_PLAY_PACKAGE_NAME=com.kindred.app
GOOGLE_PLAY_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
GOOGLE_PLAY_CLIENT_EMAIL=name@project-id.iam.gserviceaccount.com
```

### Setting Up Locally

```bash
# Copy example
cp .env.example .env

# Fill in your values
nano .env

# Never commit .env!
echo ".env" >> .gitignore
```

## Installation

### 1. Install Dependencies

```bash
npm install expo-in-app-purchases
npm install app-store-server-api googleapis
```

### 2. Configure Production API URL

In `services/iapService.ts`:

```typescript
const VALIDATION_API_URL = __DEV__
  ? 'http://localhost:8081/api/validate-purchase'
  : 'https://api.kindred.app/api/validate-purchase'; // Update this
```

### 3. Deploy Backend

```bash
# Using Vercel
npm install -g vercel
vercel --prod

# Set environment variables in Vercel dashboard
```

## API Endpoint

### `POST /api/validate-purchase`

**Request Body**:
```json
{
  "platform": "ios" | "android",
  "productId": "com.kindred.lifetime",
  "receipt": "base64-encoded-receipt",  // iOS only
  "transactionId": "transaction-id",    // iOS only
  "purchaseToken": "token",              // Android only
}
```

**Response**:
```json
{
  "valid": true | false,
  "productId": "com.kindred.lifetime",
  "platform": "ios" | "android",
  "isTestEnvironment": true | false,
  "error": "error message"  // only if invalid
}
```

## Usage Example

### Purchase Flow

```typescript
import { useUserStore } from '@/lib/userStore';

function ProUpgradeScreen() {
  const { purchasePro, purchaseState } = useUserStore();

  const handlePurchase = async () => {
    await purchasePro();
    // purchaseState.purchasePro handles loading/error states
    // Success automatically sets isPro = true
  };

  return (
    <Button
      onPress={handlePurchase}
      disabled={purchaseState.isPurchasing}
    >
      {purchaseState.isPurchasing
        ? 'Processing...'
        : 'Purchase Pro ($4.99)'}
    </Button>
  );
}
```

### Restore Flow

```typescript
const { restorePurchase } = useUserStore();

await restorePurchase();
// Automatically checks App Store/Play for existing purchases
// Updates isPro status accordingly
```

## Testing Checklist

- [ ] Set up App Store Connect product (`com.kindred.lifetime`)
- [ ] Set up Google Play product (`com.kindred.lifetime`)
- [ ] Configure environment variables locally
- [ ] Test purchase in development mode (mock)
- [ ] Deploy backend API to production
- [ ] Configure production environment variables
- [ ] Test purchase on real iOS device with sandbox account
- [ ] Test purchase on real Android device with test account
- [ ] Test restore purchases
- [ ] Test error handling (cancelled purchase, network error)

## Common Issues & Solutions

### Issue: Purchase fails in production

**Possible Causes**:
- Product not approved in store
- Environment variable not set
- API URL incorrect
- Receipt validation failing

**Solution**:
1. Check product status in App Store Connect / Play Console
2. Verify environment variables are set
3. Check API logs for validation errors
4. Test with sandbox environment first

### Issue: Validation always fails

**Possible Causes**:
- Incorrect API keys
- Bundle/package ID mismatch
- Wrong product ID
- Testing in wrong environment

**Solution**:
1. Verify bundle/package ID matches store
2. Check API keys are correct and not expired
3. Ensure product ID exactly matches
4. Use sandbox accounts for testing

### Issue: "Purchase failed" error with no details

**Possible Causes**:
- Network timeout
- API down
- Receipt corrupted

**Solution**:
1. Check network connectivity
2. Monitor API logs
3. Implement retry logic
4. Report platform-specific error codes

## Monitoring & Analytics

Track these metrics:

1. **Purchase Success Rate**: Percentage of completed purchases
2. **Validation Success Rate**: Percentage of valid receipts
3. **Platform Breakdown**: iOS vs Android sales
4. **Error Types**: Most common validation failures
5. **Revenue**: Total lifetime purchases

## Resources

- [Expo In-App Purchases Docs](https://docs.expo.dev/versions/latest/sdk/in-app-purchases/)
- [Apple App Store Server API](https://developer.apple.com/documentation/appstoreserverapi)
- [Google Play Billing API](https://developer.android.com/google/play/billing)
- [BACKEND_SETUP.md](./BACKEND_SETUP.md) - Detailed backend setup guide

## License

This implementation is part of the Kindred app project.
