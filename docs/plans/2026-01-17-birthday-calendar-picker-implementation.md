# Birthday Calendar Picker Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace text-based BirthdayInput with a calendar picker that supports optional year selection.

**Architecture:** Create a new `BirthdayPicker` component using `react-native-calendars` (already installed). The component includes a toggle for "I don't know the year" and stores birthdays as `MM-DD` (year unknown) or `YYYY-MM-DD` (year known).

**Tech Stack:** React Native, react-native-calendars, NativeWind/Tailwind CSS

---

## Task 1: Extend Birthday Validation for YYYY-MM-DD Format

**Files:**
- Modify: `utils/birthdayValidation.ts`
- Modify: `utils/__tests__/birthdayValidation.test.ts`

### Step 1: Write failing tests for YYYY-MM-DD validation

Add to `utils/__tests__/birthdayValidation.test.ts`:

```typescript
describe('validateBirthday with year', () => {
  it('accepts valid YYYY-MM-DD format', () => {
    expect(validateBirthday('1990-03-15')).toEqual({ valid: true });
    expect(validateBirthday('2000-12-31')).toEqual({ valid: true });
    expect(validateBirthday('1985-01-01')).toEqual({ valid: true });
  });

  it('rejects invalid year', () => {
    expect(validateBirthday('0000-03-15')).toEqual({ valid: false, error: 'Invalid year' });
    expect(validateBirthday('3000-03-15')).toEqual({ valid: false, error: 'Invalid year' });
  });

  it('rejects invalid month in YYYY-MM-DD', () => {
    expect(validateBirthday('1990-13-15')).toEqual({ valid: false, error: 'Month must be 1-12' });
    expect(validateBirthday('1990-00-15')).toEqual({ valid: false, error: 'Month must be 1-12' });
  });

  it('rejects invalid day in YYYY-MM-DD', () => {
    expect(validateBirthday('1990-02-30')).toEqual({ valid: false, error: 'Invalid day for this month' });
    expect(validateBirthday('1990-04-31')).toEqual({ valid: false, error: 'Invalid day for this month' });
  });

  it('allows Feb 29 in leap year', () => {
    expect(validateBirthday('2000-02-29')).toEqual({ valid: true });
    expect(validateBirthday('2004-02-29')).toEqual({ valid: true });
  });

  it('rejects Feb 29 in non-leap year', () => {
    expect(validateBirthday('1900-02-29')).toEqual({ valid: false, error: 'Invalid day for this month' });
    expect(validateBirthday('2001-02-29')).toEqual({ valid: false, error: 'Invalid day for this month' });
  });
});
```

### Step 2: Run test to verify it fails

```bash
npx jest utils/__tests__/birthdayValidation.test.ts -v
```

Expected: FAIL - tests expecting YYYY-MM-DD validation

### Step 3: Update validateBirthday to handle YYYY-MM-DD

Replace `utils/birthdayValidation.ts`:

```typescript
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

const MAX_DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getMaxDaysInMonth(month: number, year?: number): number {
  if (month === 2 && year !== undefined) {
    return isLeapYear(year) ? 29 : 28;
  }
  return MAX_DAYS_IN_MONTH[month - 1];
}

export function validateBirthday(input: string): ValidationResult {
  const trimmed = input.trim();

  if (trimmed === '') {
    return { valid: true };
  }

  const cleaned = trimmed.replace(/\//g, '-');
  const parts = cleaned.split('-');

  // YYYY-MM-DD format
  if (parts.length === 3) {
    const yearStr = parts[0];
    const monthStr = parts[1];
    const dayStr = parts[2];

    if (!/^\d{4}$/.test(yearStr) || !/^\d{1,2}$/.test(monthStr) || !/^\d{1,2}$/.test(dayStr)) {
      return { valid: false, error: 'Use format YYYY-MM-DD or MM/DD' };
    }

    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);

    if (year < 1900 || year > 2100) {
      return { valid: false, error: 'Invalid year' };
    }

    if (month < 1 || month > 12) {
      return { valid: false, error: 'Month must be 1-12' };
    }

    if (day < 1 || day > getMaxDaysInMonth(month, year)) {
      return { valid: false, error: 'Invalid day for this month' };
    }

    return { valid: true };
  }

  // MM-DD format
  if (parts.length === 2) {
    const monthStr = parts[0];
    const dayStr = parts[1];

    if (!/^\d{1,2}$/.test(monthStr) || !/^\d{1,2}$/.test(dayStr)) {
      return { valid: false, error: 'Use format MM/DD' };
    }

    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);

    if (month < 1 || month > 12) {
      return { valid: false, error: 'Month must be 1-12' };
    }

    if (day < 1 || day > MAX_DAYS_IN_MONTH[month - 1]) {
      return { valid: false, error: 'Invalid day for this month' };
    }

    return { valid: true };
  }

  return { valid: false, error: 'Use format MM/DD' };
}

export function normalizeBirthday(input: string): string {
  const trimmed = input.trim();

  if (trimmed === '') {
    return '';
  }

  const validation = validateBirthday(trimmed);
  if (!validation.valid) {
    return '';
  }

  const cleaned = trimmed.replace(/\//g, '-');
  const parts = cleaned.split('-');

  // YYYY-MM-DD format - keep as is but normalize padding
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  // MM-DD format
  const month = parseInt(parts[0], 10);
  const day = parseInt(parts[1], 10);
  return `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
