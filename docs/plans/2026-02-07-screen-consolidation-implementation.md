# Screen Consolidation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Consolidate Moments tab into Connections (Due filter), add a new Calendar tab, unify tap behavior so all connection taps go to the detail page, and remove the daily quote from Home.

**Architecture:** Remove the Moments screen and redistribute its functionality. The Due filter on Connections gets time-grouped sections (This Week / Next Week / Later This Season) using existing `MomentCard` and `MomentSectionDivider` components. A new Calendar tab provides month grid + agenda view using `react-native-calendars` and existing `calendarService` functions. Home screen tiles navigate to detail page instead of opening `ReachedOutSheet`. A new "Log a Moment" quick action tile on the detail page becomes the single entry point for interaction logging.

**Tech Stack:** React Native, Expo Router, TypeScript, NativeWind, react-native-calendars ^1.1313.0, Drizzle ORM, existing calendarService

**Design Doc:** `docs/plans/2026-02-07-screen-consolidation-design.md`

---

### Task 1: Home Screen — Remove DailySoftnessCard

**Files:**
- Modify: `app/(tabs)/index.tsx:25,31,48,125-128,206-209`

**Step 1: Remove the DailySoftnessCard import and usage**

In `app/(tabs)/index.tsx`, remove the import on line 25:
```typescript
// DELETE this line:
import { DailySoftnessCard } from '@/components/DailySoftnessCard';
```

Remove the `dailyQuote` memo on line 48:
```typescript
// DELETE this line:
const dailyQuote = useMemo(() => getDailyQuote(), []);
```

Remove the `getDailyQuote` import on line 31:
```typescript
// DELETE this line:
import { getDailyQuote } from '@/constants/quotes';
```

Remove the `handleReflect` callback (lines 125-128):
```typescript
// DELETE these lines:
const handleReflect = useCallback(() => {
  // TODO: Implement reflect feature
  Alert.alert('Reflect', dailyQuote);
}, [dailyQuote]);
```

Remove the `DailySoftnessCard` JSX (lines 206-209):
```typescript
// DELETE these lines:
<DailySoftnessCard
  quote={dailyQuote}
  onReflectPress={handleReflect}
/>
```

**Step 2: Verify the app compiles**

Run: `npx tsc --noEmit 2>&1 | grep -v calendar.tsx`
Expected: No errors related to `index.tsx`

**Step 3: Commit**

```bash
git add app/(tabs)/index.tsx
git commit -m "feat: remove DailySoftnessCard from Home screen"
```

---

### Task 2: Home Screen — Navigate to Detail Page Instead of ReachedOutSheet

**Files:**
- Modify: `app/(tabs)/index.tsx`

**Step 1: Change handleContactPress to navigate to detail page**

Replace the `handleContactPress` callback (line 96-99):
```typescript
// BEFORE:
const handleContactPress = useCallback((contact: Contact) => {
  setSelectedContact(contact);
  setShowReachedOutSheet(true);
}, []);

// AFTER:
const handleContactPress = useCallback((contact: Contact) => {
  router.push(`/contacts/${contact.id}`);
}, [router]);
```

**Step 2: Remove ReachedOutSheet state and JSX**

Remove these state declarations (lines 43-44):
```typescript
// DELETE:
const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
const [showReachedOutSheet, setShowReachedOutSheet] = useState(false);
```

Remove the `handleReachedOutSubmit` callback (lines 101-115):
```typescript
// DELETE the entire handleReachedOutSubmit function
```

Remove the `ReachedOutSheet` JSX at the bottom of the component (lines 258-266):
```typescript
// DELETE:
<ReachedOutSheet
  visible={showReachedOutSheet}
  contact={selectedContact}
  onClose={() => {
    setShowReachedOutSheet(false);
    setSelectedContact(null);
  }}
  onSubmit={handleReachedOutSubmit}
/>
```

Remove the import (line 23):
```typescript
// DELETE:
import ReachedOutSheet from '@/components/ReachedOutSheet';
```

Also remove `LayoutAnimation` from the react-native import since it was only used in `handleReachedOutSubmit`:
```typescript
// Remove LayoutAnimation from this import:
import {
  ActivityIndicator,
  Alert,
  LayoutAnimation,  // DELETE this
  Platform,
  ...
```

**Step 3: Clean up unused imports**

