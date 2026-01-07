# Task
I would like to brainstorm the following: when we first import users and initially set up reminder frequencies for them, there are times when many contacts can sync on the same day. For example, if I import ten users and set the frequency to weekly, from that point on all users' reminders will appear on the same day each week. what's the best way to make sure that the reminders are distributed, and that users hav more control over that process? It should be as clear as possible to users

---

# Design Proposal: Distributed Reminder Scheduling

## Problem Summary
When importing multiple contacts with the same frequency (e.g., 10 contacts all set to "weekly"), all reminders cluster on the same day. This creates:
1. **Overwhelming reminder days** - Users face many reminders at once
2. **Unnatural cadence** - Real friendships don't all require attention on the same schedule

## Proposed Solutions

### Option A: Smart Auto-Distribution (Recommended)

**Concept:** Automatically spread imported contacts across the frequency period with a clear preview before import.

**Implementation:**
1. After selecting contacts and frequencies, show a **"Review Schedule" step** before final import
2. System automatically distributes contacts evenly across days within their frequency period:
   - 10 weekly contacts → ~1-2 reminders per day across the week
   - 10 monthly contacts → ~1 reminder every 3 days
3. Display a calendar preview showing:
   - Which contacts are scheduled for which days
   - Visual distribution indicator (e.g., "Your reminders are evenly spread across 7 days")
4. Allow users to tap individual contacts to **manually adjust their start date** if needed

**User Flow:**
```
Import Screen → Select Contacts → Set Frequencies → Review Schedule → Import
```

**UI for Review Schedule:**
```
┌──────────────────────────────────────┐
│  📅 Your Reminder Schedule           │
│                                      │
│  Kindred will spread your 10 weekly  │
│  contacts across the week:           │
│                                      │
│  Mon: Alice, Bob                     │
│  Tue: Carol, Dan                     │
│  Wed: Eve, Frank                     │
│  Thu: Grace, Henry                   │
│  Fri: Ivy, Jack                      │
│  Sat: -                              │
│  Sun: -                              │
│                                      │
│  [Edit Schedule]   [Looks Good ✓]    │
└──────────────────────────────────────┘
```

**Code Changes:**
- Modify `addContact()` to accept optional `nextContactDate` override
- Add `distributeContacts()` utility in `utils/scheduler.ts`:
  ```typescript
  export const distributeContacts = (
    contacts: { id: string; bucket: Bucket }[],
    fromDate: number = Date.now()
  ): Map<string, number> => {
    const byBucket = groupBy(contacts, 'bucket');
    const result = new Map<string, number>();
    
    for (const [bucket, group] of Object.entries(byBucket)) {
      const periodDays = bucketOffsets[bucket];
      const spacing = periodDays / group.length;
      
      group.forEach((contact, index) => {
        const offsetDays = Math.floor(index * spacing);
        result.set(contact.id, fromDate + offsetDays * DAY_IN_MS);
      });
    }
    
    return result;
  };
  ```
- Add new screen `app/contacts/review-schedule.tsx` for the preview step

---

### Option B: User-Controlled "Stagger" Setting

**Concept:** Add a simple toggle/option during import to enable distribution.

**Implementation:**
1. Add checkbox on import screen: "☑ Spread reminders evenly across days"
2. When enabled, automatically distribute without preview
3. Users can later adjust individual contacts from their detail page

**Pros:** Minimal UI changes, simple to understand
**Cons:** Less transparent, users don't see the result before committing

---

### Option C: "Start Date" Picker Per Contact

**Concept:** Let users manually set when each contact's reminder cycle starts.

**Implementation:**
1. Add a date picker button next to each contact row during import
2. Default to today, but users can tap to choose any starting date
3. Show mini calendar picker

**Pros:** Maximum control
**Cons:** Tedious for many contacts, cognitive overhead

---

## Recommendation

**Implement Option A** with these phases:

### Phase 1: Core Distribution Logic
- Add `distributeContacts()` to scheduler.ts
- Modify import flow to use distributed dates
- Enable via a simple toggle (like Option B) initially

### Phase 2: Schedule Preview (full Option A)
- Add the Review Schedule screen with calendar visualization
- Allow individual contact date adjustments
- Show distribution stats ("X reminders per day on average")

### Phase 3: Post-Import Rebalancing (Future)
- Add a "Rebalance Reminders" option in Settings
- Automatically redistribute existing contacts to smooth out clusters
- Useful for existing users who didn't have distribution at import time

---

## Alternative Enhancements to Consider

1. **Day-of-week preferences:** Let users set "no reminders on weekends" 
2. **Daily reminder cap:** "Max 3 reminders per day" → system auto-adjusts
3. **Batch distribution on existing contacts:** "Spread out my monthly contacts" action

---

## Summary

The clustering problem is a common UX issue in reminder apps. The key is balancing:
- **Transparency:** Users should understand what's happening
- **Simplicity:** Don't make importing contacts feel complex
- **Control:** Power users should be able to customize

Option A (Smart Auto-Distribution with Preview) strikes this balance best.