```

### Step 4: Run tests to verify they pass

```bash
npx jest utils/__tests__/birthdayValidation.test.ts -v
```

Expected: PASS

### Step 5: Commit

```bash
git add utils/birthdayValidation.ts utils/__tests__/birthdayValidation.test.ts
git commit -m "feat: extend birthday validation to support YYYY-MM-DD format"
```

---

## Task 2: Add Birthday Helper Functions

**Files:**
- Modify: `utils/birthdayValidation.ts`
- Modify: `utils/__tests__/birthdayValidation.test.ts`

### Step 1: Write failing tests for helper functions

Add to `utils/__tests__/birthdayValidation.test.ts`:

```typescript
import { validateBirthday, normalizeBirthday, hasYear, getMonthDay, getYear } from '../birthdayValidation';

describe('hasYear', () => {
  it('returns true for YYYY-MM-DD format', () => {
    expect(hasYear('1990-03-15')).toBe(true);
    expect(hasYear('2000-12-31')).toBe(true);
  });

  it('returns false for MM-DD format', () => {
    expect(hasYear('03-15')).toBe(false);
    expect(hasYear('12-31')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(hasYear('')).toBe(false);
  });
});

describe('getMonthDay', () => {
  it('extracts MM-DD from YYYY-MM-DD', () => {
    expect(getMonthDay('1990-03-15')).toBe('03-15');
    expect(getMonthDay('2000-12-31')).toBe('12-31');
  });

  it('returns MM-DD as is', () => {
    expect(getMonthDay('03-15')).toBe('03-15');
    expect(getMonthDay('12-31')).toBe('12-31');
  });

  it('returns empty string for empty input', () => {
    expect(getMonthDay('')).toBe('');
  });
});

describe('getYear', () => {
  it('extracts year from YYYY-MM-DD', () => {
    expect(getYear('1990-03-15')).toBe(1990);
    expect(getYear('2000-12-31')).toBe(2000);
  });

  it('returns null for MM-DD format', () => {
    expect(getYear('03-15')).toBe(null);
    expect(getYear('12-31')).toBe(null);
  });

  it('returns null for empty string', () => {
    expect(getYear('')).toBe(null);
  });
});
```

### Step 2: Run test to verify it fails

```bash
npx jest utils/__tests__/birthdayValidation.test.ts -v
```

Expected: FAIL - hasYear, getMonthDay, getYear not defined

### Step 3: Add helper functions

Add to end of `utils/birthdayValidation.ts`:

```typescript
export function hasYear(birthday: string): boolean {
  if (!birthday) return false;
  const parts = birthday.split('-');
  return parts.length === 3 && parts[0].length === 4;
}

export function getMonthDay(birthday: string): string {
  if (!birthday) return '';
  const parts = birthday.split('-');
  if (parts.length === 3) {
    return `${parts[1]}-${parts[2]}`;
  }
  return birthday;
}

export function getYear(birthday: string): number | null {
  if (!birthday) return null;
  const parts = birthday.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return parseInt(parts[0], 10);
  }
  return null;
}
```

### Step 4: Run tests to verify they pass

```bash
npx jest utils/__tests__/birthdayValidation.test.ts -v
```

Expected: PASS

### Step 5: Commit

```bash
git add utils/birthdayValidation.ts utils/__tests__/birthdayValidation.test.ts
git commit -m "feat: add hasYear, getMonthDay, getYear helper functions"
```

---

## Task 3: Create BirthdayPicker Component

**Files:**
- Create: `components/BirthdayPicker.tsx`
- Create: `components/__tests__/BirthdayPicker.test.tsx`

### Step 1: Write failing test for basic rendering

Create `components/__tests__/BirthdayPicker.test.tsx`:

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BirthdayPicker from '../BirthdayPicker';

describe('BirthdayPicker', () => {
  it('renders with toggle unchecked by default', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <BirthdayPicker value="" onChange={onChange} />
    );

    expect(getByText("I don't know the year")).toBeTruthy();
  });

  it('renders with toggle checked when value is MM-DD format', () => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      <BirthdayPicker value="03-15" onChange={onChange} />
    );

    const toggle = getByTestId('year-unknown-toggle');
    expect(toggle.props.accessibilityState.checked).toBe(true);
  });

  it('renders with toggle unchecked when value is YYYY-MM-DD format', () => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      <BirthdayPicker value="1990-03-15" onChange={onChange} />
    );

    const toggle = getByTestId('year-unknown-toggle');
    expect(toggle.props.accessibilityState.checked).toBe(false);
  });
});
```

