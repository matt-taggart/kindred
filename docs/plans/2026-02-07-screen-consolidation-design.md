# Screen Consolidation Design

## Summary

Consolidate the app's navigation by removing the Moments tab, absorbing its functionality into the Connections screen (Due filter) and a new Calendar tab. Unify tap behavior so all connection taps navigate to the detail page. Remove the daily quote from the Home screen.

**Tab structure: Home | Connections | Calendar | Preferences**

## Motivation

- Moments and Connections (Due filter) show overlapping data in different formats
- Tapping a connection does different things on different screens (Home opens ReachedOutSheet, Connections navigates to detail page)
- Consolidation reduces cognitive load and creates a single mental model for interacting with contacts

## Screen Designs

### 1. Home Screen

```
┌─────────────────────────────┐
│ PageHeader                   │
│ - "Kindred"                  │
│ - Time-based greeting        │
│ - User avatar (right)        │
├─────────────────────────────┤
│ "Your connections today"     │
│ QuiltGrid (6 tiles max):     │
│ - ConnectionTiles (due)      │
│ - AddConnectionTile          │
├─────────────────────────────┤
│ CelebrationStatus            │
│ (when all caught up)         │
└─────────────────────────────┘
```

**Changes:**
- `DailySoftnessCard` removed (no daily quote, no reflect button)
- Tapping a `ConnectionTile` navigates to `/contacts/[id]` instead of opening `ReachedOutSheet`

**Unchanged:**
- Time-based greeting in PageHeader
- QuiltGrid layout with color-coded tile variants
- Contact priority sorting (partner/spouse > family > friend)
- Birthday indicators on tiles
- Completion count after interactions
- AddConnectionTile in the grid
- FAB (floating heart button) for adding connections
- Empty state with import/add options
- Pull-to-refresh
- "See all" link to Connections tab

### 2. Connections Screen

```
┌─────────────────────────────┐
│ PageHeader + Search Button   │
├─────────────────────────────┤
│ FilterPills (sticky)         │
│ [All · #] [Due · #] [Arch.·#]│
├─────────────────────────────┤
│                              │
│ ── WHEN "ALL" SELECTED ──   │
│                              │
│ Section: "All connections"   │
│ - ConnectionCard             │
│ - ConnectionCard             │
│ (alphabetical or by          │
│  relationship type)          │
│                              │
│ ── WHEN "DUE" SELECTED ──   │
│                              │
│ Section: "This Week"         │
│ - MomentCard (urgent style)  │
│ - MomentCard (urgent style)  │
│                              │
│ Section: "Next Week"         │
│ - MomentCard (normal style)  │
│ - MomentCard (normal style)  │
│                              │
│ Section: "Later This Season" │
│ - MomentCard (resting style) │
│ - MomentCard (resting style) │
│                              │
│ ── WHEN "ARCHIVED" ──       │
│                              │
│ Section: "Archived"          │
│ - ConnectionCard (muted)     │
│                              │
└─────────────────────────────┘
```

**Changes:**
- **Due filter** uses time-grouped layout from the old Moments screen with `MomentCard` components and `MomentSectionDivider` headers (This Week / Next Week / Later This Season)
- Old "Connections to nurture" / "Recently connected" sections on All filter replaced with a single flat list (time-based grouping on Due makes those redundant)
- Tapping any card navigates to `/contacts/[id]`

**Unchanged:**
- Filter pills with counts
- Search functionality
- `ConnectionCard` for All and Archived views
- Pull-to-refresh
- Empty states

**Absorbed from Moments:**
- `MomentCard` component (urgent/normal/resting variants)
- `MomentSectionDivider` component
- `getUpcomingMoments()` logic from `calendarService`

### 3. Calendar Tab (New)

