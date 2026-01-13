# Kindred "Sunlit Room" Redesign

**Date**: January 13, 2026
**Goal**: Brand differentiation through warmth — make Kindred feel distinctly cozy and nurturing vs. generic CRM/PRM tools.
**Approach**: Fresh canvas redesign of layouts, hierarchy, and visual rhythm.

---

## Design Principles

### Three Guiding Principles

1. **Breathe** — Generous whitespace everywhere. Elements float rather than stack. Nothing feels cramped or urgent.

2. **Soften** — All corners rounded (16-24px radius). Shadows are warm and diffuse, not sharp. Buttons invite rather than demand.

3. **Warm** — The palette leans into natural, lived-in tones. No cold grays or harsh contrasts.

### Visual Feeling

A blend of "cozy home" (warm textures, soft edges, living room feel) and "intimate journal" (personal, reflective, clean typography, generous whitespace). The result should feel like a well-loved notebook in a sunlit room.

---

## Color Palette

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Canvas | Cream | `#F3F0E6` | All backgrounds |
| Surface | Warm White | `#FDFBF7` | Cards, modals |
| Primary | Sage | `#9CA986` | Primary actions, avatars, positive states |
| Accent | Soft Terracotta | `#D4896A` | Birthdays, gentle highlights |
| Text | Warm Slate | `#5C6356` | Body text |
| Text Secondary | Muted Sage | `#8B9678` | Secondary info, timestamps |
| Border | — | `#E8E4DA` | Subtle card edges, dividers |

**Note**: The "magic" indigo is removed — it feels too tech/productivity. The palette is now entirely warm and natural.

---

## Typography & Spacing

### Type Scale

| Role | Size | Weight | Usage |
|------|------|--------|-------|
| Page title | 28px | Semibold | "Today", screen headers |
| Date/Subhead | 18px | Regular | Date display, section labels |
| Card name | 20px | Semibold | Contact names on cards |
| Body | 16px | Regular | Descriptions, helper text |
| Caption | 14px | Regular | Timestamps, tertiary info |

### Font Choice

System fonts (San Francisco on iOS, Roboto on Android). Optional: a single accent font for date display with subtle warmth.

### Spacing Rhythm

- **Page padding**: 20px
- **Card padding**: 24px internal
- **Card gap**: 16px between cards
- **Section gap**: 32px between major sections
- **Touch targets**: Minimum 48px height

### Card Shadows

Warm, diffuse shadows: `0 2px 8px rgba(92, 99, 86, 0.08)`. No hard borders unless needed for structure.

---

## Home Screen — "Today's Rhythm"

The home screen becomes a calm daily companion, not a task list.

### Header

```
Today                        ← 28px semibold, warm slate
Sunday, January 12           ← 18px regular, muted sage
```

No heavy "dashboard" feeling. Just a quiet acknowledgment of the day.

### Connection Cards

```
┌─────────────────────────────────────┐
│  [Avatar]   Maya                    │
│             Connected last month    │  ← muted sage, gentle
│                                     │
│  ┌─────────────┐  ┌──────────────┐  │
│  │ Reached out │  │    Later     │  │  ← pill-shaped buttons
│  └─────────────┘  └──────────────┘  │
└─────────────────────────────────────┘
```

### Key Changes from Current

| Current | New |
|---------|-----|
| "Mark Done" | "Reached out" |
| "Snooze" | "Later" |
| "Last contacted: 5 days ago" | "Connected last month" |
| Birthday as task | "It's Maya's birthday" |

### Empty State

> "Your connections are resting. Enjoy your day."

---

## Flexible Ritual — "Reached Out" Flow

The core interaction supports both quick acknowledgment and deeper reflection.

### Bottom Sheet (rises on tap)

```
┌─────────────────────────────────────┐
│                                     │
│   Connected with Maya         ✓     │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ Add a note (optional)       │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │          Done               │   │
│   └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### Expanded Path (user taps note field)

```
│   How was it?                       │
│   ┌─────────────────────────────┐   │
│   │                             │   │
│   │                             │   │
│   └─────────────────────────────┘   │
│                                     │
│   Placeholder: "Caught up about     │
│   her move—felt good to connect."   │
```

### UX Details

- Sheet dismisses on swipe-down
- No "cancel" button needed — swipe or tap outside
- Card gently fades from list with subtle animation
- Birthday prompt: "How did you celebrate them?"

---

## Contact Detail Screen — "Connection View"

### Header Card

```
┌─────────────────────────────────────┐
│                                     │
│         [Large Avatar - 80px]       │
│              Maya Chen              │
│               Friend                │
│                                     │
│   Connected last month              │
│   Next reminder in 2 weeks          │
│                                     │
└─────────────────────────────────────┘
```

### Quick Actions Row

```
    ┌──────┐    ┌──────┐    ┌──────┐
    │ Call │    │ Text │    │ Note │
    └──────┘    └──────┘    └──────┘
```

Compact icon-and-label pills. Sage outline style.

### Reach Out Section (when due)

```
┌─────────────────────────────────────┐
│  Ready to connect?                  │
│                                     │
│  ┌─────────────┐  ┌──────────────┐  │
│  │ Reached out │  │    Later     │  │
│  └─────────────┘  └──────────────┘  │
└─────────────────────────────────────┘
```

### Shared Moments (replaces "History")

```
   Shared moments

   ┌─────────────────────────────────┐
   │ Jan 5 · Caught up about her     │
   │ move—felt good to connect.      │
   └─────────────────────────────────┘

   ┌─────────────────────────────────┐
   │ Dec 12 · Quick birthday call    │
   └─────────────────────────────────┘
