# UI/UX Consistency Redesign

**Date:** 2026-01-29
**Status:** Proposed
**Scope:** All four main tab views — Home, Connections, Moments, Settings

## Overview

A comprehensive audit of the four main page views identified 12 consistency and quality issues across color, typography, layout, iconography, and component reuse. This plan organizes all fixes into sequenced phases, starting with foundational corrections that unblock downstream work.

### Design Decisions (Confirmed)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Primary color | `#9DBEBB` (Soft Sage) | Matches design foundation, Colors.ts, FAB, and tab bar |
| Header pattern | Connections style | Brand chip + page title + subtitle, left-aligned. Most polished current approach |
| Icon library | Ionicons | Already used in 90% of the app. iOS-native feel matches the soft aesthetic |
| FAB strategy | Global FAB only | Single FAB in `_layout.tsx`, remove page-level ExpandableFAB from Connections |

### Reference Documents

- `docs/plans/2025-01-25-design-foundation.md` — Color system, typography, component specs
- `BRAND-GUIDE.md` — Microcopy system and language principles
- `REDESIGN.md` — HTML prototypes for target visual design

---

## Phase 1: Color System Alignment (Critical)

**Problem**: `tailwind.config.js` defines `primary: '#79947D'` while `Colors.ts` defines `primary: '#9DBEBB'`. This causes visible mismatches — filter pills render dark olive while the FAB next to them is light sage.

### 1.1 Update tailwind.config.js primary color

**File:** `tailwind.config.js`

Change:
```js
primary: '#79947D',
```
To:
```js
primary: '#9DBEBB',
```

This aligns all NativeWind `bg-primary`, `text-primary`, `border-primary` classes with the documented design foundation value.

### 1.2 Audit and remove hardcoded color values

Search the codebase for hardcoded instances of `#9DBEBB`, `#79947D`, and other primary-adjacent hex values. Replace with:
- `Colors.primary` for inline styles
- `bg-primary` / `text-primary` for NativeWind classes

**Known hardcoded locations:**
- `_layout.tsx:126` — FAB `backgroundColor: '#9DBEBB'`
- `_layout.tsx:128` — FAB `shadowColor: '#9DBEBB'`
- `ConnectionsHeader.tsx:24` — Heart icon `color="#9DBEBB"`
- `calendar.tsx:92` — Ionicons `color="#9DBEBB"`
- `settings.tsx:49` — SettingsRow references `Colors.primary` (correct, keep)
- `FilterPills.tsx:41` — Uses `bg-primary` (will auto-fix after 1.1)

### 1.3 Verify FAB color consistency

After 1.1, the global FAB in `_layout.tsx` should switch from hardcoded `#9DBEBB` to `Colors.primary` for maintainability. Both resolve to the same value, but using the token prevents future drift.

---

## Phase 2: Shared Header Component (High)

**Problem**: All four pages use different header structures with different typography, branding, alignment, and right-side elements.

### 2.1 Create PageHeader component

**File:** `components/PageHeader.tsx`

Standardize on the Connections-style header applied to all pages:

```
[Heart icon] KINDRED              [optional right element]
Page Title
Subtitle text
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | required | Page title (e.g., "Connections") |
| `subtitle` | `string` | `undefined` | Subtitle text below title |
| `rightElement` | `ReactNode` | `undefined` | Optional right-side element (search button, avatar, etc.) |
| `showBranding` | `boolean` | `true` | Show the heart + KINDRED chip |

**Implementation notes:**
- Brand chip: Use `Ionicons` "heart" icon (16px) in primary color + "KINDRED" in `Caption uppercase` style
- Title: Use `Heading size={1}` component (Playfair Display via `font-display`)
- Subtitle: Use `Body size="lg"` with `text-slate-500`
- All left-aligned, consistent with current Connections layout
- No italic on subtitles (consistent across all pages)

### 2.2 Update Home screen header

**File:** `app/(tabs)/index.tsx`

Replace `HomeHeader` usage with `PageHeader`:
- `title="Kindred"` (keep app name as home page title)
- `subtitle` = dynamic greeting ("Good evening, friend")
- `rightElement` = avatar button (preserve existing avatar/notification functionality)
- `showBranding={false}` (since the title IS the brand name)

### 2.3 Update Connections screen header

**File:** `app/(tabs)/two.tsx`

Replace `ConnectionsHeader` with `PageHeader`:
- `title="Connections"`
- `subtitle="Stay close to the people who matter most."`
- `rightElement` = search button
- Move search input to a separate collapsible row below the header

### 2.4 Update Moments screen header

**File:** `app/(tabs)/calendar.tsx`

Replace inline header with `PageHeader`:
- `title="Moments"` (drop "Upcoming" — the tab says "Moments", page should match)
- `subtitle="A gentle pace for meaningful returns."`

### 2.5 Update Settings screen header

**File:** `app/(tabs)/settings.tsx`

Replace centered header with `PageHeader`:
- `title="Preferences"` (match the tab label — resolves "Settings" vs "Preferences" mismatch)
- `subtitle="Your peaceful space"`
- Remove the centered heart icon decoration
- Left-align to match all other pages

### 2.6 Deprecate old header components

Mark for removal after migration:
- `components/HomeHeader.tsx` — replaced by PageHeader
- `components/ConnectionsHeader.tsx` — replaced by PageHeader + separate search row

---

## Phase 3: Icon Library Standardization (Medium)

**Problem**: `MaterialCommunityIcons` (tab bar, global FAB) and `Ionicons` (everything else) have different visual weights and styles.

### 3.1 Switch tab bar icons to Ionicons

**File:** `app/(tabs)/_layout.tsx`

Replace `MaterialCommunityIcons` with `Ionicons` equivalents:

| Tab | Current (MaterialCommunity) | New (Ionicons) |
|-----|---------------------------|----------------|
| Home | `home` / `home-outline` | `home` / `home-outline` |
| Connections | `account-multiple` / `account-multiple-outline` | `people` / `people-outline` |
| Moments | `calendar-heart` / `calendar-heart-outline` | `calendar` / `calendar-outline` |
| Preferences | `cog` / `cog-outline` | `settings` / `settings-outline` |

### 3.2 Switch global FAB icon to Ionicons

**File:** `app/(tabs)/_layout.tsx`

Replace `MaterialCommunityIcons` "heart-plus" with `Ionicons` "heart" or a custom composite. If no direct equivalent exists, use `Ionicons` "add" icon (matching the expandable FAB pattern) or "heart-outline" with a small "+" badge.

### 3.3 Remove MaterialCommunityIcons import

After 3.1 and 3.2, remove the `MaterialCommunityIcons` import from `_layout.tsx`. Verify no other files import it. If the package is unused project-wide, it can be removed from dependencies.

---

## Phase 4: FAB Consolidation (High)

**Problem**: Two FAB systems exist — a global one in `_layout.tsx` (always visible) and an `ExpandableFAB` in `two.tsx` (Connections only). They overlap on the Connections tab and trigger different flows.

### 4.1 Remove ExpandableFAB from Connections

**File:** `app/(tabs)/two.tsx`

Remove the `<ExpandableFAB>` component and its related imports/handlers (`handleAddManually`, `handleImportContacts`).

### 4.2 Enhance global FAB behavior

**File:** `app/(tabs)/_layout.tsx`

The global FAB currently opens `AddConnectionSheet`. Enhance to:
- Keep the single FAB on all tabs
- On press: open the `AddConnectionSheet` (existing behavior) which provides both "Import" and "Add manually" options
- Use `Colors.primary` instead of hardcoded `#9DBEBB`
- Use `Ionicons` instead of `MaterialCommunityIcons`

### 4.3 Consider removing ExpandableFAB component

**File:** `components/ExpandableFAB.tsx`

If no other page uses it after 4.1, remove the file entirely.

---

## Phase 5: Typography System Enforcement (Medium)

**Problem**: Multiple components use raw `Text` with inline `fontFamily` instead of the design system components (`Heading`, `Body`, `Caption`).

### 5.1 Refactor Settings page to use typography components

**File:** `app/(tabs)/settings.tsx`

| Current | Replace With |
|---------|-------------|
| `<Text style={{ fontFamily: 'PlayfairDisplay_500Medium' }}>Settings</Text>` | `<Heading size={1}>Preferences</Heading>` |
| `<Text style={{ fontFamily: 'Outfit_300Light' }}>Your peaceful space</Text>` | `<Body size="sm" muted>Your peaceful space</Body>` |
| `SettingsSection` title `<Text>` | `<Caption uppercase>` |
| `SettingsSection` description `<Text>` | `<Body size="sm" muted>` |
| `SettingsRow` label `<Text>` | `<Body weight="medium">` |

### 5.2 Refactor FilterPills to use Body component

**File:** `components/FilterPills.tsx`

Replace raw `<Text>` with `<Body size="sm" weight="medium">` to ensure Outfit font renders.

### 5.3 Extract SettingsRow and SettingsSection as shared components

**Files:** Create `components/SettingsRow.tsx` and `components/SettingsSection.tsx`

Move these out of `settings.tsx` so they can be reused (e.g., notification settings, future preference screens). Update to use design system typography components internally.

---

## Phase 6: Empty State Consistency (High)

**Problem**: Home has a polished empty state, Connections has none, and Moments uses a completely different inline pattern.

### 6.1 Create shared EmptyState component

**File:** `components/EmptyState.tsx`

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `keyof typeof Ionicons.glyphMap` | required | Ionicons icon name |
| `title` | `string` | required | Heading text |
| `subtitle` | `string` | `undefined` | Supporting body text |
| `actions` | `Array<{ label: string; icon: string; onPress: () => void }>` | `[]` | Optional CTA buttons |

**Layout:**
```
     [Icon in sage circle, 72px]

     Title (Heading size 3, centered)
     Subtitle (Body muted, centered)

     [Action Row 1]  (optional)
     [Action Row 2]  (optional)
```

Use the same action row style as the current `EmptyContactsState` — white card with icon circle + label + chevron.

### 6.2 Refactor Home empty state

**File:** `components/EmptyContactsState.tsx`

