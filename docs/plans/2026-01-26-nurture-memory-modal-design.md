# Nurture Memory Modal Redesign

## Overview

Refactor `app/modal.tsx` to match the new "Airy Memory Log" design. The modal is used for logging new interactions and editing existing notes.

## Design Reference

- HTML mockup provided by user
- Screenshot: Soft, airy aesthetic with sage green primary color

## Visual Changes

### Header Layout

**Structure:** Three-part horizontal layout
- **Left:** X (close) icon button - muted gray color
- **Center:** Leaf/eco icon - sage green brand element
- **Right:** "Save" pill button - sage-light background, sage text

**Title:** Centered below header
- "Nurture a memory" (new entries)
- "Edit memory" (editing existing)
- Style: text-2xl, font-light, centered

### Connection Type Buttons

**Layout:** Horizontally distributed row of 4 circular buttons

**Section label:** "HOW DID YOU CONNECT?"
- Uppercase, tracking-widest, text-xs, muted, centered

**Button specs:**
- Size: 64px (w-16 h-16) circles
- Unselected: sage-light background, sage icon, muted label
- Selected: primary/10 background, 2px sage ring with 4px offset, sage label (semibold)

**Type mapping (internal value → display):**
| Value | Label | Icon |
|-------|-------|------|
| call | Call | call |
| text | Text | chatbubble-outline |
| email | Voice | mic-outline |
| meet | In person | person-outline |

### Text Area

**Section label:** "ANYTHING TO REMEMBER?"
- Same style as connection type label

**Input:**
- No border, transparent background
- text-lg, leading-relaxed
- Placeholder: "Type your heart out..."
- Min height ~200px, flexible

### Footer

**Dashed separator:** Horizontal dashed line, primary/30 color

**Privacy note:**
- "Kindred thoughts are kept private"
- Sparkle icon prefix
- text-[10px], muted, centered

## Behavioral Changes

### Removed
- "Not now" / Skip button (users must Save or Close)
- Bottom action buttons (Save moved to header)

### Preserved
- Edit mode detection and pre-population
- Same save/update service calls
- Keyboard avoidance via SafeAreaView
- No auto-focus on TextInput

### Save Button States
- Default: "Save" with sage-light background
- Saving: "Saving..." disabled state

## Color Additions

Add to `tailwind.config.js` if not present:
```js
'sage-dark': '#2A2F2A',  // For dark mode backgrounds
```

## Files to Modify

1. `app/modal.tsx` - Complete visual refactor
2. `tailwind.config.js` - Add sage-dark color (if needed)

## Files NOT Changed

- Database schema (keeping existing type values)
- `services/contactService.ts`
- Navigation/routing

## Dark Mode

- Background: background-dark (#121412)
- Buttons: sage-dark background
- Text: slate-200 / slate-400 variants
- Ring offset: uses dark background color

## Component Structure

```
SafeAreaView (bg-cream / bg-background-dark)
├── Header Row
│   ├── Close Button (X icon)
│   ├── Leaf Icon (centered)
│   └── Save Button (pill)
├── Title ("Nurture a memory")
├── Connection Type Section
│   ├── Label ("HOW DID YOU CONNECT?")
│   └── Button Row (Call, Text, Voice, In person)
├── Notes Section
│   ├── Label ("ANYTHING TO REMEMBER?")
│   ├── TextInput (transparent)
│   ├── Dashed Separator
│   └── Privacy Note
└── (flex spacer)
```

## Acceptance Criteria

- [ ] Header has X/leaf/Save layout
- [ ] Title is centered and contextual (new vs edit)
- [ ] Circular connection type buttons with ring selection indicator
- [ ] Transparent borderless text area
- [ ] Dashed line and privacy note footer
- [ ] Dark mode support
- [ ] Existing edit functionality preserved
- [ ] Save/close navigation works correctly
