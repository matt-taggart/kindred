# RevenueCat + Dev Client Refactor

## Summary
- Replaced `expo-in-app-purchases` receipt validation flow with RevenueCat (`react-native-purchases`).
- Added Expo dev client support for native SDK usage.
- Removed the Vercel receipt validation API and related server dependencies.

## What Changed

### Client IAP Flow
- `services/iapService.ts` now uses `react-native-purchases` for offerings, purchase, restore, and entitlement checks.
- `lib/userStore.ts` tracks `priceLabel` and updates `isPro` based on RevenueCat entitlements.
- `app/_layout.tsx` initializes RevenueCat on boot and prefetches product data.
- `components/PaywallModal.tsx` and `components/EnhancedPaywallModal.tsx` display dynamic pricing when available.

### Configuration
- `app.json` now reads a RevenueCat API key via `expo.extra.revenueCatApiKey`.
- `.env.example` now includes `REVENUECAT_API_KEY` (public SDK key).

### Removed
- `api/validate-purchase.ts` (server receipt validation endpoint).
- Dependencies: `expo-in-app-purchases`, `app-store-server-api`, `googleapis`.
- `vercel.json` API build/routes (no serverless API usage now).

## RevenueCat Setup Requirements
1. Create a RevenueCat project and app.
2. Configure your product `com.kindred.lifetime` and an entitlement (default: `pro`).
3. Configure an offering (default: `default`).
4. Set your **public SDK key** as `REVENUECAT_API_KEY` for Expo config.

## Dev Client Usage
RevenueCat requires native code and will not work in Expo Go.

### EAS Dev Client (recommended)
```bash
eas build --profile development --platform ios
eas build --profile development --platform android
```
Then run:
```bash
expo start --dev-client
```

### Local Prebuild
```bash
expo prebuild
expo run:ios
expo run:android
```

## Notes
- Entitlement id is hardcoded as `pro` and offering id as `default` in `services/iapService.ts`.
- If you change either in RevenueCat, update `ENTITLEMENT_ID` or `OFFERING_ID` accordingly.
