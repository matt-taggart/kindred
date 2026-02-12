import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';

import Colors from "@/constants/Colors";
import type { Contact } from "@/db/schema";
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { FilterPills, FilterOption } from "@/components/FilterPills";
import { ConnectionCard } from "@/components/ConnectionCard";
import { MomentCard, MomentSectionDivider } from '@/components';
import {
  getContacts,
  unarchiveContact,
} from "@/services/contactService";
import { getUpcomingMoments, UpcomingMoments, MomentContact } from '@/services/calendarService';
import {
  formatLastConnected,
  formatNextReminder,
} from "@/utils/timeFormatting";

const isContactDue = (contact: Contact) => {
  if (contact.isArchived) return false;
  if (!contact.nextContactDate) return false;
  return contact.nextContactDate <= Date.now();
};

type ListItem =
  | { type: 'section-header'; title: string; key: string }
  | { type: 'moment-divider'; title: string; highlighted: boolean; key: string }
  | { type: 'moment-card'; moment: MomentContact; key: string }
  | { type: 'connection-card'; contact: Contact; key: string }
  | { type: 'archived-row'; contact: Contact; key: string };

export default function ConnectionsScreen() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [moments, setMoments] = useState<UpcomingMoments>({
    thisWeek: [],
    nextWeek: [],
    laterThisSeason: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterOption>("all");
  const [counts, setCounts] = useState({ all: 0, due: 0, archived: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const loadContacts = useCallback(() => {
    try {
      const results = getContacts({ includeArchived: true });
      const upcomingMoments = getUpcomingMoments();
      const activeCount = results.filter((c) => !c.isArchived).length;
      const archivedCount = results.filter((c) => c.isArchived).length;
      const dueCount =
        upcomingMoments.thisWeek.length +
        upcomingMoments.nextWeek.length +
        upcomingMoments.laterThisSeason.length;

      setContacts(results);
      setCounts({ all: activeCount, due: dueCount, archived: archivedCount });
      setMoments(upcomingMoments);
    } catch (error) {
      console.warn("Failed to load contacts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadContacts();
    }, [loadContacts])
  );

  const listData = useMemo((): ListItem[] => {
    const items: ListItem[] = [];

    const matchesSearch = (contact: Contact) =>
      !searchQuery || contact.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMomentSearch = (moment: MomentContact) =>
      !searchQuery || moment.contact.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === "archived") {
      const archivedContacts = contacts.filter((c) => c.isArchived && matchesSearch(c));
      archivedContacts.forEach((contact) => {
        items.push({ type: 'archived-row', contact, key: `archived-${contact.id}` });
      });
      return items;
    }

    if (filter === "due") {
      // Time-grouped moment cards
      const thisWeek = moments.thisWeek.filter(matchesMomentSearch);
      const nextWeek = moments.nextWeek.filter(matchesMomentSearch);
      const laterThisSeason = moments.laterThisSeason.filter(matchesMomentSearch);

      if (thisWeek.length > 0) {
        items.push({ type: 'moment-divider', title: 'This Week', highlighted: true, key: 'divider-this-week' });
        thisWeek.forEach((moment) => {
          items.push({ type: 'moment-card', moment, key: `moment-${moment.contact.id}` });
        });
      }

      if (nextWeek.length > 0) {
        items.push({ type: 'moment-divider', title: 'Next Week', highlighted: false, key: 'divider-next-week' });
        nextWeek.forEach((moment) => {
          items.push({ type: 'moment-card', moment, key: `moment-${moment.contact.id}` });
        });
      }

      if (laterThisSeason.length > 0) {
        items.push({ type: 'moment-divider', title: 'Later This Season', highlighted: false, key: 'divider-later' });
        laterThisSeason.forEach((moment) => {
          items.push({ type: 'moment-card', moment, key: `moment-${moment.contact.id}` });
        });
      }

      return items;
    }

    // All filter: due contacts first, then all other active connections
    const dueContacts = contacts.filter(
      (c) => !c.isArchived && isContactDue(c) && matchesSearch(c)
    );

    if (dueContacts.length > 0) {
      items.push({ type: 'section-header', title: 'Connections to nurture', key: 'header-due' });
      dueContacts.forEach((contact) => {
        items.push({ type: 'connection-card', contact, key: `card-${contact.id}` });
      });
    }

    const dueIds = new Set(dueContacts.map((c) => c.id));
    const otherActiveContacts = contacts.filter(
      (c) => !c.isArchived && !dueIds.has(c.id) && matchesSearch(c)
    );

    if (otherActiveContacts.length > 0) {
      items.push({ type: 'section-header', title: 'All connections', key: 'header-all' });
      otherActiveContacts.forEach((contact) => {
        items.push({ type: 'connection-card', contact, key: `all-${contact.id}` });
      });
    }

    return items;
  }, [contacts, moments, filter, searchQuery]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadContacts();
  }, [loadContacts]);

  const handleContactPress = useCallback(
    (contactId: string) => {
      router.push(`/contacts/${contactId}`);
    },
    [router]
  );

  const handleUnarchive = useCallback(
    async (contactId: string) => {
      try {
        await unarchiveContact(contactId);
        loadContacts();
      } catch (error) {
        Alert.alert(
          "Error",
          error instanceof Error ? error.message : "Failed to unarchive connection."
        );
      }
    },
    [loadContacts]
  );

  const handleSearchPress = useCallback(() => {
    setIsSearching(prev => !prev);
    if (isSearching) {
      setSearchQuery("");
    }
  }, [isSearching]);

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      switch (item.type) {
        case 'section-header':
          return (
            <View className="mb-4 mt-1 items-center px-1">
              <Text className="text-[12px] font-semibold uppercase tracking-[2px] text-text-muted dark:text-slate-400 text-center">
                {item.title}
              </Text>
            </View>
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

        case 'archived-row':
          return (
            <View className="mb-4">
              <ConnectionCard
                contact={item.contact}
                lastConnectedLabel={formatLastConnected(item.contact.lastContactedAt)}
                nextReminderLabel="Archived"
                isReady={false}
                onPress={() => handleContactPress(item.contact.id)}
              />
              <TouchableOpacity
                onPress={() => handleUnarchive(item.contact.id)}
                className="mt-1 self-end flex-row items-center rounded-full border border-stroke-soft bg-surface-card px-3 py-1.5"
                activeOpacity={0.8}
              >
                <Ionicons name="refresh-outline" size={13} color={Colors.primary} />
                <Text className="ml-1 text-xs font-medium text-primary">Restore</Text>
              </TouchableOpacity>
            </View>
          );

        default:
          return null;
      }
    },
    [handleContactPress, handleUnarchive]
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-surface-page dark:bg-background-dark">
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-page dark:bg-background-dark">
      <FlatList
        data={listData}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 164,
          paddingTop: 16,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          counts.all === 0 ? (
            <EmptyState
              icon="people-outline"
              title="Your connections will appear here"
              subtitle="Add someone you'd like to stay close to"
              actions={[
                {
                  icon: 'people-outline',
                  label: 'Import from contacts',
                  onPress: () => router.push({ pathname: "/contacts/import", params: { autoRequest: "1" } }),
                },
                {
                  icon: 'person-add-outline',
                  label: 'Add manually',
                  onPress: () => router.push("/contacts/add"),
                },
              ]}
            />
          ) : filter === "due" && counts.due === 0 ? (
            <EmptyState
              icon="checkmark-circle-outline"
              title="All Caught Up! Enjoy your day."
            />
          ) : undefined
        }
        ListHeaderComponent={
          <View className="mb-4">
            <PageHeader
              title="Connections"
              subtitle={isSearching ? undefined : "Stay close to the people who matter most."}
              rightElement={
                counts.all > 0 ? (
                  <TouchableOpacity
                    testID="search-button"
                    onPress={handleSearchPress}
                    accessibilityLabel={isSearching ? "Close search" : "Search connections"}
                    accessibilityRole="button"
                    className={`p-3.5 shadow-sm border rounded-full items-center justify-center ${
                      isSearching
                        ? "bg-sage-light border-primary/30 dark:bg-card-dark dark:border-primary/40"
                        : "bg-surface-card border-stroke-soft dark:bg-card-dark dark:border-slate-800"
                    }`}
                    activeOpacity={0.7}
                  >
                    <Ionicons name={isSearching ? "close" : "search"} size={22} color={Colors.textMuted} />
                  </TouchableOpacity>
                ) : undefined
              }
            />
            {isSearching && counts.all > 0 && (
              <View className="mb-5">
                <View className="h-14 flex-row items-center bg-surface-card dark:bg-card-dark border border-stroke-soft dark:border-slate-800 rounded-2xl px-4">
                  <Ionicons name="search" size={18} color="#9AA3AF" />
                  <TextInput
                    className="flex-1 h-full ml-2 py-0 text-base leading-5 text-text-strong dark:text-slate-100"
                    placeholder="Search by name..."
                    placeholderTextColor="#9AA3AF"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoFocus
                    autoCapitalize="none"
                    autoCorrect={false}
                    textAlignVertical="center"
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setSearchQuery("")}
                      accessibilityRole="button"
                      accessibilityLabel="Clear search"
                      className="ml-2 h-8 w-8 items-center justify-center rounded-full bg-surface-soft"
                    >
                      <Ionicons name="close" size={14} color={Colors.textMuted} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
            {counts.all > 0 && <FilterPills
              selected={filter}
              counts={counts}
              onSelect={setFilter}
            />}
          </View>
        }
      />
    </SafeAreaView>
  );
}