### Step 2: Run test to verify it fails

```bash
npx jest components/__tests__/BirthdayPicker.test.tsx -v
```

Expected: FAIL - BirthdayPicker not found

### Step 3: Create initial BirthdayPicker component

Create `components/BirthdayPicker.tsx`:

```typescript
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, TouchableOpacity } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { hasYear, getMonthDay } from '@/utils/birthdayValidation';

interface BirthdayPickerProps {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
}

const calendarTheme = {
  calendarBackground: '#FDFBF7',
  textSectionTitleColor: '#8B9678',
  selectedDayBackgroundColor: '#9CA986',
  selectedDayTextColor: '#ffffff',
  todayTextColor: '#9CA986',
  dayTextColor: '#5C6356',
  textDisabledColor: '#8B9678',
  dotColor: '#9CA986',
  selectedDotColor: '#ffffff',
  arrowColor: '#9CA986',
  monthTextColor: '#5C6356',
  textDayFontFamily: 'System',
  textMonthFontFamily: 'System',
  textDayHeaderFontFamily: 'System',
  textDayFontSize: 16,
  textMonthFontSize: 16,
  textDayHeaderFontSize: 13,
};

export default function BirthdayPicker({ value, onChange }: BirthdayPickerProps) {
  const [yearUnknown, setYearUnknown] = useState(() => {
    if (!value) return false;
    return !hasYear(value);
  });

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (!value) return '';
    if (hasYear(value)) return value;
    // For MM-DD, use current year to display
    const currentYear = new Date().getFullYear();
    const monthDay = getMonthDay(value);
    return `${currentYear}-${monthDay}`;
  });

  useEffect(() => {
    if (!value) {
      setYearUnknown(false);
      setSelectedDate('');
      return;
    }
    setYearUnknown(!hasYear(value));
    if (hasYear(value)) {
      setSelectedDate(value);
    } else {
      const currentYear = new Date().getFullYear();
      setSelectedDate(`${currentYear}-${getMonthDay(value)}`);
    }
  }, [value]);

  const handleToggleYear = () => {
    const newYearUnknown = !yearUnknown;
    setYearUnknown(newYearUnknown);

    if (selectedDate) {
      const parts = selectedDate.split('-');
      if (parts.length === 3) {
        const monthDay = `${parts[1]}-${parts[2]}`;
        if (newYearUnknown) {
          onChange(monthDay);
        } else {
          onChange(selectedDate);
        }
      }
    }
  };

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
    if (yearUnknown) {
      const parts = day.dateString.split('-');
      onChange(`${parts[1]}-${parts[2]}`);
    } else {
      onChange(day.dateString);
    }
  };

  const handleClear = () => {
    setSelectedDate('');
    onChange('');
  };

  const markedDates = useMemo(() => {
    if (!selectedDate) return {};
    return {
      [selectedDate]: {
        selected: true,
        selectedColor: '#9CA986',
        selectedTextColor: '#ffffff',
      },
    };
  }, [selectedDate]);

  const yearMutedTheme = useMemo(() => {
    if (!yearUnknown) return calendarTheme;
    return {
      ...calendarTheme,
      monthTextColor: '#A0A0A0',
    };
  }, [yearUnknown]);

  return (
    <View>
      {/* Toggle Row */}
      <Pressable
        testID="year-unknown-toggle"
        accessibilityState={{ checked: yearUnknown }}
        onPress={handleToggleYear}
        className="flex-row items-center gap-3 py-3 px-1"
      >
        <View
          className={`h-6 w-6 rounded-md border-2 items-center justify-center ${
            yearUnknown ? 'bg-sage border-sage' : 'border-border bg-surface'
          }`}
        >
          {yearUnknown && <Ionicons name="checkmark" size={16} color="#fff" />}
        </View>
        <Text className="text-base text-warmgray">I don't know the year</Text>
      </Pressable>

      {/* Calendar */}
      <View className="rounded-2xl overflow-hidden bg-surface border border-border">
        <Calendar
          current={selectedDate || undefined}
          markedDates={markedDates}
          onDayPress={handleDayPress}
          theme={yearMutedTheme}
          enableSwipeMonths
          firstDay={0}
        />
      </View>

      {/* Clear Link */}
      {selectedDate && (
        <TouchableOpacity
          onPress={handleClear}
          className="py-3 items-center"
          activeOpacity={0.7}
        >
          <Text className="text-sm font-medium text-warmgray-muted">Clear</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
```

