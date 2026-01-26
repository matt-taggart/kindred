# Connections Page Redesign

## Overview

A comprehensive list view of all contacts with filtering capabilities, complementing the "Today" tab's focused daily view.

## Screen Structure

```
┌─────────────────────────────────────┐
│  ♡ KINDRED                    [🔍]  │  ← Header
│  Connections                        │  ← Title (large)
│  Stay close to the people who...    │  ← Subtitle
├─────────────────────────────────────┤
│  [All·12] [Due·3] [Archived·0]      │  ← Filter pills
├─────────────────────────────────────┤
│  CONNECTIONS TO NURTURE             │  ← Section header
│  ┌─────────────────────────────┐    │
│  │ Large ConnectionCard        │    │  ← Due contacts
│  └─────────────────────────────┘    │
├─────────────────────────────────────┤
│  RECENTLY CONNECTED                 │  ← Section header
│  [Compact row] [Compact row]        │  ← Recent contacts
├─────────────────────────────────────┤
│                          [+] FAB    │  ← Expandable FAB
└─────────────────────────────────────┘
```

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Color palette | Keep existing | Seafoam/rose already established app-wide |
| Screen relationship | Separate from Today | Today = daily focus, Connections = full list |
| Recently connected window | 14 days | Balance between meaningful and recent |
| READY badge logic | Due today or overdue | Visual urgency indicator |

## Components

### ConnectionsHeader

Header with branding, title, subtitle, and search button.

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  ┌───┐                                          │
│  │ ♡ │ KINDRED                           [🔍]   │
│  └───┘                                          │
│  Connections                                    │
│  Stay close to the people who matter most.     │
└─────────────────────────────────────────────────┘
```

**Props:**
```typescript
type ConnectionsHeaderProps = {
  onSearchPress: () => void;
};
```

### FilterPills

Horizontal scrollable filter tabs to switch between All, Due, and Archived views.

**Layout:**
```
┌──────────────────────────────────────────────────┐
│  [All · 12]  [Due · 3]  [Archived · 0]    →      │
└──────────────────────────────────────────────────┘
     ▲ active      ▲ inactive
```

**Props:**
```typescript
type FilterOption = 'all' | 'due' | 'archived';

type FilterPillsProps = {
  selected: FilterOption;
  counts: { all: number; due: number; archived: number };
  onSelect: (filter: FilterOption) => void;
};
```

**Styling:**

| State | Background | Text | Border |
|-------|------------|------|--------|
| Active | `bg-slate-800` | `text-white` | none |
| Inactive | `bg-white` | `text-slate-600` | `border-slate-200` |

**Filter Logic:**
- **All**: All non-archived contacts (`isArchived === false`)
- **Due**: Contacts where `nextContactDate <= today` and not archived
- **Archived**: Contacts where `isArchived === true`

### ConnectionCard

Large card for contacts in the "Connections to nurture" section.

**Layout:**
```
┌─────────────────────────────────────────────────┐
│                                         READY   │  ← Badge (optional)
│  ┌──────┐                                       │
│  │ 📷   │  Thalia Villalobos                    │  ← Avatar (56x56) + Name
│  │      │  Every week                           │  ← Rhythm label
│  └──────┘                                       │
│                                                 │
│  LAST CONNECTED                                 │
│  "It's been a while since you last connected"  │  ← or "2 months ago"
│                                                 │
│  NEXT REMINDER                           [ > ]  │
│  Today                                          │  ← Colored if urgent
└─────────────────────────────────────────────────┘
```

**Props:**
```typescript
type ConnectionCardProps = {
  contact: Contact;
  lastConnectedLabel: string;
  nextReminderLabel: string;
  isReady: boolean;
  onPress: () => void;
};
```

**Visual States:**

| Condition | "READY" Badge | Next Reminder Color |
|-----------|---------------|---------------------|
| Due today or overdue | Yes | `secondary` (rose) |
| Due in future | No | `slate-600` |

**Rhythm Labels** (mapped from bucket):
- `daily` → "Every day"
- `weekly` → "Every week"
- `bi-weekly` → "Every two weeks"
- `every-three-weeks` → "Every three weeks"
- `monthly` → "Monthly check-in"
- `every-six-months` → "Twice a year"
- `yearly` → "Once a year"
- `custom` → "Custom schedule"

### RecentConnectionRow

Compact row for contacts in the "Recently connected" section.

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  ┌────┐                                         │
│  │ 📷 │  Sarah Jenkins              ✓           │
│  └────┘  Connected yesterday                    │
└─────────────────────────────────────────────────┘
```

