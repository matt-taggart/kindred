# Today Page UX Enhancements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enhance the Today page with quick actions (Call/Text), specific last-connected dates with colored clock icons, and an empty state for new users.

**Architecture:** Extend existing ContactCard with conditional Call/Text row for contacts with phone numbers. Update timeFormatting utility with granular date formatting and clock color logic. Add new EmptyContactsState component for zero-contacts scenario.

**Tech Stack:** React Native, Expo, NativeWind, Ionicons, Linking API

---

## Task 1: Update Time Formatting Utility

**Files:**
- Modify: `utils/timeFormatting.ts`
- Test: `utils/__tests__/timeFormatting.test.ts`

**Step 1: Write failing tests for specific day formatting**

Add to `utils/__tests__/timeFormatting.test.ts`:

```typescript
describe('formatLastConnected - specific days', () => {
  const NOW = new Date('2026-01-15T12:00:00Z').getTime();
  const DAY = 24 * 60 * 60 * 1000;

  it('returns "Connected today" for same day', () => {
    expect(formatLastConnected(NOW - 1000, NOW)).toBe('Connected today');
  });

  it('returns "Connected yesterday" for 1 day ago', () => {
    expect(formatLastConnected(NOW - DAY, NOW)).toBe('Connected yesterday');
  });

  it('returns "Connected 2 days ago" for 2 days', () => {
    expect(formatLastConnected(NOW - 2 * DAY, NOW)).toBe('Connected 2 days ago');
  });

  it('returns "Connected 3 days ago" for 3 days', () => {
    expect(formatLastConnected(NOW - 3 * DAY, NOW)).toBe('Connected 3 days ago');
  });

  it('returns "Connected 4 days ago" for 4 days', () => {
    expect(formatLastConnected(NOW - 4 * DAY, NOW)).toBe('Connected 4 days ago');
  });

  it('returns "Connected 5 days ago" for 5 days', () => {
    expect(formatLastConnected(NOW - 5 * DAY, NOW)).toBe('Connected 5 days ago');
  });

  it('returns "Connected 6 days ago" for 6 days', () => {
    expect(formatLastConnected(NOW - 6 * DAY, NOW)).toBe('Connected 6 days ago');
  });

  it('returns "Connected last week" for 7-13 days', () => {
    expect(formatLastConnected(NOW - 10 * DAY, NOW)).toBe('Connected last week');
  });

  it('returns "Connected 2 weeks ago" for 14-20 days', () => {
    expect(formatLastConnected(NOW - 16 * DAY, NOW)).toBe('Connected 2 weeks ago');
  });

  it('returns "Connected 3 weeks ago" for 21-29 days', () => {
    expect(formatLastConnected(NOW - 25 * DAY, NOW)).toBe('Connected 3 weeks ago');
  });

  it('returns "Connected last month" for 30-59 days', () => {
    expect(formatLastConnected(NOW - 45 * DAY, NOW)).toBe('Connected last month');
  });

  it('returns "Connected 2 months ago" for 60-89 days', () => {
    expect(formatLastConnected(NOW - 75 * DAY, NOW)).toBe('Connected 2 months ago');
  });

  it('returns "Connected 3 months ago" for 90-119 days', () => {
    expect(formatLastConnected(NOW - 100 * DAY, NOW)).toBe('Connected 3 months ago');
  });

  it('returns "It\'s been a while" for 180+ days', () => {
    expect(formatLastConnected(NOW - 200 * DAY, NOW)).toBe("It's been a while");
  });

  it('returns "Not reached out yet" for null', () => {
    expect(formatLastConnected(null, NOW)).toBe('Not reached out yet');
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `pnpm --dir /Users/mtaggart/Documents/kindred/.worktrees/today-page-ux exec jest utils/__tests__/timeFormatting.test.ts --no-watchman`

Expected: Multiple FAIL - current implementation returns different strings

**Step 3: Update formatLastConnected implementation**

Replace in `utils/timeFormatting.ts`:

```typescript
const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function formatLastConnected(
  timestamp: number | null | undefined,
  now: number = Date.now()
): string {
  if (!timestamp) return 'Not reached out yet';

  const diff = Math.max(0, now - timestamp);
  const days = Math.floor(diff / DAY_IN_MS);

  if (days === 0) return 'Connected today';
  if (days === 1) return 'Connected yesterday';
  if (days <= 6) return `Connected ${days} days ago`;
  if (days <= 13) return 'Connected last week';
  if (days <= 20) return 'Connected 2 weeks ago';
  if (days <= 29) return 'Connected 3 weeks ago';
  if (days <= 59) return 'Connected last month';
  if (days <= 89) return 'Connected 2 months ago';
  if (days <= 119) return 'Connected 3 months ago';
  if (days <= 149) return 'Connected 4 months ago';
  if (days <= 179) return 'Connected 5 months ago';
  return "It's been a while";
}
```

**Step 4: Run tests to verify they pass**

Run: `pnpm --dir /Users/mtaggart/Documents/kindred/.worktrees/today-page-ux exec jest utils/__tests__/timeFormatting.test.ts --no-watchman`

Expected: PASS

**Step 5: Commit**

```bash
git -C /Users/mtaggart/Documents/kindred/.worktrees/today-page-ux add utils/timeFormatting.ts utils/__tests__/timeFormatting.test.ts
git -C /Users/mtaggart/Documents/kindred/.worktrees/today-page-ux commit -m "feat: update formatLastConnected with specific day formatting"
```

---

## Task 2: Add Clock Color Utility

**Files:**
- Modify: `utils/timeFormatting.ts`
- Test: `utils/__tests__/timeFormatting.test.ts`

**Step 1: Write failing tests for getClockColor**

Add to `utils/__tests__/timeFormatting.test.ts`:

```typescript
import { formatLastConnected, getClockColor } from '../timeFormatting';

