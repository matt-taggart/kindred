# Upcoming Moments Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor calendar.tsx from calendar-picker to timeline-based "Upcoming Moments" view with time-grouped sections.

**Architecture:** New service function groups contacts by time buckets (thisWeek, nextWeek, laterThisSeason). Two new components (MomentCard, MomentSectionDivider) render the timeline. Screen replaces Calendar component with ScrollView of sections.

**Tech Stack:** React Native, NativeWind/Tailwind, TypeScript, Jest + React Testing Library

---

## Task 1: Add MomentContact Type and getUpcomingMoments Service Function

**Files:**
- Modify: `services/calendarService.ts`

**Step 1: Add types at top of file (after existing types)**

Add after line 21 (after `CalendarContact` type):

```typescript
export type MomentContact = {
  contact: Contact;
  timeLabel: string;
  isUrgent: boolean;
  isResting: boolean;
  emoji: string;
  rhythmLabel: string;
};

export type UpcomingMoments = {
  thisWeek: MomentContact[];
  nextWeek: MomentContact[];
  laterThisSeason: MomentContact[];
};
```

**Step 2: Add helper functions before getUpcomingMoments**

```typescript
const getEmojiForRelationship = (relationship: string | null): string => {
  if (!relationship) return '🌊';
  const lower = relationship.toLowerCase();
  if (lower === 'partner' || lower === 'spouse') return '🌸';
  if (lower === 'family') return '🌿';
  if (lower === 'friend') return '☀️';
  if (lower === 'group') return '☕️';
  return '🌊';
};

const getRhythmLabel = (bucket: Contact['bucket']): string => {
  switch (bucket) {
    case 'daily': return 'Returning daily';
    case 'weekly': return 'Weekly rest & return';
    case 'bi-weekly': return 'Fortnightly nurture';
    case 'every-three-weeks': return 'Every few weeks';
    case 'monthly': return 'Monthly check-in';
    case 'every-six-months': return 'Seasonally gathering';
    case 'yearly': return 'Yearly celebration';
    case 'custom': return 'Custom rhythm';
    default: return 'At your pace';
  }
};

const getTimeLabel = (timestamp: number): string => {
  const now = new Date();
  const target = new Date(timestamp);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const diffDays = Math.round((targetDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) {
    return target.toLocaleDateString('en-US', { weekday: 'long' });
  }
  return target.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
```

**Step 3: Add getUpcomingMoments function at end of file**

```typescript
export const getUpcomingMoments = (): UpcomingMoments => {
  const contacts = getContacts({ includeArchived: false });
  const now = Date.now();
  const oneDay = 1000 * 60 * 60 * 24;
  const oneWeek = oneDay * 7;
  const twoWeeks = oneDay * 14;
  const threemonths = oneDay * 90;

  const thisWeek: MomentContact[] = [];
  const nextWeek: MomentContact[] = [];
  const laterThisSeason: MomentContact[] = [];

  contacts.forEach((contact) => {
    if (!contact.nextContactDate) return;

    const daysUntil = (contact.nextContactDate - now) / oneDay;
    const isUrgent = daysUntil <= 1;
    const isResting = contact.bucket === 'every-six-months' || contact.bucket === 'yearly';

    const momentContact: MomentContact = {
      contact,
      timeLabel: getTimeLabel(contact.nextContactDate),
      isUrgent,
      isResting,
      emoji: getEmojiForRelationship(contact.relationship),
      rhythmLabel: getRhythmLabel(contact.bucket),
    };

    if (contact.nextContactDate <= now + oneWeek) {
      thisWeek.push(momentContact);
    } else if (contact.nextContactDate <= now + twoWeeks) {
      nextWeek.push(momentContact);
    } else if (contact.nextContactDate <= now + threemonths) {
      laterThisSeason.push(momentContact);
    }
  });

  // Sort each array by nextContactDate
  const sortByDate = (a: MomentContact, b: MomentContact) =>
    (a.contact.nextContactDate || 0) - (b.contact.nextContactDate || 0);

  thisWeek.sort(sortByDate);
  nextWeek.sort(sortByDate);
  laterThisSeason.sort(sortByDate);

  return { thisWeek, nextWeek, laterThisSeason };
};
```

**Step 4: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 5: Commit**

```bash
git add services/calendarService.ts
git commit -m "feat(calendar): add getUpcomingMoments service function

Add MomentContact type and getUpcomingMoments() to group contacts
by time buckets (thisWeek, nextWeek, laterThisSeason) with emoji,
rhythm labels, and urgency flags.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Create MomentSectionDivider Component

**Files:**
- Create: `components/MomentSectionDivider.tsx`
- Create: `components/MomentSectionDivider.test.tsx`

**Step 1: Write the test file**

```typescript
import React from 'react';
import { render } from '@testing-library/react-native';
import { MomentSectionDivider } from './MomentSectionDivider';

