# Sunlit Room Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform Kindred's UI/UX from a task-tracking app into a warm, nurturing experience that feels like "a well-loved notebook in a sunlit room."

**Architecture:** Phase-based approach starting with foundation (colors, typography), then updating screens from most-used to least-used. Each phase is independently deployable. Copy changes happen alongside visual updates to maintain consistency.

**Tech Stack:** React Native, Expo Router, NativeWind/Tailwind, Zustand

---

## Phase 1: Foundation — Color & Typography

### Task 1.1: Update Tailwind Color Palette

**Files:**
- Modify: `tailwind.config.js`

**Step 1: Read current config**

Review existing colors to understand what we're replacing.

**Step 2: Update color palette**

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        sage: {
          DEFAULT: '#9CA986',
          100: '#E6E9E1',
        },
        terracotta: {
          DEFAULT: '#D4896A',
          100: '#F6E6DE',
        },
        cream: '#F3F0E6',
        surface: '#FDFBF7',
        slate: {
          DEFAULT: '#5C6356',
          muted: '#8B9678',
        },
        border: '#E8E4DA',
      },
    },
  },
  plugins: [],
};
```

**Step 3: Verify build works**

Run: `pnpm start` — confirm no Tailwind errors.

**Step 4: Commit**

```bash
git add tailwind.config.js
git commit -m "style: update color palette for Sunlit Room redesign