describe('getClockColor', () => {
  const NOW = new Date('2026-01-15T12:00:00Z').getTime();
  const DAY = 24 * 60 * 60 * 1000;

  it('returns sage for 0-14 days (recent)', () => {
    expect(getClockColor(NOW, NOW)).toBe('sage');
    expect(getClockColor(NOW - 7 * DAY, NOW)).toBe('sage');
    expect(getClockColor(NOW - 14 * DAY, NOW)).toBe('sage');
  });

  it('returns warmgray-muted for 15-60 days (neutral)', () => {
    expect(getClockColor(NOW - 15 * DAY, NOW)).toBe('warmgray-muted');
    expect(getClockColor(NOW - 30 * DAY, NOW)).toBe('warmgray-muted');
    expect(getClockColor(NOW - 60 * DAY, NOW)).toBe('warmgray-muted');
  });

  it('returns amber for 61+ days (attention)', () => {
    expect(getClockColor(NOW - 61 * DAY, NOW)).toBe('amber');
    expect(getClockColor(NOW - 120 * DAY, NOW)).toBe('amber');
  });

  it('returns amber for null (never contacted)', () => {
    expect(getClockColor(null, NOW)).toBe('amber');
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `pnpm --dir /Users/mtaggart/Documents/kindred/.worktrees/today-page-ux exec jest utils/__tests__/timeFormatting.test.ts --no-watchman -t "getClockColor"`

Expected: FAIL - function not defined

**Step 3: Add getClockColor implementation**

Add to `utils/timeFormatting.ts`:

```typescript
export type ClockColor = 'sage' | 'warmgray-muted' | 'amber';

export function getClockColor(
  timestamp: number | null | undefined,
  now: number = Date.now()
): ClockColor {
  if (!timestamp) return 'amber';

  const diff = Math.max(0, now - timestamp);
  const days = Math.floor(diff / DAY_IN_MS);

  if (days <= 14) return 'sage';
  if (days <= 60) return 'warmgray-muted';
  return 'amber';
}
```

**Step 4: Run tests to verify they pass**

Run: `pnpm --dir /Users/mtaggart/Documents/kindred/.worktrees/today-page-ux exec jest utils/__tests__/timeFormatting.test.ts --no-watchman`

Expected: PASS

**Step 5: Commit**

```bash
git -C /Users/mtaggart/Documents/kindred/.worktrees/today-page-ux add utils/timeFormatting.ts utils/__tests__/timeFormatting.test.ts
git -C /Users/mtaggart/Documents/kindred/.worktrees/today-page-ux commit -m "feat: add getClockColor utility for clock icon coloring"
```

---

## Task 3: Create EmptyContactsState Component

**Files:**
- Create: `components/EmptyContactsState.tsx`

**Step 1: Create the component**

Create `components/EmptyContactsState.tsx`:

```typescript
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';

export default function EmptyContactsState() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center px-8">
      <View className="mb-6 items-center justify-center">
        <View className="relative">
          <Ionicons name="people-outline" size={80} color="#9CA986" />
          <View className="absolute -bottom-1 -right-1 rounded-full bg-cream p-1">
            <Ionicons name="heart" size={24} color="#C4A484" />
          </View>
        </View>
      </View>

      <Text className="text-2xl font-semibold text-warmgray text-center leading-tight mb-2">
        The people you care about{'\n'}will gather here.
      </Text>

      <Text className="text-base text-warmgray-muted text-center mb-8">
        Start by adding your first connection.
      </Text>

      <TouchableOpacity
        className="w-full items-center rounded-2xl bg-sage py-4 mb-3"
        onPress={() => router.push('/contacts/import')}
        activeOpacity={0.85}
      >
        <Text className="text-lg font-semibold text-white">Import from contacts</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/contacts/new')}
        activeOpacity={0.7}
      >
        <Text className="text-base font-medium text-sage">Add manually</Text>
      </TouchableOpacity>
    </View>
  );
}
```

**Step 2: Verify component renders without errors**

Run: `pnpm --dir /Users/mtaggart/Documents/kindred/.worktrees/today-page-ux exec tsc --noEmit`

Expected: No type errors

**Step 3: Commit**

```bash
git -C /Users/mtaggart/Documents/kindred/.worktrees/today-page-ux add components/EmptyContactsState.tsx
git -C /Users/mtaggart/Documents/kindred/.worktrees/today-page-ux commit -m "feat: add EmptyContactsState component for new users"
```

---

## Task 4: Add Call/Text Handlers to ContactCard

**Files:**
- Modify: `app/(tabs)/index.tsx`

**Step 1: Add imports and phone utilities**

Add to imports at top of `app/(tabs)/index.tsx`:

```typescript
import { Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatPhoneUrl } from '@/utils/phone';
import { getClockColor, ClockColor } from '@/utils/timeFormatting';
```

**Step 2: Update ContactCardProps type**

Update the ContactCardProps type:

```typescript
type ContactCardProps = {
  contact: Contact;
  onMarkDone: () => void;
  onSnooze: () => void;
  isSnoozing?: boolean;
  onPress: () => void;
  highlightReachedOut?: boolean;
};
```

**Step 3: Add Call/Text handlers inside ContactCard**

Add inside the ContactCard component, before the return statement:

```typescript
const handleCall = useCallback(() => {
  if (!contact.phone) return;
  Linking.openURL(`tel:${formatPhoneUrl(contact.phone)}`);
}, [contact.phone]);

const handleText = useCallback(() => {
  if (!contact.phone) return;
  Linking.openURL(`sms:${formatPhoneUrl(contact.phone)}`);
}, [contact.phone]);

const clockColor = isBirthday ? null : getClockColor(contact.lastContactedAt);

const clockColorClass: Record<ClockColor, string> = {
  'sage': '#9CA986',
  'warmgray-muted': '#9A9A8E',
  'amber': '#D4A574',
};
```

**Step 4: Verify no type errors**

Run: `pnpm --dir /Users/mtaggart/Documents/kindred/.worktrees/today-page-ux exec tsc --noEmit`

Expected: No type errors

**Step 5: Commit**

```bash
git -C /Users/mtaggart/Documents/kindred/.worktrees/today-page-ux add app/\(tabs\)/index.tsx
git -C /Users/mtaggart/Documents/kindred/.worktrees/today-page-ux commit -m "feat: add Call/Text handlers to ContactCard"
```

---

## Task 5: Update ContactCard UI with Clock and Call/Text Row

**Files:**
- Modify: `app/(tabs)/index.tsx`

**Step 1: Update the last connected display with clock icon**

Replace the last connected Text element inside ContactCard (lines ~71-75):

```typescript
{isBirthday ? (
  <Text className="text-base text-terracotta-100 font-medium">It's {contact.name}'s birthday</Text>
) : (
  <View className="flex-row items-center gap-1">
    <Ionicons
      name="time-outline"
      size={14}
      color={clockColor ? clockColorClass[clockColor] : '#9A9A8E'}
    />
    <Text className="text-base text-warmgray-muted">{formatLastConnected(contact.lastContactedAt)}</Text>
  </View>
)}
```

**Step 2: Add Call/Text row before action buttons**

Add after the TouchableOpacity that wraps the contact info, before the action buttons View:

```typescript
{contact.phone && (
  <View className={`mt-4 flex-row gap-2 ${isBirthday ? '' : ''}`}>
    <TouchableOpacity
      className={`flex-1 flex-row items-center justify-center gap-2 rounded-xl py-2.5 ${
        isBirthday ? 'bg-white/20' : 'bg-cream border border-border'
      }`}
      onPress={handleCall}
      activeOpacity={0.7}
    >
      <Ionicons name="call-outline" size={18} color={isBirthday ? '#FFFFFF' : '#9CA986'} />
      <Text className={`text-base font-medium ${isBirthday ? 'text-white' : 'text-sage'}`}>Call</Text>
    </TouchableOpacity>

    <TouchableOpacity
      className={`flex-1 flex-row items-center justify-center gap-2 rounded-xl py-2.5 ${
        isBirthday ? 'bg-white/20' : 'bg-cream border border-border'
      }`}
      onPress={handleText}
      activeOpacity={0.7}
    >
      <Ionicons name="chatbubble-outline" size={18} color={isBirthday ? '#FFFFFF' : '#9CA986'} />
      <Text className={`text-base font-medium ${isBirthday ? 'text-white' : 'text-sage'}`}>Text</Text>
    </TouchableOpacity>
  </View>
)}
```

**Step 3: Verify no type errors**

Run: `pnpm --dir /Users/mtaggart/Documents/kindred/.worktrees/today-page-ux exec tsc --noEmit`

Expected: No type errors

**Step 4: Commit**

```bash
git -C /Users/mtaggart/Documents/kindred/.worktrees/today-page-ux add app/\(tabs\)/index.tsx
git -C /Users/mtaggart/Documents/kindred/.worktrees/today-page-ux commit -m "feat: add clock icon and Call/Text buttons to ContactCard UI"
```

---

## Task 6: Add Visual Nudge Animation

**Files:**
- Modify: `app/(tabs)/index.tsx`

**Step 1: Add Animated import and state**

Add to imports:

```typescript
import { Animated } from 'react-native';
import { useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
```

Update ContactCard to accept and use animation:

```typescript
const ContactCard = ({ contact, onMarkDone, onSnooze, isSnoozing = false, onPress, highlightReachedOut = false }: ContactCardProps) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (highlightReachedOut) {
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 150, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 150, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [highlightReachedOut, pulseAnim]);
```

**Step 2: Wrap the "Reached out" button with Animated.View**

Replace the "Reached out" TouchableOpacity:

```typescript
<Animated.View style={{ flex: 1, transform: [{ scale: pulseAnim }] }}>
  <TouchableOpacity
    className={`flex-1 items-center rounded-2xl py-3 border-2 ${isBirthday ? 'bg-white border-white' : 'bg-sage border-transparent'}`}
    onPress={onMarkDone}
    activeOpacity={0.85}
  >
    <Text className={`text-lg font-semibold ${isBirthday ? 'text-terracotta' : 'text-white'}`}>Reached out</Text>
  </TouchableOpacity>
</Animated.View>
```

**Step 3: Add state tracking in HomeScreen**

Add to HomeScreen component state:

```typescript
const [lastCalledContactId, setLastCalledContactId] = useState<string | null>(null);
const appState = useRef(AppState.currentState);

useEffect(() => {
  const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // App came to foreground - trigger highlight if we have a pending contact
      if (lastCalledContactId) {
        // The highlight will be triggered by the state being set
        // Clear it after a short delay
        setTimeout(() => setLastCalledContactId(null), 1000);
      }
    }
    appState.current = nextAppState;
  });

  return () => subscription.remove();
}, [lastCalledContactId]);
```

**Step 4: Update renderItem to pass highlight prop**

Update the renderItem callback:

```typescript
const renderItem = useCallback(
  ({ item }: { item: Contact }) => (
    <ContactCard
      contact={item}
      onMarkDone={() => handleMarkDone(item)}
      onSnooze={() => handleSnooze(item)}
      isSnoozing={snoozingContactId === item.id}
      onPress={() => handleContactPress(item.id)}
      highlightReachedOut={lastCalledContactId === item.id}
    />
  ),
  [handleMarkDone, handleSnooze, snoozingContactId, handleContactPress, lastCalledContactId],
);
```

**Step 5: Pass setLastCalledContactId to ContactCard**

Update ContactCardProps:

```typescript
type ContactCardProps = {
  contact: Contact;
  onMarkDone: () => void;
  onSnooze: () => void;
  isSnoozing?: boolean;
  onPress: () => void;
  highlightReachedOut?: boolean;
  onCallOrText?: () => void;
};
```

Update handleCall and handleText to call the callback:

```typescript
const handleCall = useCallback(() => {
  if (!contact.phone) return;
  onCallOrText?.();
  Linking.openURL(`tel:${formatPhoneUrl(contact.phone)}`);
}, [contact.phone, onCallOrText]);

const handleText = useCallback(() => {
  if (!contact.phone) return;
  onCallOrText?.();
  Linking.openURL(`sms:${formatPhoneUrl(contact.phone)}`);
}, [contact.phone, onCallOrText]);
```

Update renderItem:

```typescript
const renderItem = useCallback(
  ({ item }: { item: Contact }) => (
    <ContactCard
      contact={item}
      onMarkDone={() => handleMarkDone(item)}
      onSnooze={() => handleSnooze(item)}
      isSnoozing={snoozingContactId === item.id}
      onPress={() => handleContactPress(item.id)}
      highlightReachedOut={lastCalledContactId === item.id}
      onCallOrText={() => setLastCalledContactId(item.id)}
    />
  ),
  [handleMarkDone, handleSnooze, snoozingContactId, handleContactPress, lastCalledContactId],
);
```

**Step 6: Verify no type errors**

Run: `pnpm --dir /Users/mtaggart/Documents/kindred/.worktrees/today-page-ux exec tsc --noEmit`

Expected: No type errors

**Step 7: Commit**

```bash
git -C /Users/mtaggart/Documents/kindred/.worktrees/today-page-ux add app/\(tabs\)/index.tsx
git -C /Users/mtaggart/Documents/kindred/.worktrees/today-page-ux commit -m "feat: add visual nudge animation for Reached out button"
```

---

## Task 7: Add Empty Contacts State Check

**Files:**
- Modify: `app/(tabs)/index.tsx`
- Modify: `services/contactService.ts`

**Step 1: Add getTotalContactCount to contactService**

Add to `services/contactService.ts`:

```typescript
export function getTotalContactCount(): number {
  const result = db.select({ count: sql<number>`count(*)` }).from(contacts).where(eq(contacts.isArchived, false)).get();
  return result?.count ?? 0;
}
```

**Step 2: Import and use in HomeScreen**

Add to imports in `app/(tabs)/index.tsx`:

```typescript
import { getTotalContactCount } from '@/services/contactService';
import EmptyContactsState from '@/components/EmptyContactsState';
```

Add state:

```typescript
const [totalContactCount, setTotalContactCount] = useState<number | null>(null);
```

Update loadContacts:

```typescript
const loadContacts = useCallback(() => {
  try {
    const results = getDueContactsGrouped();
    setGroupedContacts(results);
    setTotalContactCount(getTotalContactCount());
  } catch (e) {
    console.warn('Failed to load contacts:', e);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, []);
```

**Step 3: Add conditional rendering for empty contacts**

Update the return statement to check for zero contacts:

```typescript
if (totalContactCount === 0) {
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
        <EmptyContactsState />
      </View>
    </SafeAreaView>
  );
}
```

Place this after the loading check and before the main return.

**Step 4: Verify no type errors**

Run: `pnpm --dir /Users/mtaggart/Documents/kindred/.worktrees/today-page-ux exec tsc --noEmit`

Expected: No type errors

**Step 5: Run all tests**

Run: `pnpm --dir /Users/mtaggart/Documents/kindred/.worktrees/today-page-ux exec jest --no-watchman`

Expected: All tests pass

**Step 6: Commit**

```bash
git -C /Users/mtaggart/Documents/kindred/.worktrees/today-page-ux add app/\(tabs\)/index.tsx services/contactService.ts
git -C /Users/mtaggart/Documents/kindred/.worktrees/today-page-ux commit -m "feat: add empty contacts state for new users"
```

---

## Task 8: Final Verification and Cleanup

**Step 1: Run full test suite**

Run: `pnpm --dir /Users/mtaggart/Documents/kindred/.worktrees/today-page-ux exec jest --no-watchman`

Expected: All tests pass

**Step 2: Run TypeScript check**

Run: `pnpm --dir /Users/mtaggart/Documents/kindred/.worktrees/today-page-ux exec tsc --noEmit`

Expected: No errors

**Step 3: Start the app and manually verify**

Run: `pnpm --dir /Users/mtaggart/Documents/kindred/.worktrees/today-page-ux start`

Manual verification checklist:
- [ ] Cards show clock icon with correct colors (sage/gray/amber)
- [ ] Cards with phone numbers show Call/Text buttons
- [ ] Cards without phone numbers don't show Call/Text buttons
- [ ] Tapping Call opens phone app
- [ ] Tapping Text opens SMS app
- [ ] Returning to app highlights "Reached out" button briefly
- [ ] New user (no contacts) sees EmptyContactsState
- [ ] Import button navigates to import flow
- [ ] Add manually link navigates to new contact form

**Step 4: Final commit if any cleanup needed**

```bash
git -C /Users/mtaggart/Documents/kindred/.worktrees/today-page-ux status
# If clean, no action needed
```
