# Import Birthday from Contacts - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Auto-import birthdays from phone contacts during the "Import from Contacts" flow.

**Architecture:** Fetch birthday field from expo-contacts, display inline on contact rows during selection, show on review cards, pass through to `addContact()` which already supports the birthday parameter.

**Tech Stack:** Expo Contacts API, React Native, NativeWind

---

## Task 1: Add Birthday to ImportableContact Type

**Files:**
- Modify: `app/contacts/import.tsx:76-82`

**Step 1: Update the type definition**

Add `birthday` field to the `ImportableContact` type:

```typescript
type ImportableContact = {
  id: string;
  name: string;
  phone: string;
  avatarUri?: string;
  birthday?: string;  // Format: "YYYY-MM-DD" or "MM-DD"
};
```

**Step 2: Verify TypeScript compiles**

Run: `pnpm exec tsc --noEmit`
Expected: No errors (birthday is optional, so existing code still works)

**Step 3: Commit**

```bash
git add app/contacts/import.tsx
git commit -m "feat(import): add birthday field to ImportableContact type"
```

---

## Task 2: Fetch Birthday from Expo Contacts

**Files:**
- Modify: `app/contacts/import.tsx:207-213`

**Step 1: Add Birthday field to getContactsAsync call**

Update the `loadContacts` function to request birthday data:

```typescript
const { data } = await Contacts.getContactsAsync({
  fields: [
    Contacts.Fields.PhoneNumbers,
    Contacts.Fields.Image,
    Contacts.Fields.Birthday,
  ],
  sort: Contacts.SortTypes.FirstName,
});
```

**Step 2: Verify app still loads contacts**

Run the app, navigate to Import from Contacts, grant permission.
Expected: Contact list loads (birthdays not displayed yet, but no errors)

**Step 3: Commit**

```bash
git add app/contacts/import.tsx
git commit -m "feat(import): fetch birthday field from expo-contacts"
```

---

## Task 3: Extract Birthday in toImportable Function

**Files:**
- Modify: `app/contacts/import.tsx:91-108`

**Step 1: Update toImportable to extract birthday**

Replace the `toImportable` function:

```typescript
const toImportable = (contact: Contacts.Contact): ImportableContact | null => {
  const phoneNumber = contact.phoneNumbers?.find((entry) =>
    entry.number?.trim(),
  );

  if (!phoneNumber?.number) {
    return null;
  }

  let birthday: string | undefined;
  if (contact.birthday) {
    const { day, month, year } = contact.birthday;
    if (day !== undefined && month !== undefined) {
      const mm = String(month).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      birthday = year ? `${year}-${mm}-${dd}` : `${mm}-${dd}`;
    }
  }

  return {
    id: contact.id,
    name: getName(contact),
    phone: phoneNumber.number.trim(),
    avatarUri: contact.imageAvailable
      ? (contact.image?.uri ?? undefined)
      : undefined,
    birthday,
  };
};
```

**Step 2: Add Contacts import type (if needed)**

Ensure the import at the top includes the Contact type:

```typescript
import * as Contacts from "expo-contacts";
```

**Step 3: Verify TypeScript compiles**

Run: `pnpm exec tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add app/contacts/import.tsx
git commit -m "feat(import): extract birthday from phone contact data"
```

---

## Task 4: Add Birthday Display Helper

**Files:**
- Modify: `app/contacts/import.tsx` (add after line ~74, before ImportableContact type)

**Step 1: Add the formatBirthdayDisplay helper function**

```typescript
const formatBirthdayDisplay = (birthday: string): string => {
  const parts = birthday.split('-');
  const month = parseInt(parts.length === 3 ? parts[1] : parts[0], 10);
  const day = parseInt(parts.length === 3 ? parts[2] : parts[1], 10);

  const date = new Date(2000, month - 1, day);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
};
```

**Step 2: Verify TypeScript compiles**

Run: `pnpm exec tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add app/contacts/import.tsx
git commit -m "feat(import): add birthday display formatting helper"
```

---

## Task 5: Display Birthday in ContactRow

**Files:**
- Modify: `app/contacts/import.tsx:110-178` (ContactRow component)

**Step 1: Add birthday prop to ContactRow**