```
┌─────────────────────────────┐
│ PageHeader                   │
│ "Calendar"                   │
│ "Your rhythm at a glance"    │
├─────────────────────────────┤
│ Month Grid                   │
│ ◄  February 2026  ►         │
│ Su Mo Tu We Th Fr Sa         │
│                 1  2  3      │
│  4  5  6  7• 8  9  10       │
│ 11 12 13• 14 15 16 17       │
│ 18 19 20  21 22• 23 24      │
│ 25 26 27  28                 │
│                              │
│ • = has reminders/birthdays  │
├─────────────────────────────┤
│ Agenda (selected day)        │
│ "Friday, February 7"         │
│                              │
│ ┌───────────────────────┐   │
│ │ Reminder              │   │
│ │ Sarah · Check in weekly│   │
│ │                   ›    │   │
│ ├───────────────────────┤   │
│ │ Birthday              │   │
│ │ Marcus · Turning 30    │   │
│ │                   ›    │   │
│ └───────────────────────┘   │
│                              │
│ (scrollable if many entries) │
└─────────────────────────────┘
```

**Data sources:**
- Reminder dots: `nextContactDate` on each contact
- Birthday dots: `birthday` field on contacts (supports `YYYY-MM-DD` and `MM-DD`)
- Agenda items: reminders and birthdays for the selected day, birthdays listed first

**Interactions:**
- Swipe or tap arrows to change month
- Tap a day to update the agenda below
- Tap an agenda item to navigate to `/contacts/[id]`
- Today highlighted and auto-selected on load
- Days with both birthdays and reminders show two distinct colored dots

**New components:**
- `CalendarGrid` — month view with dot indicators (leverage `react-native-calendars` already in dependencies)
- `AgendaList` — scrollable list for the selected day
- `AgendaItem` — row with icon, contact name, and context label

**Empty state for selected day:** "Nothing planned for today"

### 4. Connection Detail Page

```
┌─────────────────────────────┐
│ [←] [Name]            [•••] │
├─────────────────────────────┤
│ ConnectionProfileSection     │
│ - Avatar                     │
│ - Relationship               │
│ - Last connected: [date]     │
├─────────────────────────────┤
│ QuiltGrid (Quick Actions)    │
│ [Call] [Text] [Log a Moment] │
├─────────────────────────────┤
│ SharedMomentsSection         │
│ "Shared Moments"             │
│ - Moment tiles (last 5)      │
│ - Or empty state             │
└─────────────────────────────┘
```

**Changes:**
- New **"Log a Moment"** action tile added to QuiltGrid alongside Call and Text
- Tapping "Log a Moment" opens `ReachedOutSheet` (select method + optional note)
- This is the single entry point for logging interactions from any screen

**Flow from any screen:**
```
Home tile       → Detail page → "Log a Moment" → ReachedOutSheet
Connections card → Detail page → "Log a Moment" → ReachedOutSheet
Calendar item   → Detail page → "Log a Moment" → ReachedOutSheet
```

**Unchanged:**
- Back button, header with name, more menu (edit/archive)
- Profile section with avatar, relationship, last connected
- Call/Text quick actions with confirmation dialogs
- Shared Moments history
- Archived banner with restore option
- `EditContactModal` from the ••• menu

### 5. Preferences Screen

No changes.

## Removals and Cleanup

**Screen removed:**
- `app/(tabs)/calendar.tsx` (old Moments screen) — replaced by the new Calendar tab

**Tab bar update:**
- `app/(tabs)/_layout.tsx` updated: Home | Connections | Calendar | Preferences
- Calendar tab uses the calendar icon (same as old Moments tab)
- Tab label: "Calendar"

**Components that move:**
- `MomentCard` and `MomentSectionDivider` stay in `components/`, now consumed by Connections Due filter

**Components removed:**
- `DailySoftnessCard` — no longer used

**Logic changes:**
- `ReachedOutSheet` no longer triggered from Home screen tile tap
- `getUpcomingMoments()` continues powering the Due filter and also feeds the Calendar tab

**No changes:**
- Database schema (no migrations needed)
- Contact service CRUD operations
- `AddConnectionSheet` (FAB)
- `EditContactModal`
