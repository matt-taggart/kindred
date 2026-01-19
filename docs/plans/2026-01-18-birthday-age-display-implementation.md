# Birthday Age Display Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add "turning X" age display to birthday reminders when birth year is available.

**Architecture:** Add a `calculateTurningAge` function to the existing birthday utilities. Update the home screen and calendar view to conditionally display age when available. No database changes needed.

**Tech Stack:** TypeScript, React Native, Jest

---

## Task 1: Add calculateTurningAge function

**Files:**
- Modify: `utils/birthdayValidation.ts:128-135` (after `getYear` function)
- Test: `utils/__tests__/birthdayValidation.test.ts`

**Step 1: Write the failing tests**

Add to `utils/__tests__/birthdayValidation.test.ts`:

```typescript
describe('calculateTurningAge', () => {
  it('returns age for birthday with year', () => {
    // Person born March 15, 1990. On March 15, 2026 they turn 36
    expect(calculateTurningAge('1990-03-15', new Date('2026-03-15'))).toBe(36);
  });

  it('returns null for birthday without year', () => {
    expect(calculateTurningAge('03-15', new Date('2026-03-15'))).toBe(null);
  });

  it('returns null for empty string', () => {
    expect(calculateTurningAge('', new Date('2026-03-15'))).toBe(null);
  });

  it('returns null for invalid birthday', () => {
    expect(calculateTurningAge('invalid', new Date('2026-03-15'))).toBe(null);
  });

  it('calculates correct age for different years', () => {
    expect(calculateTurningAge('2000-12-25', new Date('2026-12-25'))).toBe(26);
    expect(calculateTurningAge('1985-01-01', new Date('2026-01-01'))).toBe(41);
  });
});
```

**Step 2: Update import in test file**

At the top of `utils/__tests__/birthdayValidation.test.ts`, update the import:

```typescript
import { validateBirthday, normalizeBirthday, hasYear, getMonthDay, getYear, calculateTurningAge } from '../birthdayValidation';
```

**Step 3: Run tests to verify they fail**

Run: `pnpm test -- --testPathPattern="birthdayValidation" --no-watch`

Expected: FAIL with "calculateTurningAge is not a function" or similar

**Step 4: Implement calculateTurningAge**

Add to `utils/birthdayValidation.ts` after the `getYear` function (after line 135):

```typescript
export function calculateTurningAge(birthday: string, targetDate: Date): number | null {
  const birthYear = getYear(birthday);
  if (birthYear === null) {
    return null;
  }

  const targetYear = targetDate.getFullYear();
  return targetYear - birthYear;
}
```

**Step 5: Run tests to verify they pass**

Run: `pnpm test -- --testPathPattern="birthdayValidation" --no-watch`

Expected: All tests PASS

**Step 6: Commit**

```bash
git add utils/birthdayValidation.ts utils/__tests__/birthdayValidation.test.ts
git commit -m "feat: add calculateTurningAge function for birthday age display"
```

---

## Task 2: Update home screen birthday card

**Files:**
- Modify: `app/(tabs)/index.tsx:113` (birthday text in ContactCard)

**Step 1: Add import**

At line 29 in `app/(tabs)/index.tsx`, update the imports to add:

```typescript
import { calculateTurningAge } from '@/utils/birthdayValidation';
```

**Step 2: Calculate age in ContactCard**

Inside the `ContactCard` component, after line 56 (`const isBirthday = isBirthdayToday(contact);`), add:

```typescript
const turningAge = isBirthday && contact.birthday
  ? calculateTurningAge(contact.birthday, new Date())
  : null;
```

**Step 3: Update birthday text display**

Replace line 113:

```typescript
<Text className="text-base text-terracotta-100 font-medium">It's {contact.name}'s birthday</Text>
```

With:

```typescript
<Text className="text-base text-terracotta-100 font-medium">
  {turningAge
    ? `${contact.name} is turning ${turningAge} today!`
    : `It's ${contact.name}'s birthday`}
</Text>
```

**Step 4: Test manually**

