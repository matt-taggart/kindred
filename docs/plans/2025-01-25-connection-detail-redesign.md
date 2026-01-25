# Connection Detail Screen Redesign

**Date:** 2025-01-25
**Status:** Approved
**Scope:** Connection Detail screen visual redesign with quilt-style components

## Overview

This design transforms the Connection Detail screen from a functional card-based layout to a modern, visually engaging design with editable notes, quick action tiles, and shared moments. It preserves all existing functionality while introducing a more personal and intimate interface for viewing individual connections.

## 1. Scope

### What Changes
- Replace header with new centered layout (back button, name/relationship center, more menu)
- Add large profile section with colored avatar ring and favorite badge
- Replace notes list with editable notes card
- Replace inline action buttons with 2x2 QuickActionTile grid
- Add SharedMomentsSection replacing interaction history
- Update all colors from old palette to new design system

### What Stays
- All existing functionality (edit contact, archive, call/text linking)
- ReachedOutSheet and snooze functionality
- Birthday detection and display
- Phone number in edit modal
- Back navigation

## 2. New Components

### 2.1 ConnectionDetailHeader

**File:** `components/ConnectionDetailHeader.tsx`

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | - | Contact's name |
| `relationship` | `string` | - | Relationship type |
| `onBackPress` | `() => void` | - | Back button handler |
| `onMorePress` | `() => void` | - | More options handler |

**Behavior:**
- Centered name with relationship type below
- Back button (left) and more menu button (right)
- Both buttons are circular with soft shadow

**Styling:**
- Container: `flex-row items-center justify-between px-6 py-4`
- Buttons: `w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-100 items-center justify-center shadow-sm`
- Name: Heading size={4}, centered
- Relationship: Caption uppercase tracking-widest muted

### 2.2 ConnectionProfileSection

**File:** `components/ConnectionProfileSection.tsx`

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `avatarUri` | `string \| null` | `null` | Contact photo URL |
| `name` | `string` | - | Name for initials fallback |
| `relationship` | `string` | - | Determines ring color |
| `lastConnected` | `string \| null` | `null` | Last connected text |
| `isFavorite` | `boolean` | `false` | Shows heart badge |

**Behavior:**
- Large 128px avatar with colored border ring
- Ring color based on relationship type
- Favorite badge in bottom-right if applicable
- "Last connected" text below

**Ring Colors by Relationship:**
- Partner/Spouse: `border-secondary/30` (rose)
- Family: `border-primary/30` (sage)
- Friend: `border-accent/30` (peach)
- Other: `border-slate-200`

**Styling:**
- Container: `items-center py-8`
- Avatar wrapper: `w-32 h-32 rounded-full border-4 p-1.5`
- Avatar: `w-full h-full rounded-full`
- Badge: `absolute bottom-1 right-1 bg-white p-1.5 rounded-full shadow-md`
- Last connected: Body size="sm" muted

### 2.3 ConnectionNotesCard

**File:** `components/ConnectionNotesCard.tsx`

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `notes` | `string` | `''` | Current notes text |
| `onChangeNotes` | `(text: string) => void` | - | Change handler |
| `placeholder` | `string` | `'What matters...'` | Placeholder text |

**Behavior:**
- Editable text area for free-form notes
- Sparkle icon header with "NOTES" label
- Auto-saves on change (parent handles debounce)

**Styling:**
- Container: `bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 shadow-soft`
- Header: `flex-row items-center gap-2 mb-3`
- Icon: auto-awesome in amber-400
- Label: Caption uppercase tracking-wider muted
- TextInput: `bg-transparent text-lg` multiline, 96px height

### 2.4 QuickActionTile

**File:** `components/QuickActionTile.tsx`

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'call' \| 'text' \| 'voice' \| 'later'` | - | Action type |
| `onPress` | `() => void` | - | Tap handler |

**Variant Configurations:**
| Variant | Icon | Label | Background | Icon BG | Text Color |
|---------|------|-------|------------|---------|------------|
| `call` | phone | Call | `secondary/20` | `secondary` | `pink-600` |
| `text` | chat-bubble | Text | `primary/20` | `primary` | `emerald-600` |
| `voice` | mic | Voice Note | `accent/20` | `accent` | `amber-600` |
| `later` | edit-note | Write Later | `slate-100` | `white` | `slate-500` |

**Styling:**
- Container: `p-6 rounded-3xl flex-col items-center justify-center gap-3`
- Icon box: `w-12 h-12 rounded-2xl items-center justify-center`
- Label: Body weight="semibold"

### 2.5 SharedMomentsSection

**File:** `components/SharedMomentsSection.tsx`

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `moments` | `Moment[]` | `[]` | Array of moments |
| `onViewAll` | `() => void` | - | View all handler |
| `onMomentPress` | `(moment) => void` | - | Moment tap handler |

**Moment Type:**
```typescript
interface Moment {
  id: string;
  title: string;
  date: string;
  description: string;
  imageUri?: string;
  icon?: string;
  iconBgColor?: string;
}
```

**Styling:**
- Header: `flex-row justify-between items-center px-2 mb-4`
- Title: Heading size={4}
- View all: Body size="sm" weight="semibold" primary color
- Card: `bg-white p-4 rounded-3xl flex-row items-center gap-4 border shadow-soft mb-3`
- Thumbnail: `w-16 h-16 rounded-2xl`

## 3. Screen Layout

**File:** `app/contacts/[id].tsx` (refactored)

### Layout Structure
```
SafeAreaView (bg-background-light)
├── ConnectionDetailHeader
├── ScrollView (px-6 pb-32)
│   ├── ConnectionProfileSection
│   ├── ConnectionNotesCard
│   ├── QuiltGrid (Quick Actions)
│   │   ├── QuickActionTile (call)
│   │   ├── QuickActionTile (text)
│   │   ├── QuickActionTile (voice)
│   │   └── QuickActionTile (later)
│   └── SharedMomentsSection
├── ReachedOutSheet (existing)
└── MoreMenu ActionSheet
```

### Data Flow
- Load contact from `getContactById(id)`
- Notes stored in contact record
- Quick actions trigger handlers
- Moments mapped from interactions

## 4. File Structure

```
components/
├── ConnectionDetailHeader.tsx
├── ConnectionDetailHeader.test.tsx
├── ConnectionProfileSection.tsx
├── ConnectionProfileSection.test.tsx
├── ConnectionNotesCard.tsx
├── ConnectionNotesCard.test.tsx
├── QuickActionTile.tsx
├── QuickActionTile.test.tsx
├── SharedMomentsSection.tsx
├── SharedMomentsSection.test.tsx
└── index.ts (updated exports)

app/contacts/
└── [id].tsx (refactored)
```

## 5. Migration Notes

### Database Changes
- Add `notes` field to Contact type if not present
- Moments can map from existing interactions initially

### Breaking Changes
- Schedule summary card removed from detail view (move to edit)
- Inline reached out/later buttons replaced with tile actions

### Preserved Functionality
- Edit contact modal
- Archive functionality
- Call/Text linking
- Birthday display
- ReachedOutSheet
- Back navigation

## 6. Future Considerations

- Voice note recording integration
- "Write Later" reminder scheduling
- Photo attachments for moments
- Moment creation flow
- Share moments between users
