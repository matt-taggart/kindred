# Birthday Text Input Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace native DateTimePicker with text input for MM/DD birthday entry across all three input screens.

**Architecture:** Create a shared `BirthdayInput` component with validation logic, then integrate it into the three birthday input locations: add contact wizard, edit contact modal, and review-schedule import screen.

**Tech Stack:** React Native, NativeWind, Jest

---

## Task 1: Create Validation Utility

**Files:**
- Create: `utils/birthdayValidation.ts`
- Create: `utils/__tests__/birthdayValidation.test.ts`

**Step 1: Write the failing tests**

Create `utils/__tests__/birthdayValidation.test.ts`:

```typescript
import { validateBirthday, normalizeBirthday } from '../birthdayValidation';

describe('validateBirthday', () => {
  it('accepts empty string (optional field)', () => {
    expect(validateBirthday('')).toEqual({ valid: true });
    expect(validateBirthday('  ')).toEqual({ valid: true });
  });

  it('accepts valid MM/DD format', () => {
    expect(validateBirthday('03/15')).toEqual({ valid: true });
    expect(validateBirthday('12/31')).toEqual({ valid: true });
    expect(validateBirthday('01/01')).toEqual({ valid: true });
  });

  it('accepts valid MM-DD format', () => {
    expect(validateBirthday('03-15')).toEqual({ valid: true });
    expect(validateBirthday('12-31')).toEqual({ valid: true });
  });

  it('accepts single digit month/day', () => {
    expect(validateBirthday('3/5')).toEqual({ valid: true });
    expect(validateBirthday('1/1')).toEqual({ valid: true });
  });

  it('rejects invalid month', () => {
    expect(validateBirthday('13/15')).toEqual({ valid: false, error: 'Month must be 1-12' });
    expect(validateBirthday('00/15')).toEqual({ valid: false, error: 'Month must be 1-12' });
  });

  it('rejects invalid day for month', () => {
    expect(validateBirthday('02/30')).toEqual({ valid: false, error: 'Invalid day for this month' });
    expect(validateBirthday('04/31')).toEqual({ valid: false, error: 'Invalid day for this month' });
    expect(validateBirthday('03/00')).toEqual({ valid: false, error: 'Invalid day for this month' });
  });

  it('allows Feb 29 (leap year possibility)', () => {
    expect(validateBirthday('02/29')).toEqual({ valid: true });
  });

  it('rejects invalid format', () => {
    expect(validateBirthday('abc')).toEqual({ valid: false, error: 'Use format MM/DD' });
    expect(validateBirthday('123')).toEqual({ valid: false, error: 'Use format MM/DD' });
    expect(validateBirthday('03/15/1990')).toEqual({ valid: false, error: 'Use format MM/DD' });
  });
});

describe('normalizeBirthday', () => {
  it('normalizes to MM-DD format', () => {
    expect(normalizeBirthday('03/15')).toBe('03-15');
    expect(normalizeBirthday('3/5')).toBe('03-05');
    expect(normalizeBirthday('12-31')).toBe('12-31');
  });

  it('returns empty string for empty input', () => {
    expect(normalizeBirthday('')).toBe('');
    expect(normalizeBirthday('  ')).toBe('');
  });

  it('returns empty string for invalid input', () => {
    expect(normalizeBirthday('abc')).toBe('');
    expect(normalizeBirthday('13/15')).toBe('');
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npx jest utils/__tests__/birthdayValidation.test.ts --ci`
Expected: FAIL with "Cannot find module '../birthdayValidation'"

**Step 3: Write the implementation**

Create `utils/birthdayValidation.ts`:

```typescript
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

const MAX_DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function validateBirthday(input: string): ValidationResult {
  const trimmed = input.trim();

  if (trimmed === '') {
    return { valid: true };
  }

  const cleaned = trimmed.replace(/\//g, '-');
  const parts = cleaned.split('-');

  if (parts.length !== 2) {
    return { valid: false, error: 'Use format MM/DD' };
  }

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
  const month = parseInt(parts[0], 10);
  const day = parseInt(parts[1], 10);

  return `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