Remove `Alert` from the react-native import (no longer used after removing handleReflect and handleReachedOutSubmit). Keep it only if other code still uses it — check first.

Remove `updateInteraction` from the contactService import (line 20) since it was only used in handleReachedOutSubmit.

**Step 4: Verify the app compiles**

Run: `npx tsc --noEmit 2>&1 | grep -v calendar.tsx`
Expected: No errors related to `index.tsx`

**Step 5: Commit**

```bash
git add app/(tabs)/index.tsx
git commit -m "feat: navigate to detail page from Home tiles instead of ReachedOutSheet"
```

---

### Task 3: Detail Page — Add "Log a Moment" Quick Action Tile

**Files:**
- Modify: `components/QuickActionTile.tsx`
- Modify: `app/contacts/[id].tsx`

**Step 1: Add "moment" variant to QuickActionTile**

In `components/QuickActionTile.tsx`, update the type and config:

```typescript
// BEFORE:
type QuickActionVariant = 'call' | 'text';

// AFTER:
type QuickActionVariant = 'call' | 'text' | 'moment';
```

Add to `variantConfigs`:
```typescript
moment: {
  icon: 'leaf-outline',
  label: 'Log a Moment',
  bgColor: 'bg-secondary/10 dark:bg-secondary/20',
  iconBgColor: 'bg-secondary/20 dark:bg-secondary/30',
  textColor: 'text-secondary dark:text-secondary',
  iconColor: '#D4896A',
},
```

**Step 2: Add ReachedOutSheet and "Log a Moment" tile to the detail page**

In `app/contacts/[id].tsx`, add imports:
```typescript
import ReachedOutSheet from '@/components/ReachedOutSheet';
import { updateInteraction } from '@/services/contactService';
```

Add state for the sheet (after the existing state declarations around line 38):
```typescript
const [showReachedOutSheet, setShowReachedOutSheet] = useState(false);
```

Add handler for logging a moment (after `handleAddNote` around line 121):
```typescript
const handleLogMoment = useCallback(() => {
  setShowReachedOutSheet(true);
}, []);

const handleReachedOutSubmit = useCallback(async (type: any, note: string) => {
  if (!contact) return;

  try {
    await updateInteraction(contact.id, type, note || undefined);
    loadContactData();
  } catch (error) {
    Alert.alert('Error', 'Failed to save. Please try again.');
  } finally {
    setShowReachedOutSheet(false);
  }
}, [contact, loadContactData]);
```

Add the "Log a Moment" tile to the QuiltGrid (after line 261):
```typescript
<QuiltGrid>
  <QuickActionTile variant="call" onPress={handleCall} />
  <QuickActionTile variant="text" onPress={handleText} />
  <QuickActionTile variant="moment" onPress={handleLogMoment} />
</QuiltGrid>
```

Add the ReachedOutSheet JSX before the closing `</>` (after the EditContactModal, around line 311):
```typescript
<ReachedOutSheet
  visible={showReachedOutSheet}
  contact={contact}
  onClose={() => setShowReachedOutSheet(false)}
  onSubmit={handleReachedOutSubmit}
/>
```

**Step 3: Verify the app compiles**

Run: `npx tsc --noEmit 2>&1 | grep -v calendar.tsx`
Expected: No errors

**Step 4: Commit**

```bash
git add components/QuickActionTile.tsx app/contacts/[id].tsx
git commit -m "feat: add Log a Moment quick action to detail page"
```

---

### Task 4: Connections Screen — Add Time-Grouped Moments to Due Filter

**Files:**
- Modify: `app/(tabs)/two.tsx`

**Step 1: Add imports**

Add to the imports section of `app/(tabs)/two.tsx`:
```typescript
import { MomentCard, MomentSectionDivider } from '@/components';
import { getUpcomingMoments, UpcomingMoments, MomentContact } from '@/services/calendarService';
```

**Step 2: Add moments state**

Add after the existing state declarations (around line 56):
```typescript
const [moments, setMoments] = useState<UpcomingMoments>({
  thisWeek: [],
  nextWeek: [],
  laterThisSeason: [],
});
```

**Step 3: Load moments data**