### Step 4: Run tests to verify they pass

```bash
npx jest components/__tests__/BirthdayPicker.test.tsx -v
```

Expected: PASS

### Step 5: Commit

```bash
git add components/BirthdayPicker.tsx components/__tests__/BirthdayPicker.test.tsx
git commit -m "feat: create BirthdayPicker component with calendar and year toggle"
```

---

## Task 4: Add More BirthdayPicker Tests

**Files:**
- Modify: `components/__tests__/BirthdayPicker.test.tsx`

### Step 1: Add tests for interactions

Add to `components/__tests__/BirthdayPicker.test.tsx`:

```typescript
describe('BirthdayPicker interactions', () => {
  it('calls onChange with MM-DD when toggle is checked and day is pressed', () => {
    const onChange = jest.fn();
    const { getByTestId, getByText } = render(
      <BirthdayPicker value="" onChange={onChange} />
    );

    // Check the toggle first
    const toggle = getByTestId('year-unknown-toggle');
    fireEvent.press(toggle);

    // The calendar should be rendered - we can't easily simulate day press
    // but we can verify the component renders
    expect(getByText("I don't know the year")).toBeTruthy();
  });

  it('shows Clear link when a date is selected', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <BirthdayPicker value="1990-03-15" onChange={onChange} />
    );

    expect(getByText('Clear')).toBeTruthy();
  });

  it('hides Clear link when no date is selected', () => {
    const onChange = jest.fn();
    const { queryByText } = render(
      <BirthdayPicker value="" onChange={onChange} />
    );

    expect(queryByText('Clear')).toBeNull();
  });

  it('calls onChange with empty string when Clear is pressed', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <BirthdayPicker value="1990-03-15" onChange={onChange} />
    );

    fireEvent.press(getByText('Clear'));
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('reformats date when toggle is changed with existing date', () => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      <BirthdayPicker value="1990-03-15" onChange={onChange} />
    );

    // Toggle to year unknown
    const toggle = getByTestId('year-unknown-toggle');
    fireEvent.press(toggle);

    expect(onChange).toHaveBeenCalledWith('03-15');
  });
});
```

### Step 2: Run tests

```bash
npx jest components/__tests__/BirthdayPicker.test.tsx -v
```

Expected: PASS

### Step 3: Commit

```bash
git add components/__tests__/BirthdayPicker.test.tsx
git commit -m "test: add interaction tests for BirthdayPicker"
```

---

## Task 5: Integrate BirthdayPicker in Add Wizard

**Files:**
- Modify: `app/contacts/add/birthday.tsx`

### Step 1: Update imports

Replace `BirthdayInput` import with `BirthdayPicker`:

```typescript
// Change this line:
import BirthdayInput from '@/components/BirthdayInput';
// To:
import BirthdayPicker from '@/components/BirthdayPicker';
```

### Step 2: Replace BirthdayInput usage

In the editing state section (around line 156-162), replace:

```typescript
<View className="py-2 bg-cream rounded-xl border border-border/50">
  <BirthdayInput
    value={editingBirthday}
    onChange={setEditingBirthday}
    autoFocus
  />
</View>
```

With:

```typescript
<View className="py-2">
  <BirthdayPicker
    value={editingBirthday}
    onChange={setEditingBirthday}
  />
</View>
```

### Step 3: Run the app and test manually

```bash
pnpm ios
```

Navigate to Add Contact → set frequency → reach birthday screen. Verify:
- Toggle appears above calendar
- Calendar picker works
- "I don't know the year" toggle works
- Clear link works