Update the component props interface:

```typescript
const ContactRow = ({
  contact,
  selected,
  onToggle,
  frequency,
  onFrequencyChange,
}: {
  contact: ImportableContact;
  selected: boolean;
  onToggle: () => void;
  frequency: Bucket;
  onFrequencyChange: (bucket: Bucket) => void;
}) => {
```

(No change needed - contact already includes birthday from type)

**Step 2: Add birthday display in the row**

Update the ContactRow JSX to show birthday. Find the View containing name and phone, and add the birthday line after the phone number Text:

```tsx
<View className="flex-1">
  <Text className="text-base font-semibold text-warmgray">
    {contact.name}
  </Text>
  <Text className="text-sm text-warmgray-muted">
    {formatPhoneNumber(contact.phone)}
  </Text>
  {contact.birthday && (
    <Text className="text-xs text-warmgray-muted mt-0.5">
      🎂 {formatBirthdayDisplay(contact.birthday)}
    </Text>
  )}
</View>
```

**Step 3: Verify in app**

Run the app, import contacts. Contacts with birthdays in the phone should show "🎂 March 15" below the phone number.

**Step 4: Commit**

```bash
git add app/contacts/import.tsx
git commit -m "feat(import): display birthday on contact selection row"
```

---

## Task 6: Pass Birthday to Review Screen

**Files:**
- Modify: `app/contacts/import.tsx:420-442` (handleSave function)

**Step 1: Include birthday in contactsToImport**

Update the `handleSave` callback to include birthday:

```typescript
const handleSave = useCallback(() => {
  if (selected.size === 0) {
    return;
  }

  const chosen = contacts.filter((contact) => selected.has(contact.id));
  const contactsToImport = chosen.map((contact) => ({
    id: contact.id,
    name: contact.name,
    phone: contact.phone,
    avatarUri: contact.avatarUri,
    bucket: contactFrequencies[contact.id] || "weekly",
    customIntervalDays:
      contactFrequencies[contact.id] === "custom"
        ? customIntervals[contact.id]
        : undefined,
    birthday: contact.birthday,
  }));

  router.push({
    pathname: "/contacts/review-schedule",
    params: { contacts: JSON.stringify(contactsToImport) },
  });
}, [contacts, router, selected, contactFrequencies, customIntervals]);
```

**Step 2: Verify TypeScript compiles**

Run: `pnpm exec tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add app/contacts/import.tsx
git commit -m "feat(import): pass birthday data to review screen"
```

---

## Task 7: Update ContactToImport Type in Review Screen

**Files:**
- Modify: `app/contacts/review-schedule.tsx:34-49`

**Step 1: Add birthday to ContactToImport type**

```typescript
type ContactToImport = {
  id: string;
  name: string;
  phone: string;
  avatarUri?: string;
  bucket:
    | "daily"
    | "weekly"
    | "bi-weekly"
    | "every-three-weeks"
    | "monthly"
    | "every-six-months"
    | "yearly"
    | "custom";
  customIntervalDays?: number | null;
  birthday?: string;
};
```

**Step 2: Verify TypeScript compiles**

Run: `pnpm exec tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add app/contacts/review-schedule.tsx
git commit -m "feat(review): add birthday field to ContactToImport type"
```

---

## Task 8: Add Birthday Display Helper to Review Screen

**Files:**
- Modify: `app/contacts/review-schedule.tsx` (add after bucketLabels, around line 60)

**Step 1: Add the same formatBirthdayDisplay helper**

```typescript
const formatBirthdayDisplay = (birthday: string): string => {
  const parts = birthday.split('-');
  const month = parseInt(parts.length === 3 ? parts[1] : parts[0], 10);
  const day = parseInt(parts.length === 3 ? parts[2] : parts[1], 10);

  const date = new Date(2000, month - 1, day);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
};
```

**Step 2: Verify TypeScript compiles**

Run: `pnpm exec tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add app/contacts/review-schedule.tsx
git commit -m "feat(review): add birthday display formatting helper"
```

---

## Task 9: Display Birthday on Review Cards

**Files:**
- Modify: `app/contacts/review-schedule.tsx:320-341` (renderItem contact card)

**Step 1: Update the contact card to show birthday section**