Update `loadContacts` (lines 58-73) to also fetch moments:
```typescript
const loadContacts = useCallback(() => {
  try {
    const results = getContacts({ includeArchived: true });
    const recent = getRecentlyConnectedContacts();
    const filterCounts = getFilterCounts();
    const upcomingMoments = getUpcomingMoments();

    setContacts(results);
    setRecentContacts(recent);
    setCounts(filterCounts);
    setMoments(upcomingMoments);
  } catch (error) {
    console.warn("Failed to load contacts:", error);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, []);
```

**Step 4: Update the ListItem type**

Update the type union (lines 41-45):
```typescript
type ListItem =
  | { type: 'section-header'; title: string; key: string }
  | { type: 'moment-divider'; title: string; highlighted: boolean; key: string }
  | { type: 'moment-card'; moment: MomentContact; key: string }
  | { type: 'connection-card'; contact: Contact; key: string }
  | { type: 'recent-row'; contact: Contact; key: string }
  | { type: 'archived-row'; contact: Contact; key: string };
```

**Step 5: Update listData to use time-grouped sections on Due filter**

Replace the `listData` memo (lines 82-144) with:
```typescript
const listData = useMemo((): ListItem[] => {
  const items: ListItem[] = [];

  const matchesSearch = (contact: Contact) =>
    !searchQuery || contact.name.toLowerCase().includes(searchQuery.toLowerCase());

  if (filter === "archived") {
    const archivedContacts = contacts.filter((c) => c.isArchived && matchesSearch(c));
    archivedContacts.forEach((contact) => {
      items.push({ type: 'archived-row', contact, key: `archived-${contact.id}` });
    });
    return items;
  }

  if (filter === "due") {
    // Time-grouped layout (from old Moments screen)
    if (moments.thisWeek.length > 0) {
      items.push({ type: 'moment-divider', title: 'This Week', highlighted: true, key: 'moment-header-thisweek' });
      moments.thisWeek.filter(m => matchesSearch(m.contact)).forEach((moment) => {
        items.push({ type: 'moment-card', moment, key: `moment-thisweek-${moment.contact.id}` });
      });
    }

    if (moments.nextWeek.length > 0) {
      items.push({ type: 'moment-divider', title: 'Next Week', highlighted: false, key: 'moment-header-nextweek' });
      moments.nextWeek.filter(m => matchesSearch(m.contact)).forEach((moment) => {
        items.push({ type: 'moment-card', moment, key: `moment-nextweek-${moment.contact.id}` });
      });
    }

    if (moments.laterThisSeason.length > 0) {
      items.push({ type: 'moment-divider', title: 'Later This Season', highlighted: false, key: 'moment-header-later' });
      moments.laterThisSeason.filter(m => matchesSearch(m.contact)).forEach((moment) => {
        items.push({ type: 'moment-card', moment, key: `moment-later-${moment.contact.id}` });
      });
    }

    return items;
  }

  // "All" filter: flat list of all active contacts
  const activeContacts = contacts.filter((c) => !c.isArchived && matchesSearch(c));

  // Due contacts first
  const dueContacts = activeContacts.filter(isContactDue);
  const nonDueContacts = activeContacts.filter(c => !isContactDue(c));

  if (dueContacts.length > 0) {
    items.push({ type: 'section-header', title: 'Connections to nurture', key: 'header-due' });
    dueContacts.forEach((contact) => {
      items.push({ type: 'connection-card', contact, key: `card-${contact.id}` });
    });
  }

  if (nonDueContacts.length > 0) {
    items.push({ type: 'section-header', title: 'All connections', key: 'header-all' });
    nonDueContacts.forEach((contact) => {
      items.push({ type: 'connection-card', contact, key: `all-${contact.id}` });
    });
  }

  return items;
}, [contacts, filter, searchQuery, moments]);
```

Note: The `recentContacts` state and `getRecentlyConnectedContacts` import can be removed since we no longer show a "Recently connected" section. Remove the state declaration (`setRecentContacts`), the loading call, and the import.

**Step 6: Update renderItem**

