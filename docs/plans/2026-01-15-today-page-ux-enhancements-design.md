# Today Page UX Enhancements

## Problem

The Today page is the first thing users see, but it has several UX gaps:

1. **No quick actions** — Users must navigate to detail page to call or text
2. **Vague timing** — "Connected recently" doesn't tell users exactly when
3. **No onboarding** — New users with zero contacts see nothing helpful
4. **Hidden features** — Many users don't realize they can call/text from Kindred

## Solution

### 1. Contact Card Redesign

**New card structure for contacts with phone numbers:**

```
┌────────────────────────────────────────┐
│  👤 Sarah                    🎂        │
│  🕐 Connected 3 days ago               │  ← colored clock icon
│                                        │
│     📞 Call          💬 Text           │  ← new row
│                                        │
│  [ Reached out ]      [ Later ]        │
└────────────────────────────────────────┘
```

**For contacts without phone numbers:**

```
┌────────────────────────────────────────┐
│  👤 Mike                               │
│  🕐 It's been 2 months                 │
│                                        │
│  [ Reached out ]      [ Later ]        │  ← no Call/Text row
└────────────────────────────────────────┘
```

**Call/Text behavior:**
- Tapping Call opens phone app via `tel:` URL
- Tapping Text opens SMS app via `sms:` URL
- Does NOT auto-log interaction — user taps "Reached out" separately
- This preserves intentionality: logging is a moment of reflection

**Visual nudge:**
When user returns to the app after tapping Call or Text, the "Reached out" button pulses briefly (subtle scale animation) to remind them to log the interaction.

### 2. Last Connected: Specific Dates + Colored Clock

**New date formatting:**

| Time Gap | Display Text |
|----------|--------------|
| Today | "Connected today" |
| Yesterday | "Connected yesterday" |
| 2 days | "Connected 2 days ago" |
| 3 days | "Connected 3 days ago" |
| 4 days | "Connected 4 days ago" |
| 5 days | "Connected 5 days ago" |
| 6 days | "Connected 6 days ago" |
| 7-13 days | "Connected last week" |
| 14-29 days | "Connected 2 weeks ago" / "Connected 3 weeks ago" |
| 1-2 months | "Connected last month" |
| 2-6 months | "Connected 3 months ago" (exact) |
| 6+ months | "It's been a while" |
| Never | "Not reached out yet" |

**Clock icon color thresholds:**

| Time Gap | Icon Color | Rationale |
|----------|------------|-----------|
| 0-14 days | Sage | Recent, healthy connection |
| 15-60 days | Muted gray | Neutral, normal gap |
| 60+ days or never | Amber | Gentle attention signal |

Amber is warm, not alarming — aligns with design proposal principle: "Time gaps are neutral, not failures."

### 3. Empty State: No Contacts

**When a user has zero contacts in the app:**

```
┌─────────────────────────────────────────────┐
│                                             │
│            [Illustration]                   │
│         (Ionicons composition or            │
│          simple friendly graphic)           │
│                                             │
│    The people you care about                │
│         will gather here.                   │
│                                             │
│    ┌─────────────────────────────────┐      │
│    │   Import from contacts          │      │  ← Primary (sage, filled)
│    └─────────────────────────────────┘      │
│                                             │
│         Add manually                        │  ← Secondary (text link)
│                                             │
└─────────────────────────────────────────────┘
```

**Copy:**
- Headline: "The people you care about will gather here." (from design proposal)
- Primary button: "Import from contacts"
- Secondary link: "Add manually"

**Behavior:**
- "Import from contacts" → navigates to `/contacts/import`
- "Add manually" → navigates to `/contacts/new`

### 4. Empty State Distinction

| Scenario | What to Show |
|----------|--------------|
| No contacts in app | New illustrated empty state with Import/Add |
| Has contacts, but none due today | Existing "All caught up!" celebration |

### 5. Birthday Card Treatment

Birthday cards keep terracotta styling with same enhancements:

```
┌────────────────────────────────────────┐  ← terracotta background
│  👤 Sarah                    🎂        │
│  It's Sarah's birthday!                │  ← replaces "last connected"
│                                        │
│     📞 Call          💬 Text           │  ← if has phone number
│                                        │
│  [ Reached out ]      [ Later ]        │  ← white/terracotta styling
└────────────────────────────────────────┘
```

**Differences from standard cards:**
- No clock icon (birthday message takes priority)
- "It's [Name]'s birthday!" replaces last connected text
- Call/Text buttons styled for terracotta background (white text/icons)
- "Reached out" button inverted (white background, terracotta text)

## Implementation

### Files to Modify

| File | Changes |
|------|---------|
| `app/(tabs)/index.tsx` | Add Call/Text buttons to ContactCard, add visual nudge logic, add no-contacts empty state check |
| `utils/timeFormatting.ts` | Update `formatLastConnected()` with new specific date logic |
| `components/EmptyContactsState.tsx` | **New file** — illustrated empty state with Import/Add buttons |

### Key Implementation Details

1. **Call/Text buttons** — Reuse `handleCall`/`handleText` pattern from `app/contacts/[id].tsx`

2. **Visual nudge** — Track `lastActionContactId` in state; when app returns to foreground and matches, trigger brief scale animation on "Reached out" button

3. **Clock icon color** — Simple utility function:
   ```typescript
   getClockColor(lastContactedAt: number | null): 'sage' | 'warmgray-muted' | 'amber'
   ```

4. **No-contacts check** — Query total contact count, show `EmptyContactsState` if zero

### No Changes Needed

- `CelebrationStatus.tsx` — already handles completion count
- `services/contactService.ts` — existing logic sufficient

## Design Principles Alignment

- **Reduce friction** — Call/Text directly from Today page
- **Guide new users** — Empty state explains what to do
- **Surface features** — Quick actions are discoverable
- **Gentle, not urgent** — Amber (warm) not red, time gaps are neutral
- **Intentional logging** — "Reached out" remains a conscious reflection moment
