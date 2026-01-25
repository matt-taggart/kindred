# Kindred Design Foundation

**Date:** 2025-01-25
**Status:** Approved
**Scope:** Visual foundation - colors, fonts, and base UI components

## Overview

This design establishes the foundational design system for Kindred's visual redesign. It replaces the existing sage/terracotta palette with a new color system and introduces reusable UI components that enforce consistency across the app.

## 1. Color System

### Primary Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#9DBEBB` | Buttons, active states, primary accents (Soft Sage) |
| `secondary` | `#F4ACB7` | Highlights, relationship indicators (Soft Rose) |
| `accent` | `#FFE5D9` | Warm accents, tertiary elements (Creamy Peach) |

### Background Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `background-light` | `#F9FBFA` | Light mode background |
| `background-dark` | `#121414` | Dark mode background |

### Usage Patterns

- Use opacity variants via Tailwind: `bg-primary/20`, `border-secondary/30`
- Primary color for interactive elements and CTAs
- Secondary for relationship-related indicators
- Accent for warm, inviting highlights

## 2. Typography

### Font Families

| Token | Font | Usage |
|-------|------|-------|
| `font-display` | Quicksand | Headings, titles, emphasis |
| `font-body` | Outfit | Body text, labels, UI elements |

### Font Weights

**Quicksand (display):**
- 400 (regular)
- 500 (medium)
- 600 (semibold)
- 700 (bold)

**Outfit (body):**
- 300 (light)
- 400 (regular)
- 500 (medium)
- 600 (semibold)

### Packages

```bash
npx expo install @expo-google-fonts/quicksand @expo-google-fonts/outfit expo-font
```

### Loading Strategy

Fonts load in `app/_layout.tsx` using `useFonts` hook. Splash screen remains visible until fonts are ready. Falls back to system fonts if loading fails.

## 3. Tailwind Configuration

```js
// tailwind.config.js
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#9DBEBB',
        secondary: '#F4ACB7',
        accent: '#FFE5D9',
        'background-light': '#F9FBFA',
        'background-dark': '#121414',
      },
      fontFamily: {
        display: ['Quicksand'],
        body: ['Outfit'],
      },
      borderRadius: {
        DEFAULT: '24px',
        'xl': '32px',
        '2xl': '40px',
      },
      boxShadow: {
        'soft': '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};
```

## 4. Component Specifications

All components live in `components/ui/`.

### 4.1 Typography Components

#### `Heading`

Quicksand-based heading component with size variants.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `1 \| 2 \| 3 \| 4` | `2` | Size variant (1 = largest) |
| `weight` | `'medium' \| 'semibold' \| 'bold'` | `'bold'` | Font weight |
| `className` | `string` | - | Additional Tailwind classes |
| `children` | `ReactNode` | - | Text content |

**Size Mapping:**
- Size 1: 32px (page titles)
- Size 2: 24px (section headers)
- Size 3: 20px (card titles)
- Size 4: 16px (small headings)

#### `Body`