Update the `renderItem` function (lines 180-222) to handle new item types:
```typescript
const renderItem = useCallback(
  ({ item }: { item: ListItem }) => {
    switch (item.type) {
      case 'section-header':
        return <SectionHeader title={item.title} />;

      case 'moment-divider':
        return <MomentSectionDivider title={item.title} highlighted={item.highlighted} />;

      case 'moment-card':
        return (
          <MomentCard
            contact={item.moment.contact}
            avatarIcon={item.moment.avatarIcon as keyof typeof Ionicons.glyphMap}
            rhythmLabel={item.moment.rhythmLabel}
            timeLabel={item.moment.timeLabel}
            isUrgent={item.moment.isUrgent}
            isResting={item.moment.isResting}
            onPress={() => handleContactPress(item.moment.contact.id)}
          />
        );

      case 'connection-card':
        return (
          <ConnectionCard
            contact={item.contact}
            lastConnectedLabel={formatLastConnected(item.contact.lastContactedAt)}
            nextReminderLabel={formatNextReminder(item.contact.nextContactDate)}
            isReady={isContactDue(item.contact)}
            onPress={() => handleContactPress(item.contact.id)}
          />
        );

      case 'recent-row':
        return (
          <RecentConnectionRow
            contact={item.contact}
            connectedLabel={formatLastConnected(item.contact.lastContactedAt)}
            onPress={() => handleContactPress(item.contact.id)}
          />
        );

      case 'archived-row':
        return (
          <ConnectionCard
            contact={item.contact}
            lastConnectedLabel={formatLastConnected(item.contact.lastContactedAt)}
            nextReminderLabel="Archived"
            isReady={false}
            onPress={() => handleContactPress(item.contact.id)}
          />
        );

      default:
        return null;
    }
  },
  [handleContactPress]
);
```

**Step 7: Clean up unused imports**

Remove `RecentConnectionRow` import and `getRecentlyConnectedContacts` from the contactService import if no longer used. Remove `recentContacts` state.

**Step 8: Verify the app compiles**

Run: `npx tsc --noEmit 2>&1 | grep -v calendar.tsx`
Expected: No errors related to `two.tsx`

**Step 9: Commit**

```bash
git add app/(tabs)/two.tsx
git commit -m "feat: add time-grouped moments to Connections Due filter"
```

---

### Task 5: New Calendar Tab Screen

**Files:**
- Create: `app/(tabs)/calendar.tsx` (replace existing Moments screen)

**Step 1: Write the new Calendar tab screen**

Replace the entire contents of `app/(tabs)/calendar.tsx` with a new Calendar screen. This uses `react-native-calendars` (already in dependencies) for the month grid and a custom agenda list below.

