# Birthday Age Display Design

## Overview

Add "turning X" age display to birthday reminders when the birth year is available. This makes the year field valuable to users rather than just storing unused data.

## Decision Summary

- **Keep flexibility** for entering birthdays with or without year
- **Show "turning X"** when year is present, on both home screen and calendar
- **Graceful degradation** - no age mention when year is absent (no prompts to add it)
- **Show age for all birthdays** - today and upcoming, not just today

## Implementation

### Age Calculation Logic

**New function:** `calculateTurningAge(birthday: string, targetDate: Date): number | null`

- Takes a birthday string (`YYYY-MM-DD` or `MM-DD`) and the date of the birthday occurrence
- Returns the age they're turning, or `null` if no year is stored
- Example: Birthday `1990-03-15`, target date March 15 2026 → returns `36`

**Edge cases:**
- `MM-DD` format (no year) → returns `null`
- Invalid/malformed dates → returns `null`

**Location:** `utils/ageCalculation.ts` (new file) or add to `utils/birthdayValidation.ts`

### Home Screen Changes

**File:** `app/(tabs)/index.tsx`

Update birthday reminder card text:
- With age: `"Sarah is turning 36 today!"`
- Without age: `"Sarah's birthday is today"`

No visual design changes - same card styling, just different text content.

### Calendar View Changes

**Files:** `services/calendarService.ts`, `app/(tabs)/calendar.tsx`

Update birthday display text:
- With age: `"Sarah (turning 36)"` or `"Sarah's birthday - turning 36"`
- Without age: `"Sarah's birthday"`

Show age for both today's and upcoming birthdays.

## Files to Change

| File | Change |
|------|--------|
| `utils/ageCalculation.ts` | New file with `calculateTurningAge` function |
| `app/(tabs)/index.tsx` | Update birthday card text rendering |
| `services/calendarService.ts` | Update birthday display data formatting |
| `app/(tabs)/calendar.tsx` | Update if display logic lives in component |

**No database changes needed** - birth year is already stored in `YYYY-MM-DD` format.

## Testing

### Unit Tests

- Birthday with year → returns correct age
- Birthday without year (`MM-DD`) → returns `null`
- Edge case: birthday is today → returns age they're turning
- Edge case: invalid/malformed string → returns `null`

### Manual Testing

- Home screen: verify "turning X" appears for contacts with birth year
- Home screen: verify no age shown for contacts without birth year
- Calendar: verify age appears on upcoming birthdays
- Calendar: verify age appears on today's birthdays
- Import flow: verify imported contacts with years show age correctly
