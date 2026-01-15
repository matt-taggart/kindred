# Import Birthday from Contacts - Design

## Overview

Add birthday importing to the "Import from Contacts" flow. When users import contacts from their phone's address book, birthdays are automatically pulled in alongside name and phone number.

## Design Decisions

1. **Auto-import birthdays** - If the phone contact has a birthday, automatically bring it into Kindred (no extra user action required)
2. **Show birthdays inline** - Display birthday on the contact selection screen so users see exactly what's being imported
3. **Only show when present** - Contacts without birthdays don't show a birthday row (no "Add birthday" prompts during import)

## UI Design

### Contact Selection Screen (`import.tsx`)

Birthday appears as a subtle third line on the contact row, only when the phone contact has one:

```
┌────────────────────────────────────────────────────────┐
│  [Avatar]  Sarah Chen                    [Weekly ▾] ☑  │
│            (555) 123-4567                              │
│            🎂 March 15                                 │
└────────────────────────────────────────────────────────┘
```

**Styling:**
- Cake emoji (🎂) as visual anchor
- Date formatted as "March 15" (friendly, readable)
- `text-warmgray-muted` and slightly smaller text for visual hierarchy
- Third line only renders when birthday exists

### Review Schedule Screen (`review-schedule.tsx`)

Birthday section appears on the review card, only for contacts that have one:

```
┌────────────────────────────────────────────────────────┐
│  [Avatar]  Sarah Chen                                  │
│                                                        │
│  ┌─ Rhythm ─────────────────────────────────────────┐  │
│  │  Every week                                      │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌─ Birthday ───────────────────────────────────────┐  │
│  │  🎂 March 15                                     │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

Contacts without birthdays only show the Rhythm section (no empty birthday section).

## Data Flow

### 1. Fetch birthday from expo-contacts

Add `Contacts.Fields.Birthday` to the `getContactsAsync` call:

```typescript
const { data } = await Contacts.getContactsAsync({
  fields: [
    Contacts.Fields.PhoneNumbers,
    Contacts.Fields.Image,
    Contacts.Fields.Birthday,  // Add this
  ],
  sort: Contacts.SortTypes.FirstName,
});
```

### 2. Update ImportableContact type

```typescript
type ImportableContact = {
  id: string;
  name: string;
  phone: string;
  avatarUri?: string;
  birthday?: string;  // Format: "YYYY-MM-DD" or "MM-DD"
};
```

### 3. Extract birthday in toImportable()

```typescript
const toImportable = (contact: Contacts.Contact): ImportableContact | null => {
  // ... existing phone extraction ...

  let birthday: string | undefined;
  if (contact.birthday) {
    const { day, month, year } = contact.birthday;
    if (day && month) {
      const mm = String(month).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      birthday = year ? `${year}-${mm}-${dd}` : `${mm}-${dd}`;
    }
  }

  return {
    id: contact.id,
    name: getName(contact),
    phone: phoneNumber.number.trim(),
    avatarUri: contact.imageAvailable ? contact.image?.uri : undefined,
    birthday,
  };
};
```

### 4. Display helper

```typescript
const formatBirthdayDisplay = (birthday: string): string => {
  // Handle both "YYYY-MM-DD" and "MM-DD" formats
  const parts = birthday.split('-');
  const month = parseInt(parts.length === 3 ? parts[1] : parts[0], 10);
  const day = parseInt(parts.length === 3 ? parts[2] : parts[1], 10);

  const date = new Date(2000, month - 1, day);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
};
```

### 5. Pass through to addContact()

The birthday is passed through the review screen to `addContact()`, which already accepts a `birthday` parameter (used by the manual add flow).

## Files to Modify

| File | Changes |
|------|---------|
| `app/contacts/import.tsx` | Fetch birthday field, update `ImportableContact` type, update `toImportable()`, add birthday line to `ContactRow`, include birthday in data passed to review |
| `app/contacts/review-schedule.tsx` | Display birthday section on review cards, pass birthday to `addContact()` |

## Files Unchanged

- `services/contactService.ts` - already accepts `birthday` parameter
- `db/schema.ts` - birthday field already exists
- Manual add flow (`app/contacts/add/*`) - unchanged

## Edge Cases

1. **Birthday without year** - Common scenario. Store as `"MM-DD"`, display as `"March 15"`. Works with existing `isBirthdayToday()` logic.

2. **Birthday with year** - Store as `"YYYY-MM-DD"`, display as `"March 15"` (year not shown in UI). Year preserved for potential future features.

3. **Multiple phone numbers** - Current behavior picks first valid number. Birthday handling unaffected.

4. **Re-importing same contact** - Existing duplicate handling applies. Birthday would update if different.

## Future Considerations

- Allow editing birthdays on the review screen (not in this iteration - keeps it simple)
- Show age on birthday if year is known
- Bulk "set all birthdays" option (not needed - auto-import handles this)
