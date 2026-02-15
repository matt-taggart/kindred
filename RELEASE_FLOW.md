# Kindred EAS Release Flow

This is the source of truth for iOS release operations.

## Profiles, Channels, and Purpose
- `preview` build profile -> `staging` update channel
- `production` build profile -> `production` update channel
- `development` build profile -> `development` update channel

## Current Config Assumptions
- `eas.json` uses `"appVersionSource": "remote"`.
- `preview` and `production` both use `"autoIncrement": true` for store builds.
- `runtimeVersion.policy` is `appVersion` in `app.config.js`.

## Rule of Thumb
- OTA-only JS/content changes: publish update to the channel (`staging` or `production`).
- Native dependency/config changes: create a new binary build.
- New App Store version (marketing version): run `build:version:set` first, then build.

## Beta Lane (TestFlight via `preview` + `staging`)
1. Check remote version/build:
```bash
pnpm run version:get:preview:ios
```
2. Only when you need a new marketing version (for example `1.0.0` -> `1.1.0`):
```bash
pnpm run version:set:preview:ios
```
3. Build and submit:
```bash
pnpm run build:preview:ios
pnpm run submit:preview:ios
```
4. Publish OTA to beta users on TestFlight:
```bash
pnpm run update:staging -- --message "beta fixes"
```

## Production Lane (TestFlight/App Store via `production` + `production`)
1. Check remote version/build:
```bash
pnpm run version:get:production:ios
```
2. Only when you need a new marketing version:
```bash
pnpm run version:set:production:ios
```
3. Build and submit:
```bash
pnpm run build:production:ios
pnpm run submit:production:ios
```
4. Publish OTA to production users:
```bash
pnpm run update:production -- --message "production hotfix"
```

## Existing Binaries You Already Built
Because you already built both `preview` and `production`, you can immediately publish OTA updates without a rebuild:
```bash
pnpm run update:staging -- --message "update for preview/TestFlight build"
pnpm run update:production -- --message "update for production build"
```

## Quick Commands (No Scripts)
```bash
eas build:version:get -p ios -e preview
eas build:version:get -p ios -e production
eas build:version:set -p ios -e preview
eas build:version:set -p ios -e production
eas build -p ios -e preview
eas build -p ios -e production
eas submit -p ios -e preview
eas submit -p ios -e production
eas update --channel staging --message "..."
eas update --channel production --message "..."
```

