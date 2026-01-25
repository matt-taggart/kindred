# Home Screen Redesign

**Date:** 2025-01-25
**Status:** Approved
**Scope:** Home screen visual redesign with quilt grid layout

## Overview

This design transforms the Home screen from a SectionList-based layout to a quilt grid layout matching the new visual design system. It preserves all existing functionality while introducing a more visually engaging and modern interface.

## 1. Scope

### What Changes
- Replace header ("Today" + date) with new header (greeting + "Kindred" title + avatar)
- Add "Daily Softness" inspirational quote section
- Replace SectionList with "Your connections" section using QuiltGrid
- Update all colors from old palette (sage, terracotta, cream) to new (primary, secondary, accent)
- Use new typography components (Heading, Body, Caption)

### What Stays
- All existing functionality (load contacts, snooze, mark done, call/text, birthday handling)
- ReachedOutSheet bottom sheet
- CelebrationStatus for empty state
- EmptyContactsState for no contacts
- Pull-to-refresh

## 2. New Components

### 2.1 HomeHeader

**File:** `components/HomeHeader.tsx`

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `userName` | `string` | - | User's first name for greeting |
| `avatarUri` | `string \| null` | `null` | User avatar image URL |
| `hasNotification` | `boolean` | `false` | Shows notification badge on avatar |
| `onAvatarPress` | `() => void` | - | Press handler for avatar |

**Behavior:**
- Shows time-appropriate greeting ("Good morning/afternoon/evening, {name}")
- "Kindred" title in display font (Quicksand bold, 32px)
- Avatar with circular border and soft shadow
- Small secondary badge (notification dot) positioned top-right of avatar

**Styling:**
- Container: `flex-row justify-between items-center mb-8`
- Greeting: Body size="sm" muted (opacity 60%)
- Title: Heading size={1} (32px, bold)
- Avatar: `w-12 h-12 rounded-full border-2 border-white shadow-soft`
- Badge: `absolute -top-1 -right-1 w-4 h-4 bg-secondary rounded-full`

### 2.2 DailySoftnessCard

**File:** `components/DailySoftnessCard.tsx`

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `quote` | `string` | - | The inspirational quote to display |
| `onReflectPress` | `() => void` | - | Press handler for Reflect button |

**Behavior:**
- Displays a "Daily Softness" header with sparkle icon
- Shows an italicized quote
- "Reflect" button with arrow icon
- Decorative blurred circle in bottom-right corner

**Styling:**
- Container: `bg-primary/10 dark:bg-primary/20 p-6 rounded-2xl relative overflow-hidden mb-10`
- Header: `flex-row items-center gap-2`
  - Icon: MaterialCommunityIcons "auto-awesome" in primary color
  - Title: Body weight="medium" size="lg" ("Daily Softness")
- Quote: Body size="sm" muted, italic, mb-4, wrapped in quotes
- Button: SecondaryButton with "Reflect" label and arrow-forward icon
- Decoration: `absolute -right-8 -bottom-8 w-32 h-32 bg-primary/20 rounded-full` with blur

### 2.3 ConnectionTile

**File:** `components/ConnectionTile.tsx`

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `contact` | `Contact` | - | Contact data |
| `variant` | `'primary' \| 'secondary' \| 'accent' \| 'neutral'` | `'neutral'` | Color variant |
| `size` | `'standard' \| 'large'` | `'standard'` | Large spans 2 rows |
| `onPress` | `() => void` | - | Tap handler |

**Behavior:**
- Shows icon based on relationship type (favorite for spouse/partner, home for family, etc.)
- Relationship type badge in top-right (uppercase, small)
- Contact name as title
- Status text (e.g., "Connected recently", "3 days since last talk")
- Birthday contacts get special treatment (🎂 emoji, birthday message)
- Optional emoji indicators at bottom (for tags/notes)

**Variant Assignment Logic:**
- `secondary` (rose): Partner/Spouse relationships, or birthday contacts
- `primary` (sage): Family relationships
- `accent` (peach): Friends
- `neutral` (slate): Others, groups

**Size Logic:**
- `large`: Partner/Spouse (most important relationship)
- `standard`: Everyone else

**Styling:**
- Base: `p-5 rounded-3xl flex-col justify-between border`
- Icon container: `w-8 h-8` (standard) or `w-10 h-10` (large) `rounded-xl bg-{variant}/30`
- Relationship badge: Caption uppercase, variant-tinted
- Name: Heading size={size === 'large' ? 3 : 4}
- Status: Caption muted

### 2.4 AddConnectionTile

**File:** `components/AddConnectionTile.tsx`

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onPress` | `() => void` | - | Tap handler to add new connection |

**Behavior:**
- Dashed border button spanning full width (col-span-2 in grid)
- Plus icon in circular background
- "Add a connection" text

**Styling:**
- Container: `border-2 border-dashed border-slate-200 dark:border-slate-700 p-6 rounded-3xl flex-col items-center justify-center gap-2`
- Icon container: `w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center`
- Icon: Ionicons "add" in slate-400
- Label: Body size="sm" muted ("Add a connection")

## 3. Home Screen Layout

**File:** `app/(tabs)/index.tsx` (refactored)

### Layout Structure
```
SafeAreaView (bg-background-light)
├── ScrollView (px-6 pb-32)
│   ├── HomeHeader
│   ├── DailySoftnessCard
│   ├── ConnectionsSection
│   │   ├── Header ("Your connections" + "See all" button)
│   │   ├── QuiltGrid
│   │   │   ├── ConnectionTile (large - partner/spouse)
│   │   │   ├── ConnectionTile (standard - family)
│   │   │   ├── ConnectionTile (standard - friend)
│   │   │   └── AddConnectionTile
│   └── (Pull-to-refresh)
├── ReachedOutSheet (existing)
└── FAB (optional)
```

### Data Flow
- Still uses `getDueContactsGrouped()` but flattens birthdays + reconnect into single array
- Sort by: birthdays first, then by relationship priority (partner > family > friend)
- Limit to ~6 tiles initially, "See all" navigates to full contacts list
- Birthday contacts get `variant="secondary"` and special status text

### Key Changes from Current
1. Replace SectionList with ScrollView + QuiltGrid
2. Contacts displayed as tiles instead of cards
3. No separate "Birthdays" / "Time to reconnect" sections - all in one grid
4. Preserve all existing state (loading, refreshing, snoozing, etc.)
5. Keep ReachedOutSheet functionality but trigger from tile tap

## 4. File Structure

```
components/
├── HomeHeader.tsx
├── HomeHeader.test.tsx
├── DailySoftnessCard.tsx
├── DailySoftnessCard.test.tsx
├── ConnectionTile.tsx
├── ConnectionTile.test.tsx
├── AddConnectionTile.tsx
├── AddConnectionTile.test.tsx
└── ui/
    └── (existing components)

app/(tabs)/
└── index.tsx (refactored)
```

## 5. Migration Notes

### Breaking Changes
- ContactCard component will be removed (or deprecated)
- Old color classes (sage, terracotta, cream, warmgray) no longer used on Home screen

### Preserved Functionality
- Contact loading and caching
- Snooze functionality (moved to long-press or detail view)
- Mark done / Reached out (triggered from tile tap)
- Call/Text quick actions (moved to detail view or long-press menu)
- Birthday highlighting
- Pull-to-refresh
- Empty states

## 6. Future Considerations

- Quote service for Daily Softness (fetch from API or local collection)
- User profile/settings screen (avatar press destination)
- Group connections tile support
- Customizable tile order/pinning
- Swipe gestures on tiles for quick actions
