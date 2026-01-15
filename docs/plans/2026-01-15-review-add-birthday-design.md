# Add Birthday on Review Screen - Design

## Overview

Expand the birthday import feature to allow users to add birthdays on the review-schedule screen for contacts that don't have one from their phone. This makes the import flow clearer by showing a consistent birthday section on every contact card.

## Design Decisions

1. **Always show birthday section** - Every card has a birthday section for consistent layout
2. **Inline editing** - Date picker expands within the card, no modal
3. **Single edit mode** - Only one card can be editing birthday at a time

## UI Design

### Contact with existing birthday
```
┌────────────────────────────────────────────────────┐
│  Sarah Chen                                        │
│  Every week                          Tap to edit   │
│  ───────────────────────────────────────────────   │
│  Birthday                                          │
│  🎂 March 15                                       │
└────────────────────────────────────────────────────┘
```

### Contact without birthday
```
┌────────────────────────────────────────────────────┐
│  Mike Johnson                                      │
│  Once a month                        Tap to edit   │
│  ───────────────────────────────────────────────   │
│  Birthday                                          │
│  + Add birthday                                    │
└────────────────────────────────────────────────────┘
```

### Contact in "adding birthday" mode
```
┌────────────────────────────────────────────────────┐
│  Mike Johnson                                      │
│  Once a month                        Tap to edit   │
│  ───────────────────────────────────────────────   │
│  Birthday                              Cancel      │
│  ┌────────────────────────────────────────────┐   │
│  │         [  Date Picker Spinner  ]          │   │
│  └────────────────────────────────────────────┘   │
│  [ Save Birthday ]                                 │
└────────────────────────────────────────────────────┘
```

## Interaction Flow

1. User taps "+ Add birthday" on a contact card
2. Card expands to show inline date picker
3. User selects date and taps "Save Birthday"
4. Card collapses, shows `🎂 March 15`
5. Birthday is included when "Import all" is tapped

**Cancel behavior:** Collapses picker, returns to "+ Add birthday" state

**Single edit constraint:** If user taps "+ Add birthday" on another card while one is open, the first auto-cancels

## State Management

New state in review-schedule.tsx:
```typescript
const [editingBirthdayContactId, setEditingBirthdayContactId] = useState<string | null>(null);
const [editingBirthdayDate, setEditingBirthdayDate] = useState<Date>(new Date());
```

**On tap "+ Add birthday":**
- Set `editingBirthdayContactId` to contact's ID
- Initialize `editingBirthdayDate` to today

**On save:**
- Update `contactsData` state with new birthday
- Clear `editingBirthdayContactId`

**Data flow:** Birthday flows through existing `importContacts` → `addContact()` path. No database changes needed.

## Files to Modify

| File | Changes |
|------|---------|
| `app/contacts/review-schedule.tsx` | Add state, update card rendering, add handlers |

## Files Unchanged

- `app/contacts/import.tsx` - no changes
- `services/contactService.ts` - already accepts birthday
- `utils/formatters.ts` - already has formatBirthdayDisplay
- Database schema - birthday field exists

## Estimated Scope

~50-80 lines of changes to one file