```

Edit/delete via long-press or swipe.

---

## Add Connection Flow

A warm, stepped experience. Each step is its own focused screen.

### Step 1 — Name

```
   Add a connection

   Who would you like to
   stay connected with?

   ┌─────────────────────────────────┐
   │ Name                            │
   └─────────────────────────────────┘

   ┌─────────────────────────────────┐
   │           Continue              │
   └─────────────────────────────────┘

   Or import from contacts ↗
```

### Step 2 — Rhythm

```
   Maya

   How often would you like
   a gentle reminder?

   ○ Every week
   ○ Every few weeks
   ○ Once a month
   ○ Seasonally
   ○ Only when I choose

   You can always change this.
```

### Step 3 — Birthday (optional)

```
   One more thing...

   Would you like to remember
   Maya's birthday?

   ┌─────────────────────────────────┐
   │ Birthday (optional)             │
   └─────────────────────────────────┘

   ┌────────────────┐  ┌─────────────┐
   │     Skip       │  │    Done     │
   └────────────────┘  └─────────────┘
```

### UX Details

- Progress indicator: subtle dots at top
- Back navigation always available
- Relationship type removed to simplify flow

---

## Calendar Screen

```
   January 2026

   ┌───┬───┬───┬───┬───┬───┬───┐
   │ S │ M │ T │ W │ T │ F │ S │
   ├───┼───┼───┼───┼───┼───┼───┤
   │   │   │   │ 1 │ 2 │ 3 │ 4 │
   │ 5 │ 6 │ 7 │ 8 │ 9 │10 │11 │
   │12 │13 │14 │15 │16 │17 │18 │
   └───┴───┴───┴───┴───┴───┴───┘

   January 12

   ┌─────────────────────────────────┐
   │ 🎂 Maya's birthday              │
   └─────────────────────────────────┘
   ┌─────────────────────────────────┐
   │ Reminder: Sam                   │
   └─────────────────────────────────┘
```

Subtle dots indicate days with reminders or birthdays. Tapping a day shows that day's connections.

---

## Settings Screen

### Renamed Sections

| Current | New |
|---------|-----|
| Notifications | Reminders |
| Contact Preferences | Your rhythm |
| — | Quiet mode |

### Layout

```
   Settings

   Reminders
   Choose when Kindred gently nudges you →

   Your rhythm
   Default reminder frequency for new connections →

   Quiet mode
   Pause reminders without losing your connections →

   About Kindred
```

Simple rows, chevrons for navigation, generous 56px row height.

---

## Microcopy System

### Core Replacements

| Old | New |
|-----|-----|
| Contact | Connection |
| Mark Done | Reached out |
| Snooze | Later |
| Last contacted: X days ago | Connected recently / last month |
| History | Shared moments |
| Reminder | Gentle reminder |
| Notifications | Reminders |
| Add Contact | Add a connection |

### Time Language

| Exact | Gentle |
|-------|--------|
| Today | Today |
| 1-2 days ago | Connected recently |
| 3-14 days ago | Connected this week / last week |
| 15-45 days ago | Connected last month |
| 46+ days ago | It's been a while |

### Rhythm Labels (replaces bucket names)

| Old | New |
|-----|-----|
| Daily | Every day |
| Weekly | Every week |
| Bi-weekly | Every few weeks |
| Monthly | Once a month |
| Every six months | Seasonally |
| Yearly | Once a year |
| Custom | Only when I choose |

### Empty States

- **Home (no due)**: "Your connections are resting. Enjoy your day."
- **Shared moments (no history)**: "Your story together starts here."
- **Calendar (empty day)**: No message needed

### Notification Copy

> "It might be a good time to connect with Maya."

### Error States

> "Something went wrong. Let's try that again."

---

## Implementation Notes

### Files to Update

**Styling:**
- `tailwind.config.js` — Update color palette

**Screens:**
- `app/(tabs)/index.tsx` — Home screen redesign
- `app/(tabs)/calendar.tsx` — Calendar styling updates
- `app/(tabs)/settings.tsx` — Settings restructure
- `app/contacts/[id].tsx` — Connection detail redesign
- `app/contacts/import.tsx` — Add connection flow

**Components:**
- Contact cards (new flexible ritual bottom sheet)
- Interaction history → Shared moments
- Edit contact modal

**Services:**
- `contactService.ts` — Update time formatting helpers

### Tailwind Config Changes

```js
colors: {
  sage: {
    DEFAULT: '#9CA986',
    100: '#E6E9E1',
  },
  terracotta: {
    DEFAULT: '#D4896A',
    100: '#F6E6DE',
  },
  cream: '#F3F0E6',
  surface: '#FDFBF7',
  slate: {
    DEFAULT: '#5C6356',
    muted: '#8B9678',
  },
  border: '#E8E4DA',
}
```

Remove `magic` color entirely.

---

## Success Criteria

- Users describe the app as "calm" or "warm" in feedback
- Core flows (add connection, mark reached out) feel effortless
- Visual identity is distinct from productivity/CRM tools
- No increase in time-to-complete core actions
