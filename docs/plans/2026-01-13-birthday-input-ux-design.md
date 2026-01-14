# Birthday Input UX Redesign

## Problem

The onboarding wizard's birthday screen (step 3 of 3) has confusing "Skip" and "Done" buttons:
- When no birthday is added, both buttons do the same thing (save without birthday)
- When a birthday is added, "Done" saves it but "Skip" discards it
- Users can't tell what each button does at a glance

## Goals

- Make the birthday step quick and optional (users can breeze through)
- Provide explicit save action when adding a birthday
- Eliminate button confusion with a single "Done" button

## Design

### Component States

The birthday card has three distinct states:

**State 1: Collapsed (Initial)**
- Shows "Add Birthday" button with gift icon
- Default state when user arrives
- Tapping expands to editing state

**State 2: Editing**
- Date picker visible
- "Cancel" link in top-right dismisses back to collapsed
- "Save Birthday" button below picker confirms selection

**State 3: Saved**
- Shows saved date with checkmark (e.g., "March 15, 1990")
- "Edit" link allows returning to editing state

### UI Layout

**Collapsed:**
```
┌─────────────────────────────────────────┐
│     🎁  Add Birthday                    │
└─────────────────────────────────────────┘
```

**Editing:**
```
┌─────────────────────────────────────────┐
│  Birthday                    Cancel     │
│  ┌───────────────────────────────────┐  │
│  │      [ Date Picker Spinner ]      │  │
│  └───────────────────────────────────┘  │
│         [ Save Birthday ]               │
└─────────────────────────────────────────┘
```

**Saved:**
```
┌─────────────────────────────────────────┐
│   ✓  March 15, 1990              Edit   │
└─────────────────────────────────────────┘
```

**Bottom:** Single "Done" button (replaces Skip/Done pair)

### State Transitions

- Collapsed → Editing: Tap "Add Birthday"
- Editing → Collapsed: Tap "Cancel" (discards date)
- Editing → Saved: Tap "Save Birthday"
- Saved → Editing: Tap "Edit" (pre-fills saved date)

### Done Button Behavior

| Current State | Behavior |
|---------------|----------|
| Collapsed | Save contact without birthday |
| Editing | Discard unsaved date, save without birthday |
| Saved | Save contact with confirmed birthday |

Tapping Done while editing discards the unsaved date without confirmation (keeps flow fast).

## Implementation

### State Management

```typescript
type BirthdayState = 'collapsed' | 'editing' | 'saved';

const [birthdayState, setBirthdayState] = useState<BirthdayState>('collapsed');
const [editingDate, setEditingDate] = useState<Date>(new Date());
const [savedDate, setSavedDate] = useState<Date | null>(null);
```

### Files to Modify

- `app/contacts/add/birthday.tsx` — all changes contained here

### No Changes Required

- `contactService.ts` (already accepts `birthday: string | null`)
- Database schema
- Other screens