- Replace blue-gray slate with warm slate (#5C6356)
- Soften terracotta to #D4896A
- Add surface color for cards (#FDFBF7)
- Add border color (#E8E4DA)
- Remove magic/indigo colors"
```

---

### Task 1.2: Create Time Formatting Utility

**Files:**
- Create: `utils/timeFormatting.ts`
- Create: `utils/__tests__/timeFormatting.test.ts`

**Step 1: Write the failing test**

```ts
// utils/__tests__/timeFormatting.test.ts
import { formatLastConnected, formatNextReminder } from '../timeFormatting';

describe('formatLastConnected', () => {
  const NOW = new Date('2026-01-13T12:00:00Z').getTime();

  it('returns "Today" for same day', () => {
    const timestamp = NOW - 1000 * 60 * 60; // 1 hour ago
    expect(formatLastConnected(timestamp, NOW)).toBe('Today');
  });

  it('returns "Connected recently" for 1-2 days ago', () => {
    const timestamp = NOW - 1000 * 60 * 60 * 24 * 2; // 2 days ago
    expect(formatLastConnected(timestamp, NOW)).toBe('Connected recently');
  });

  it('returns "Connected last week" for 3-14 days ago', () => {
    const timestamp = NOW - 1000 * 60 * 60 * 24 * 7; // 7 days ago
    expect(formatLastConnected(timestamp, NOW)).toBe('Connected last week');
  });

  it('returns "Connected last month" for 15-45 days ago', () => {
    const timestamp = NOW - 1000 * 60 * 60 * 24 * 30; // 30 days ago
    expect(formatLastConnected(timestamp, NOW)).toBe('Connected last month');
  });

  it('returns "It\'s been a while" for 46+ days ago', () => {
    const timestamp = NOW - 1000 * 60 * 60 * 24 * 60; // 60 days ago
    expect(formatLastConnected(timestamp, NOW)).toBe("It's been a while");
  });

  it('returns "Never" for null/undefined', () => {
    expect(formatLastConnected(null, NOW)).toBe('Never');
    expect(formatLastConnected(undefined, NOW)).toBe('Never');
  });
});

describe('formatNextReminder', () => {
  const NOW = new Date('2026-01-13T12:00:00Z').getTime();

  it('returns "Today" for same day', () => {
    const timestamp = NOW + 1000 * 60 * 60; // 1 hour from now
    expect(formatNextReminder(timestamp, NOW)).toBe('Today');
  });

  it('returns "Tomorrow" for next day', () => {
    const timestamp = NOW + 1000 * 60 * 60 * 24; // 1 day from now
    expect(formatNextReminder(timestamp, NOW)).toBe('Tomorrow');
  });

  it('returns "In X days" for future dates', () => {
    const timestamp = NOW + 1000 * 60 * 60 * 24 * 5; // 5 days from now
    expect(formatNextReminder(timestamp, NOW)).toBe('In 5 days');
  });

  it('returns "In X weeks" for 2+ weeks', () => {
    const timestamp = NOW + 1000 * 60 * 60 * 24 * 14; // 14 days from now
    expect(formatNextReminder(timestamp, NOW)).toBe('In 2 weeks');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test -- --testPathPattern="timeFormatting" --watchAll=false`
Expected: FAIL — module not found

**Step 3: Write implementation**

```ts
// utils/timeFormatting.ts
const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function formatLastConnected(
  timestamp: number | null | undefined,
  now: number = Date.now()
): string {
  if (!timestamp) return 'Never';

  const diff = Math.max(0, now - timestamp);
  const days = Math.floor(diff / DAY_IN_MS);

  if (days === 0) return 'Today';
  if (days <= 2) return 'Connected recently';
  if (days <= 14) return 'Connected last week';
  if (days <= 45) return 'Connected last month';
  return "It's been a while";
}

export function formatNextReminder(
  timestamp: number | null | undefined,
  now: number = Date.now()
): string {
  if (!timestamp) return 'Not scheduled';

  const diff = timestamp - now;
  if (diff <= 0) return 'Today';

  const days = Math.ceil(diff / DAY_IN_MS);
  if (days === 1) return 'Tomorrow';
  if (days < 14) return `In ${days} days`;

  const weeks = Math.floor(days / 7);
  return `In ${weeks} weeks`;
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test -- --testPathPattern="timeFormatting" --watchAll=false`
Expected: PASS

**Step 5: Commit**

```bash
git add utils/timeFormatting.ts utils/__tests__/timeFormatting.test.ts
git commit -m "feat: add gentle time formatting utilities

- formatLastConnected: 'Connected recently', 'Connected last month', etc.
- formatNextReminder: 'Tomorrow', 'In 2 weeks', etc.
- Replaces clinical 'X days ago' with warmer language"
```

---

## Phase 2: Home Screen Redesign

### Task 2.1: Create CelebrationStatus Empty State Update

**Files:**
- Modify: `components/CelebrationStatus.tsx`

**Step 1: Read current implementation**

Review existing empty state component.

**Step 2: Update copy and styling**

Replace current content with:
- Headline: Remove or soften
- Body: "Your connections are resting. Enjoy your day."
- Styling: Warm colors, generous padding

**Step 3: Verify visually**

Run app, ensure no due contacts, verify empty state displays correctly.

**Step 4: Commit**

```bash
git add components/CelebrationStatus.tsx
git commit -m "style: update empty state with nurturing copy

'Your connections are resting. Enjoy your day.'"
```

---

### Task 2.2: Update ContactCard Component

**Files:**
- Modify: `app/(tabs)/index.tsx`

**Step 1: Read current implementation**

Review ContactCard component within index.tsx.

**Step 2: Update card styling**

- Background: `bg-surface` (warm white)
- Border: `border-border` (subtle warm border)
- Shadow: Warm diffuse shadow
- Padding: 24px internal
- Corner radius: 16px

**Step 3: Update button labels**

- "Mark Done" → "Reached out"
- "Snooze" → "Later"
- Make buttons pill-shaped with softer styling

**Step 4: Update time display**

- Import `formatLastConnected` from `@/utils/timeFormatting`
- Replace "Last contacted: X days ago" with formatted output

**Step 5: Update birthday card**

- Keep terracotta background
- Change "It's their birthday today!" → "It's [name]'s birthday"

**Step 6: Verify visually**

Run app with test data, confirm cards look correct.

**Step 7: Commit**

```bash
git add app/\(tabs\)/index.tsx
git commit -m "style: redesign home screen contact cards

- Softer card styling with warm shadows
- 'Reached out' and 'Later' button labels
- Gentle time formatting
- Updated birthday card copy"
```

---

### Task 2.3: Update Home Screen Header

**Files:**
- Modify: `app/(tabs)/index.tsx`

**Step 1: Update header styling**

- "Today" headline: 28px semibold, warm slate (`text-slate`)
- Date: 18px regular, muted sage (`text-slate-muted`)
- Increase top padding to 20px
- Increase gap below date to 32px

**Step 2: Verify visually**

Run app, confirm header feels calm and grounded.

**Step 3: Commit**

```bash
git add app/\(tabs\)/index.tsx
git commit -m "style: update home screen header typography

- Larger 'Today' heading
- Muted date styling
- More generous spacing"
```

---

## Phase 3: Flexible Ritual Bottom Sheet

### Task 3.1: Create ReachedOutSheet Component

**Files:**
- Create: `components/ReachedOutSheet.tsx`

**Step 1: Create bottom sheet component**

```tsx
// components/ReachedOutSheet.tsx
import { useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { Contact } from '@/db/schema';
import { isBirthdayToday } from '@/services/contactService';

type Props = {
  visible: boolean;
  contact: Contact | null;
  onClose: () => void;
  onSubmit: (note: string) => void;
};

export default function ReachedOutSheet({ visible, contact, onClose, onSubmit }: Props) {
  const [note, setNote] = useState('');
  const [expanded, setExpanded] = useState(false);

  const isBirthday = contact ? isBirthdayToday(contact) : false;
  const prompt = isBirthday ? 'How did you celebrate them?' : 'How was it?';
  const placeholder = isBirthday
    ? 'Sent a birthday message...'
    : 'Caught up about her move—felt good to connect.';

  const handleSubmit = useCallback(() => {
    onSubmit(note.trim());
    setNote('');
    setExpanded(false);
  }, [note, onSubmit]);

  const handleClose = useCallback(() => {
    setNote('');
    setExpanded(false);
    onClose();
  }, [onClose]);

  if (!contact) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable className="flex-1 bg-black/30" onPress={handleClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-end"
        >
          <Pressable
            className="bg-surface rounded-t-3xl px-6 pb-8 pt-6"
            onPress={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <View className="mb-4 h-1 w-10 self-center rounded-full bg-border" />

            {/* Confirmation */}
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-xl font-semibold text-slate">
                Connected with {contact.name}
              </Text>
              <Text className="text-2xl">✓</Text>
            </View>

            {/* Note input */}
            {expanded ? (
              <View className="mb-6">
                <Text className="mb-2 text-base text-slate-muted">{prompt}</Text>
                <TextInput
                  className="min-h-[100px] rounded-2xl border border-border bg-cream p-4 text-base text-slate"
                  placeholder={placeholder}
                  placeholderTextColor="#8B9678"
                  value={note}
                  onChangeText={setNote}
                  multiline
                  textAlignVertical="top"
                  autoFocus
                />
              </View>
            ) : (
              <TouchableOpacity
                className="mb-6 rounded-2xl border border-border bg-cream p-4"
                onPress={() => setExpanded(true)}
                activeOpacity={0.7}
              >
                <Text className="text-base text-slate-muted">
                  Add a note (optional)
                </Text>
              </TouchableOpacity>
            )}

            {/* Submit button */}
            <TouchableOpacity
              className="items-center rounded-2xl bg-sage py-4"
              onPress={handleSubmit}
              activeOpacity={0.85}
            >
              <Text className="text-lg font-semibold text-white">Done</Text>
            </TouchableOpacity>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
```

**Step 2: Verify component renders**

Import and test in isolation.

**Step 3: Commit**

```bash
git add components/ReachedOutSheet.tsx
git commit -m "feat: add ReachedOutSheet bottom sheet component

- Flexible ritual: quick tap or expand to add note
- Birthday-aware prompts
- Swipe/tap outside to dismiss"
```

---

### Task 3.2: Integrate ReachedOutSheet into Home Screen

**Files:**
- Modify: `app/(tabs)/index.tsx`

**Step 1: Import and add state**

```tsx
import ReachedOutSheet from '@/components/ReachedOutSheet';

// In HomeScreen component:
const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
const [showReachedOutSheet, setShowReachedOutSheet] = useState(false);
```

**Step 2: Update handleMarkDone**

Instead of navigating to modal, show the bottom sheet:

```tsx
const handleMarkDone = useCallback((contact: Contact) => {
  setSelectedContact(contact);
  setShowReachedOutSheet(true);
}, []);
```

**Step 3: Add submit handler**

```tsx
const handleReachedOutSubmit = useCallback(async (note: string) => {
  if (!selectedContact) return;

  try {
    await markContactDone(selectedContact.id, note || undefined);
    loadContacts();
  } catch (error) {
    Alert.alert('Error', 'Failed to save. Please try again.');
  } finally {
    setShowReachedOutSheet(false);
    setSelectedContact(null);
  }
}, [selectedContact, loadContacts]);
```

**Step 4: Render sheet**

Add at bottom of component, before closing SafeAreaView:

```tsx
<ReachedOutSheet
  visible={showReachedOutSheet}
  contact={selectedContact}
  onClose={() => {
    setShowReachedOutSheet(false);
    setSelectedContact(null);
  }}
  onSubmit={handleReachedOutSubmit}
/>
```

**Step 5: Update ContactCard onMarkDone prop**

Pass the full contact instead of just the ID.

**Step 6: Verify flow**

Run app, tap "Reached out", verify sheet appears and submission works.

**Step 7: Commit**

```bash
git add app/\(tabs\)/index.tsx
git commit -m "feat: integrate flexible ritual bottom sheet on home screen

- Replace modal navigation with inline bottom sheet
- Quick path: tap Done immediately
- Expanded path: add optional note"
```

---

## Phase 4: Contact Detail Screen

### Task 4.1: Update Contact Detail Header

**Files:**
- Modify: `app/contacts/[id].tsx`

**Step 1: Update header card styling**

- Center avatar (80px)
- Center name below avatar (24px semibold)
- Optional relationship label below name (16px muted)
- Center time info: "Connected last month" / "Next reminder in 2 weeks"
- Use `formatLastConnected` and `formatNextReminder` utilities

**Step 2: Update card container**

- Background: `bg-surface`
- Rounded: 24px
- Padding: 24px
- Shadow: warm diffuse

**Step 3: Verify visually**

Run app, navigate to contact detail, confirm header looks correct.

**Step 4: Commit**

```bash
git add app/contacts/\\[id\\].tsx
git commit -m "style: redesign contact detail header

- Centered layout with larger avatar
- Gentle time language
- Warmer card styling"
```

---

### Task 4.2: Update Quick Actions Row

**Files:**
- Modify: `app/contacts/[id].tsx`

**Step 1: Redesign action buttons**

Replace stacked buttons with horizontal pill row:
- Call, Text, Note as icon+label pills
- Sage outline style
- Compact horizontal layout

**Step 2: Rename "Add Note" to "Note"**

Simpler label.

**Step 3: Verify visually**

Run app, confirm buttons display in row.

**Step 4: Commit**

```bash
git add app/contacts/\\[id\\].tsx
git commit -m "style: update contact detail quick actions

- Horizontal pill layout
- Simpler labels (Note instead of Add Note)
- Sage outline styling"
```

---

### Task 4.3: Update Interaction History Section

**Files:**
- Modify: `app/contacts/[id].tsx`
- Modify: `components/InteractionListItem.tsx`

**Step 1: Rename "History" to "Shared moments"**

Update section header text.

**Step 2: Update empty state**

"Your story together starts here."

**Step 3: Simplify interaction cards**

- Date + note only
- Softer card styling
- Edit/delete via long-press (keep existing swipe if implemented)

**Step 4: Verify visually**

Run app, confirm section looks correct.

**Step 5: Commit**

```bash
git add app/contacts/\\[id\\].tsx components/InteractionListItem.tsx
git commit -m "style: rename History to Shared moments

- Warmer section title
- Updated empty state copy
- Softer interaction card styling"
```

---

## Phase 5: Settings & Calendar

### Task 5.1: Update Settings Screen

**Files:**
- Modify: `app/(tabs)/settings.tsx`

**Step 1: Rename sections**

- "Notifications" → "Reminders"
- Add "Quiet mode" if not present (or rename existing pause feature)

**Step 2: Update row styling**

- 56px row height
- Warm colors
- Chevron icons for navigation

**Step 3: Update copy**

- "Choose when Kindred gently nudges you"
- "Pause reminders without losing your connections"

**Step 4: Verify visually**

Run app, navigate to settings.

**Step 5: Commit**

```bash
git add app/\(tabs\)/settings.tsx
git commit -m "style: update settings with nurturing language

- Reminders instead of Notifications
- Quiet mode framing
- Warmer copy throughout"
```

---

### Task 5.2: Update Calendar Screen

**Files:**
- Modify: `app/(tabs)/calendar.tsx`

**Step 1: Update event card styling**

- Birthday events: terracotta accent with emoji
- Reminder events: sage accent
- Softer card backgrounds

**Step 2: Update copy**

- Birthday: "🎂 [Name]'s birthday"
- Reminder: "Reminder: [Name]" or "Connect with [Name]"

**Step 3: Verify visually**

Run app, navigate to calendar with events.

**Step 4: Commit**

```bash
git add app/\(tabs\)/calendar.tsx
git commit -m "style: update calendar with warm event styling

- Birthday emoji and terracotta accent
- Softer reminder cards
- Consistent with Sunlit Room palette"
```

---

## Phase 6: Final Polish

### Task 6.1: Update Bucket Labels Throughout

**Files:**
- Modify: `app/contacts/[id].tsx` (bucketLabelMap)
- Any other files using bucket labels

**Step 1: Update rhythm labels**

```ts
const rhythmLabelMap: Record<Contact['bucket'], string> = {
  daily: 'Every day',
  weekly: 'Every week',
  'bi-weekly': 'Every few weeks',
  'every-three-weeks': 'Every few weeks',
  monthly: 'Once a month',
  'every-six-months': 'Seasonally',
  yearly: 'Once a year',
  custom: 'Custom rhythm',
};
```

**Step 2: Search for other usages**

Grep for "bucket" to find all places labels are displayed.

**Step 3: Update all occurrences**

**Step 4: Commit**

```bash
git add -A
git commit -m "style: update reminder frequency labels

- 'Bi-weekly' → 'Every few weeks'
- 'Every six months' → 'Seasonally'
- Warmer rhythm language throughout"
```

---

### Task 6.2: Update Snooze Dialog Copy

**Files:**
- Modify: `app/(tabs)/index.tsx`
- Modify: `app/contacts/[id].tsx`

**Step 1: Update snooze alert**

- Title: "Remind me later"
- Message: "When would you like a gentle reminder?"
- Keep time options as-is (1 hour, Tomorrow, etc.)

**Step 2: Verify both locations**

Test snooze from home and contact detail.

**Step 3: Commit**

```bash
git add app/\(tabs\)/index.tsx app/contacts/\\[id\\].tsx
git commit -m "style: soften snooze dialog language

'Remind me later' with 'gentle reminder' framing"
```

---

### Task 6.3: Final Review & Cleanup

**Step 1: Run full test suite**

Run: `pnpm test -- --watchAll=false`

**Step 2: Manual visual review**

Walk through all screens, verify consistency.

**Step 3: Remove any dead code**

- Old color references
- Unused imports

**Step 4: Final commit**

```bash
git add -A
git commit -m "chore: cleanup after Sunlit Room redesign

- Remove unused color references
- Clean up imports"
```

---

## Verification Checklist

Before merging, verify:

- [ ] All colors use new palette (no blue-grays, no magic/indigo)
- [ ] "Mark Done" → "Reached out" everywhere
- [ ] "Snooze" → "Later" everywhere
- [ ] "History" → "Shared moments"
- [ ] "Last contacted: X days ago" → gentle time format
- [ ] Empty states use new copy
- [ ] Cards have warm shadows, not sharp borders
- [ ] Touch targets are at least 48px
- [ ] Tests pass
- [ ] No TypeScript errors