1. Run: `pnpm start`
2. Open the app on iOS simulator
3. Find a contact with a birthday (with year) that is today, or temporarily set one
4. Verify the home screen shows "Name is turning X today!"
5. Test with a contact whose birthday has no year - should show "It's Name's birthday"

**Step 5: Commit**

```bash
git add app/\(tabs\)/index.tsx
git commit -m "feat: show turning age on home screen birthday cards"
```

---

## Task 3: Update calendar view birthday card

**Files:**
- Modify: `app/(tabs)/calendar.tsx:64` (title in CalendarContactCard)

**Step 1: Add import**

At the top of `app/(tabs)/calendar.tsx`, add the import (after line 17):

```typescript
import { calculateTurningAge } from '@/utils/birthdayValidation';
```

**Step 2: Calculate age in CalendarContactCard**

Inside the `CalendarContactCard` component, before line 64, add:

```typescript
// Calculate age for birthdays with year
const turningAge = isBirthday && contact.birthday
  ? calculateTurningAge(contact.birthday, new Date(/* will need date from props */))
  : null;
```

Wait - we need the selected date, not today's date. The calendar shows birthdays on future dates too.

**Step 2 (revised): Pass selectedDate to CalendarContactCard**

First, update the `CalendarContactCardProps` type (around line 53):

```typescript
type CalendarContactCardProps = {
  contact: CalendarContact;
  onPress: () => void;
  selectedDate: string;
};
```

**Step 3: Update CalendarContactCard to accept and use selectedDate**

Update the component signature (line 58):

```typescript
const CalendarContactCard = ({ contact, onPress, selectedDate }: CalendarContactCardProps) => {
```

Then add after `const isBirthday = contact.isBirthday;` (line 62):

```typescript
const turningAge = isBirthday && contact.birthday
  ? calculateTurningAge(contact.birthday, new Date(selectedDate))
  : null;
```

**Step 4: Update title to include age**

Replace line 64:

```typescript
const title = isBirthday ? `${contact.name}'s birthday` : contact.name;
```

With:

```typescript
const title = isBirthday
  ? (turningAge ? `${contact.name}'s birthday (turning ${turningAge})` : `${contact.name}'s birthday`)
  : contact.name;
```

**Step 5: Update CalendarContactCard usage to pass selectedDate**

Find where `CalendarContactCard` is rendered (around line 273-278) and add the `selectedDate` prop:

```typescript
<CalendarContactCard
  key={contact.id}
  contact={contact}
  onPress={() => handleContactPress(contact.id)}
  selectedDate={selectedDate}
/>
```

**Step 6: Test manually**

1. Run: `pnpm start`
2. Open the app on iOS simulator
3. Navigate to Calendar tab
4. Find a date with a birthday (contact with year in their birthday)
5. Verify it shows "Name's birthday (turning X)"
6. Test with a contact whose birthday has no year - should show "Name's birthday"
7. Navigate to different dates and verify the age changes correctly for future birthdays

**Step 7: Commit**

```bash
git add app/\(tabs\)/calendar.tsx
git commit -m "feat: show turning age on calendar birthday cards"
```

---

## Task 4: Run full test suite and verify

**Step 1: Run all tests**

Run: `pnpm test -- --no-watch`

Expected: All tests pass

**Step 2: Run type check**

Run: `pnpm exec tsc --noEmit`

Expected: No type errors

**Step 3: Final manual verification**

1. Home screen: Birthday contact with year shows "Name is turning X today!"
2. Home screen: Birthday contact without year shows "It's Name's birthday"
3. Calendar: Birthday with year shows "Name's birthday (turning X)"
4. Calendar: Birthday without year shows "Name's birthday"
5. Calendar: Future birthdays show correct future age

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Add calculateTurningAge function | `utils/birthdayValidation.ts`, test file |
| 2 | Update home screen | `app/(tabs)/index.tsx` |
| 3 | Update calendar view | `app/(tabs)/calendar.tsx` |
| 4 | Verify all tests pass | - |

**Total commits:** 3
**Estimated implementation time:** 4 tasks, ~15-20 minutes
