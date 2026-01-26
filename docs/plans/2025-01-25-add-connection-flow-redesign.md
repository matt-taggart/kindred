# Add Connection Flow Redesign

**Date:** 2025-01-25
**Status:** Approved
**Scope:** Add Connection flow visual redesign with new components and layout

## Overview

This design transforms the Add Connection flow from a basic stepped form to a modern, visually cohesive experience with relationship type selection, segmented progress bar, and consistent layout wrapper. It preserves all existing functionality while introducing the new design system.

## 1. Scope

### What Changes
- Update all screens to new color palette (primary, secondary, accent, background-light)
- Replace ProgressDots with new pill-style progress bar (3 segments)
- Add relationship type selection to Step 1 (Friend, Family, Chosen family, Mentor, Other)
- Modernize input styling with rounded corners and new placeholder text
- Fixed bottom bar with Skip/Next buttons on gradient background
- Update typography to use new design system fonts

### What Stays
- 3-step flow structure: Name/Relationship → Rhythm → Birthday
- Core functionality (name entry, rhythm selection, birthday picker)
- Navigation logic and state management
- Contact creation service integration
- Back button navigation

## 2. New Components

### 2.1 AddFlowProgressBar

**File:** `components/AddFlowProgressBar.tsx`

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `currentStep` | `number` | - | Current step (1, 2, or 3) |
| `totalSteps` | `number` | `3` | Total number of steps |

**Behavior:**
- Displays horizontal bar divided into segments
- Filled segments for completed + current step
- Unfilled segments for remaining steps
- Smooth transition between states

