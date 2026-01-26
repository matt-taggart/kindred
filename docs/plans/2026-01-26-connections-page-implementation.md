# Connections Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor the Connections tab (`two.tsx`) to match the new design with filter pills, ConnectionCard for due contacts, RecentConnectionRow for recently connected, and ExpandableFAB.

**Architecture:** The screen uses a FlatList with sectioned data. Filter pills control which contacts appear. Service layer provides filtered/grouped data. Five new components are extracted for reusability.

**Tech Stack:** React Native, NativeWind (Tailwind), Expo Router, Drizzle ORM, react-native-reanimated (for FAB animation)

---

## Task 1: Add getRecentlyConnectedContacts Service Function

**Files:**
- Modify: `services/contactService.ts`
- Test: `services/__tests__/contactService.test.ts`

**Step 1: Write the failing test**

Add to `services/__tests__/contactService.test.ts`:

```typescript
describe('getRecentlyConnectedContacts', () => {
  it('returns contacts connected within last 14 days', () => {
    const now = Date.now();
    const fiveDaysAgo = now - 5 * 24 * 60 * 60 * 1000;
    const twentyDaysAgo = now - 20 * 24 * 60 * 60 * 1000;

    // Add contact connected 5 days ago
    addContact({
      name: 'Recent Contact',
      bucket: 'weekly',
      lastContactedAt: fiveDaysAgo,
    });

    // Add contact connected 20 days ago (outside window)
    addContact({
      name: 'Old Contact',
      bucket: 'weekly',
      lastContactedAt: twentyDaysAgo,
    });

    const recent = getRecentlyConnectedContacts();

    expect(recent).toHaveLength(1);
    expect(recent[0].name).toBe('Recent Contact');
  });

  it('excludes archived contacts', () => {
    const now = Date.now();
    const fiveDaysAgo = now - 5 * 24 * 60 * 60 * 1000;

    const contact = addContact({
      name: 'Archived Recent',
      bucket: 'weekly',
      lastContactedAt: fiveDaysAgo,
    });
    archiveContact(contact.id);

    const recent = getRecentlyConnectedContacts();

    expect(recent).toHaveLength(0);
  });

  it('sorts by most recent first', () => {
    const now = Date.now();
    const twoDaysAgo = now - 2 * 24 * 60 * 60 * 1000;
    const fiveDaysAgo = now - 5 * 24 * 60 * 60 * 1000;

    addContact({
      name: 'Five Days Ago',
      bucket: 'weekly',
      lastContactedAt: fiveDaysAgo,
    });
    addContact({
      name: 'Two Days Ago',
      bucket: 'weekly',
      lastContactedAt: twoDaysAgo,
    });

    const recent = getRecentlyConnectedContacts();

    expect(recent[0].name).toBe('Two Days Ago');
    expect(recent[1].name).toBe('Five Days Ago');
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test --prefix /Users/mtaggart/Documents/kindred/.worktrees/connections-page -- --watchAll=false --testPathPattern="contactService"
```

Expected: FAIL with "getRecentlyConnectedContacts is not a function"

**Step 3: Write minimal implementation**

Add to `services/contactService.ts`:

```typescript
const RECENTLY_CONNECTED_DAYS = 14;

export const getRecentlyConnectedContacts = (): Contact[] => {
  const db = getDb();
  const cutoffMs = Date.now() - RECENTLY_CONNECTED_DAYS * 24 * 60 * 60 * 1000;

  return db
    .select()
    .from(contacts)
    .where(
      and(
        eq(contacts.isArchived, false),
        lte(cutoffMs, contacts.lastContactedAt)
      )
    )
    .orderBy(desc(contacts.lastContactedAt))
    .all()
    .filter((c) => c.lastContactedAt !== null && c.lastContactedAt >= cutoffMs);
};
```

**Step 4: Run test to verify it passes**

```bash
npm test --prefix /Users/mtaggart/Documents/kindred/.worktrees/connections-page -- --watchAll=false --testPathPattern="contactService"
```

Expected: PASS

**Step 5: Commit**

