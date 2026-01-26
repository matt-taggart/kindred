# Upcoming Moments Screen Redesign

**Date:** 2026-01-25
**Status:** Approved
**Scope:** Refactor calendar.tsx to new timeline-based "Upcoming Moments" design

## Overview

Replace the traditional calendar picker view with a timeline-based "Upcoming Moments" view that groups contacts by time periods (This Week, Next Week, Later This Season).

## Core Concept

The current Calendar view uses `react-native-calendars` where users select a date to see contacts due that day. The new design is a **timeline view** grouped by time periods with poetic rhythm descriptions and visual urgency states.

**Key changes:**
- Remove calendar picker from this screen
- Group contacts by time buckets instead of specific dates
- Use poetic rhythm descriptions ("Returning daily", "Weekly rest & return")
- Add visual states: urgent (secondary badge), normal (gray), resting (dashed/muted)

## Component Architecture

### New Components

#### 1. MomentCard.tsx

Individual contact row with emoji avatar, name, rhythm, and time badge.

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  ┌──────┐                                       │
│  │ 🌸   │  Emma              TOMORROW           │
│  │      │  Returning daily        (badge)       │
│  └──────┘                                       │
└─────────────────────────────────────────────────┘
```

**Visual States:**

| State | Background | Border | Avatar BG | Time Badge |
|-------|-----------|--------|-----------|------------|
| Urgent (tomorrow/today) | `bg-white` | solid `border-slate-100` | `secondary/20` | Rose pill badge |
| Normal (this/next week) | `bg-white` | solid `border-slate-100` | `primary/20` or `accent/40` | Gray text |
| Resting (seasonal) | `bg-slate-50/50` | dashed `border-slate-200` | `bg-slate-100` grayscale | "Resting" + progress bar |

**Props:**
```typescript
type MomentCardProps = {
  contact: Contact;
  emoji: string;
  rhythmLabel: string;
  timeLabel: string;        // "Tomorrow", "Friday", "May 12"
  isUrgent?: boolean;       // Shows rose badge
  isResting?: boolean;      // Dashed border, muted style
  onPress: () => void;
};
```

**Rhythm Labels (mapped from bucket):**
- `daily` → "Returning daily"
- `weekly` → "Weekly rest & return"
- `bi-weekly` → "Fortnightly nurture"
- `monthly` → "Monthly check-in"
- `every-six-months` → "Seasonally gathering"
- `yearly` → "Yearly celebration"

#### 2. MomentSectionDivider.tsx

Section header with centered text and horizontal lines.

```
────────────  THIS WEEK  ────────────
```

**Props:**
```typescript
type MomentSectionDividerProps = {
  title: string;
  highlighted?: boolean;  // Uses primary color instead of gray
};
```

- "This Week" uses `text-primary` with `bg-primary/20` lines
- Other sections use `text-slate-400` with `bg-slate-200` lines

### Screen Layout

```
┌─────────────────────────────────────┐
│  KINDRED logo        [avatar]       │  ← Header
├─────────────────────────────────────┤
│  Upcoming Moments                   │  ← Title (Heading size 1)
│  A gentle pace for meaningful...    │  ← Subtitle (italic, muted)
├─────────────────────────────────────┤
│  ─────── THIS WEEK ───────          │
│  [MomentCard - Emma]                │
│  [MomentCard - Dad]                 │
│                                     │
│  ─────── NEXT WEEK ───────          │
│  [MomentCard - Marcus]              │
│                                     │
│  ─────── LATER THIS SEASON ──────   │
│  [MomentCard - Brunch Group]        │
│  [MomentCard - Maya]                │
└─────────────────────────────────────┘
```

### Empty States

- If a section has no contacts, it's not rendered
- If ALL sections empty: "You're all caught up! No moments on the horizon."

## Service Layer Changes

### New Function in calendarService.ts

```typescript
type UpcomingMoments = {
  thisWeek: MomentContact[];
  nextWeek: MomentContact[];
  laterThisSeason: MomentContact[];
};

type MomentContact = {
  contact: Contact;
  timeLabel: string;      // "Tomorrow", "Friday", "May 12"
  isUrgent: boolean;      // Due today or tomorrow
  isResting: boolean;     // Seasonal/yearly buckets
  emoji: string;          // 🌸, 🌿, ☀️, ☕️, 🌊
  rhythmLabel: string;    // "Returning daily"
};

function getUpcomingMoments(): UpcomingMoments
```

### Grouping Logic

- **This Week**: Due within 7 days from today
- **Next Week**: Due 8-14 days from today
- **Later This Season**: Due 15-90 days, OR contacts with `every-six-months`/`yearly` buckets

### Emoji Assignment (based on relationship)

- Partner/spouse → 🌸
- Family → 🌿
- Friend → ☀️
- Group → ☕️
- Default → 🌊

## Files to Change

### New Files
- `components/MomentCard.tsx`
- `components/MomentCard.test.tsx`
- `components/MomentSectionDivider.tsx`
- `components/MomentSectionDivider.test.tsx`

### Modified Files
- `app/(tabs)/calendar.tsx` — Complete rewrite to timeline view
- `services/calendarService.ts` — Add `getUpcomingMoments()` function
- `components/index.ts` — Export new components

### No Changes Needed
- `tailwind.config.js` — Colors already correct
- `constants/Colors.ts` — Already has primary/secondary/accent
- Tab navigation — Still called "Moments" in bottom nav

## Design System Alignment

Uses existing design tokens:
- **Colors:** primary (#9DBEBB), secondary (#F4ACB7), accent (#FFE5D9), brand-navy (#2D3648)
- **Typography:** Quicksand (display), Outfit (body)
- **Spacing:** rounded-3xl cards, p-4 padding
- **Shadows:** soft-shadow class

## Implementation Order

1. Add `getUpcomingMoments()` to calendarService.ts
2. Create MomentSectionDivider component + tests
3. Create MomentCard component + tests
4. Rewrite calendar.tsx screen
5. Update component exports
6. Manual testing and polish
