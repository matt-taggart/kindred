# Birthday Text Input Consolidation

## Problem

The app stores birthdays as `MM-DD` (month and day only), but two of three birthday input screens still use the native `DateTimePicker`, which requires a full year. This creates:

- Inconsistent UX across screens
- Unnecessary year data that gets stripped or ignored
- The native picker may not render correctly when trying to parse `MM-DD` back to a `Date` object

**Affected screens:**

| Screen | Current Implementation | Status |
|--------|----------------------|--------|
| `app/contacts/add/birthday.tsx` | DateTimePicker | Needs update |
| `components/EditContactModal.tsx` | DateTimePicker | Needs update |
| `app/contacts/review-schedule.tsx` | TextInput | Working ✓ |

## Goals

- Consistent MM/DD text input across all birthday entry points
- Single reusable component to avoid code duplication
- Clear validation with helpful error messages
- Maintain the app's warm, simple aesthetic

## Design

### Component: `components/BirthdayInput.tsx`

A controlled text input that handles MM/DD entry with inline validation.

**Props:**

```typescript
interface BirthdayInputProps {
  value: string;                        // Current value (MM-DD format or empty)
  onChange: (value: string) => void;    // Called with validated MM-DD or empty
  onCancel?: () => void;                // Optional cancel action
  autoFocus?: boolean;                  // Focus on mount (default: false)
}
```

**Behavior:**

- Displays placeholder "MM/DD" when empty
- Accepts input with `/` or `-` as separator (normalizes to `-` internally)
- Shows inline validation error for invalid dates (e.g., "02/31")
- Calls `onChange` only with valid `MM-DD` string or empty string
- Visual styling matches existing form inputs (cream background, border, warmgray text)

**Visual layout:**

```
┌─────────────────────────────────────────┐
│  🎂  Birthday                   Cancel  │
│  ┌───────────────────────────────────┐  │
│  │         03/15                     │  │
│  └───────────────────────────────────┘  │
│  Format: MM/DD                          │
└─────────────────────────────────────────┘
```

### Screen Integration

**1. `app/contacts/add/birthday.tsx` (onboarding wizard)**

Replace the DateTimePicker with BirthdayInput. Keep the existing three-state flow (collapsed → editing → saved):

- **Collapsed:** "Add Birthday" button (no change)
- **Editing:** Show `<BirthdayInput>` instead of DateTimePicker
- **Saved:** Display formatted date with Edit link (no change)

Update `formatDate()` to output `MM-DD` instead of `YYYY-MM-DD`.

**2. `components/EditContactModal.tsx`**

Replace the DateTimePicker block (lines 226-234) with `<BirthdayInput>`. Remove the `parseDate()` helper since we no longer need to convert `MM-DD` to a `Date` object.

**3. `app/contacts/review-schedule.tsx`**

Extract the existing inline TextInput (lines 513-525) into the shared `<BirthdayInput>` component. This screen already works — we're just consolidating the code.

### Validation

**Input normalization:**

- Accept `/` or `-` as separator → normalize to `-`
- Strip non-numeric characters except separator
- Auto-insert separator after two digits (optional UX enhancement)

**Validation rules:**

```typescript
function validateBirthday(input: string): { valid: boolean; error?: string } {
  if (input.trim() === '') {
    return { valid: true };  // Empty is valid (birthday is optional)
  }

  const cleaned = input.replace(/\//g, '-');
  const parts = cleaned.split('-');

  if (parts.length !== 2) {
    return { valid: false, error: 'Use format MM/DD' };
  }

  const month = parseInt(parts[0], 10);
  const day = parseInt(parts[1], 10);

  if (isNaN(month) || isNaN(day)) {
    return { valid: false, error: 'Use format MM/DD' };
  }

  if (month < 1 || month > 12) {
    return { valid: false, error: 'Month must be 1-12' };
  }

  const maxDays = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (day < 1 || day > maxDays[month - 1]) {
    return { valid: false, error: 'Invalid day for this month' };
  }

  return { valid: true };
}
```

**Error display:**

- Show error text below input in terracotta color
- Only show after user has entered something (not on empty field)
- Clear error as user types valid input

## Files to Modify

| File | Change |
|------|--------|
| `components/BirthdayInput.tsx` | New file — shared component |
| `app/contacts/add/birthday.tsx` | Swap DateTimePicker for BirthdayInput |
| `components/EditContactModal.tsx` | Swap DateTimePicker for BirthdayInput |
| `app/contacts/review-schedule.tsx` | Use shared BirthdayInput component |

## Testing

**Unit tests for validation function:**

```typescript
// Valid inputs
'03/15' → { valid: true }
'03-15' → { valid: true }
'12/31' → { valid: true }
''      → { valid: true }  // Optional field
'3/5'   → { valid: true }  // Single digits OK, normalize to 03-05

// Invalid inputs
'13/15' → { valid: false, error: 'Month must be 1-12' }
'02/30' → { valid: false, error: 'Invalid day for this month' }
'00/15' → { valid: false, error: 'Month must be 1-12' }
'03/00' → { valid: false, error: 'Invalid day for this month' }
'abc'   → { valid: false, error: 'Use format MM/DD' }
```

**Component tests:**

- Renders placeholder when empty
- Calls onChange with normalized `MM-DD` on valid input
- Displays error message for invalid input
- Cancel button calls onCancel
- autoFocus prop focuses input on mount

**Integration tests:**

- Add contact flow saves birthday correctly
- Edit contact modal updates birthday correctly
- Review-schedule preserves birthday through import