```typescript
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { PageHeader } from '@/components/PageHeader';
import { Body, Caption, Heading } from '@/components/ui';
import {
  getCalendarData,
  getContactsByDate,
  getTodayDateKey,
  CalendarContact,
  CalendarData,
} from '@/services/calendarService';
import { formatLastConnected } from '@/utils/timeFormatting';

export default function CalendarScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [calendarData, setCalendarData] = useState<CalendarData>({});
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateKey());
  const [agendaContacts, setAgendaContacts] = useState<CalendarContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(() => {
    try {
      const data = getCalendarData();
      setCalendarData(data);

      const contacts = getContactsByDate(selectedDate);
      setAgendaContacts(contacts);
    } catch (error) {
      console.warn('Failed to load calendar data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedDate]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();
    }, [loadData]),
  );

  const handleDayPress = useCallback(
    (day: DateData) => {
      setSelectedDate(day.dateString);
      const contacts = getContactsByDate(day.dateString);
      setAgendaContacts(contacts);
    },
    [],
  );

  const handleContactPress = useCallback(
    (contactId: string) => {
      router.push(`/contacts/${contactId}`);
    },
    [router],
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const todayKey = getTodayDateKey();

  // Build marked dates for the calendar
  const markedDates = Object.entries(calendarData).reduce(
    (acc, [date, data]) => {
      acc[date] = {
        marked: true,
        dots: data.dots.map((dot, i) => ({ key: `dot-${i}`, color: dot.color })),
        selected: date === selectedDate,
        selectedColor: date === selectedDate ? (isDark ? 'rgba(125, 157, 122, 0.2)' : 'rgba(125, 157, 122, 0.15)') : undefined,
        selectedTextColor: date === selectedDate ? (isDark ? '#fff' : '#1e293b') : undefined,
      };
      return acc;
    },
    {} as Record<string, any>,
  );

  // Ensure selected date is always marked
  if (!markedDates[selectedDate]) {
    markedDates[selectedDate] = {
      selected: true,
      selectedColor: isDark ? 'rgba(125, 157, 122, 0.2)' : 'rgba(125, 157, 122, 0.15)',
      selectedTextColor: isDark ? '#fff' : '#1e293b',
    };
  }

  // Format selected date for display
  const formatSelectedDate = (dateString: string): string => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 140 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          title="Calendar"
          subtitle="Your rhythm at a glance."
        />

        {/* Month Grid */}
        <View className="mb-6 rounded-3xl overflow-hidden bg-white dark:bg-card-dark border border-slate-100 dark:border-slate-800 shadow-soft">
          <Calendar
            markingType="multi-dot"
            markedDates={markedDates}
            onDayPress={handleDayPress}
            theme={{
              backgroundColor: 'transparent',
              calendarBackground: 'transparent',
              textSectionTitleColor: isDark ? '#94a3b8' : '#64748b',
              selectedDayBackgroundColor: Colors.primary,
              selectedDayTextColor: '#ffffff',
              todayTextColor: Colors.primary,
              todayBackgroundColor: isDark ? 'rgba(125, 157, 122, 0.1)' : 'rgba(125, 157, 122, 0.08)',
              dayTextColor: isDark ? '#e2e8f0' : '#1e293b',
              textDisabledColor: isDark ? '#475569' : '#cbd5e1',
              monthTextColor: isDark ? '#f1f5f9' : '#1e293b',
              arrowColor: Colors.primary,
              textDayFontFamily: 'Outfit_400Regular',
              textMonthFontFamily: 'Quicksand_600SemiBold',
              textDayHeaderFontFamily: 'Outfit_500Medium',
              textDayFontSize: 15,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 13,
            }}
          />
        </View>

        {/* Agenda Section */}
        <View>
          <View className="mb-4">
            <Heading size={3}>{formatSelectedDate(selectedDate)}</Heading>
            {selectedDate === todayKey && (
              <Caption muted>Today</Caption>
            )}
          </View>

          {agendaContacts.length === 0 ? (
            <View className="items-center py-10">
              <View className="w-14 h-14 rounded-full bg-sage-light dark:bg-accent-dark-sage items-center justify-center mb-3">
                <Ionicons name="sunny-outline" size={24} color={Colors.primary} />
              </View>
              <Body muted>Nothing planned for this day</Body>
            </View>
          ) : (
            <View className="space-y-3">
              {agendaContacts.map((contact) => (
                <TouchableOpacity
                  key={contact.id}
                  onPress={() => handleContactPress(contact.id)}
                  activeOpacity={0.7}
                  className="bg-white dark:bg-card-dark p-4 rounded-3xl flex-row items-center justify-between border border-slate-100 dark:border-slate-800 shadow-soft"
                >
                  <View className="flex-row items-center gap-4">
                    <View className={`w-10 h-10 rounded-2xl items-center justify-center ${
                      contact.isBirthday
                        ? 'bg-secondary/20'
                        : 'bg-primary/20'
                    }`}>
                      <Ionicons
                        name={contact.isBirthday ? 'gift-outline' : 'notifications-outline'}
                        size={18}
                        color={contact.isBirthday ? '#D4896A' : Colors.primary}
                      />
                    </View>
                    <View>
                      <Body weight="medium">{contact.name}</Body>
                      <Caption muted>
                        {contact.isBirthday ? 'Birthday' : 'Reminder'}
                        {contact.relationship ? ` · ${contact.relationship}` : ''}
                      </Caption>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={isDark ? '#475569' : '#94a3b8'} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

**Step 2: Verify the app compiles**

Run: `npx tsc --noEmit`
Expected: No errors (the old TS errors in calendar.tsx should now be gone)

**Step 3: Commit**

```bash
git add app/(tabs)/calendar.tsx
git commit -m "feat: replace Moments screen with Calendar tab (month grid + agenda)"
```

---

### Task 6: Update Tab Layout

**Files:**
- Modify: `app/(tabs)/_layout.tsx:74-86`

**Step 1: Change the tab label from "Moments" to "Calendar"**

In `app/(tabs)/_layout.tsx`, update lines 74-86:

```typescript
// BEFORE:
<Tabs.Screen
  name="calendar"
  options={{
    title: "Moments",
    tabBarIcon: ({ color, focused }) => (
      <Ionicons
        name={focused ? "calendar" : "calendar-outline"}
        size={26}
        color={color}
      />
    ),
  }}
/>

