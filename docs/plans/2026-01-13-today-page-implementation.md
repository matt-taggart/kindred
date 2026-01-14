# Today Page Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the Today page with clear hierarchy, emotional guidance, and momentum feedback.

**Architecture:** Update `getDueContacts()` sorting, modify HomeScreen to use grouped sections with SectionList, add completion tracking state, and enhance the empty state component.

**Tech Stack:** React Native, NativeWind, Expo, Drizzle ORM

---

## Task 1: Update Contact Sorting Logic

**Files:**
- Modify: `services/contactService.ts:129-161`
- Test: `services/__tests__/contactService.test.ts` (new)

**Step 1: Create test file for sorting logic**

Create `services/__tests__/contactService.test.ts`:

```typescript
import { Contact } from '@/db/schema';
import { isBirthdayToday } from '../contactService';

// Mock contact factory
const createContact = (overrides: Partial<Contact> = {}): Contact => ({
  id: 'test-id',
  name: 'Test Contact',
  phone: null,
  avatarUri: null,
  bucket: 'weekly',
  customIntervalDays: null,
  lastContactedAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
  nextContactDate: Date.now(),
  birthday: null,
  isArchived: false,
  ...overrides,
});

describe('isBirthdayToday', () => {
  it('returns true when birthday matches today (YYYY-MM-DD format)', () => {
    const today = new Date('2026-01-13');
    const contact = createContact({ birthday: '1990-01-13' });
    expect(isBirthdayToday(contact, today)).toBe(true);
  });

  it('returns true when birthday matches today (MM-DD format)', () => {
    const today = new Date('2026-01-13');
    const contact = createContact({ birthday: '01-13' });
    expect(isBirthdayToday(contact, today)).toBe(true);
  });

  it('returns false when birthday does not match', () => {
    const today = new Date('2026-01-13');
    const contact = createContact({ birthday: '1990-06-15' });
    expect(isBirthdayToday(contact, today)).toBe(false);
  });

  it('returns false when no birthday set', () => {
    const today = new Date('2026-01-13');
    const contact = createContact({ birthday: null });
    expect(isBirthdayToday(contact, today)).toBe(false);
  });
});
```

**Step 2: Run test to verify it passes**

Run: `pnpm test -- --testPathPattern="contactService" --watchAll=false`

Expected: PASS (tests existing `isBirthdayToday` function)

**Step 3: Commit**

```bash
git add services/__tests__/contactService.test.ts
git commit -m "test: add contactService sorting tests"
```

---

## Task 2: Add Grouped Contacts Function

**Files:**
- Modify: `services/contactService.ts`

**Step 1: Add test for new grouping function**

Add to `services/__tests__/contactService.test.ts`:

```typescript
import { getDueContactsGrouped } from '../contactService';

// Note: This test requires mocking the database, which is complex.
// For now, we'll test the sorting helper directly.

describe('contact sorting', () => {
  it('sorts birthdays before non-birthdays', () => {
    const today = new Date('2026-01-13');
    const birthdayContact = createContact({
      id: 'birthday',
      name: 'Birthday Person',
      birthday: '01-13',
      lastContactedAt: Date.now(), // recent
    });
    const regularContact = createContact({
      id: 'regular',
      name: 'Regular Person',
      birthday: null,
      lastContactedAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
    });

    const contacts = [regularContact, birthdayContact];

    // Sort: birthdays first, then by lastContactedAt ascending (longest gap)
    const sorted = contacts.sort((a, b) => {
      const aBirthday = isBirthdayToday(a, today);
      const bBirthday = isBirthdayToday(b, today);

      if (aBirthday && !bBirthday) return -1;
      if (!aBirthday && bBirthday) return 1;

      // Within same group, sort by longest gap (oldest lastContactedAt first)
      const aLast = a.lastContactedAt || 0;
      const bLast = b.lastContactedAt || 0;
      return aLast - bLast;
    });

    expect(sorted[0].id).toBe('birthday');
    expect(sorted[1].id).toBe('regular');
  });

  it('within non-birthday group, sorts by longest gap first', () => {
    const today = new Date('2026-01-13');
    const recentContact = createContact({
      id: 'recent',
      lastContactedAt: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
    });
    const oldContact = createContact({
      id: 'old',
      lastContactedAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
    });

    const contacts = [recentContact, oldContact];

    const sorted = contacts.sort((a, b) => {
      const aLast = a.lastContactedAt || 0;
      const bLast = b.lastContactedAt || 0;
      return aLast - bLast; // ascending = oldest first
    });

    expect(sorted[0].id).toBe('old');
    expect(sorted[1].id).toBe('recent');
  });
});
```

**Step 2: Run test to verify it passes**

Run: `pnpm test -- --testPathPattern="contactService" --watchAll=false`

Expected: PASS

**Step 3: Add getDueContactsGrouped function**

Add to `services/contactService.ts` after `getDueContacts`:

```typescript
export type GroupedDueContacts = {
  birthdays: Contact[];
  reconnect: Contact[];
};

export const getDueContactsGrouped = (): GroupedDueContacts => {
  const db = getDb();
  const now = new Date();
  const nowMs = now.getTime();

  const allContacts: Contact[] = db
    .select()
    .from(contacts)
    .where(eq(contacts.isArchived, false))
    .all();

  const dueContacts = allContacts.filter((contact: Contact) => {
    if (contact.lastContactedAt && isSameDay(new Date(contact.lastContactedAt), now)) {
      return false;
    }
    const isDue = contact.nextContactDate !== null && contact.nextContactDate <= nowMs;
    const isBirthday = isBirthdayToday(contact, now);
    return isDue || isBirthday;
  });

  const birthdays: Contact[] = [];
  const reconnect: Contact[] = [];

  for (const contact of dueContacts) {
    if (isBirthdayToday(contact, now)) {
      birthdays.push(contact);
    } else {
      reconnect.push(contact);
    }
  }

  // Sort birthdays by name for consistent ordering
  birthdays.sort((a, b) => a.name.localeCompare(b.name));

  // Sort reconnect by longest gap (oldest lastContactedAt first)
  reconnect.sort((a, b) => {
    const aLast = a.lastContactedAt || 0;
    const bLast = b.lastContactedAt || 0;
    return aLast - bLast;
  });

  return { birthdays, reconnect };
};
```

**Step 4: Run tests to verify nothing broke**

Run: `pnpm test -- --testPathPattern="contactService" --watchAll=false`

Expected: PASS

**Step 5: Commit**

```bash
git add services/contactService.ts services/__tests__/contactService.test.ts
git commit -m "feat: add getDueContactsGrouped for Today page sections"
```

---

## Task 3: Update HomeScreen with Sections

**Files:**
- Modify: `app/(tabs)/index.tsx`

**Step 1: Update imports and types**

Replace the imports and add new types at the top of `app/(tabs)/index.tsx`:

```typescript
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  RefreshControl,
  SafeAreaView,
  SectionList,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';

import { Contact } from '@/db/schema';
import { getDueContactsGrouped, GroupedDueContacts, snoozeContact, isBirthdayToday, updateInteraction } from '@/services/contactService';
import CelebrationStatus from '@/components/CelebrationStatus';
import ReachedOutSheet from '@/components/ReachedOutSheet';
import { formatLastConnected } from '@/utils/timeFormatting';

type Section = {
  title: string;
  data: Contact[];
};
```

**Step 2: Update state and data loading**

Replace the state declarations and `loadContacts` function:

```typescript
export default function HomeScreen() {
  const router = useRouter();
  const [groupedContacts, setGroupedContacts] = useState<GroupedDueContacts>({ birthdays: [], reconnect: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [snoozingContactId, setSnoozingContactId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showReachedOutSheet, setShowReachedOutSheet] = useState(false);
  const [completionCount, setCompletionCount] = useState(0);

  const loadContacts = useCallback(() => {
    try {
      const results = getDueContactsGrouped();
      setGroupedContacts(results);
    } catch (e) {
      console.warn('Failed to load contacts:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Build sections for SectionList
  const sections: Section[] = useMemo(() => {
    const result: Section[] = [];
    if (groupedContacts.birthdays.length > 0) {
      result.push({ title: 'Birthdays', data: groupedContacts.birthdays });
    }
    if (groupedContacts.reconnect.length > 0) {
      result.push({ title: 'Time to reconnect', data: groupedContacts.reconnect });
    }
    return result;
  }, [groupedContacts]);

  const totalContacts = groupedContacts.birthdays.length + groupedContacts.reconnect.length;
```

**Step 3: Update handleReachedOutSubmit to track completions**

Replace the `handleReachedOutSubmit` function:

```typescript
  const handleReachedOutSubmit = useCallback(async (note: string) => {
    if (!selectedContact) return;

    try {
      await updateInteraction(selectedContact.id, 'call', note || undefined);
      setCompletionCount(prev => prev + 1);
      loadContacts();
    } catch (error) {
      Alert.alert('Error', 'Failed to save. Please try again.');
    } finally {
      setShowReachedOutSheet(false);
      setSelectedContact(null);
    }
  }, [selectedContact, loadContacts]);
```

**Step 4: Add section header renderer**

Add this function before the return statement:

```typescript
  const renderSectionHeader = useCallback(({ section }: { section: Section }) => (
    <Text className="text-lg font-semibold text-warmgray-muted mb-3 mt-6">
      {section.title}
    </Text>
  ), []);
```

**Step 5: Update the render return**

Replace the entire return statement:

```typescript
  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="flex-1 px-4 pt-6">
        <Text className="mb-1 text-3xl font-semibold text-warmgray">Today</Text>
        <Text className="text-lg text-warmgray-muted font-medium">
          {currentDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </Text>

        {totalContacts > 0 && (
          <Text className="mt-2 text-base text-warmgray-muted">
            Who would you like to reach out to?
          </Text>
        )}

        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{
            paddingBottom: 24,
            flexGrow: totalContacts === 0 ? 1 : undefined,
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<CelebrationStatus completionCount={completionCount} />}
          ListFooterComponent={
            totalContacts > 0 && completionCount > 0 ? (
              <Text className="text-center text-warmgray-muted mt-6">
                {completionCount} {completionCount === 1 ? 'connection' : 'connections'} nurtured today
              </Text>
            ) : null
          }
          stickySectionHeadersEnabled={false}
        />
      </View>

      <ReachedOutSheet
        visible={showReachedOutSheet}
        contact={selectedContact}
        onClose={() => {
          setShowReachedOutSheet(false);
          setSelectedContact(null);
        }}
        onSubmit={handleReachedOutSubmit}
      />
    </SafeAreaView>
  );
}
```

**Step 6: Run the app to verify it compiles**

Run: `pnpm start`

Expected: App starts without errors

**Step 7: Commit**

```bash
git add app/\(tabs\)/index.tsx
git commit -m "feat: update Today page with grouped sections and completion tracking"
```

---

## Task 4: Update CelebrationStatus Component

**Files:**
- Modify: `components/CelebrationStatus.tsx`

**Step 1: Update component to accept completionCount prop**

Replace the entire file:

```typescript
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';

type Props = {
  completionCount?: number;
};

export default function CelebrationStatus({ completionCount = 0 }: Props) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <View className="mb-6 items-center justify-center">
        <Ionicons name="sunny-outline" size={80} color="#9CA986" />
      </View>

      <Text className="text-3xl font-bold text-warmgray text-center leading-tight">
        All caught up!
      </Text>

      {completionCount > 0 ? (
        <Text className="mt-4 text-xl text-warmgray-muted text-center leading-relaxed">
          {completionCount} {completionCount === 1 ? 'connection' : 'connections'} nurtured today.{'\n'}
          Enjoy your day.
        </Text>
      ) : (
        <Text className="mt-4 text-xl text-warmgray-muted text-center leading-relaxed">
          Enjoy your day.
        </Text>
      )}
    </View>
  );
}
```

**Step 2: Run the app to verify changes**

Run: `pnpm start`

Expected: App runs, empty state shows completion count when applicable

**Step 3: Commit**

```bash
git add components/CelebrationStatus.tsx
git commit -m "feat: update CelebrationStatus to show completion count"
```

---

## Task 5: Add Card Animation (Optional Enhancement)

**Files:**
- Modify: `app/(tabs)/index.tsx`

**Step 1: Add animated card wrapper**

This is an optional enhancement. The card can use React Native's `LayoutAnimation` for a simple fade effect when items are removed.

Add this import at the top:

```typescript
import { LayoutAnimation, Platform, UIManager } from 'react-native';
```

Add this setup after the imports:

```typescript
// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
```

**Step 2: Update handleReachedOutSubmit to animate**

Update the function:

```typescript
  const handleReachedOutSubmit = useCallback(async (note: string) => {
    if (!selectedContact) return;

    try {
      await updateInteraction(selectedContact.id, 'call', note || undefined);
      setCompletionCount(prev => prev + 1);

      // Animate the list change
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      loadContacts();
    } catch (error) {
      Alert.alert('Error', 'Failed to save. Please try again.');
    } finally {
      setShowReachedOutSheet(false);
      setSelectedContact(null);
    }
  }, [selectedContact, loadContacts]);
```

**Step 3: Test the animation**

Run: `pnpm ios` or `pnpm android`

Expected: Cards animate smoothly when removed

**Step 4: Commit**

```bash
git add app/\(tabs\)/index.tsx
git commit -m "feat: add layout animation for card removal"
```

---

## Task 6: Final Testing and Cleanup

**Step 1: Run all tests**

Run: `pnpm test -- --watchAll=false`

Expected: All tests pass

**Step 2: Manual testing checklist**

- [ ] Open app with no due contacts → shows "All caught up! Enjoy your day."
- [ ] Open app with due contacts → shows grouped sections
- [ ] Birthday contacts appear in "Birthdays" section at top
- [ ] Non-birthday contacts appear in "Time to reconnect" section
- [ ] Contacts sorted by longest gap (oldest first)
- [ ] "Who would you like to reach out to?" prompt shows when contacts exist
- [ ] Mark a contact as "Reached out" → card animates away
- [ ] Footer shows "1 connection nurtured today" after first completion
- [ ] Clear all contacts → empty state shows completion count
- [ ] Pull to refresh works

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete Today page redesign with hierarchy, guidance, and momentum"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Add sorting tests | `services/__tests__/contactService.test.ts` |
| 2 | Add `getDueContactsGrouped` function | `services/contactService.ts` |
| 3 | Update HomeScreen with SectionList | `app/(tabs)/index.tsx` |
| 4 | Update CelebrationStatus with count | `components/CelebrationStatus.tsx` |
| 5 | Add card animation (optional) | `app/(tabs)/index.tsx` |
| 6 | Final testing | Manual verification |

**Total estimated changes:** ~150 lines modified/added across 4 files
