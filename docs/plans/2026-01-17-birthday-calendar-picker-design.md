# Birthday Calendar Picker Design

## Overview

Replace the current text-based `BirthdayInput` component with a calendar picker that supports optional year selection. Users can toggle "I don't know the year" to store birthdays as `MM-DD` (year unknown) or `YYYY-MM-DD` (year known).

## Component Design

### New Component: `BirthdayPicker`

Location: `components/BirthdayPicker.tsx`

**Props interface:**

```typescript
interface BirthdayPickerProps {
  value: string;              // '' | 'MM-DD' | 'YYYY-MM-DD'
  onChange: (value: string) => void;
  autoFocus?: boolean;        // For add wizard compatibility
}
```

**Behavior:**

- Empty value → Calendar shows current month, no day selected, toggle unchecked
- `MM-DD` value → Toggle checked, calendar shows that month in current year
- `YYYY-MM-DD` value → Toggle unchecked, calendar shows full date

### Visual Layout

```
┌─────────────────────────────────┐
│ ☐ I don't know the year        │  ← Toggle row
├─────────────────────────────────┤
│     ◀  January 2026  ▶         │  ← Calendar header (year muted when toggled)
│  Su  Mo  Tu  We  Th  Fr  Sa    │
│              1   2   3   4     │
│   5   6   7   8   9  10  11    │
│  12  13  14  15 [16] 17  18    │  ← Selected day highlighted
│  19  20  21  22  23  24  25    │
│  26  27  28  29  30  31        │
└─────────────────────────────────┘
│           Clear                 │  ← Clear link
└─────────────────────────────────┘
```

**Styling:**

- Toggle row: Checkbox with label, `sage` color for checked state
- Calendar: Reuse theme from `calendar.tsx` (cream background, sage accents, warmgray text)
- Year muting: When toggle checked, year text gets `warmgray-muted` color and 0.5 opacity
- Container: `rounded-2xl`, surface background, matching existing card styles

### Interaction Flow

**User interactions:**

1. **Tap a day** → Calls `onChange` with formatted value based on toggle state
   - Toggle checked → `onChange('03-15')`
   - Toggle unchecked → `onChange('2026-03-15')`

2. **Toggle "I don't know the year"** → If date selected, reformats and calls `onChange`
   - Checking: `1990-03-15` → `03-15`
   - Unchecking: `03-15` → `2026-03-15` (uses current calendar year)

3. **Month/year navigation** → Standard arrows, no `onChange` until day tapped

4. **Clear link** → Calls `onChange('')`

## Data Layer Changes

### Validation Updates (`utils/birthdayValidation.ts`)

Extend to support both formats:

```typescript
validateBirthday('03-15')      → { valid: true }
validateBirthday('1990-03-15') → { valid: true }
```

### New Helper Functions

```typescript
// Check if birthday includes year
hasYear(birthday: string): boolean

// Extract month/day for comparison
getMonthDay(birthday: string): string

// Get year if present
getYear(birthday: string): number | null
```

## Integration Points

### Screens to Update

1. **Add wizard** (`app/contacts/add/birthday.tsx`) - Replace `BirthdayInput`
2. **Edit modal** (`components/EditContactModal.tsx`) - Replace `BirthdayInput`
3. **Review schedule** (`app/contacts/review-schedule.tsx`) - Replace `BirthdayInput`

### Files to Remove

- `components/BirthdayInput.tsx`
- `components/__tests__/BirthdayInput.test.tsx`

## Testing Strategy

### Unit Tests (`components/__tests__/BirthdayPicker.test.tsx`)

- Renders with empty value
- Renders with `MM-DD` value (toggle checked)
- Renders with `YYYY-MM-DD` value (toggle unchecked)
- Toggle reformats existing date
- Day tap calls `onChange` with correct format
- Clear link calls `onChange('')`

### Validation Tests

- Extend existing tests for `YYYY-MM-DD` format
- Test `hasYear`, `getMonthDay`, `getYear` helpers
- Edge cases: leap year Feb 29, invalid dates

## Technical Decisions

| Aspect | Decision |
|--------|----------|
| Library | `react-native-calendars` (already installed) |
| Toggle placement | Above the calendar |
| Year-unknown behavior | Navigation visible but muted |
| Storage format | `MM-DD` or `YYYY-MM-DD` |
| Backward compatibility | Not needed (prototype) |

## Files Changed

| File | Action |
|------|--------|
| `components/BirthdayPicker.tsx` | Create |
| `components/__tests__/BirthdayPicker.test.tsx` | Create |
| `utils/birthdayValidation.ts` | Modify |
| `utils/__tests__/birthdayValidation.test.ts` | Modify |
| `app/contacts/add/birthday.tsx` | Modify |
| `components/EditContactModal.tsx` | Modify |
| `app/contacts/review-schedule.tsx` | Modify |
| `components/BirthdayInput.tsx` | Delete |
| `components/__tests__/BirthdayInput.test.tsx` | Delete |
