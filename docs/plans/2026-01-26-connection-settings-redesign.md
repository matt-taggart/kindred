# Connection Settings Modal Redesign

## Overview

Refactor `EditContactModal.tsx` to match the new Kindred design language while preserving all existing functionality (rhythm selection, birthday, next reminder, archive).

## Design Reference

Based on HTML prototype with warm cream backgrounds, soft sage primary color, Playfair Display headings, and generous rounded corners.

## Component Structure

### Header & Contact Profile

**Header row:**
- Left: "Cancel" button (`text-primary font-medium text-lg`)
- Center: "Connection settings" title (`text-xl font-semibold`)
- Right: Empty spacer for balance

**Profile area (centered, below header):**
- Heart icon in soft circle (`w-12 h-12 bg-primary/10 rounded-full` with Ionicons `heart` in primary)
- Contact name in display font (`text-2xl font-display` - Playfair Display)
- Tagline: *"Every relationship has its own rhythm."* (`text-slate-500 italic`)

### Rhythm Selection Cards

**Card container:** `space-y-4`

**Individual card styling:**
- Container: `p-5 bg-card-light dark:bg-card-dark rounded-3xl shadow-sm`
- Border: `border-2 border-transparent` (unselected) / `border-primary` (selected)
- Layout: `flex-row justify-between items-center`

**Card content:**
- Left side:
  - Title: `font-semibold text-lg`
  - Description: `text-sm text-slate-500`
- Right side (radio indicator):
  - Circle: `w-6 h-6 rounded-full border-2`
  - Unselected: `border-slate-200 dark:border-slate-700`
  - Selected: `bg-primary` with inner white dot (`w-2.5 h-2.5 bg-white rounded-full`)

**Rhythm options:**
1. "Every day" - "For your closest relationships"
2. "Every week" - "For your inner circle"
3. "Once a month" - "For people you care about"
4. "Once a year" - "For long-distance friends"
5. "Custom rhythm" - Shows calculated summary

**Custom rhythm expansion:**
- Appears below custom card when selected
- Contains frequency input + unit selector (days/weeks/months)
- Styled to match card aesthetic with `bg-slate-50` background

### Birthday Section

**Container:**
- Background: `bg-accent-warm/20 dark:bg-primary/5`
- Corners: `rounded-[32px]`
- Border: `border border-accent-warm/30 dark:border-primary/20`
- Padding: `p-6`
- Margin: `mt-10`

**Header row:**
- Left: Cake emoji (`text-3xl`) + title column:
  - "Birthday" (`font-semibold text-lg`)
  - "A GENTLE REMINDER IS COMING UP" (`text-xs text-primary font-medium uppercase tracking-wider`) - only if birthday set
- Right: "Edit" button (`text-primary font-bold text-sm`)

**Content:**
- Birthday set: Date in `text-xl font-display text-center py-2`
- No birthday: "Add Birthday" pill button
- Editing: BirthdayPicker inline expansion

### Next Reminder Section

**Container (matching birthday styling):**
- Background: `bg-accent-warm/20 dark:bg-primary/5`
- Corners: `rounded-[32px]`
- Border: `border border-accent-warm/30 dark:border-primary/20`
- Padding: `p-6`
- Margin: `mt-4`

**Header row:**
- Left: Calendar icon in circle (`w-10 h-10 bg-primary/10 rounded-full`) + "Next Reminder" title
- Right: "Edit" button

**Content:**
- Date display: `text-xl font-display text-center py-2`
- Editing: DateTimePicker inline (iOS spinner / Android default)

### Action Buttons

**Save Changes:**
- Full width, `rounded-full`
- Padding: `py-4`
- Background: `bg-primary` (enabled) / `bg-slate-200` (disabled)
- Text: `text-white font-semibold text-lg`
- Shadow: `shadow-lg shadow-primary/20`
- Press effect: scale transition
- Margin: `mt-12`

**Archive Connection:**
- Layout: horizontal with icon + text
- Icon container: `w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800`
- Icon: archive outline in `text-slate-400`
- Hover/press: container `bg-red-50`, icon `text-red-400`
- Text: "Archive connection" (`text-slate-600 font-medium`)
- Subtitle: *"This connection has been resting"* (`text-[10px] text-slate-400 italic`)
- Margin: `mt-8`

## Color Tokens Required

Verify these exist in `tailwind.config.js`:
- `primary`: #8E9B7B (soft sage)
- `background-light`: #FDFBF7 (warm cream)
- `card-light`: #FFFFFF
- `card-dark`: #2D2D2A
- `accent-warm`: #E8D5C4

## Typography

- Display font: Playfair Display (`font-display`)
- Body font: Quicksand (`font-sans`)

## Implementation Notes

1. Keep modal presentation (`presentationStyle="pageSheet"`)
2. Preserve all existing state management and handlers
3. Keep custom rhythm expansion logic
4. Keep BirthdayPicker component integration
5. Keep iOS/Android DateTimePicker behavior
6. Ensure dark mode support throughout

## Files to Modify

- `components/EditContactModal.tsx` - Main refactor
- `tailwind.config.js` - Add any missing color tokens
- `constants/Colors.ts` - Add any missing color exports (if needed)
