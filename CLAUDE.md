# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
pnpm install          # Install dependencies (pnpm required)
pnpm start            # Start Expo dev server
pnpm ios              # Run on iOS simulator
pnpm android          # Run on Android emulator
pnpm web              # Run web version
pnpm test             # Run Jest tests in watch mode
pnpm seed             # Seed database with test data
```

To run a single test file:
```bash
pnpm test -- --testPathPattern="birthday_logic"
```

## Architecture Overview

Kindred is a **local-first, offline-only personal relationship manager (PRM)** built with Expo/React Native. It tracks contact frequency with friends and schedules reminders.

### Tech Stack
- **Runtime**: Expo 54 (Managed Workflow)
- **Navigation**: Expo Router (file-based routing in `app/`)
- **Database**: Expo SQLite + Drizzle ORM
- **Styling**: NativeWind v4 (Tailwind CSS)
- **State**: Zustand (persisted to AsyncStorage)

### Key Directories

```
app/                    # Expo Router pages
├── (tabs)/            # Tab navigation (Home, Contacts, Calendar, Settings)
├── contacts/          # Contact detail and import flows
└── settings/          # Settings sub-navigation

services/              # Business logic layer
├── contactService.ts  # Contact CRUD, scheduling, birthday logic
├── notificationService.ts  # Local push notification scheduling
├── calendarService.ts # Calendar data formatting
└── iapService.ts      # In-app purchase handling

db/
├── schema.ts          # Drizzle schema (contacts, interactions tables)
├── client.ts          # SQLite initialization
└── migrations.ts      # Schema migrations (run on app launch)

lib/
├── store.ts           # App state (filter, search)
└── userStore.ts       # User state (isPro, notification settings)

utils/
└── scheduler.ts       # Date calculations for contact frequency
```

### Data Flow

1. **Contacts** have a `bucket` (frequency: daily/weekly/monthly/etc.) and `nextContactDate`
2. **Home screen** (`app/(tabs)/index.tsx`) shows contacts where `nextContactDate <= today` or birthday is today
3. **Marking done** creates an `Interaction` record and recalculates `nextContactDate` via `scheduler.ts`
4. **Notifications** are rescheduled after each interaction update

### Birthday Logic

Birthday reminders are integrated throughout:
- `contactService.isBirthdayToday(contact, date)` - checks if today is contact's birthday
- `contactService.getReminderPriority()` - returns 'birthday' | 'standard' for sorting
- Birthdays stored as `'YYYY-MM-DD'` or `'MM-DD'` in contact record
- Calendar view shows birthdays with purple/terracotta styling

### Monetization

Freemium model with 5 free contacts. `contactService.addContact()` enforces this limit unless `userStore.isPro` is true. IAP validation happens via `/api/validate-purchase.ts` serverless function.

## Styling

Custom colors defined in `tailwind.config.js`:
- `sage` (green) - standard reminders
- `terracotta` (orange) - birthdays, overdue items
- `magic` (indigo) - accents
- `cream` - backgrounds