describe('MomentSectionDivider', () => {
  it('renders the title text', () => {
    const { getByText } = render(<MomentSectionDivider title="This Week" />);
    expect(getByText('This Week')).toBeTruthy();
  });

  it('renders with highlighted style when highlighted prop is true', () => {
    const { getByTestId } = render(
      <MomentSectionDivider title="This Week" highlighted />
    );
    const divider = getByTestId('moment-section-divider');
    expect(divider.props.accessibilityHint).toContain('highlighted');
  });

  it('renders without highlighted style by default', () => {
    const { getByTestId } = render(
      <MomentSectionDivider title="Next Week" />
    );
    const divider = getByTestId('moment-section-divider');
    expect(divider.props.accessibilityHint).not.toContain('highlighted');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --testPathPattern="MomentSectionDivider" --watchAll=false`
Expected: FAIL - Cannot find module './MomentSectionDivider'

**Step 3: Write the component**

```typescript
import React from 'react';
import { View, Text } from 'react-native';

type MomentSectionDividerProps = {
  title: string;
  highlighted?: boolean;
};

export function MomentSectionDivider({ title, highlighted = false }: MomentSectionDividerProps) {
  const lineColor = highlighted ? 'bg-primary/20' : 'bg-slate-200 dark:bg-slate-800';
  const textColor = highlighted ? 'text-primary' : 'text-slate-400';

  return (
    <View
      testID="moment-section-divider"
      accessibilityHint={highlighted ? 'highlighted' : 'default'}
      className="flex-row items-center gap-3 mb-4"
    >
      <View className={`h-[1px] flex-1 ${lineColor}`} />
      <Text className={`text-xs font-bold uppercase tracking-widest ${textColor} font-display`}>
        {title}
      </Text>
      <View className={`h-[1px] flex-1 ${lineColor}`} />
    </View>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --testPathPattern="MomentSectionDivider" --watchAll=false`
Expected: PASS (3 tests)

**Step 5: Commit**

```bash
git add components/MomentSectionDivider.tsx components/MomentSectionDivider.test.tsx
git commit -m "feat(components): add MomentSectionDivider component

Section header with centered text and horizontal lines.
Supports highlighted state for primary sections.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Create MomentCard Component

**Files:**
- Create: `components/MomentCard.tsx`
- Create: `components/MomentCard.test.tsx`

**Step 1: Write the test file**

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MomentCard } from './MomentCard';
import { Contact } from '@/db/schema';

describe('MomentCard', () => {
  const mockOnPress = jest.fn();

  const baseContact: Contact = {
    id: '1',
    name: 'Emma',
    phone: '+1234567890',
    birthday: null,
    bucket: 'daily',
    customIntervalDays: null,
    lastContactedAt: Date.now() - 86400000,
    nextContactDate: Date.now(),
    relationship: 'partner',
    isArchived: false,
    avatarUri: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders contact name', () => {
    const { getByText } = render(
      <MomentCard
        contact={baseContact}
        emoji="🌸"
        rhythmLabel="Returning daily"
        timeLabel="Tomorrow"
        onPress={mockOnPress}
      />
    );
    expect(getByText('Emma')).toBeTruthy();
  });

  it('renders emoji', () => {
    const { getByText } = render(
      <MomentCard
        contact={baseContact}
        emoji="🌸"
        rhythmLabel="Returning daily"
        timeLabel="Tomorrow"
        onPress={mockOnPress}
      />
    );
    expect(getByText('🌸')).toBeTruthy();
  });

  it('renders rhythm label', () => {
    const { getByText } = render(
      <MomentCard
        contact={baseContact}
        emoji="🌸"
        rhythmLabel="Returning daily"
        timeLabel="Tomorrow"
        onPress={mockOnPress}
      />
    );
    expect(getByText('Returning daily')).toBeTruthy();
  });

  it('renders time label', () => {
    const { getByText } = render(
      <MomentCard
        contact={baseContact}
        emoji="🌸"
        rhythmLabel="Returning daily"
        timeLabel="Tomorrow"
        onPress={mockOnPress}
      />
    );
    expect(getByText('Tomorrow')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByTestId } = render(
      <MomentCard
        contact={baseContact}
        emoji="🌸"
        rhythmLabel="Returning daily"
        timeLabel="Tomorrow"
        onPress={mockOnPress}
      />
    );
    fireEvent.press(getByTestId('moment-card'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('applies urgent styling when isUrgent is true', () => {
    const { getByTestId } = render(
      <MomentCard
        contact={baseContact}
        emoji="🌸"
        rhythmLabel="Returning daily"
        timeLabel="Tomorrow"
        isUrgent
        onPress={mockOnPress}
      />
    );
    const card = getByTestId('moment-card');
    expect(card.props.accessibilityHint).toContain('urgent');
  });

  it('applies resting styling when isResting is true', () => {
    const { getByTestId } = render(
      <MomentCard
        contact={baseContact}
        emoji="☕️"
        rhythmLabel="Seasonally gathering"
        timeLabel="Late June"
        isResting
        onPress={mockOnPress}
      />
    );
    const card = getByTestId('moment-card');
    expect(card.props.accessibilityHint).toContain('resting');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --testPathPattern="MomentCard.test" --watchAll=false`
Expected: FAIL - Cannot find module './MomentCard'

**Step 3: Write the component**

```typescript
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Contact } from '@/db/schema';

type MomentCardProps = {
  contact: Contact;
  emoji: string;
  rhythmLabel: string;
  timeLabel: string;
  isUrgent?: boolean;
  isResting?: boolean;
  onPress: () => void;
};

export function MomentCard({
  contact,
  emoji,
  rhythmLabel,
  timeLabel,
  isUrgent = false,
  isResting = false,
  onPress,
}: MomentCardProps) {
  // Build style variants
  const cardBg = isResting ? 'bg-slate-50/50 dark:bg-slate-800/20' : 'bg-white dark:bg-slate-900/50';
  const borderStyle = isResting
    ? 'border-dashed border-slate-200 dark:border-slate-800'
    : 'border-slate-100 dark:border-slate-800/50';

  const avatarBg = isResting
    ? 'bg-slate-100 dark:bg-slate-800'
    : isUrgent
      ? 'bg-secondary/20'
      : 'bg-primary/20';

  const avatarOpacity = isResting ? 'opacity-50 grayscale' : '';

  // Build accessibility hint for testing
  const hintParts: string[] = [];
  if (isUrgent) hintParts.push('urgent');
  if (isResting) hintParts.push('resting');

  return (
    <TouchableOpacity
      testID="moment-card"
      accessibilityHint={hintParts.join(' ') || 'normal'}
      onPress={onPress}
      activeOpacity={0.7}
      className={`${cardBg} p-4 rounded-3xl flex-row items-center justify-between border ${borderStyle} shadow-soft mb-3`}
    >
      <View className="flex-row items-center gap-4">
        <View className={`w-12 h-12 rounded-2xl ${avatarBg} items-center justify-center`}>
          <Text className={`text-xl ${avatarOpacity}`}>{emoji}</Text>
        </View>
        <View>
          <Text className="font-bold text-base text-slate-800 dark:text-slate-100 font-display">
            {contact.name}
          </Text>
          <Text className="text-xs opacity-50 font-body">{rhythmLabel}</Text>
        </View>
      </View>

      <View className="items-end">
        {isUrgent ? (
          <View className="bg-secondary/10 px-2 py-1 rounded-full">
            <Text className="text-[10px] font-bold uppercase text-secondary tracking-tight">
              {timeLabel}
            </Text>
          </View>
        ) : isResting ? (
          <View className="flex-col items-end">
            <Text className="text-[10px] font-bold uppercase text-slate-400 tracking-tight mb-1">
              {timeLabel}
            </Text>
            <View className="w-8 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
          </View>
        ) : (
          <Text className="text-[10px] font-bold uppercase text-slate-400 tracking-tight">
            {timeLabel}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --testPathPattern="MomentCard.test" --watchAll=false`
Expected: PASS (7 tests)

**Step 5: Commit**

```bash
git add components/MomentCard.tsx components/MomentCard.test.tsx
git commit -m "feat(components): add MomentCard component

Contact card for timeline view with emoji avatar, rhythm label,
time badge. Supports urgent (rose badge) and resting (dashed/muted)
visual states.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Export New Components

**Files:**
- Modify: `components/index.ts`

**Step 1: Add exports**

Add at end of file:

```typescript
export { MomentSectionDivider } from './MomentSectionDivider';
export { MomentCard } from './MomentCard';
```

**Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add components/index.ts
git commit -m "chore(components): export MomentCard and MomentSectionDivider

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Rewrite Calendar Screen to Upcoming Moments

**Files:**
- Modify: `app/(tabs)/calendar.tsx`

**Step 1: Replace entire file content**

```typescript
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Heading, Body, Caption } from '@/components/ui';
import { MomentCard, MomentSectionDivider } from '@/components';
import { getUpcomingMoments, UpcomingMoments } from '@/services/calendarService';

export default function MomentsScreen() {
  const router = useRouter();
  const [moments, setMoments] = useState<UpcomingMoments>({
    thisWeek: [],
    nextWeek: [],
    laterThisSeason: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(() => {
    try {
      const data = getUpcomingMoments();
      setMoments(data);
    } catch (error) {
      console.warn('Failed to load moments data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();
    }, [loadData]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleContactPress = useCallback(
    (contactId: string) => {
      router.push(`/contacts/${contactId}`);
    },
    [router],
  );

  const isEmpty =
    moments.thisWeek.length === 0 &&
    moments.nextWeek.length === 0 &&
    moments.laterThisSeason.length === 0;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
        <ActivityIndicator size="large" color="#9DBEBB" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="pt-2 mb-8">
          <Heading size={1} className="text-brand-navy dark:text-slate-100 mb-2">
            Upcoming Moments
          </Heading>
          <Caption muted className="italic">
            A gentle pace for meaningful returns.
          </Caption>
        </View>

        {isEmpty ? (
          /* Empty State */
          <View className="items-center py-16 px-6">
            <Ionicons name="sunny-outline" size={72} color="#9DBEBB" />
            <Heading size={3} className="mt-6 text-center text-brand-navy dark:text-slate-100">
              All caught up!
            </Heading>
            <Body className="mt-3 text-center opacity-60">
              No moments on the horizon. Enjoy the stillness.
            </Body>
          </View>
        ) : (
          <View className="space-y-10">
            {/* This Week Section */}
            {moments.thisWeek.length > 0 && (
              <View>
                <MomentSectionDivider title="This Week" highlighted />
                <View className="space-y-3">
                  {moments.thisWeek.map((moment) => (
                    <MomentCard
                      key={moment.contact.id}
                      contact={moment.contact}
                      emoji={moment.emoji}
                      rhythmLabel={moment.rhythmLabel}
                      timeLabel={moment.timeLabel}
                      isUrgent={moment.isUrgent}
                      onPress={() => handleContactPress(moment.contact.id)}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Next Week Section */}
            {moments.nextWeek.length > 0 && (
              <View>
                <MomentSectionDivider title="Next Week" />
                <View className="space-y-3">
                  {moments.nextWeek.map((moment) => (
                    <MomentCard
                      key={moment.contact.id}
                      contact={moment.contact}
                      emoji={moment.emoji}
                      rhythmLabel={moment.rhythmLabel}
                      timeLabel={moment.timeLabel}
                      onPress={() => handleContactPress(moment.contact.id)}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Later This Season Section */}
            {moments.laterThisSeason.length > 0 && (
              <View>
                <MomentSectionDivider title="Later This Season" />
                <View className="space-y-3 opacity-80">
                  {moments.laterThisSeason.map((moment) => (
                    <MomentCard
                      key={moment.contact.id}
                      contact={moment.contact}
                      emoji={moment.emoji}
                      rhythmLabel={moment.rhythmLabel}
                      timeLabel={moment.timeLabel}
                      isResting={moment.isResting}
                      onPress={() => handleContactPress(moment.contact.id)}
                    />
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
```

**Step 2: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add app/\(tabs\)/calendar.tsx
git commit -m "feat(calendar): rewrite to Upcoming Moments timeline view

Replace calendar picker with timeline grouped by time periods:
- This Week (highlighted)
- Next Week
- Later This Season

Uses MomentCard and MomentSectionDivider components.
Removes react-native-calendars from this screen.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Run All Tests and Verify Build

**Step 1: Run full test suite**

Run: `npm test -- --watchAll=false`
Expected: All tests pass

**Step 2: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Run lint**

Run: `npm run lint`
Expected: No errors (or only pre-existing warnings)

**Step 4: Start dev server and manual test**

Run: `npx expo start`
Expected: App loads, Moments tab shows timeline view

**Step 5: Final commit if any fixes needed**

If fixes were made:
```bash
git add -A
git commit -m "fix: address test/lint issues from Moments refactor

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Summary

| Task | Component | Tests |
|------|-----------|-------|
| 1 | calendarService.ts (types + getUpcomingMoments) | TypeScript only |
| 2 | MomentSectionDivider | 3 tests |
| 3 | MomentCard | 7 tests |
| 4 | components/index.ts exports | TypeScript only |
| 5 | calendar.tsx rewrite | Manual test |
| 6 | Full verification | All tests + lint + build |

Total new tests: 10
Total commits: 5-6
