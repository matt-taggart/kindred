# Today Page Redesign

## Problem

The Today page has three UX issues:

1. **No clear hierarchy** — When multiple reminders are due, users feel overwhelmed and don't know where to start
2. **Missing emotional guidance** — The page reads like a task list rather than an invitation to connect
3. **Lack of momentum** — Users complete reminders but get no sense of progress or celebration

## Solution

### 1. Information Hierarchy

**Priority sorting logic:**
1. Birthdays today (always first)
2. All other reminders sorted by longest gap since last contact
3. Within same gap duration, sort by relationship closeness: Family → Chosen Family → Friend → Mentor → Other

**Grouped sections:**
- **"Birthdays"** — Only renders when someone has a birthday today. Uses existing terracotta card styling.
- **"Time to reconnect"** — All other due reminders. Uses existing sage/surface card styling.

If no birthdays exist, the Birthdays section doesn't render at all.

### 2. Emotional Guidance

**Page header structure:**
```
Today
Monday, January 13, 2026
Who would you like to reach out to?
```

The prompt "Who would you like to reach out to?" appears below the date in muted text (`text-warmgray-muted`). This reframes the page from "here are your tasks" to "here's an invitation."

**Section headers:**
- Birthdays section: "Birthdays" (no additional copy — terracotta styling signals celebration)
- Reconnect section: "Time to reconnect"

Section headers use muted warmgray styling, keeping them subtle.

When the list is empty, the prompt line does not render — the empty state component handles messaging.

### 3. Momentum & Progress

**Card completion feedback:**
When a user completes a reminder, the card animates out with a fade + slide up. The animation provides closure without needing a toast.

**Running count footer:**
After completing at least one reminder, a footer appears below the last card:

```
1 connection nurtured today
```

- Muted warmgray text, centered
- Only appears after first completion (not on initial load)
- Count persists for the session, resets daily
- Positioned below the list with comfortable spacing

**Enhanced empty state:**

When reminders are cleared after completing some:
```
[Sun icon]

All caught up!

2 connections nurtured today.
Enjoy your day.
```

When nothing was due (no completions):
```
[Sun icon]

All caught up!

Enjoy your day.
```

## Implementation

### Files to modify

**`app/(tabs)/index.tsx`**
- Add prompt line below date
- Group contacts into birthday vs. reconnect sections using `SectionList` or manual grouping
- Update sorting logic (birthdays first → longest gap → relationship closeness)
- Add section headers with appropriate styling
- Track `completionCount` in component state
- Render footer when `completionCount > 0`
- Add `Animated` fade/slide on card removal

**`components/CelebrationStatus.tsx`**
- Accept optional `completionCount` prop
- Conditionally render count line when prop > 0

**`services/contactService.ts`**
- Update `getDueContacts()` sorting logic or create `getDueContactsGrouped()` that returns `{ birthdays: Contact[], reconnect: Contact[] }`
- Sorting within reconnect: by `lastContactedAt` ascending (longest gap first), then by relationship type priority

### New state

- `completionCount: number` — tracks reminders completed this session
- Stored in component state (not persisted)
- Resets on app restart or date change

### No new files needed

This is a refactor of existing components.

## Design Principles Alignment

- **Hierarchy** gives users clear direction without being prescriptive
- **Grouped sections** preserve user agency — they can see priority but choose freely
- **Gentle prompt** shifts tone from task list to invitation
- **Subtle footer** provides momentum without gamification pressure
- **Conditional empty state** celebrates effort without implying more is better
