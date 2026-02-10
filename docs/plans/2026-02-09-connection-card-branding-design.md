# Connection Card Branding Alignment

**Date**: 2026-02-09
**Status**: Approved
**Scope**: 3 files, minimal changes

## Problem

Connection cards on the home screen default to a cold "neutral" variant (stark white background, gray slate borders, gray icons) whenever a contact has no relationship type set or isn't overdue. This makes the most prominent UI element on the home screen feel disconnected from the warm brand palette (Soft Sage, Soft Rose, Creamy Peach) used everywhere else.

### Root Cause

`getTileVariant()` in `utils/tileVariant.ts` returns `'neutral'` as its fallback. The `neutral` variant in `ConnectionTile.tsx` uses `bg-white`, `border-slate-200`, and `bg-slate-100` with `#9ca3af` gray — none of which reference the brand palette.

## Solution

Replace the cold neutral variant with soft sage tinting as the default, and add subtle background tints to all variants so every card feels warm and branded.

### Design Decisions

- **Uniform sage tint**: All default cards use the same soft sage wash (not varied by relationship or rotating colors)
- **Soft tinted backgrounds**: Subtle color wash rather than stark white — warm but understated
- **Add a connection card**: Matches the sage tint for visual unity
- **Eliminate neutral entirely**: Remove the variant from the type, styles, and fallback logic

## Changes

### 1. `components/ConnectionTile.tsx` — Update variant backgrounds, remove neutral

**Before:**
```typescript
const variantStyles = {
  primary: {
    bg: 'bg-white dark:bg-card-dark',
    border: 'border-primary/35 dark:border-primary/45',
    iconBg: 'bg-primary/15 dark:bg-primary/20',
    iconColor: Colors.primary,
  },
  secondary: {
    bg: 'bg-white dark:bg-card-dark',
    border: 'border-secondary/40 dark:border-secondary/50',
    iconBg: 'bg-secondary/20 dark:bg-secondary/30',
    iconColor: Colors.secondary,
  },
  accent: {
    bg: 'bg-white dark:bg-card-dark',
    border: 'border-accent/70 dark:border-accent/50',
    iconBg: 'bg-accent/60 dark:bg-accent/20',
    iconColor: '#F97316',
  },
  neutral: {
    bg: 'bg-white dark:bg-card-dark',
    border: 'border-slate-200 dark:border-slate-700',
    iconBg: 'bg-slate-100 dark:bg-slate-700',
    iconColor: '#9ca3af',
  },
};
```

**After:**
```typescript
const variantStyles = {
  primary: {
    bg: 'bg-primary/10 dark:bg-card-dark',
    border: 'border-primary/25 dark:border-primary/45',
    iconBg: 'bg-primary/15 dark:bg-primary/20',
    iconColor: Colors.primary,
  },
  secondary: {
    bg: 'bg-secondary/10 dark:bg-card-dark',
    border: 'border-secondary/30 dark:border-secondary/50',
    iconBg: 'bg-secondary/20 dark:bg-secondary/30',
    iconColor: Colors.secondary,
  },
  accent: {
    bg: 'bg-accent/30 dark:bg-card-dark',
    border: 'border-accent/50 dark:border-accent/50',
    iconBg: 'bg-accent/60 dark:bg-accent/20',
    iconColor: '#F97316',
  },
};
```

Also update:
- `ConnectionTileProps` variant type: remove `'neutral'`
- Remove the `neutral` className test assertion block
- Update ellipsis button styling to use variant icon color (already does)

### 2. `utils/tileVariant.ts` — Remove neutral fallback

**Before:**
```typescript
export type TileVariant = 'primary' | 'secondary' | 'accent' | 'neutral';

// ...in getTileVariant():
default:
  if (overdueDays >= 7) return 'primary';
  if (overdueDays >= 1) return 'accent';
  return 'neutral';
```

**After:**
```typescript
export type TileVariant = 'primary' | 'secondary' | 'accent';

// ...in getTileVariant():
default:
  if (overdueDays >= 7) return 'primary';
  if (overdueDays >= 1) return 'accent';
  return 'primary';
```

### 3. `app/(tabs)/index.tsx` — Update "Add a connection" card

**Before:**
```tsx
className="mt-4 rounded-2xl border border-dashed border-primary/35 dark:border-primary/40 px-4 py-3.5 bg-white/80 dark:bg-card-dark/90 ..."
```

**After:**
```tsx
className="mt-4 rounded-2xl border border-dashed border-primary/35 dark:border-primary/40 px-4 py-3.5 bg-primary/10 dark:bg-card-dark/90 ..."
```

## Visual Result

- All connection cards: soft sage wash background with sage border
- Birthday cards: soft rose wash with rose border
- Friend cards (when overdue 1-6 days): soft peach wash with peach border
- Add a connection: matching sage wash with sage dashed border
- Dark mode: unchanged (keeps `bg-card-dark`)

## Testing

- Verify cards render with sage tint on home screen
- Verify birthday variant still shows rose tint
- Verify dark mode unchanged
- Verify "Add a connection" card matches
- Check any existing tests referencing the `neutral` variant and update