// AFTER:
<Tabs.Screen
  name="calendar"
  options={{
    title: "Calendar",
    tabBarIcon: ({ color, focused }) => (
      <Ionicons
        name={focused ? "calendar" : "calendar-outline"}
        size={26}
        color={color}
      />
    ),
  }}
/>
```

**Step 2: Verify the app compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add app/(tabs)/_layout.tsx
git commit -m "feat: rename Moments tab to Calendar"
```

---

### Task 7: Clean Up Unused Code

**Files:**
- Modify: `components/index.ts` (remove DailySoftnessCard export)
- Consider deleting: `components/DailySoftnessCard.tsx`
- Consider deleting: `constants/quotes.ts` (if only used by DailySoftnessCard)

**Step 1: Check if DailySoftnessCard is used elsewhere**

Run: `grep -r "DailySoftnessCard" --include="*.tsx" --include="*.ts" app/ components/`

If only referenced in `components/index.ts` and `components/DailySoftnessCard.tsx`, it's safe to remove.

**Step 2: Check if quotes.ts is used elsewhere**

Run: `grep -r "getDailyQuote\|quotes" --include="*.tsx" --include="*.ts" app/ components/ services/`

If only referenced in the (now removed) Home screen import, it's safe to leave but can be removed.

**Step 3: Remove DailySoftnessCard export from index.ts**

In `components/index.ts`, remove line 1:
```typescript
// DELETE:
export { DailySoftnessCard } from './DailySoftnessCard';
```

**Step 4: Delete unused files if confirmed safe**

```bash
rm components/DailySoftnessCard.tsx
# Only if confirmed unused:
# rm constants/quotes.ts
```

**Step 5: Check if RecentConnectionRow is still used anywhere**

Run: `grep -r "RecentConnectionRow" --include="*.tsx" --include="*.ts" app/ components/`

If no longer imported in `two.tsx` or anywhere else, remove it too.

**Step 6: Verify the app compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 7: Commit**

```bash
git add -A
git commit -m "chore: remove unused DailySoftnessCard and clean up dead code"
```

---

### Task 8: Manual Testing Checklist

Run the app and verify each flow:

**Home Screen:**
- [ ] No daily quote card visible
- [ ] Due connection tiles still appear in QuiltGrid
- [ ] Tapping a tile navigates to `/contacts/[id]` detail page (NOT ReachedOutSheet)
- [ ] "See all" link still works
- [ ] Empty state still works
- [ ] Pull-to-refresh works

**Connection Detail Page:**
- [ ] Call and Text quick actions still work
- [ ] New "Log a Moment" tile appears in the QuiltGrid
- [ ] Tapping "Log a Moment" opens ReachedOutSheet
- [ ] Submitting an interaction via ReachedOutSheet saves correctly
- [ ] Shared Moments section still displays interaction history
- [ ] Back button works

**Connections Screen (All filter):**
- [ ] Shows all active contacts with ConnectionCards
- [ ] Due contacts appear at top under "Connections to nurture"
- [ ] Search works

**Connections Screen (Due filter):**
- [ ] Shows time-grouped sections: This Week / Next Week / Later This Season
- [ ] MomentCards display with correct styling (urgent/normal/resting)
- [ ] Section dividers appear with correct highlighting
- [ ] Tapping a MomentCard navigates to detail page
- [ ] Search filters the moment cards
- [ ] Empty state works when no due contacts

**Connections Screen (Archived filter):**
- [ ] Shows archived contacts unchanged

**Calendar Tab:**
- [ ] Month grid displays with dot indicators
- [ ] Reminder dots (sage green) appear on correct dates
- [ ] Birthday dots (coral) appear on correct dates
- [ ] Tapping a day updates the agenda below
- [ ] Today is highlighted and auto-selected
- [ ] Month navigation (arrows) works
- [ ] Agenda shows contacts for selected day
- [ ] Birthday items show gift icon and "Birthday" label
- [ ] Reminder items show notification icon and "Reminder" label
- [ ] Tapping an agenda item navigates to detail page
- [ ] Empty state shows "Nothing planned for this day"
- [ ] Pull-to-refresh works

**Tab Bar:**
- [ ] 4 tabs: Home, Connections, Calendar, Preferences
- [ ] Calendar tab shows calendar icon
- [ ] FAB still works

**Dark Mode:**
- [ ] All new/modified screens render correctly in dark mode
