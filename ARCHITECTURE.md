This project is structured as an **Expo (React Native)** app using **TypeScript**, **NativeWind (Tailwind)**, and **SQLite**.

### **Master Instruction for the Agent**

> *Copy and save the section below as `ARCHITECTURE.md` in your project root. Instruct your agent to "Read ARCHITECTURE.md before starting any task."*

---

# Project: Kindred (Local-First PRM)

**Goal:** Build a relationship management app to track contact frequency with friends.
**Constraint:** Local-first, offline-only, zero maintenance cost.
**Monetization:** Freemium (5 contacts free) + Lifetime IAP.

## Tech Stack

* **Runtime:** Expo (Managed Workflow)
* **Language:** TypeScript
* **Navigation:** Expo Router (File-based routing)
* **Styling:** NativeWind (Tailwind CSS)
* **Database:** Expo SQLite + Drizzle ORM (Local migrations)
* **State Management:** Zustand
* **Device Integration:** `expo-contacts`, `expo-notifications`

## Data Schema (Drizzle)

* **Contacts:** `id` (text), `name` (text), `phone` (text), `avatarUri` (text), `bucket` (text: 'daily'|'weekly'|'monthly'|'yearly'), `lastContactedAt` (int/timestamp), `nextContactDate` (int/timestamp), `isArchived` (bool).
* **Interactions:** `id` (text), `contactId` (fk), `date` (int), `type` (text: 'call'|'text'|'meet'), `notes` (text).

---

### **Execution Roadmap**

Below are the stages. Feed these prompts to your agent one by one.

#### **Stage 1: Scaffold & Infrastructure**

**Goal:** Initialize the app with the correct libraries and directory structure.

**Agent Prompt:**

```text
Initialize a new Expo project with TypeScript and Expo Router.
1. Run: `npx create-expo-app@latest kindred --template tabs@50`
2. Install dependencies: `nativewind`, `tailwindcss`, `drizzle-orm`, `expo-sqlite`, `zustand`, `clsx`, `tailwind-merge`.
3. Configure NativeWind (v4) according to their docs (babel.config.js, tailwind.config.js, global.css).
4. Set up Drizzle ORM:
   - Create `db/client.ts` (init expo-sqlite).
   - Create `db/schema.ts` defining the `contacts` and `interactions` tables.
   - Create `db/migrations.ts` to handle schema creation on app launch.
5. Create a `lib/store.ts` using Zustand to hold ephemeral app state (e.g., current filter).

```

#### **Stage 2: The Data Layer (CRUD)**

**Goal:** create the repositories to manage data before building UI.

**Agent Prompt:**

```text
Implement the Data Access Layer using Drizzle.
1. Create `services/contactService.ts`:
   - `addContact(contact)`: Inserts a contact.
   - `getContacts()`: Returns contacts sorted by `nextContactDate` ASC (overdue first).
   - `updateInteraction(contactId, type, notes)`: Creates an Interaction record AND updates the Contact's `lastContactedAt` and `nextContactDate`.
2. Implement the frequency logic in a helper `utils/scheduler.ts`:
   - Weekly = +7 days, Monthly = +30 days, etc.
   - Use this helper inside `updateInteraction` to calculate the new `nextContactDate`.
3. Create a seed script that checks if the DB is empty and inserts 3 dummy contacts for testing.

```

#### **Stage 3: The "Today" View (Home Screen)**

**Goal:** A card-stack view showing who to contact today.

**Agent Prompt:**

```text
Build the Home Screen (`app/(tabs)/index.tsx`).
1. Use NativeWind for styling.
2. Fetch contacts where `nextContactDate` <= Today OR `lastContactedAt` is null.
3. Render a FlatList of "Contact Cards".
   - Card shows: Name, Avatar, "Last contacted: X days ago".
   - Actions: Two buttons "Mark Done" (Green) and "Snooze" (Gray).
4. Connect "Mark Done" to open a Modal (`presentation: 'modal'`) asking for a "Log Interaction" note.
5. Saving the note should call `contactService.updateInteraction` and refresh the list.

```

#### **Stage 4: Contact Import & Management**

**Goal:** Pull real data from the phone.

**Agent Prompt:**

```text
Implement Contact Import in `app/contacts/import.tsx`.
1. Install `expo-contacts`.
2. Create a button "Import from Phone".
3. On press, request permission. If granted, fetch all contacts with a phone number.
4. Render a multi-select list of contacts.
5. "Import Selected":
   - Save selected items to the DB.
   - Default bucket: 'Monthly'.
   - Navigate back to Home.

```

#### **Stage 5: Notification Engine**

**Goal:** Schedule local reminders.

**Agent Prompt:**

```text
Implement the Local Notification system.
1. Install `expo-notifications`.
2. Configure `app/_layout.tsx` to handle foreground notifications.
3. Create `services/notificationService.ts`:
   - `scheduleReminder(contact)`: Cancels existing ID, schedules a new notification for `contact.nextContactDate`.
   - Title: "Time to catch up with {name}"
   - Body: "It's been a while."
4. Hook this into the `updateInteraction` flow: whenever a contact is updated, reschedule their notification.

```

#### **Stage 6: Monetization (The Gate)**

**Goal:** Lock the app after 5 contacts.

**Agent Prompt:**

```text
Implement the Paywall logic.
1. In `contactService.ts`, check the count of existing contacts before adding a new one.
2. If count >= 5 AND `user.isPro` is false, throw a "LimitReached" error.
3. Create a `components/PaywallModal.tsx` that explains the limit.
4. (Mock IAP for now): Add a "Restore Purchase" button that simply sets a boolean `isPro` in Zustand/AsyncStorage to true for testing purposes.

```

### **Recommended "Agentic" Workflow**

1. **Initialize:** Paste the **Stage 1** prompt into your terminal/agent. Wait for completion.
2. **Verify:** Run `npx expo start` to ensure the app loads.
3. **Iterate:** Paste the subsequent stages one by one.
4. **Debug:** If an error occurs, paste the error log + the relevant file content back to the agent.

**Next Step:**
Would you like me to generate the **`db/schema.ts`** file content (using Drizzle) right now so you can verify the data structure before starting?
