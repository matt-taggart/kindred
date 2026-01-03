# Tend (Kindred) - Project Context

## Project Overview

**Tend** (referred to as "Kindred" in architectural docs) is a local-first Personal Relationship Management (PRM) application designed to help users track and maintain contact with friends. It prioritizes privacy and longevity by being offline-only and having zero maintenance costs.

The application follows a "Freemium" model (limit on contacts) with a lifetime In-App Purchase (IAP) unlock.

## Tech Stack & Architecture

The project is built on the **Expo (Managed Workflow)** platform using **TypeScript**.

### Core Technologies
*   **Runtime:** [Expo](https://expo.dev)
*   **Language:** TypeScript
*   **Navigation:** [Expo Router](https://docs.expo.dev/router/introduction) (File-based routing)
*   **Styling:** [NativeWind](https://www.nativewind.dev/) (Tailwind CSS) *[Pending Installation]*
*   **Database:** [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) + [Drizzle ORM](https://orm.drizzle.team/) *[Pending Installation]*
*   **State Management:** [Zustand](https://github.com/pmndrs/zustand) *[Pending Installation]*

### Key Architecture Files
*   **`ARCHITECTURE.md`**: The master execution roadmap. **Crucial:** Read this before starting any significant feature work. It outlines the implementation stages (Scaffold, Data Layer, UI, Import, Notifications, Monetization).
*   **`app.json`**: Expo configuration.
*   **`package.json`**: Dependencies and scripts.

## Directory Structure

*   **`app/`**: Contains the application source code and defines the navigation structure (Expo Router).
    *   **`(tabs)/`**: The main tab-based navigation layout.
    *   **`_layout.tsx`**: The root layout file.
*   **`components/`**: Reusable React components.
    *   **`ui/`**: Generic UI elements (likely to be replaced/augmented by NativeWind).
*   **`constants/`**: Configuration constants (e.g., `theme.ts`).
*   **`hooks/`**: Custom React hooks (e.g., `useColorScheme`).
*   **`assets/`**: Images and static assets.
*   **`scripts/`**: Utility scripts (e.g., `reset-project.js`).

## Development Workflow

### Building and Running

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Start the Development Server:**
    ```bash
    npm start
    # or
    npx expo start
    ```
    This will launch the Expo development server. You can then open the app in:
    *   Expo Go (on your physical device)
    *   Android Emulator (`a`)
    *   iOS Simulator (`i`)
    *   Web Browser (`w`)

3.  **Reset Project:**
    ```bash
    npm run reset-project
    ```
    *Warning:* This resets the app directory to a blank state.

### Conventions & Guidelines

*   **Routing:** Strictly follow Expo Router's file-based routing conventions.
*   **Styling:** Prefer `NativeWind` (Tailwind classes) over `StyleSheet.create` once configured.
*   **Database:** Use Drizzle ORM for all database interactions. Schema definitions should reside in `db/schema.ts` (once created).
*   **State:** Use Zustand for global ephemeral state (e.g., filters) and SQLite for persistent data.
*   **Strict Typing:** Maintain strict TypeScript types. Avoid `any`.

## Status

The project is currently in the **Initialization** phase. The basic Expo template is present, but the core architecture libraries (NativeWind, Drizzle, Zustand) defined in `ARCHITECTURE.md` have not yet been installed or configured.

## Additional Instructions
Read ARCHITECTURE.md before starting any task.