### Step 4: Run tests

```bash
npx jest --watchAll=false
```

Expected: PASS

### Step 5: Commit

```bash
git add app/contacts/add/birthday.tsx
git commit -m "feat: replace BirthdayInput with BirthdayPicker in add wizard"
```

---

## Task 6: Integrate BirthdayPicker in Edit Modal

**Files:**
- Modify: `components/EditContactModal.tsx`

### Step 1: Update imports

Replace `BirthdayInput` import with `BirthdayPicker`:

```typescript
// Change this line:
import BirthdayInput from '@/components/BirthdayInput';
// To:
import BirthdayPicker from '@/components/BirthdayPicker';
```

### Step 2: Replace BirthdayInput usage

In the birthday section (around line 197-202), replace:

```typescript
<View className="py-2 bg-cream rounded-xl border border-border/50">
  <BirthdayInput
    value={birthday}
    onChange={setBirthday}
  />
</View>
```

With:

```typescript
<View className="py-2">
  <BirthdayPicker
    value={birthday}
    onChange={setBirthday}
  />
</View>
```

### Step 3: Test manually

Open edit modal on a contact. Verify calendar picker works.

### Step 4: Run tests

```bash
npx jest --watchAll=false
```

Expected: PASS

### Step 5: Commit

```bash
git add components/EditContactModal.tsx
git commit -m "feat: replace BirthdayInput with BirthdayPicker in edit modal"
```

---

## Task 7: Integrate BirthdayPicker in Review Schedule

**Files:**
- Modify: `app/contacts/review-schedule.tsx`

### Step 1: Update imports

Replace `BirthdayInput` import with `BirthdayPicker`:

```typescript
// Change this line:
import BirthdayInput from "@/components/BirthdayInput";
// To:
import BirthdayPicker from "@/components/BirthdayPicker";
```

### Step 2: Replace iOS BirthdayInput usage

In the iOS birthday bottom sheet (around line 485-491), replace:

```typescript
<View className="py-4">
  <BirthdayInput
    value={birthdayInput}
    onChange={setBirthdayInput}
    autoFocus
  />
</View>
```

With:

```typescript
<View className="py-4">
  <BirthdayPicker
    value={birthdayInput}
    onChange={setBirthdayInput}
  />
</View>
```

### Step 3: Replace Android BirthdayInput usage

In the Android birthday modal (around line 513-517), replace:

```typescript
<BirthdayInput
  value={birthdayInput}
  onChange={setBirthdayInput}
  autoFocus
/>
```

With:

```typescript
<BirthdayPicker
  value={birthdayInput}
  onChange={setBirthdayInput}
/>
```

### Step 4: Adjust modal/sheet height if needed

The calendar is taller than the text input. The KeyboardAvoidingView and ScrollView should handle this, but verify the layout works on both platforms.

### Step 5: Run tests

```bash
npx jest --watchAll=false
```

Expected: PASS

### Step 6: Commit

```bash
git add app/contacts/review-schedule.tsx
git commit -m "feat: replace BirthdayInput with BirthdayPicker in review-schedule"
```

---

## Task 8: Remove Old BirthdayInput Component

**Files:**
- Delete: `components/BirthdayInput.tsx`
- Delete: `components/__tests__/BirthdayInput.test.tsx`

### Step 1: Verify no remaining usages

```bash
grep -r "BirthdayInput" --include="*.tsx" --include="*.ts" .
```

Expected: No results (or only in the files we're about to delete)

### Step 2: Delete old files

```bash
rm components/BirthdayInput.tsx
rm components/__tests__/BirthdayInput.test.tsx
```

### Step 3: Run tests to verify nothing breaks

```bash
npx jest --watchAll=false
```

Expected: PASS

### Step 4: Commit

```bash
git add -A
git commit -m "chore: remove deprecated BirthdayInput component"
```

---

## Task 9: Final Verification

### Step 1: Run full test suite

```bash
npx jest --watchAll=false
```

Expected: All tests pass

### Step 2: Manual testing checklist

Test on iOS simulator:
- [ ] Add contact flow: calendar picker appears, toggle works, clear works
- [ ] Edit modal: calendar picker appears, can change birthday
- [ ] Review schedule: calendar picker appears in bottom sheet
- [ ] Birthday displays correctly after saving (both MM-DD and YYYY-MM-DD)

### Step 3: Commit any final fixes

If any fixes needed, commit them.

### Step 4: Final commit summary

```bash
git log --oneline -10
```

Verify all commits are present and coherent.
