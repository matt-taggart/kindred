# Settings Page Redesign

## Overview

Refactor the Settings page to adopt a refined, elegant visual design with pill-shaped cards, icon circles, and updated typography. This establishes a new design system that will propagate to other screens.

## Design System Updates (Global)

### Font Addition

Install `@expo-google-fonts/playfair-display`:
- PlayfairDisplay_500Medium
- PlayfairDisplay_600SemiBold
- PlayfairDisplay_500Medium_Italic

### Tailwind Config Updates

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Existing (keep)
        primary: '#9DBEBB',
        secondary: '#F4ACB7',
        accent: '#FFE5D9',
        'brand-navy': '#2D3648',

        // New additions
        'sage-light': '#E8EFEA',     // Light tint for icon backgrounds
        'off-white': '#FDFCFB',      // Subtle warm background
        'text-soft': '#5C635C',      // Muted text color
        'card-white': '#FFFFFF',     // Card backgrounds
      },
      borderRadius: {
        DEFAULT: '24px',
        xl: '32px',
        '2xl': '40px',
        'pill': '32px',              // Large pill-shaped cards
        'inner-pill': '24px',        // Inner elements
      },
      fontFamily: {
        display: ['PlayfairDisplay_500Medium'],
        'display-semibold': ['PlayfairDisplay_600SemiBold'],
        'display-italic': ['PlayfairDisplay_500Medium_Italic'],
        body: ['Outfit_400Regular'],
      },
    },
  },
};
```

### Colors.ts Updates

Add new colors to the Colors constant file for non-Tailwind usage.

## Settings Page Structure

### Header

```
         [Heart Icon]            48x48 sage-light circle

          Settings               Playfair Display, 30px
      Your peaceful space        Outfit italic, 14px, text-soft
```

- Centered layout
- Heart icon: Custom SVG or Ionicons heart-outline in sage-light circle
- Title: `font-display text-3xl text-slate-900`
- Subtitle: `text-sm italic text-text-soft`

### Section Component

```
SECTION TITLE                    10px, uppercase, tracking-widest, primary/70
Optional description             13px, text-soft/80

╭────────────────────────────╮
│  [icon]  Label         ›   │   Row with chevron
│────────────────────────────│   Inset divider (mx-6)
│  [icon]  Label         ›   │
╰────────────────────────────╯   pill radius, white bg, soft shadow
```

**Card styling:**
- `bg-card-white rounded-pill`
- `shadow-[0_4px_20px_rgba(0,0,0,0.03)]`
- `border border-slate-50`

### Row Component

**Props:**
- `icon`: Ionicons name
- `label`: string
- `onPress`: function
- `variant`: `'default' | 'destructive'`
- `rightElement`: React.ReactNode (optional)
- `showChevron`: boolean (default: true)

**Icon circle:**
- 40x40, rounded-full
- Default: `bg-sage-light`, icon in `primary`
- Destructive: `bg-red-50`, icon in red

**Divider:**
- `mx-6 border-t border-slate-50`

## Sections Content

### 1. Notifications

**Header:** "Choose when Kindred gently nudges you"

| Icon | Label | Action |
|------|-------|--------|
| notifications-outline | Reminder Schedule | Navigate to `/settings/notifications` |

### 2. Support

| Icon | Label | Action | Condition |
|------|-------|--------|-----------|
| sparkles-outline | Upgrade to Pro | Show paywall modal | `!isPro` |
| refresh-outline | Restore Purchases | Restore IAP | Always (no chevron) |
| checkmark-circle | Kindred Pro | Display only | `isPro` (shows "Active" badge) |

### 3. Data

| Icon | Label | Action | Style |
|------|-------|--------|-------|
| trash-outline | Delete All Data | Show delete modal | Destructive (red) |

### 4. Debug (__DEV__ only)

| Icon | Label | Action |
|------|-------|--------|
| close-circle-outline | Clear All Notifications | Cancel all reminders |
| refresh-circle-outline | Reset Pro Status | Reset Pro state |

### Footer

```
Version 2.4.0 — Made with love
```
- Centered, 11px, `text-text-soft/40`
- `mt-8` spacing above

## Delete Modal Updates

Apply new visual style to existing modal:
- Card: `rounded-pill` (32px)
- Warning icon: `bg-red-50` circle
- Input: `rounded-inner-pill` (24px)
- Buttons: `rounded-inner-pill`
- Softer shadow matching card style

Logic unchanged (type "DELETE" to confirm).

## Implementation Steps

1. **Install Playfair Display font**
   - `npx expo install @expo-google-fonts/playfair-display`
   - Update root layout to load fonts

2. **Update design system**
   - Modify `tailwind.config.js` with new colors and radii
   - Update `constants/Colors.ts`

3. **Refactor Settings page**
   - Create new `SettingsSection` component
   - Create new `SettingsRow` component
   - Build header with icon and typography
   - Implement all sections
   - Update delete modal styling

4. **Test**
   - Verify all functionality preserved
   - Check dark mode compatibility
   - Test on iOS and Android

## Files to Modify

- `package.json` (add font dependency)
- `app/_layout.tsx` (load Playfair Display)
- `tailwind.config.js` (new design tokens)
- `constants/Colors.ts` (new colors)
- `app/(tabs)/settings.tsx` (full refactor)

## Preserved Functionality

All existing functionality remains unchanged:
- Navigate to notification settings
- Show/hide Pro upgrade based on status
- Restore purchases with loading state
- Delete all data with confirmation modal
- Debug actions in development mode