```

**Step 4: Run tests to verify they pass**

Run: `npx jest utils/__tests__/birthdayValidation.test.ts --ci`
Expected: PASS (all 12 tests)

**Step 5: Commit**

```bash
git add utils/birthdayValidation.ts utils/__tests__/birthdayValidation.test.ts
git commit -m "feat: add birthday validation utility with tests"
```

---

## Task 2: Create BirthdayInput Component

**Files:**
- Create: `components/BirthdayInput.tsx`
- Create: `components/__tests__/BirthdayInput.test.tsx`

**Step 1: Write the failing tests**

Create `components/__tests__/BirthdayInput.test.tsx`:

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BirthdayInput from '../BirthdayInput';

describe('BirthdayInput', () => {
  it('renders with placeholder when empty', () => {
    const { getByPlaceholderText } = render(
      <BirthdayInput value="" onChange={jest.fn()} />
    );
    expect(getByPlaceholderText('MM/DD')).toBeTruthy();
  });

  it('displays current value', () => {
    const { getByDisplayValue } = render(
      <BirthdayInput value="03-15" onChange={jest.fn()} />
    );
    expect(getByDisplayValue('03-15')).toBeTruthy();
  });

  it('calls onChange with normalized value on valid input', () => {
    const onChange = jest.fn();
    const { getByPlaceholderText } = render(
      <BirthdayInput value="" onChange={onChange} />
    );

    fireEvent.changeText(getByPlaceholderText('MM/DD'), '3/15');
    expect(onChange).toHaveBeenCalledWith('03-15');
  });

  it('calls onChange with empty string when cleared', () => {
    const onChange = jest.fn();
    const { getByDisplayValue } = render(
      <BirthdayInput value="03-15" onChange={onChange} />
    );

    fireEvent.changeText(getByDisplayValue('03-15'), '');
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('shows error for invalid input', () => {
    const { getByPlaceholderText, getByText } = render(
      <BirthdayInput value="" onChange={jest.fn()} />
    );

    fireEvent.changeText(getByPlaceholderText('MM/DD'), '13/15');
    expect(getByText('Month must be 1-12')).toBeTruthy();
  });

  it('does not call onChange for invalid input', () => {
    const onChange = jest.fn();
    const { getByPlaceholderText } = render(
      <BirthdayInput value="" onChange={onChange} />
    );

    fireEvent.changeText(getByPlaceholderText('MM/DD'), '13/15');
    expect(onChange).not.toHaveBeenCalled();
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npx jest components/__tests__/BirthdayInput.test.tsx --ci`
Expected: FAIL with "Cannot find module '../BirthdayInput'"

**Step 3: Write the implementation**

Create `components/BirthdayInput.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { View, TextInput, Text } from 'react-native';
import { validateBirthday, normalizeBirthday } from '@/utils/birthdayValidation';

interface BirthdayInputProps {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
}

export default function BirthdayInput({ value, onChange, autoFocus = false }: BirthdayInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChangeText = (text: string) => {
    setInputValue(text);

    const trimmed = text.trim();

    if (trimmed === '') {
      setError(null);
      onChange('');
      return;
    }

    const validation = validateBirthday(trimmed);

    if (validation.valid) {
      setError(null);
      onChange(normalizeBirthday(trimmed));
    } else {
      setError(validation.error || 'Invalid date');
    }
  };

  return (
    <View>
      <TextInput
        value={inputValue}
        onChangeText={handleChangeText}
        placeholder="MM/DD"
        placeholderTextColor="#A0A0A0"
        keyboardType="numbers-and-punctuation"
        autoFocus={autoFocus}
        maxLength={5}
        className="text-2xl font-bold text-center py-4 text-warmgray"
      />
      <Text className="text-sm text-warmgray-muted text-center mt-1">
        Format: MM/DD
      </Text>
      {error && (
        <Text className="text-sm text-terracotta text-center mt-2">
          {error}
        </Text>
      )}
    </View>
  );
}
```

**Step 4: Run tests to verify they pass**

Run: `npx jest components/__tests__/BirthdayInput.test.tsx --ci`
Expected: PASS (all 6 tests)

**Step 5: Commit**

```bash
git add components/BirthdayInput.tsx components/__tests__/BirthdayInput.test.tsx
git commit -m "feat: add BirthdayInput component with tests"
```

---

## Task 3: Integrate into Add Contact Wizard

**Files:**
- Modify: `app/contacts/add/birthday.tsx`

