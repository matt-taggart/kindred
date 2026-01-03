Initialize a new Expo project with TypeScript and Expo Router.
1. Install dependencies: `nativewind`, `tailwindcss`, `drizzle-orm`, `expo-sqlite`, `zustand`, `clsx`, `tailwind-merge`.
2. Configure NativeWind (v4) according to their docs (babel.config.js, tailwind.config.js, global.css).
3. Set up Drizzle ORM:
   - Create `db/client.ts` (init expo-sqlite).
   - Create `db/schema.ts` defining the `contacts` and `interactions` tables.
   - Create `db/migrations.ts` to handle schema creation on app launch.
4. Create a `lib/store.ts` using Zustand to hold ephemeral app state (e.g., current filter).