```bash
cd /Users/mtaggart/Documents/kindred/.worktrees/connections-page && git add services/contactService.ts services/__tests__/contactService.test.ts && git commit -m "feat(services): add getRecentlyConnectedContacts function

Returns contacts connected within last 14 days, excluding archived,
sorted by most recent first.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Add getFilterCounts Service Function

**Files:**
- Modify: `services/contactService.ts`
- Test: `services/__tests__/contactService.test.ts`

**Step 1: Write the failing test**

```typescript
describe('getFilterCounts', () => {
  it('returns counts for all, due, and archived', () => {
    const now = Date.now();
    const pastDate = now - 24 * 60 * 60 * 1000;
    const futureDate = now + 7 * 24 * 60 * 60 * 1000;

    // Active, due
    addContact({ name: 'Due Contact', bucket: 'weekly', nextContactDate: pastDate });

    // Active, not due
    addContact({ name: 'Not Due', bucket: 'weekly', nextContactDate: futureDate });

    // Archived
    const archived = addContact({ name: 'Archived', bucket: 'weekly' });
    archiveContact(archived.id);

    const counts = getFilterCounts();

    expect(counts.all).toBe(2);
    expect(counts.due).toBe(1);
    expect(counts.archived).toBe(1);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test --prefix /Users/mtaggart/Documents/kindred/.worktrees/connections-page -- --watchAll=false --testPathPattern="contactService"
```

Expected: FAIL with "getFilterCounts is not a function"

**Step 3: Write minimal implementation**

```typescript
export type FilterCounts = {
  all: number;
  due: number;
  archived: number;
};

export const getFilterCounts = (): FilterCounts => {
  const db = getDb();
  const now = Date.now();

  const allContacts = db.select().from(contacts).all();

  const all = allContacts.filter((c) => !c.isArchived).length;
  const due = allContacts.filter(
    (c) => !c.isArchived && c.nextContactDate !== null && c.nextContactDate <= now
  ).length;
  const archived = allContacts.filter((c) => c.isArchived).length;

  return { all, due, archived };
};
```

**Step 4: Run test to verify it passes**

```bash
npm test --prefix /Users/mtaggart/Documents/kindred/.worktrees/connections-page -- --watchAll=false --testPathPattern="contactService"
```

Expected: PASS

**Step 5: Commit**

```bash
cd /Users/mtaggart/Documents/kindred/.worktrees/connections-page && git add services/contactService.ts services/__tests__/contactService.test.ts && git commit -m "feat(services): add getFilterCounts function

Returns counts for all (non-archived), due, and archived contacts.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Add formatRhythmLabel Utility Function

**Files:**
- Modify: `utils/timeFormatting.ts`
- Test: `utils/__tests__/timeFormatting.test.ts`

**Step 1: Write the failing test**

Create `utils/__tests__/timeFormatting.test.ts` if it doesn't exist:

```typescript
import { formatRhythmLabel } from '../timeFormatting';

describe('formatRhythmLabel', () => {
  it('formats daily bucket', () => {
    expect(formatRhythmLabel('daily')).toBe('Every day');
  });

  it('formats weekly bucket', () => {
    expect(formatRhythmLabel('weekly')).toBe('Every week');
  });

  it('formats bi-weekly bucket', () => {
    expect(formatRhythmLabel('bi-weekly')).toBe('Every two weeks');
  });

  it('formats every-three-weeks bucket', () => {
    expect(formatRhythmLabel('every-three-weeks')).toBe('Every three weeks');
  });

  it('formats monthly bucket', () => {
    expect(formatRhythmLabel('monthly')).toBe('Monthly check-in');
  });

  it('formats every-six-months bucket', () => {
    expect(formatRhythmLabel('every-six-months')).toBe('Twice a year');
  });

  it('formats yearly bucket', () => {
    expect(formatRhythmLabel('yearly')).toBe('Once a year');
  });

  it('formats custom bucket', () => {
    expect(formatRhythmLabel('custom')).toBe('Custom schedule');
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test --prefix /Users/mtaggart/Documents/kindred/.worktrees/connections-page -- --watchAll=false --testPathPattern="timeFormatting"
```

Expected: FAIL with "formatRhythmLabel is not a function"

**Step 3: Write minimal implementation**

Add to `utils/timeFormatting.ts`:

```typescript
type Bucket = 'daily' | 'weekly' | 'bi-weekly' | 'every-three-weeks' | 'monthly' | 'every-six-months' | 'yearly' | 'custom';

export function formatRhythmLabel(bucket: Bucket): string {
  switch (bucket) {
    case 'daily':
      return 'Every day';
    case 'weekly':
      return 'Every week';
    case 'bi-weekly':
      return 'Every two weeks';
    case 'every-three-weeks':
      return 'Every three weeks';
    case 'monthly':
      return 'Monthly check-in';
    case 'every-six-months':
      return 'Twice a year';
    case 'yearly':
      return 'Once a year';
    case 'custom':
      return 'Custom schedule';
    default:
      return 'Custom schedule';
  }
}
```

**Step 4: Run test to verify it passes**

```bash
npm test --prefix /Users/mtaggart/Documents/kindred/.worktrees/connections-page -- --watchAll=false --testPathPattern="timeFormatting"
```

Expected: PASS

**Step 5: Commit**

```bash
cd /Users/mtaggart/Documents/kindred/.worktrees/connections-page && git add utils/timeFormatting.ts utils/__tests__/timeFormatting.test.ts && git commit -m "feat(utils): add formatRhythmLabel function

Maps bucket enum to human-readable rhythm labels.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Create ConnectionsHeader Component

**Files:**
- Create: `components/ConnectionsHeader.tsx`
- Create: `components/ConnectionsHeader.test.tsx`

**Step 1: Write the failing test**

Create `components/ConnectionsHeader.test.tsx`:

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ConnectionsHeader } from './ConnectionsHeader';

describe('ConnectionsHeader', () => {
  const mockOnSearchPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the Kindred branding', () => {
    const { getByText } = render(
      <ConnectionsHeader onSearchPress={mockOnSearchPress} />
    );

    expect(getByText('KINDRED')).toBeTruthy();
  });

  it('renders the title', () => {
    const { getByText } = render(
      <ConnectionsHeader onSearchPress={mockOnSearchPress} />
    );

    expect(getByText('Connections')).toBeTruthy();
  });

  it('renders the subtitle', () => {
    const { getByText } = render(
      <ConnectionsHeader onSearchPress={mockOnSearchPress} />
    );

    expect(getByText('Stay close to the people who matter most.')).toBeTruthy();
  });

  it('calls onSearchPress when search button is pressed', () => {
    const { getByTestId } = render(
      <ConnectionsHeader onSearchPress={mockOnSearchPress} />
    );

    fireEvent.press(getByTestId('search-button'));
    expect(mockOnSearchPress).toHaveBeenCalledTimes(1);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test --prefix /Users/mtaggart/Documents/kindred/.worktrees/connections-page -- --watchAll=false --testPathPattern="ConnectionsHeader"
```

Expected: FAIL with "Cannot find module './ConnectionsHeader'"

**Step 3: Write minimal implementation**

Create `components/ConnectionsHeader.tsx`:

```typescript
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ConnectionsHeaderProps = {
  onSearchPress: () => void;
};

export function ConnectionsHeader({ onSearchPress }: ConnectionsHeaderProps) {
  return (
    <View className="mb-6">
      <View className="flex-row justify-between items-start mb-2">
        <View>
          <View className="flex-row items-center gap-2 mb-1">
            <View className="w-8 h-8 items-center justify-center bg-primary/10 rounded-full">
              <Ionicons name="heart" size={16} color="#9DBEBB" />
            </View>
            <Text className="text-xs font-semibold tracking-widest uppercase text-primary/70">
              KINDRED
            </Text>
          </View>
          <Text className="text-4xl font-semibold tracking-tight text-warmgray dark:text-white">
            Connections
          </Text>
        </View>
        <TouchableOpacity
          testID="search-button"
          onPress={onSearchPress}
          className="p-3 bg-white dark:bg-card-dark shadow-sm border border-slate-100 dark:border-slate-800 rounded-full items-center justify-center"
          activeOpacity={0.7}
        >
          <Ionicons name="search" size={20} color="#94a3b8" />
        </TouchableOpacity>
      </View>
      <Text className="text-slate-500 dark:text-slate-400 text-lg">
        Stay close to the people who matter most.
      </Text>
    </View>
  );
}
```

**Step 4: Run test to verify it passes**

```bash
npm test --prefix /Users/mtaggart/Documents/kindred/.worktrees/connections-page -- --watchAll=false --testPathPattern="ConnectionsHeader"
```

Expected: PASS

**Step 5: Commit**

```bash
cd /Users/mtaggart/Documents/kindred/.worktrees/connections-page && git add components/ConnectionsHeader.tsx components/ConnectionsHeader.test.tsx && git commit -m "feat(components): add ConnectionsHeader component

Header with Kindred branding, title, subtitle, and search button.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Create FilterPills Component

**Files:**
- Create: `components/FilterPills.tsx`
- Create: `components/FilterPills.test.tsx`

**Step 1: Write the failing test**

Create `components/FilterPills.test.tsx`:

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FilterPills } from './FilterPills';

describe('FilterPills', () => {
  const mockOnSelect = jest.fn();
  const defaultCounts = { all: 12, due: 3, archived: 2 };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all filter options with counts', () => {
    const { getByText } = render(
      <FilterPills selected="all" counts={defaultCounts} onSelect={mockOnSelect} />
    );

    expect(getByText(/All/)).toBeTruthy();
    expect(getByText(/12/)).toBeTruthy();
    expect(getByText(/Due/)).toBeTruthy();
    expect(getByText(/3/)).toBeTruthy();
    expect(getByText(/Archived/)).toBeTruthy();
    expect(getByText(/2/)).toBeTruthy();
  });

  it('calls onSelect with filter value when pressed', () => {
    const { getByTestId } = render(
      <FilterPills selected="all" counts={defaultCounts} onSelect={mockOnSelect} />
    );

    fireEvent.press(getByTestId('filter-due'));
    expect(mockOnSelect).toHaveBeenCalledWith('due');
  });

  it('shows active styling for selected filter', () => {
    const { getByTestId } = render(
      <FilterPills selected="due" counts={defaultCounts} onSelect={mockOnSelect} />
    );

    const dueButton = getByTestId('filter-due');
    expect(dueButton.props.accessibilityState.selected).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test --prefix /Users/mtaggart/Documents/kindred/.worktrees/connections-page -- --watchAll=false --testPathPattern="FilterPills"
```

Expected: FAIL with "Cannot find module './FilterPills'"

**Step 3: Write minimal implementation**

Create `components/FilterPills.tsx`:

```typescript
import React from 'react';
import { View, TouchableOpacity, Text, ScrollView } from 'react-native';

export type FilterOption = 'all' | 'due' | 'archived';

type FilterPillsProps = {
  selected: FilterOption;
  counts: { all: number; due: number; archived: number };
  onSelect: (filter: FilterOption) => void;
};

const filterLabels: Record<FilterOption, string> = {
  all: 'All',
  due: 'Due',
  archived: 'Archived',
};

export function FilterPills({ selected, counts, onSelect }: FilterPillsProps) {
  const filters: FilterOption[] = ['all', 'due', 'archived'];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-8"
      contentContainerStyle={{ gap: 8, paddingBottom: 8 }}
    >
      {filters.map((filter) => {
        const isActive = selected === filter;
        const count = counts[filter];

        return (
          <TouchableOpacity
            key={filter}
            testID={`filter-${filter}`}
            onPress={() => onSelect(filter)}
            accessibilityState={{ selected: isActive }}
            activeOpacity={0.85}
            className={`px-6 py-2 rounded-full ${
              isActive
                ? 'bg-slate-800 dark:bg-white'
                : 'bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                isActive
                  ? 'text-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {filterLabels[filter]} · {count}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
```

**Step 4: Run test to verify it passes**

```bash
npm test --prefix /Users/mtaggart/Documents/kindred/.worktrees/connections-page -- --watchAll=false --testPathPattern="FilterPills"
```

Expected: PASS

**Step 5: Commit**

```bash
cd /Users/mtaggart/Documents/kindred/.worktrees/connections-page && git add components/FilterPills.tsx components/FilterPills.test.tsx && git commit -m "feat(components): add FilterPills component

Horizontal scrollable filter tabs for All/Due/Archived with counts.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Create ConnectionCard Component

**Files:**
- Create: `components/ConnectionCard.tsx`
- Create: `components/ConnectionCard.test.tsx`

**Step 1: Write the failing test**

Create `components/ConnectionCard.test.tsx`:

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ConnectionCard } from './ConnectionCard';
import type { Contact } from '@/db/schema';

describe('ConnectionCard', () => {
  const mockOnPress = jest.fn();
  const baseContact: Contact = {
    id: '1',
    name: 'Test Contact',
    phone: null,
    avatarUri: null,
    bucket: 'weekly',
    customIntervalDays: null,
    lastContactedAt: null,
    nextContactDate: Date.now(),
    birthday: null,
    relationship: null,
    isArchived: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders contact name', () => {
    const { getByText } = render(
      <ConnectionCard
        contact={baseContact}
        lastConnectedLabel="2 months ago"
        nextReminderLabel="Today"
        isReady={false}
        onPress={mockOnPress}
      />
    );

    expect(getByText('Test Contact')).toBeTruthy();
  });

  it('renders rhythm label', () => {
    const { getByText } = render(
      <ConnectionCard
        contact={baseContact}
        lastConnectedLabel="2 months ago"
        nextReminderLabel="Today"
        isReady={false}
        onPress={mockOnPress}
      />
    );

    expect(getByText('Every week')).toBeTruthy();
  });

  it('renders last connected label', () => {
    const { getByText } = render(
      <ConnectionCard
        contact={baseContact}
        lastConnectedLabel="2 months ago"
        nextReminderLabel="Today"
        isReady={false}
        onPress={mockOnPress}
      />
    );

    expect(getByText('2 months ago')).toBeTruthy();
  });

  it('renders next reminder label', () => {
    const { getByText } = render(
      <ConnectionCard
        contact={baseContact}
        lastConnectedLabel="2 months ago"
        nextReminderLabel="Today"
        isReady={false}
        onPress={mockOnPress}
      />
    );

    expect(getByText('Today')).toBeTruthy();
  });

  it('shows READY badge when isReady is true', () => {
    const { getByText } = render(
      <ConnectionCard
        contact={baseContact}
        lastConnectedLabel="2 months ago"
        nextReminderLabel="Today"
        isReady={true}
        onPress={mockOnPress}
      />
    );

    expect(getByText('Ready')).toBeTruthy();
  });

  it('hides READY badge when isReady is false', () => {
    const { queryByText } = render(
      <ConnectionCard
        contact={baseContact}
        lastConnectedLabel="2 months ago"
        nextReminderLabel="Tomorrow"
        isReady={false}
        onPress={mockOnPress}
      />
    );

    expect(queryByText('Ready')).toBeNull();
  });

  it('calls onPress when pressed', () => {
    const { getByTestId } = render(
      <ConnectionCard
        contact={baseContact}
        lastConnectedLabel="2 months ago"
        nextReminderLabel="Today"
        isReady={false}
        onPress={mockOnPress}
      />
    );

    fireEvent.press(getByTestId('connection-card'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test --prefix /Users/mtaggart/Documents/kindred/.worktrees/connections-page -- --watchAll=false --testPathPattern="ConnectionCard.test"
```

Expected: FAIL with "Cannot find module './ConnectionCard'"

**Step 3: Write minimal implementation**

Create `components/ConnectionCard.tsx`:

```typescript
import React from 'react';
import { View, TouchableOpacity, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Contact } from '@/db/schema';
import { formatRhythmLabel } from '@/utils/timeFormatting';

type ConnectionCardProps = {
  contact: Contact;
  lastConnectedLabel: string;
  nextReminderLabel: string;
  isReady: boolean;
  onPress: () => void;
};

export function ConnectionCard({
  contact,
  lastConnectedLabel,
  nextReminderLabel,
  isReady,
  onPress,
}: ConnectionCardProps) {
  const rhythmLabel = formatRhythmLabel(contact.bucket);

  return (
    <TouchableOpacity
      testID="connection-card"
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-white dark:bg-card-dark p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden mb-4"
    >
      {isReady && (
        <View className="absolute top-0 right-0 p-4">
          <View className="bg-secondary/10 px-3 py-1 rounded-full">
            <Text className="text-secondary text-[10px] font-bold uppercase tracking-wider">
              Ready
            </Text>
          </View>
        </View>
      )}

      <View className="flex-row items-center gap-4 mb-4">
        <View className="w-14 h-14 rounded-full bg-primary/20 items-center justify-center overflow-hidden">
          {contact.avatarUri ? (
            <Image
              source={{ uri: contact.avatarUri }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="person" size={24} color="#9DBEBB" />
          )}
        </View>
        <View>
          <Text className="text-xl font-semibold text-warmgray dark:text-white">
            {contact.name}
          </Text>
          <Text className="text-sm text-slate-400">{rhythmLabel}</Text>
        </View>
      </View>

      <View className="space-y-4">
        <View>
          <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
            Last Connected
          </Text>
          <Text className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {lastConnectedLabel}
          </Text>
        </View>

        <View className="flex-row justify-between items-end">
          <View>
            <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
              Next Reminder
            </Text>
            <Text
              className={`text-sm font-semibold ${
                isReady ? 'text-secondary' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {nextReminderLabel}
            </Text>
          </View>
          <View className="w-10 h-10 bg-slate-50 dark:bg-slate-800/50 rounded-full items-center justify-center">
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
```

**Step 4: Run test to verify it passes**

```bash
npm test --prefix /Users/mtaggart/Documents/kindred/.worktrees/connections-page -- --watchAll=false --testPathPattern="ConnectionCard.test"
```

Expected: PASS

**Step 5: Commit**

```bash
cd /Users/mtaggart/Documents/kindred/.worktrees/connections-page && git add components/ConnectionCard.tsx components/ConnectionCard.test.tsx && git commit -m "feat(components): add ConnectionCard component

Large card for due contacts with avatar, rhythm, last connected,
next reminder, and optional READY badge.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Create RecentConnectionRow Component

**Files:**
- Create: `components/RecentConnectionRow.tsx`
- Create: `components/RecentConnectionRow.test.tsx`

**Step 1: Write the failing test**

Create `components/RecentConnectionRow.test.tsx`:

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RecentConnectionRow } from './RecentConnectionRow';
import type { Contact } from '@/db/schema';

describe('RecentConnectionRow', () => {
  const mockOnPress = jest.fn();
  const baseContact: Contact = {
    id: '1',
    name: 'Sarah Jenkins',
    phone: null,
    avatarUri: null,
    bucket: 'weekly',
    customIntervalDays: null,
    lastContactedAt: Date.now() - 24 * 60 * 60 * 1000,
    nextContactDate: null,
    birthday: null,
    relationship: null,
    isArchived: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders contact name', () => {
    const { getByText } = render(
      <RecentConnectionRow
        contact={baseContact}
        connectedLabel="Connected yesterday"
        onPress={mockOnPress}
      />
    );

    expect(getByText('Sarah Jenkins')).toBeTruthy();
  });

  it('renders connected label', () => {
    const { getByText } = render(
      <RecentConnectionRow
        contact={baseContact}
        connectedLabel="Connected yesterday"
        onPress={mockOnPress}
      />
    );

    expect(getByText('Connected yesterday')).toBeTruthy();
  });

  it('renders check circle icon', () => {
    const { getByTestId } = render(
      <RecentConnectionRow
        contact={baseContact}
        connectedLabel="Connected yesterday"
        onPress={mockOnPress}
      />
    );

    expect(getByTestId('check-icon')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByTestId } = render(
      <RecentConnectionRow
        contact={baseContact}
        connectedLabel="Connected yesterday"
        onPress={mockOnPress}
      />
    );

    fireEvent.press(getByTestId('recent-connection-row'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test --prefix /Users/mtaggart/Documents/kindred/.worktrees/connections-page -- --watchAll=false --testPathPattern="RecentConnectionRow"
```

Expected: FAIL with "Cannot find module './RecentConnectionRow'"

**Step 3: Write minimal implementation**

Create `components/RecentConnectionRow.tsx`:

```typescript
import React from 'react';
import { View, TouchableOpacity, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Contact } from '@/db/schema';

type RecentConnectionRowProps = {
  contact: Contact;
  connectedLabel: string;
  onPress: () => void;
};

export function RecentConnectionRow({
  contact,
  connectedLabel,
  onPress,
}: RecentConnectionRowProps) {
  return (
    <TouchableOpacity
      testID="recent-connection-row"
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center justify-between bg-white dark:bg-card-dark/40 p-4 rounded-3xl border border-slate-100 dark:border-slate-800/50 mb-3"
    >
      <View className="flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden items-center justify-center">
          {contact.avatarUri ? (
            <Image
              source={{ uri: contact.avatarUri }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="person" size={18} color="#94a3b8" />
          )}
        </View>
        <View>
          <Text className="text-sm font-semibold text-warmgray dark:text-white">
            {contact.name}
          </Text>
          <Text className="text-[11px] text-slate-400">{connectedLabel}</Text>
        </View>
      </View>
      <Ionicons
        testID="check-icon"
        name="checkmark-circle"
        size={18}
        color="#cbd5e1"
      />
    </TouchableOpacity>
  );
}
```

**Step 4: Run test to verify it passes**

```bash
npm test --prefix /Users/mtaggart/Documents/kindred/.worktrees/connections-page -- --watchAll=false --testPathPattern="RecentConnectionRow"
```

Expected: PASS

**Step 5: Commit**

```bash
cd /Users/mtaggart/Documents/kindred/.worktrees/connections-page && git add components/RecentConnectionRow.tsx components/RecentConnectionRow.test.tsx && git commit -m "feat(components): add RecentConnectionRow component

Compact row for recently connected contacts with avatar, name,
connected label, and check icon.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Create ExpandableFAB Component

**Files:**
- Create: `components/ExpandableFAB.tsx`
- Create: `components/ExpandableFAB.test.tsx`

**Step 1: Write the failing test**

Create `components/ExpandableFAB.test.tsx`:

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ExpandableFAB } from './ExpandableFAB';

describe('ExpandableFAB', () => {
  const mockOnAddManually = jest.fn();
  const mockOnImportContacts = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders primary FAB button', () => {
    const { getByTestId } = render(
      <ExpandableFAB
        onAddManually={mockOnAddManually}
        onImportContacts={mockOnImportContacts}
      />
    );

    expect(getByTestId('primary-fab')).toBeTruthy();
  });

  it('shows secondary actions when expanded', () => {
    const { getByTestId, queryByTestId } = render(
      <ExpandableFAB
        onAddManually={mockOnAddManually}
        onImportContacts={mockOnImportContacts}
      />
    );

    // Initially hidden
    expect(queryByTestId('add-manually-fab')).toBeNull();

    // Expand
    fireEvent.press(getByTestId('primary-fab'));

    // Now visible
    expect(getByTestId('add-manually-fab')).toBeTruthy();
    expect(getByTestId('import-contacts-fab')).toBeTruthy();
  });

  it('calls onAddManually when add manually button pressed', () => {
    const { getByTestId } = render(
      <ExpandableFAB
        onAddManually={mockOnAddManually}
        onImportContacts={mockOnImportContacts}
      />
    );

    fireEvent.press(getByTestId('primary-fab'));
    fireEvent.press(getByTestId('add-manually-fab'));

    expect(mockOnAddManually).toHaveBeenCalledTimes(1);
  });

  it('calls onImportContacts when import button pressed', () => {
    const { getByTestId } = render(
      <ExpandableFAB
        onAddManually={mockOnAddManually}
        onImportContacts={mockOnImportContacts}
      />
    );

    fireEvent.press(getByTestId('primary-fab'));
    fireEvent.press(getByTestId('import-contacts-fab'));

    expect(mockOnImportContacts).toHaveBeenCalledTimes(1);
  });

  it('collapses when primary FAB pressed while expanded', () => {
    const { getByTestId, queryByTestId } = render(
      <ExpandableFAB
        onAddManually={mockOnAddManually}
        onImportContacts={mockOnImportContacts}
      />
    );

    // Expand
    fireEvent.press(getByTestId('primary-fab'));
    expect(getByTestId('add-manually-fab')).toBeTruthy();

    // Collapse
    fireEvent.press(getByTestId('primary-fab'));
    expect(queryByTestId('add-manually-fab')).toBeNull();
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test --prefix /Users/mtaggart/Documents/kindred/.worktrees/connections-page -- --watchAll=false --testPathPattern="ExpandableFAB"
```

Expected: FAIL with "Cannot find module './ExpandableFAB'"

**Step 3: Write minimal implementation**

Create `components/ExpandableFAB.tsx`:

```typescript
import React, { useState } from 'react';
import { View, TouchableOpacity, Text, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type ExpandableFABProps = {
  onAddManually: () => void;
  onImportContacts: () => void;
};

export function ExpandableFAB({ onAddManually, onImportContacts }: ExpandableFABProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const handleAddManually = () => {
    setIsExpanded(false);
    onAddManually();
  };

  const handleImportContacts = () => {
    setIsExpanded(false);
    onImportContacts();
  };

  return (
    <View className="absolute bottom-28 right-6 items-end z-50">
      {isExpanded && (
        <>
          <View className="flex-row items-center gap-3 mb-3">
            <View className="bg-white/90 dark:bg-card-dark/90 px-3 py-1.5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
              <Text className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Add manually
              </Text>
            </View>
            <TouchableOpacity
              testID="add-manually-fab"
              onPress={handleAddManually}
              activeOpacity={0.9}
              className="w-12 h-12 bg-white dark:bg-card-dark rounded-full shadow-lg border border-slate-100 dark:border-slate-800 items-center justify-center"
            >
              <Ionicons name="person-add" size={20} color="#9DBEBB" />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center gap-3 mb-3">
            <View className="bg-white/90 dark:bg-card-dark/90 px-3 py-1.5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
              <Text className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Import from contacts
              </Text>
            </View>
            <TouchableOpacity
              testID="import-contacts-fab"
              onPress={handleImportContacts}
              activeOpacity={0.9}
              className="w-12 h-12 bg-white dark:bg-card-dark rounded-full shadow-lg border border-slate-100 dark:border-slate-800 items-center justify-center"
            >
              <Ionicons name="book" size={20} color="#9DBEBB" />
            </TouchableOpacity>
          </View>
        </>
      )}

      <TouchableOpacity
        testID="primary-fab"
        onPress={toggleExpanded}
        activeOpacity={0.95}
        className="w-16 h-16 bg-primary rounded-full shadow-xl items-center justify-center"
        style={{ shadowColor: '#9DBEBB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }}
      >
        <Ionicons
          name={isExpanded ? 'close' : 'add'}
          size={28}
          color="white"
          style={{ transform: [{ rotate: isExpanded ? '0deg' : '45deg' }] }}
        />
      </TouchableOpacity>
    </View>
  );
}
```

**Step 4: Run test to verify it passes**

```bash
npm test --prefix /Users/mtaggart/Documents/kindred/.worktrees/connections-page -- --watchAll=false --testPathPattern="ExpandableFAB"
```

Expected: PASS

**Step 5: Commit**

```bash
cd /Users/mtaggart/Documents/kindred/.worktrees/connections-page && git add components/ExpandableFAB.tsx components/ExpandableFAB.test.tsx && git commit -m "feat(components): add ExpandableFAB component

Expandable floating action button with Add manually and Import options.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 9: Create SectionHeader Component

**Files:**
- Create: `components/SectionHeader.tsx`
- Create: `components/SectionHeader.test.tsx`

**Step 1: Write the failing test**

Create `components/SectionHeader.test.tsx`:

```typescript
import React from 'react';
import { render } from '@testing-library/react-native';
import { SectionHeader } from './SectionHeader';

describe('SectionHeader', () => {
  it('renders the title', () => {
    const { getByText } = render(<SectionHeader title="Connections to nurture" />);
    expect(getByText('Connections to nurture')).toBeTruthy();
  });

  it('renders title in uppercase', () => {
    const { getByText } = render(<SectionHeader title="test title" />);
    const element = getByText('test title');
    // Check the text style includes uppercase
    expect(element.props.className).toContain('uppercase');
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test --prefix /Users/mtaggart/Documents/kindred/.worktrees/connections-page -- --watchAll=false --testPathPattern="SectionHeader"
```

Expected: FAIL with "Cannot find module './SectionHeader'"

**Step 3: Write minimal implementation**

Create `components/SectionHeader.tsx`:

```typescript
import React from 'react';
import { Text, View } from 'react-native';

type SectionHeaderProps = {
  title: string;
};

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <View className="mb-4 px-1">
      <Text className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
        {title}
      </Text>
    </View>
  );
}
```

**Step 4: Run test to verify it passes**

```bash
npm test --prefix /Users/mtaggart/Documents/kindred/.worktrees/connections-page -- --watchAll=false --testPathPattern="SectionHeader"
```

Expected: PASS

**Step 5: Commit**

```bash
cd /Users/mtaggart/Documents/kindred/.worktrees/connections-page && git add components/SectionHeader.tsx components/SectionHeader.test.tsx && git commit -m "feat(components): add SectionHeader component

Simple section header with uppercase styling for list sections.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 10: Refactor Connections Screen (two.tsx)

**Files:**
- Modify: `app/(tabs)/two.tsx`

**Step 1: Read current implementation**

Already read above. The current implementation has most of the logic but uses different components.

**Step 2: Refactor to use new components**

Replace the contents of `app/(tabs)/two.tsx`:

```typescript
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  View,
} from "react-native";

import type { Contact } from "@/db/schema";
import { ConnectionsHeader } from "@/components/ConnectionsHeader";
import { FilterPills, FilterOption } from "@/components/FilterPills";
import { ConnectionCard } from "@/components/ConnectionCard";
import { RecentConnectionRow } from "@/components/RecentConnectionRow";
import { SectionHeader } from "@/components/SectionHeader";
import { ExpandableFAB } from "@/components/ExpandableFAB";
import {
  getContacts,
  getRecentlyConnectedContacts,
  getFilterCounts,
  unarchiveContact,
} from "@/services/contactService";
import {
  formatLastConnected,
  formatNextReminder,
} from "@/utils/timeFormatting";

const isContactDue = (contact: Contact) => {
  if (contact.isArchived) return false;
  if (!contact.nextContactDate) return false;
  return contact.nextContactDate <= Date.now();
};

type ListItem =
  | { type: 'section-header'; title: string; key: string }
  | { type: 'connection-card'; contact: Contact; key: string }
  | { type: 'recent-row'; contact: Contact; key: string }
  | { type: 'archived-row'; contact: Contact; key: string };

export default function ConnectionsScreen() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [recentContacts, setRecentContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterOption>("all");
  const [counts, setCounts] = useState({ all: 0, due: 0, archived: 0 });

  const loadContacts = useCallback(() => {
    try {
      const results = getContacts({ includeArchived: true });
      const recent = getRecentlyConnectedContacts();
      const filterCounts = getFilterCounts();

      setContacts(results);
      setRecentContacts(recent);
      setCounts(filterCounts);
    } catch (error) {
      console.warn("Failed to load contacts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadContacts();
    }, [loadContacts])
  );

  const listData = useMemo((): ListItem[] => {
    const items: ListItem[] = [];
    const now = Date.now();

    if (filter === "archived") {
      const archivedContacts = contacts.filter((c) => c.isArchived);
      archivedContacts.forEach((contact) => {
        items.push({ type: 'archived-row', contact, key: `archived-${contact.id}` });
      });
      return items;
    }

    // Due contacts (Connections to nurture)
    const dueContacts = contacts.filter(
      (c) => !c.isArchived && isContactDue(c)
    );

    if (filter === "due") {
      if (dueContacts.length > 0) {
        items.push({ type: 'section-header', title: 'Connections to nurture', key: 'header-due' });
        dueContacts.forEach((contact) => {
          items.push({ type: 'connection-card', contact, key: `card-${contact.id}` });
        });
      }
      return items;
    }

    // All filter: show due + recently connected
    if (dueContacts.length > 0) {
      items.push({ type: 'section-header', title: 'Connections to nurture', key: 'header-due' });
      dueContacts.forEach((contact) => {
        items.push({ type: 'connection-card', contact, key: `card-${contact.id}` });
      });
    }

    // Recently connected (exclude those already in due)
    const dueIds = new Set(dueContacts.map((c) => c.id));
    const recentNotDue = recentContacts.filter((c) => !dueIds.has(c.id));

    if (recentNotDue.length > 0) {
      items.push({ type: 'section-header', title: 'Recently connected', key: 'header-recent' });
      recentNotDue.forEach((contact) => {
        items.push({ type: 'recent-row', contact, key: `recent-${contact.id}` });
      });
    }

    return items;
  }, [contacts, recentContacts, filter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadContacts();
  }, [loadContacts]);

  const handleAddManually = useCallback(() => {
    router.push("/contacts/add");
  }, [router]);

  const handleImportContacts = useCallback(() => {
    router.push({ pathname: "/contacts/import", params: { autoRequest: "1" } });
  }, [router]);

  const handleContactPress = useCallback(
    (contactId: string) => {
      router.push(`/contacts/${contactId}`);
    },
    [router]
  );

  const handleUnarchive = useCallback(
    async (contactId: string) => {
      try {
        await unarchiveContact(contactId);
        loadContacts();
      } catch (error) {
        Alert.alert(
          "Error",
          error instanceof Error ? error.message : "Failed to unarchive connection."
        );
      }
    },
    [loadContacts]
  );

  const handleSearchPress = useCallback(() => {
    // TODO: Implement search
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      switch (item.type) {
        case 'section-header':
          return <SectionHeader title={item.title} />;

        case 'connection-card':
          return (
            <ConnectionCard
              contact={item.contact}
              lastConnectedLabel={formatLastConnected(item.contact.lastContactedAt)}
              nextReminderLabel={formatNextReminder(item.contact.nextContactDate)}
              isReady={isContactDue(item.contact)}
              onPress={() => handleContactPress(item.contact.id)}
            />
          );

        case 'recent-row':
          return (
            <RecentConnectionRow
              contact={item.contact}
              connectedLabel={formatLastConnected(item.contact.lastContactedAt)}
              onPress={() => handleContactPress(item.contact.id)}
            />
          );

        case 'archived-row':
          return (
            <ConnectionCard
              contact={item.contact}
              lastConnectedLabel={formatLastConnected(item.contact.lastContactedAt)}
              nextReminderLabel="Archived"
              isReady={false}
              onPress={() => handleContactPress(item.contact.id)}
            />
          );

        default:
          return null;
      }
    },
    [handleContactPress]
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator size="large" color="#9DBEBB" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <FlatList
        data={listData}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 140,
          paddingTop: 16,
        }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="mb-4">
            <ConnectionsHeader onSearchPress={handleSearchPress} />
            <FilterPills
              selected={filter}
              counts={counts}
              onSelect={setFilter}
            />
          </View>
        }
      />
      <ExpandableFAB
        onAddManually={handleAddManually}
        onImportContacts={handleImportContacts}
      />
    </SafeAreaView>
  );
}
```

**Step 3: Run the app to verify visually**

```bash
cd /Users/mtaggart/Documents/kindred/.worktrees/connections-page && npx expo start
```

Verify:
- Header shows Kindred branding, title, subtitle, search button
- Filter pills show with correct counts
- Due contacts appear in "Connections to nurture" section as large cards
- Recently connected contacts appear as compact rows
- ExpandableFAB works correctly
- Switching filters updates the list

**Step 4: Commit**

```bash
cd /Users/mtaggart/Documents/kindred/.worktrees/connections-page && git add app/\(tabs\)/two.tsx && git commit -m "refactor(connections): implement new Connections page design

- Use ConnectionsHeader with Kindred branding
- Add FilterPills for All/Due/Archived filtering
- Use ConnectionCard for due contacts
- Use RecentConnectionRow for recently connected
- Add ExpandableFAB for add actions
- Sectioned FlatList with proper headers

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 11: Update Tab Layout

**Files:**
- Modify: `app/(tabs)/_layout.tsx`

**Step 1: Update tab configuration**

The current tab is named "Moments" with a calendar icon. Change it to "Connections" with a contacts icon.

In `app/(tabs)/_layout.tsx`, change the `two` tab screen options:

```typescript
<Tabs.Screen
  name="two"
  options={{
    title: 'Connections',
    tabBarIcon: ({ color, focused }) => (
      <MaterialCommunityIcons
        name={focused ? "account-multiple" : "account-multiple-outline"}
        size={28}
        color={color}
      />
    ),
  }}
/>
```

**Step 2: Remove the FAB from _layout.tsx**

The FAB is now in the Connections screen itself (ExpandableFAB). Remove or keep the FAB in `_layout.tsx` based on whether you want it on all tabs. For now, let's keep it for other tabs but the Connections screen will have its own.

Actually, looking at the design, the FAB should probably only appear on the Connections tab. For now, we can leave the existing FAB as-is since it navigates to add contact which is still useful on other screens.

**Step 3: Run the app to verify**

```bash
cd /Users/mtaggart/Documents/kindred/.worktrees/connections-page && npx expo start
```

Verify:
- Tab shows "Connections" label
- Tab icon is contacts icon (account-multiple)
- Icon fills when selected

**Step 4: Commit**

```bash
cd /Users/mtaggart/Documents/kindred/.worktrees/connections-page && git add app/\(tabs\)/_layout.tsx && git commit -m "chore(tabs): rename Moments tab to Connections

Update tab label and icon to match new Connections page design.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 12: Export New Components

**Files:**
- Modify: `components/index.ts` (if it exists) or create exports

**Step 1: Check if index.ts exists**

```bash
ls /Users/mtaggart/Documents/kindred/.worktrees/connections-page/components/index.ts
```

**Step 2: Add exports if needed**

If there's an index.ts, add:

```typescript
export { ConnectionsHeader } from './ConnectionsHeader';
export { FilterPills } from './FilterPills';
export type { FilterOption } from './FilterPills';
export { ConnectionCard } from './ConnectionCard';
export { RecentConnectionRow } from './RecentConnectionRow';
export { SectionHeader } from './SectionHeader';
export { ExpandableFAB } from './ExpandableFAB';
```

**Step 3: Commit**

```bash
cd /Users/mtaggart/Documents/kindred/.worktrees/connections-page && git add components/index.ts && git commit -m "chore(components): export new Connections page components

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 13: Run All Tests

**Step 1: Run full test suite**

```bash
npm test --prefix /Users/mtaggart/Documents/kindred/.worktrees/connections-page -- --watchAll=false
```

**Step 2: Fix any failing tests**

If any tests fail, investigate and fix.

**Step 3: Commit any fixes**

```bash
cd /Users/mtaggart/Documents/kindred/.worktrees/connections-page && git add -A && git commit -m "fix(tests): ensure all tests pass

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Summary

| Task | Component/File | Purpose |
|------|---------------|---------|
| 1 | `getRecentlyConnectedContacts` | Service function for recent contacts |
| 2 | `getFilterCounts` | Service function for filter pill counts |
| 3 | `formatRhythmLabel` | Utility for rhythm display |
| 4 | `ConnectionsHeader` | Header with branding |
| 5 | `FilterPills` | Filter tabs |
| 6 | `ConnectionCard` | Large card for due contacts |
| 7 | `RecentConnectionRow` | Compact row for recent |
| 8 | `ExpandableFAB` | Expandable add button |
| 9 | `SectionHeader` | Section divider |
| 10 | `two.tsx` | Main screen refactor |
| 11 | `_layout.tsx` | Tab configuration |
| 12 | Exports | Component exports |
| 13 | Tests | Verify all pass |