Outfit-based body text component.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'base' \| 'lg'` | `'base'` | Text size |
| `weight` | `'light' \| 'regular' \| 'medium'` | `'regular'` | Font weight |
| `muted` | `boolean` | `false` | Reduces opacity to 60% |
| `className` | `string` | - | Additional Tailwind classes |
| `children` | `ReactNode` | - | Text content |

#### `Caption`

Small label text for badges, timestamps, and metadata.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `uppercase` | `boolean` | `false` | Transforms to uppercase with letter-spacing |
| `muted` | `boolean` | `true` | Reduces opacity |
| `className` | `string` | - | Additional Tailwind classes |
| `children` | `ReactNode` | - | Text content |

### 4.2 Button Components

#### `PrimaryButton`

Solid primary-colored button with pill shape.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Button text |
| `icon` | `string` | - | Material icon name (renders on right) |
| `fullWidth` | `boolean` | `false` | Expands to container width |
| `disabled` | `boolean` | `false` | Disables interaction, reduces opacity |
| `loading` | `boolean` | `false` | Shows spinner, disables interaction |
| `onPress` | `() => void` | - | Press handler |

**Styling:**
- Background: `bg-primary`
- Text: dark (`text-slate-900`)
- Shadow: `shadow-lg shadow-primary/30`
- Press: scales to 98%
- Disabled: 50% opacity

#### `SecondaryButton`

Light-background button for secondary actions.

**Props:** Same as `PrimaryButton`

**Styling:**
- Background: `bg-slate-100` (dark: `bg-slate-800`)
- Text: `text-slate-500` (dark: `text-slate-400`)
- No shadow
- Press: scales to 98%

#### `IconButton`

Circular icon-only button.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `string` | - | Material icon name |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `variant` | `'default' \| 'primary' \| 'muted'` | `'default'` | Color variant |
| `disabled` | `boolean` | `false` | Disables interaction |
| `onPress` | `() => void` | - | Press handler |

**Size Mapping:**
- `sm`: 40px
- `md`: 48px
- `lg`: 56px

**Variant Styling:**
- `default`: white background, subtle shadow, slate icon
- `primary`: primary background, white icon, primary shadow
- `muted`: slate-100 background, slate-400 icon

### 4.3 Card Components

#### `QuiltCard`

Rounded, tinted card for the quilt grid layout.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'accent' \| 'neutral'` | `'neutral'` | Color tint |
| `size` | `'standard' \| 'large'` | `'standard'` | Grid span (large = 2 rows) |
| `pressable` | `boolean` | `false` | Enables press animation |
| `onPress` | `() => void` | - | Press handler (requires pressable) |
| `className` | `string` | - | Additional Tailwind classes |
| `children` | `ReactNode` | - | Card content |

**Variant Styling:**
| Variant | Background | Border |
|---------|------------|--------|
| `primary` | `bg-primary/15` | `border-primary/20` |
| `secondary` | `bg-secondary/15` | `border-secondary/20` |
| `accent` | `bg-accent/40` | `border-accent/60` |
| `neutral` | `bg-slate-100` | `border-slate-200` |

**Base Styling:**
- Border radius: `rounded-3xl`
- Padding: `p-5`
- Border width: 1px

#### `QuiltGrid`

Container for QuiltCard components.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional Tailwind classes |
| `children` | `ReactNode` | - | QuiltCard children |

**Styling:**
- 2-column grid
- 12px gap
- Large cards span 2 rows automatically

### 4.4 Input Components

#### `TextInput`

Styled text input with optional label and error states.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Label text above input |
| `error` | `string` | - | Error message below input |
| `className` | `string` | - | Additional Tailwind classes |
| ...rest | `TextInputProps` | - | All React Native TextInput props |

**Styling:**
- Background: `bg-slate-50` (dark: `bg-slate-800/50`)
- Border radius: `rounded-2xl`
- Padding: `py-5 px-6`
- Text: `text-xl font-medium`
- Placeholder: `text-slate-300` (dark: `text-slate-600`)
- Focus: `ring-2 ring-primary`
- Error: `ring-2 ring-red-500`

**Label Styling:**
- Text: `text-sm font-medium text-slate-400`
- Transform: uppercase
- Letter spacing: `tracking-widest`
- Margin: `ml-1 mb-4`

## 5. File Structure

```
components/
└── ui/
    ├── index.ts           # Barrel export
    ├── Heading.tsx
    ├── Body.tsx
    ├── Caption.tsx
    ├── PrimaryButton.tsx
    ├── SecondaryButton.tsx
    ├── IconButton.tsx
    ├── QuiltCard.tsx
    ├── QuiltGrid.tsx
    └── TextInput.tsx
```

## 6. Migration Notes

### Breaking Changes

- Removes `sage`, `terracotta`, `cream`, `surface`, `warmgray`, `border` color tokens
- Existing screens using these colors will need updates

### Migration Path

1. Install font packages
2. Update `tailwind.config.js`
3. Update `_layout.tsx` for font loading
4. Create `components/ui/` with new components
5. Gradually update screens to use new components and colors

## 7. Dark Mode

All components support dark mode via Tailwind's `dark:` prefix. Dark mode is detected automatically via React Native's `useColorScheme()` and applied via NativeWind's class strategy.

Key dark mode adjustments:
- Background: `#121414`
- Card backgrounds use higher opacity tints
- Text adjusts to `slate-100` / `slate-200`
- Borders lighten for visibility