Refactor to use the shared `EmptyState` component internally:
- `icon="heart-outline"` (replace the raster app icon image with an Ionicons icon for consistency, OR keep the image if brand identity is important)
- `title="The people you care about will gather here."`
- `subtitle="Kindred helps you gently nurture the relationships that matter"`
- `actions` = Import from contacts + Add manually

### 6.3 Add empty state to Connections

**File:** `app/(tabs)/two.tsx`

When `counts.all === 0`, show:
- `icon="people-outline"`
- `title="Your connections will appear here"`
- `subtitle="Add someone you'd like to stay close to"`
- `actions` = Import from contacts + Add manually

### 6.4 Refactor Moments empty state

**File:** `app/(tabs)/calendar.tsx`

Replace inline empty state with shared component:
- `icon="sunny-outline"`
- `title="All caught up!"`
- `subtitle="No moments on the horizon. Enjoy the stillness."`
- No actions (this is a positive empty state)

---

## Phase 7: Spacing Standardization (Medium)

**Problem**: Horizontal padding, top padding, and bottom padding vary across all four pages.

### 7.1 Define shared layout constants

**File:** `constants/Layout.ts`

```ts
export const LAYOUT = {
  horizontalPadding: 24,
  topPadding: 16,
  bottomPadding: 140, // accounts for tab bar (104px) + FAB overlap + breathing room
  headerMarginBottom: 8,
};
```

### 7.2 Apply consistent padding to all tab pages

| Page | Current Bottom Padding | Fix |
|------|----------------------|-----|
| Home | 128px | → 140px |
| Connections | 140px | Already correct |
| **Moments** | **32px** | **→ 140px (critical — content is hidden behind tab bar)** |
| Settings | 120px | → 140px |

| Page | Current Horizontal | Fix |
|------|-------------------|-----|
| Home | 24px | Already correct |
| Connections | 24px | Already correct |
| Moments | 24px | Already correct |
| Settings | 20px (`px-5`) | → 24px |

Apply consistent `paddingTop: 16` to all pages (Home currently has 0).

---

## Phase 8: Minor Fixes & Polish (Low)

### 8.1 Fix tab label / page title mismatch

| Tab Label | Page Title | Fix |
|-----------|-----------|-----|
| Home | Kindred | Keep — intentional (app landing page) |
| Connections | Connections | Already consistent |
| Moments | Upcoming Moments | → "Moments" (match tab label) |
| Preferences | Settings | → "Preferences" (match tab label) |

### 8.2 Soften destructive actions in Settings

The "Delete All Data" row uses `text-red-400` and `bg-red-50` which feels harsh in the soft palette. Consider:
- Text: `text-red-300` (softer)
- Background: `bg-rose-50` or `bg-secondary/10` (warmer)
- Icon circle: `bg-rose-50` instead of `bg-red-50`

### 8.3 Remove dead code

- `components/HomeHeader.tsx` — after Phase 2 migration
- `components/ConnectionsHeader.tsx` — after Phase 2 migration
- `components/ExpandableFAB.tsx` — after Phase 4 migration
- Any unused `MaterialCommunityIcons` imports

---

## Implementation Order

Phases are sequenced by dependency — each phase builds on the previous:

```
Phase 1 (Color)          ← Foundation, unblocks everything
  ↓
Phase 2 (Headers)        ← Requires correct colors
  ↓
Phase 3 (Icons)          ← Independent, can parallel with Phase 2
  ↓
Phase 4 (FAB)            ← Requires icon decision from Phase 3
  ↓
Phase 5 (Typography)     ← Independent, can parallel with Phase 4
  ↓
Phase 6 (Empty States)   ← Requires header + typography components
  ↓
Phase 7 (Spacing)        ← Independent, can happen anytime after Phase 1
  ↓
Phase 8 (Polish)         ← Last, after all structural changes
```

**Parallelization opportunities:**
- Phases 2 + 3 can run in parallel
- Phases 4 + 5 can run in parallel
- Phase 7 can run in parallel with Phases 4-6

## Files Changed Summary

| File | Phases |
|------|--------|
| `tailwind.config.js` | 1 |
| `constants/Colors.ts` | 1 (verify, likely no change needed) |
| `app/(tabs)/_layout.tsx` | 1, 3, 4 |
| `app/(tabs)/index.tsx` | 2, 7 |
| `app/(tabs)/two.tsx` | 2, 4, 6, 7 |
| `app/(tabs)/calendar.tsx` | 1, 2, 6, 7 |
| `app/(tabs)/settings.tsx` | 2, 5, 7, 8 |
| `components/PageHeader.tsx` | 2 (new) |
| `components/EmptyState.tsx` | 6 (new) |
| `components/EmptyContactsState.tsx` | 6 |
| `components/FilterPills.tsx` | 5 |
| `components/ConnectionsHeader.tsx` | 2 (deprecated) |
| `components/HomeHeader.tsx` | 2 (deprecated) |
| `components/ExpandableFAB.tsx` | 4 (removed) |
| `components/SettingsRow.tsx` | 5 (new, extracted) |
| `components/SettingsSection.tsx` | 5 (new, extracted) |
| `constants/Layout.ts` | 7 (new) |
