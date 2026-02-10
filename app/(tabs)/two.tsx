import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
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
import { SectionHeader } from "@/components/SectionHeader";
import {
  getContacts,
  getFilterCounts,
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
      const filterCounts = getFilterCounts();
      const upcomingMoments = getUpcomingMoments();

      setContacts(results);
      setCounts(filterCounts);
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
          return <SectionHeader title={item.title} />;

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

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
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
          paddingTop: 18,
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
          ) : undefined
        }
        ListHeaderComponent={
          <View className="mb-5">
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
                    className="p-3.5 bg-white dark:bg-card-dark shadow-sm border border-slate-100 dark:border-slate-800 rounded-full items-center justify-center"
                    activeOpacity={0.7}
                  >
                    <Ionicons name={isSearching ? "close" : "search"} size={22} color="#7A879A" />
                  </TouchableOpacity>
                ) : undefined
              }
            />
            {isSearching && counts.all > 0 && (
              <View className="mb-5">
                <View className="h-14 flex-row items-center bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-2xl px-5">
                  <TextInput
                    className="flex-1 h-full py-0 text-base leading-5 text-slate-900 dark:text-slate-100"
                    placeholder="Search by name..."
                    placeholderTextColor="#8A98AC"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoFocus
                    autoCapitalize="none"
                    autoCorrect={false}
                    textAlignVertical="center"
                  />
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