**Props:**
```typescript
type RecentConnectionRowProps = {
  contact: Contact;
  connectedLabel: string;
  onPress: () => void;
};
```

**Styling:**
- Avatar: 40x40 (smaller than ConnectionCard)
- Padding: p-4 (more compact)
- Muted check circle icon on right
- Lighter card: `bg-white` with subtle border

**Connected Label Logic:**
- Today → "Connected today"
- 1 day ago → "Connected yesterday"
- 2-14 days ago → "Connected X days ago"

### ExpandableFAB

Floating action button that expands to reveal add options.

**Layout (collapsed):**
```
                                    ┌─────┐
                                    │  +  │  ← Primary FAB (rotated 45°)
                                    └─────┘
```

**Layout (expanded):**
```
                    Add manually    ┌─────┐
                                    │ 👤+ │  ← Secondary action
                                    └─────┘
              Import from contacts  ┌─────┐
                                    │ 📇  │  ← Secondary action
                                    └─────┘
                                    ┌─────┐
                                    │  ✕  │  ← Primary FAB (now shows X)
                                    └─────┘
```

**Props:**
```typescript
type ExpandableFABProps = {
  onAddManually: () => void;
  onImportContacts: () => void;
};
```

**Behavior:**
- Tap primary FAB → expands with animation, icon rotates to X
- Tap X or outside → collapses
- Secondary buttons have text labels to the left

**Styling:**
- Primary FAB: `bg-primary`, 64x64
- Secondary FABs: `bg-white` with border, 48x48

**Animation:**
- Use `react-native-reanimated` for smooth expand/collapse
- Secondary buttons fade in and slide up when expanding

## Service Layer

### New Functions in `services/contacts.ts`

```typescript
// Get contacts filtered by type
getContactsByFilter(filter: 'all' | 'due' | 'archived'): Contact[]
  - 'all': isArchived === false
  - 'due': isArchived === false AND nextContactDate <= today
  - 'archived': isArchived === true

// Get filter counts for pills
getFilterCounts(): { all: number; due: number; archived: number }

// Get recently connected contacts (within last 14 days)
getRecentlyConnectedContacts(): Contact[]
  - lastContactedAt >= (today - 14 days)
  - isArchived === false
  - Sorted by lastContactedAt descending (most recent first)
```

### Helper Functions

```typescript
// Format "last connected" label
formatLastConnectedLabel(lastContactedAt: number | null): string
  - null → "It's been a while since you last connected"
  - today → "Connected today"
  - yesterday → "Connected yesterday"
  - else → "X days/weeks/months ago"

// Format rhythm label from bucket
formatRhythmLabel(bucket: Contact['bucket']): string
  - Maps bucket enum to human-readable label
```

## File Structure

```
components/
├── ConnectionCard.tsx          ← NEW: Large card for due contacts
├── RecentConnectionRow.tsx     ← NEW: Compact row for recent contacts
├── FilterPills.tsx             ← NEW: Horizontal filter tabs
├── ExpandableFAB.tsx           ← NEW: Expandable floating action button
└── ConnectionsHeader.tsx       ← NEW: Header with branding + search

services/
└── contacts.ts                 ← MODIFY: Add filter/recent functions

app/(tabs)/
├── two.tsx                     ← REFACTOR: Becomes Connections screen
└── _layout.tsx                 ← MODIFY: Update tab name and icon
```

## Screen Implementation

```tsx
// app/(tabs)/two.tsx
export default function ConnectionsScreen() {
  const [filter, setFilter] = useState<'all' | 'due' | 'archived'>('all');

  return (
    <View>
      <ConnectionsHeader onSearchPress={...} />
      <FilterPills selected={filter} counts={...} onSelect={setFilter} />

      <ScrollView>
        {filter !== 'archived' && (
          <>
            <SectionHeader title="Connections to nurture" />
            {dueContacts.map(c => <ConnectionCard ... />)}

            <SectionHeader title="Recently connected" />
            {recentContacts.map(c => <RecentConnectionRow ... />)}
          </>
        )}

        {filter === 'archived' && (
          <ArchivedList contacts={archivedContacts} />
        )}
      </ScrollView>

      <ExpandableFAB ... />
    </View>
  );
}
```

## Tab Configuration

Update `app/(tabs)/_layout.tsx`:
- Rename "two" tab to "Connections"
- Use `contacts` icon (filled when active)