**Step 1: Review current implementation**

Read the file to understand the current DateTimePicker usage and state management.

**Step 2: Replace DateTimePicker with BirthdayInput**

Update `app/contacts/add/birthday.tsx`:

```typescript
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { Contact } from '@/db/schema';
import { addContact, getAvailableSlots } from '@/services/contactService';
import { useUserStore } from '@/lib/userStore';
import { EnhancedPaywallModal } from '@/components/EnhancedPaywallModal';
import BirthdayInput from '@/components/BirthdayInput';
import { formatBirthdayDisplay } from '@/utils/formatters';

const ProgressDots = ({ step }: { step: 1 | 2 | 3 }) => (
  <View className="flex-row items-center justify-center gap-2">
    {[1, 2, 3].map((i) => (
      <View
        key={i}
        className={`h-2.5 w-2.5 rounded-full ${i === step ? 'bg-sage' : 'bg-border'}`}
      />
    ))}
  </View>
);

export default function AddConnectionBirthdayScreen() {
  const router = useRouter();
  const { isPro } = useUserStore();
  const params = useLocalSearchParams<{ name?: string; bucket?: string; customIntervalDays?: string }>();

  const name = useMemo(() => (typeof params.name === 'string' ? params.name.trim() : ''), [params.name]);
  const bucket = useMemo(() => {
    const raw = params.bucket;
    if (typeof raw !== 'string') return 'weekly' as Contact['bucket'];
    return raw as Contact['bucket'];
  }, [params.bucket]);
  const customIntervalDays = useMemo(() => {
    const raw = params.customIntervalDays;
    if (!raw) return undefined;
    const days = parseInt(raw, 10);
    return isNaN(days) ? undefined : days;
  }, [params.customIntervalDays]);

  type BirthdayState = 'collapsed' | 'editing' | 'saved';
  const [birthdayState, setBirthdayState] = useState<BirthdayState>('collapsed');
  const [savedBirthday, setSavedBirthday] = useState<string>('');
  const [editingBirthday, setEditingBirthday] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const handleAddBirthday = () => {
    setEditingBirthday(savedBirthday);
    setBirthdayState('editing');
  };

  const handleCancel = () => {
    setEditingBirthday('');
    setBirthdayState(savedBirthday ? 'saved' : 'collapsed');
  };

  const handleSaveBirthday = () => {
    if (editingBirthday) {
      setSavedBirthday(editingBirthday);
      setBirthdayState('saved');
    }
  };

  const handleEdit = () => {
    setEditingBirthday(savedBirthday);
    setBirthdayState('editing');
  };

  const handleDone = async () => {
    if (!name) {
      router.replace('/contacts/add');
      return;
    }

    if (!isPro && getAvailableSlots() <= 0) {
      setShowPaywall(true);
      return;
    }

    try {
      setSaving(true);
      const created = await addContact({
        name,
        bucket,
        customIntervalDays,
        birthday: savedBirthday || null,
      });
      router.replace(`/contacts/${created.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add connection.';
      if (message.toLowerCase().includes('free plan')) {
        setShowPaywall(true);
      } else {
        Alert.alert('Error', message);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <Stack.Screen
        options={{
          title: name || 'Add a connection',
          headerBackTitle: 'Back',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#FDFCF8' },
          headerTintColor: '#57534E',
        }}
      />

      <View className="flex-1 px-6 pt-6">
        <ProgressDots step={3} />

        <View className="items-center mb-8 mt-10">
          <View className="h-24 w-24 items-center justify-center rounded-full bg-sage mb-6 shadow-sm">
            <Ionicons name="gift" size={48} color="#fff" />
          </View>
          <Text className="text-2xl font-bold text-warmgray text-center mb-3">
            One more thing...
          </Text>
          <Text className="text-base text-warmgray-muted text-center px-4 leading-relaxed">
            Would you like to remember {name ? `${name}'s` : 'their'} birthday?
          </Text>
        </View>

        <View className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          {birthdayState === 'collapsed' && (
            <TouchableOpacity
              className="flex-row items-center justify-center py-4"
              onPress={handleAddBirthday}
              activeOpacity={0.7}
              disabled={saving}
            >
              <Ionicons name="gift-outline" size={24} color="#788467" style={{ marginRight: 8 }} />
              <Text className="text-lg font-semibold text-sage">Add Birthday</Text>
            </TouchableOpacity>
          )}

          {birthdayState === 'editing' && (
            <View>
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-base font-semibold text-warmgray">Birthday</Text>
                <TouchableOpacity
                  onPress={handleCancel}
                  activeOpacity={0.7}
                  disabled={saving}
                >
                  <Text className="text-sm font-medium text-terracotta">Cancel</Text>
                </TouchableOpacity>
              </View>

              <View className="py-2 bg-cream rounded-xl border border-border/50">
                <BirthdayInput
                  value={editingBirthday}
                  onChange={setEditingBirthday}
                  autoFocus
                />
              </View>

              <TouchableOpacity
                className={`mt-4 items-center justify-center rounded-xl py-3 ${editingBirthday ? 'bg-sage' : 'bg-border'}`}
                onPress={handleSaveBirthday}
                activeOpacity={0.9}
                disabled={saving || !editingBirthday}
              >
                <Text className={`text-base font-semibold ${editingBirthday ? 'text-white' : 'text-warmgray-muted'}`}>
                  Save Birthday
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {birthdayState === 'saved' && savedBirthday && (
            <View className="flex-row items-center justify-between py-4">
              <View className="flex-row items-center gap-3">
                <View className="h-8 w-8 items-center justify-center rounded-full bg-sage-100">
                  <Ionicons name="checkmark" size={20} color="#788467" />
                </View>
                <Text className="text-base font-medium text-warmgray">
                  {formatBirthdayDisplay(savedBirthday)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleEdit}
                activeOpacity={0.7}
                disabled={saving}
              >
                <Text className="text-sm font-medium text-sage">Edit</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View className="mt-auto pb-6">
          <TouchableOpacity
            className="items-center justify-center rounded-2xl bg-sage h-14 shadow-sm"
            onPress={handleDone}
            activeOpacity={0.9}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-lg font-semibold text-white">Done</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <EnhancedPaywallModal visible={showPaywall} onClose={() => setShowPaywall(false)} />
    </SafeAreaView>
  );
}
```

**Step 3: Run all tests to verify no regressions**

Run: `npx jest --ci`
Expected: All tests pass

**Step 4: Commit**

```bash
git add app/contacts/add/birthday.tsx
git commit -m "feat: replace DateTimePicker with BirthdayInput in add wizard"
```

---

## Task 4: Integrate into Edit Contact Modal

**Files:**
- Modify: `components/EditContactModal.tsx`

**Step 1: Update imports and remove DateTimePicker**

Replace DateTimePicker import with BirthdayInput. Remove `parseDate` helper function.

**Step 2: Replace birthday picker section**

In `components/EditContactModal.tsx`, replace lines 214-239 (the birthday card section) with:

```typescript
<View className="mb-8 rounded-2xl bg-surface p-4 shadow-sm border border-border">
  <View className="flex-row items-center justify-between mb-2.5">
    <View className="flex-row items-center gap-2">
      <View className="h-8 w-8 items-center justify-center rounded-full bg-sage-100">
        <Text className="text-lg">🎂</Text>
      </View>
      <Text className="text-base font-semibold text-warmgray">
        Birthday
      </Text>
    </View>
    {birthday ? (
      <Pressable
        onPress={() => setBirthday("")}
        className="active:opacity-60"
      >
        <Text className="text-sm font-medium text-terracotta">
          Remove
        </Text>
      </Pressable>
    ) : null}
  </View>

  <View className="py-2 bg-cream rounded-xl border border-border/50">
    <BirthdayInput
      value={birthday}
      onChange={setBirthday}
    />
  </View>

  <Text className="mt-3 text-xs text-warmgray-muted text-center">
    We'll prioritize this over regular reminders on their birthday.
  </Text>
</View>
```

**Step 3: Update imports at top of file**

Add import:
```typescript
import BirthdayInput from '@/components/BirthdayInput';
```

Remove:
```typescript
import DateTimePicker from "@react-native-community/datetimepicker";
```

Remove the `parseDate` and `formatDate` helper functions (lines 77-87) as they're no longer needed.

Remove `handleDateChange` function (lines 142-146) as it's no longer needed.

**Step 4: Run all tests**

Run: `npx jest --ci`
Expected: All tests pass

**Step 5: Commit**

```bash
git add components/EditContactModal.tsx
git commit -m "feat: replace DateTimePicker with BirthdayInput in edit modal"
```

---

## Task 5: Integrate into Review Schedule Screen

**Files:**
- Modify: `app/contacts/review-schedule.tsx`

**Step 1: Replace inline birthday input with shared component**

The review-schedule screen already has text input for birthdays. Replace the inline implementation with the shared `BirthdayInput` component.

Add import at top:
```typescript
import BirthdayInput from '@/components/BirthdayInput';
```

**Step 2: Update iOS birthday input section (lines 488-528)**

Replace with:
```typescript
{/* iOS Birthday Input - Bottom Sheet */}
{Platform.OS === "ios" && showDatePicker && editingState?.field === "birthday" && (
  <KeyboardAvoidingView
    behavior="padding"
    className="absolute bottom-0 left-0 right-0 border-t border-border bg-surface px-4 pb-8 pt-4"
  >
    <View className="mb-2 flex-row items-center justify-between">
      <TouchableOpacity
        onPress={() => {
          setShowDatePicker(false);
          setEditingState(null);
        }}
      >
        <Text className="text-base font-semibold text-warmgray-muted">
          Cancel
        </Text>
      </TouchableOpacity>
      <Text className="text-base font-bold text-warmgray">
        Set Birthday
      </Text>
      <TouchableOpacity onPress={handleConfirmBirthday}>
        <Text className="text-base font-semibold text-sage">Done</Text>
      </TouchableOpacity>
    </View>
    <View className="py-4">
      <BirthdayInput
        value={birthdayInput}
        onChange={setBirthdayInput}
        autoFocus
      />
    </View>
  </KeyboardAvoidingView>
)}
```

**Step 3: Update Android birthday input section (lines 544-571)**

Replace with:
```typescript
{/* Android Birthday Input */}
{Platform.OS === "android" && showDatePicker && editingState?.field === "birthday" && (
  <View className="absolute bottom-0 left-0 right-0 top-0 bg-black/50 items-center justify-center p-4">
    <View className="bg-surface p-6 rounded-2xl w-full max-w-sm">
      <Text className="text-lg font-bold text-warmgray mb-4">Set Birthday</Text>
      <BirthdayInput
        value={birthdayInput}
        onChange={setBirthdayInput}
        autoFocus
      />
      <View className="flex-row justify-end gap-4 mt-4">
        <TouchableOpacity onPress={() => { setShowDatePicker(false); setEditingState(null); }}>
          <Text className="text-base font-medium text-warmgray-muted">Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleConfirmBirthday}>
          <Text className="text-base font-bold text-sage">Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
)}
```

**Step 4: Simplify handleConfirmBirthday**

Since BirthdayInput now handles validation and normalization, simplify the handler:

```typescript
const handleConfirmBirthday = useCallback(() => {
  if (!editingState || editingState.field !== "birthday") return;

  setContactsData((prev) =>
    prev.map((c) =>
      c.id === editingState.id
        ? { ...c, birthday: birthdayInput || undefined }
        : c,
    ),
  );

  setShowDatePicker(false);
  setEditingState(null);
}, [editingState, birthdayInput]);
```

**Step 5: Run all tests**

Run: `npx jest --ci`
Expected: All tests pass

**Step 6: Commit**

```bash
git add app/contacts/review-schedule.tsx
git commit -m "feat: use shared BirthdayInput in review-schedule screen"
```

---

## Task 6: Final Verification

**Step 1: Run full test suite**

Run: `npx jest --ci`
Expected: All tests pass

**Step 2: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Manual testing checklist**

Test each screen on iOS simulator:
- [ ] Add contact wizard: tap Add Birthday, enter "03/15", Save, verify displays "March 15"
- [ ] Add contact wizard: enter invalid "13/15", verify error shows
- [ ] Edit contact modal: add birthday, save, reopen, verify persisted
- [ ] Edit contact modal: remove birthday, verify cleared
- [ ] Review schedule: tap Add Birthday on contact, enter date, verify saves

**Step 4: Create final commit**

```bash
git add -A
git commit -m "chore: birthday text input consolidation complete"
```
