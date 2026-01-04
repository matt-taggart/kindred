# IAP Receipt Validation API

Standalone Vercel Serverless Functions for validating in-app purchase receipts.

## Structure

- `validate-purchase.ts` - Main API endpoint for receipt validation

## Deployment

See `BACKEND_DEPLOYMENT.md` for complete deployment instructions.

## Environment Variables

Required environment variables (set in Vercel Dashboard):

### Apple
- `APPLE_BUNDLE_ID`
- `APPLE_ISSUER_ID`
- `APPLE_PRIVATE_KEY_ID`
- `APPLE_PRIVATE_KEY`

### Google Play
- `GOOGLE_PLAY_PACKAGE_NAME`
- `GOOGLE_PLAY_PRIVATE_KEY`
- `GOOGLE_PLAY_CLIENT_EMAIL`

## API Endpoints

### POST /api/validate-purchase

Validates purchase receipts with Apple App Store or Google Play.

**Request Body:**
```json
{
  "platform": "ios" | "android",
  "productId": "com.kindred.lifetime",
  "receipt": "base64-encoded-receipt",      // iOS only
  "transactionId": "transaction-id",        // iOS only
  "purchaseToken": "token"                  // Android only
}
```

**Response:**
```json
{
  "valid": true | false,
  "productId": "com.kindred.lifetime",
  "platform": "ios",
  "isTestEnvironment": false,
  "error": "error message"  // only if invalid
}
```