**Styling:**
- Container: `flex-row gap-2 px-6 py-4`
- Each segment: `flex-1 h-1.5 rounded-full`
- Active/completed: `bg-primary` (sage green #9DBEBB)
- Inactive: `bg-slate-200 dark:bg-slate-700`

### 2.2 RelationshipTypePicker

**File:** `components/RelationshipTypePicker.tsx`

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `selected` | `string \| null` | `null` | Currently selected type |
| `onSelect` | `(type: string) => void` | - | Selection handler |

**Relationship Types:**
- Friend
- Family
- Chosen family
- Mentor
- Other

**Behavior:**
- Horizontal wrap layout of pill buttons
- Single selection (tapping another deselects previous)
- Tapping selected pill deselects it (allows no selection)
- Optional field - user can proceed without selecting

**Styling:**
- Container: `flex-row flex-wrap gap-2`
- Pill base: `px-4 py-2.5 rounded-full border`
- Unselected: `bg-white border-slate-200` with `text-slate-600`
- Selected: `bg-primary border-primary` with `text-white`
- Press feedback: `activeOpacity={0.7}`

### 2.3 AddFlowLayout

**File:** `components/AddFlowLayout.tsx`

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `currentStep` | `number` | - | Current step number |
| `title` | `string` | - | Screen title |
| `subtitle` | `string` | `undefined` | Optional subtitle text |
| `onBack` | `() => void` | - | Back button handler |
| `onSkip` | `() => void` | `undefined` | Skip button handler (hides if undefined) |
| `onNext` | `() => void` | - | Next/Save button handler |
| `nextLabel` | `string` | `'Next'` | Label for primary button |
| `nextDisabled` | `boolean` | `false` | Disable primary button |
| `children` | `ReactNode` | - | Screen content |

**Layout Structure:**
```
SafeAreaView (bg-background-light)
├── AddFlowProgressBar
├── Back button (top-left, circular)
├── ScrollView
│   ├── Title (Heading size={2})
│   ├── Subtitle (Body muted, if provided)
│   └── {children}
└── Bottom bar (fixed)
    ├── Skip button (if onSkip provided)
    └── Next button (primary, rounded-full)
```

**Bottom Bar Styling:**
- Container: `absolute bottom-0 left-0 right-0 px-6 pb-8 pt-4`
- Background: `bg-gradient-to-t from-background-light via-background-light to-transparent`
- Buttons row: `flex-row justify-between items-center`
- Skip: `text-slate-500 font-medium`
- Next: `bg-primary px-8 py-3.5 rounded-full` with `text-white font-semibold`

## 3. Screen Updates

### 3.1 Step 1: Name & Relationship

**File:** `app/contacts/add/index.tsx` (refactored)

**Screen Content:**
```
AddFlowLayout (step=1, title="Add a connection")
├── Subtitle: "Every relationship has its own rhythm..."
├── Name Input
│   ├── Label: "NAME" (Caption, uppercase, tracking-wider)
│   └── TextInput (large, rounded, placeholder: "Type a name...")
├── Spacer (mb-8)
└── RelationshipTypePicker
    └── Label: "RELATIONSHIP" (Caption, uppercase, tracking-wider)
```

**State Management:**
- `name: string` - Contact name (required for Next)
- `relationship: string | null` - Selected relationship type (optional)

**Navigation Logic:**
- **Back**: `router.back()` (exit flow)
- **Skip**: Navigate to Step 2 with just name (if name entered) or show validation
- **Next**: Navigate to Step 2 with name and relationship
- Next disabled until name has at least 1 character

**Input Styling:**
- Container: `bg-white rounded-2xl border border-slate-100 px-4 py-4`
- TextInput: `text-xl text-slate-800` with `placeholder-slate-400`
- Focus state: `border-primary`

### 3.2 Step 2: Rhythm Selection

**File:** `app/contacts/add/rhythm.tsx` (refactored)

**Screen Content:**
```
AddFlowLayout (step=2, title="Choose your rhythm")
├── Subtitle: "How often do you want to connect?"
└── Rhythm Options (vertical list)
    ├── RhythmCard: "Every day" - daily
    ├── RhythmCard: "Every week" - weekly
    ├── RhythmCard: "Once a month" - monthly
    ├── RhythmCard: "Once a year" - yearly
    └── RhythmCard: "Custom" - custom (expandable)
```

**RhythmCard Styling:**
- Container: `bg-white rounded-2xl border border-slate-100 p-4 mb-3`
- Selected: `border-primary bg-primary/5`
- Title: `text-lg font-semibold text-slate-800`
- Description: `text-sm text-slate-500 mt-1`
- Checkmark icon on right when selected

**Custom Frequency (when "Custom" selected):**
- Expands inline below the Custom card
- Number input + unit picker (days/weeks/months)
- Styling matches new design system
- Container: `bg-slate-50 rounded-xl p-4 mt-2`

### 3.3 Step 3: Birthday

**File:** `app/contacts/add/birthday.tsx` (refactored)

**Screen Content:**
```
AddFlowLayout (step=3, title="Add their birthday")
├── Subtitle: "We'll remind you when it's coming up"
├── Birthday Input Card
│   ├── Calendar icon (left)
│   ├── Date display or "Select a date..."
│   └── Chevron icon (right)
└── Skip hint text: "You can always add this later"
```

**Birthday Card Styling:**
- Container: `bg-white rounded-2xl border border-slate-100 p-4`
- Pressable to open date picker
- With date: `text-lg text-slate-800`
- Without date: `text-lg text-slate-400` (placeholder style)
- Icon: `calendar-outline` in `text-primary`

**Button Labels:**
- Skip: "Skip" (navigates to completion)
- Next: "Save" (creates contact and navigates to completion)

## 4. File Structure

```
components/
├── AddFlowProgressBar.tsx
├── AddFlowProgressBar.test.tsx
├── RelationshipTypePicker.tsx
├── RelationshipTypePicker.test.tsx
├── AddFlowLayout.tsx
├── AddFlowLayout.test.tsx
└── index.ts (updated exports)

app/contacts/add/
├── index.tsx (Step 1 - Name & Relationship)
├── rhythm.tsx (Step 2 - Rhythm Selection)
└── birthday.tsx (Step 3 - Birthday)
```

## 5. Migration Notes

### Data Flow
- Name and relationship passed via router params between steps
- Rhythm selection passed via router params to birthday step
- Contact created on final "Save" with all accumulated data

### Breaking Changes
- None - all existing functionality preserved

### Preserved Functionality
- Rhythm options (daily, weekly, monthly, yearly, custom)
- Custom frequency with days/weeks/months units
- Birthday date picker with max date validation
- Contact creation service integration
- Navigation between steps with back support