Find the renderItem function's contact card TouchableOpacity. Update to include birthday section. First, we need access to the original contact data (with birthday) - the `contact` in renderItem is a `DistributionResult`, not `ContactToImport`.

Locate the contact card and update:

```tsx
{contacts.map((contact) => {
  const originalContact = contactsData.find((c) => c.id === contact.id);
  return (
    <TouchableOpacity
      key={contact.id}
      className="mb-2 rounded-2xl border border-border bg-surface p-4"
      onPress={() => handleEditDate(contact.id)}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-base font-semibold text-warmgray">
            {contact.name}
          </Text>
          <Text className="text-sm text-warmgray-muted">
            {bucketLabels[contact.bucket]}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Text className="text-xs text-sage">Tap to edit</Text>
        </View>
      </View>
      {originalContact?.birthday && (
        <View className="mt-3 pt-3 border-t border-border/50">
          <Text className="text-xs font-medium text-warmgray-muted uppercase tracking-wide mb-1">
            Birthday
          </Text>
          <Text className="text-sm text-warmgray">
            🎂 {formatBirthdayDisplay(originalContact.birthday)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
})}
```

**Step 2: Verify in app**

Run the app, select contacts with birthdays, proceed to review screen.
Expected: Cards show birthday section below rhythm info.

**Step 3: Commit**

```bash
git add app/contacts/review-schedule.tsx
git commit -m "feat(review): display birthday section on contact cards"
```

---

## Task 10: Pass Birthday to addContact

**Files:**
- Modify: `app/contacts/review-schedule.tsx:170-190` (importContacts function)

**Step 1: Include birthday in addContact call**

Update the `importContacts` callback:

```typescript
const importContacts = useCallback(
  async (contactsToImport: DistributionResult[]) => {
    let importedCount = 0;
    for (const distributed of contactsToImport) {
      const original = contactsData.find((c) => c.id === distributed.id);
      if (!original) continue;

      await addContact({
        name: original.name,
        phone: original.phone,
        bucket: original.bucket,
        avatarUri: original.avatarUri,
        customIntervalDays: original.customIntervalDays,
        nextContactDate: distributed.nextContactDate,
        birthday: original.birthday ?? null,
      });
      importedCount++;
    }
    return importedCount;
  },
  [contactsData],
);
```

**Step 2: Verify TypeScript compiles**

Run: `pnpm exec tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add app/contacts/review-schedule.tsx
git commit -m "feat(review): pass birthday to addContact service"
```

---

## Task 11: End-to-End Verification

**Files:** None (manual testing)

**Step 1: Full flow test**

1. Open app, go to Contacts tab
2. Tap "+" to add contact
3. Tap "Or import from contacts"
4. Grant permission if needed
5. Find a contact that has a birthday in your phone
6. Verify birthday shows as "🎂 March 15" below phone number
7. Select that contact, tap "Import and Review"
8. Verify review card shows Birthday section
9. Tap "Looks good — import all"
10. View the imported contact's detail page
11. Verify birthday is saved and displayed

**Step 2: Test contact without birthday**

1. Import a contact that doesn't have a birthday in phone
2. Verify no birthday line shows on selection screen
3. Verify no Birthday section shows on review card
4. Verify contact imports successfully

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: import birthdays from phone contacts

- Fetch birthday field from expo-contacts API
- Display birthday inline on contact selection rows
- Show birthday section on review schedule cards
- Pass birthday through to addContact service
- Supports both YYYY-MM-DD and MM-DD formats"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Add birthday to ImportableContact type | import.tsx |
| 2 | Fetch birthday field from expo-contacts | import.tsx |
| 3 | Extract birthday in toImportable | import.tsx |
| 4 | Add formatBirthdayDisplay helper | import.tsx |
| 5 | Display birthday in ContactRow | import.tsx |
| 6 | Pass birthday to review screen | import.tsx |
| 7 | Add birthday to ContactToImport type | review-schedule.tsx |
| 8 | Add formatBirthdayDisplay helper | review-schedule.tsx |
| 9 | Display birthday on review cards | review-schedule.tsx |
| 10 | Pass birthday to addContact | review-schedule.tsx |
| 11 | End-to-end verification | manual |
