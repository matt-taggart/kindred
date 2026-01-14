import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
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

import { Contact } from "@/db/schema";
import {
  archiveContact,
  getContacts,
  resetDatabase,
  unarchiveContact,
} from "@/services/contactService";
import { formatPhoneNumber } from "@/utils/phone";
import { formatLastConnected, formatNextReminder } from "@/utils/timeFormatting";

const formatBucketLabel = (
  bucket: Contact["bucket"],
  customIntervalDays?: number | null,
) => {
  switch (bucket) {
    case "daily":
      return "Every day";
    case "weekly":
      return "Every week";
    case "bi-weekly":
      return "Every couple weeks";
    case "every-three-weeks":
      return "Every few weeks";
    case "monthly":
      return "Once a month";
    case "every-six-months":
      return "Seasonally";
    case "yearly":
      return "Once a year";
    case "custom": {
      if (!customIntervalDays || customIntervalDays < 1) return "Only when I choose";
      if (customIntervalDays % 30 === 0) {
        const months = customIntervalDays / 30;
        return months === 1 ? "Monthly" : `Every ${months} months`;
      }
      if (customIntervalDays % 7 === 0) {
        const weeks = customIntervalDays / 7;
        return weeks === 1 ? "Every week" : `Every ${weeks} weeks`;
      }
      if (customIntervalDays === 1) return "Every day";
      return `Every ${customIntervalDays} days`;
    }
    default:
      return "Only when I choose";
  }
};

const isContactDue = (contact: Contact) => {
  if (contact.isArchived) return false;
  if (!contact.nextContactDate) return false;
  return contact.nextContactDate <= Date.now();
};

const FilterChip = ({
  active,
  label,
  count,
  onPress,
}: {
  active: boolean;
  label: string;
  count: number;
  onPress: () => void;
}) => (
  <TouchableOpacity
    className={`rounded-full border px-4 py-3 ${
      active ? "border-sage bg-sage" : "border-border bg-surface"
    }`}
    onPress={onPress}
    activeOpacity={0.85}
  >
    <Text
      className={`text-base font-semibold ${active ? "text-white" : "text-warmgray"}`}
    >
      {label}
      <Text className={active ? "text-white" : "text-warmgray-muted"}>
        {" "}
        · {count}
      </Text>
    </Text>
  </TouchableOpacity>
);

const ContactRow = ({
  contact,
  onArchive,
  onUnarchive,
  onPress,
}: {
  contact: Contact;
  onArchive?: () => void;
  onUnarchive?: () => void;
  onPress?: () => void;
}) => {
  const due = isContactDue(contact);
  const hasReminders = contact.nextContactDate !== null;
  const statusLabel = hasReminders ? (due ? "Ready" : "Coming up") : "No reminders";

  return (
    <TouchableOpacity
      className="mb-3 rounded-2xl border border-border bg-surface p-5 shadow-sm"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-xl font-semibold text-warmgray">
            {contact.name}
          </Text>
          <Text className="text-base text-warmgray-muted">
            {formatBucketLabel(contact.bucket, contact.customIntervalDays)}
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          {hasReminders ? (
            <View
              className={`rounded-full px-4 py-2 ${due ? "bg-terracotta-100" : "bg-sage-100"}`}
            >
              <Text
                className={`text-sm font-semibold ${due ? "text-terracotta" : "text-sage"}`}
              >
                {statusLabel}
              </Text>
            </View>
          ) : (
            <View className="rounded-full border border-border bg-cream px-4 py-2">
              <Text className="text-sm font-semibold text-warmgray-muted">{statusLabel}</Text>
            </View>
          )}
          <Text className="text-2xl text-warmgray-muted -mt-0.5">›</Text>
        </View>
      </View>

      <View className="mt-4">
        <Text className="text-sm font-semibold uppercase tracking-wide text-warmgray-muted">
          Last connected
        </Text>
        <Text className="text-lg font-semibold text-warmgray">
          {formatLastConnected(contact.lastContactedAt)}
        </Text>

        <Text className="mt-3 text-sm font-semibold uppercase tracking-wide text-warmgray-muted">
          Next reminder
        </Text>
        <Text className="text-lg font-semibold text-warmgray">
          {formatNextReminder(contact.nextContactDate)}
        </Text>
      </View>

      <View className="mt-3 flex-row items-center justify-between">
        <View className="flex-1">
          {contact.phone ? (
            <Text className="text-base text-warmgray-muted">
              Phone · {formatPhoneNumber(contact.phone)}
            </Text>
          ) : null}
        </View>

        {contact.isArchived ? (
          <TouchableOpacity
            className="ml-2 flex-row items-center rounded-full bg-sage px-4 py-2"
            onPress={(e) => {
              e.stopPropagation();
              onUnarchive?.();
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh-outline" size={16} color="white" />
            <Text className="ml-1.5 text-sm font-semibold text-white">
              Unarchive
            </Text>
          </TouchableOpacity>
        ) : null}

        {!contact.isArchived && onArchive ? (
          <TouchableOpacity
            className="ml-2 flex-row items-center rounded-full bg-surface border border-border px-4 py-2"
            onPress={(e) => {
              e.stopPropagation();
              onArchive?.();
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="archive-outline" size={16} color="#78716c" />
            <Text className="ml-1.5 text-sm font-semibold text-warmgray">
              Archive
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

type ContactFilter = "all" | "due" | "archived";

export default function ContactsScreen() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<ContactFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const loadContacts = useCallback(() => {
    try {
      const results = getContacts({ includeArchived: true });
      setContacts(results);
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
    }, [loadContacts]),
  );

  const stats = useMemo(() => {
    const active = contacts.filter((contact) => !contact.isArchived);
    const archived = contacts.length - active.length;
    const due = active.filter((contact) => isContactDue(contact)).length;
    return { active: active.length, archived, due };
  }, [contacts]);

  const filteredContacts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const matchesQuery = (contact: Contact) => {
      if (!normalizedQuery) return true;
      return (
        contact.name.toLowerCase().includes(normalizedQuery) ||
        (contact.phone ?? "").toLowerCase().includes(normalizedQuery)
      );
    };

    return contacts.filter((contact) => {
      if (filter === "archived") {
        return contact.isArchived && matchesQuery(contact);
      }

      if (filter === "due") {
        return (
          !contact.isArchived && isContactDue(contact) && matchesQuery(contact)
        );
      }

      return !contact.isArchived && matchesQuery(contact);
    });
  }, [contacts, filter, searchQuery]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadContacts();
  }, [loadContacts]);

  const handleAddConnection = useCallback(() => {
    router.push("/contacts/add");
  }, [router]);

  const handleImportPress = useCallback(() => {
    router.push({ pathname: "/contacts/import", params: { autoRequest: "1" } });
  }, [router]);

  const handleArchive = useCallback(
    async (contactId: string) => {
      const contact = contacts.find((c) => c.id === contactId);
      Alert.alert(
        "Archive Connection",
        `Are you sure you want to archive ${contact?.name}? They won't appear in your main list, but you can restore them anytime.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Archive",
            style: "destructive",
            onPress: async () => {
              try {
                await archiveContact(contactId);
                loadContacts();
              } catch (error) {
                Alert.alert(
                  "Error",
                  error instanceof Error
                    ? error.message
                    : "Failed to archive connection.",
                );
              }
            },
          },
        ],
      );
    },
    [contacts, loadContacts],
  );

  const handleUnarchive = useCallback(
    async (contactId: string) => {
      try {
        await unarchiveContact(contactId);
        loadContacts();
      } catch (error) {
        Alert.alert(
          "Error",
          error instanceof Error
            ? error.message
            : "Failed to unarchive connection.",
        );
      }
    },
    [loadContacts],
  );

  const handleContactPress = useCallback(
    (contactId: string) => {
      router.push(`/contacts/${contactId}`);
    },
    [router],
  );

  const handleResetDatabase = useCallback(async () => {
    Alert.alert(
      "Reset Database",
      "This will delete all connections and shared moments. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await resetDatabase();
              loadContacts();
              Alert.alert("Success", "Database has been reset.");
            } catch (error) {
              Alert.alert(
                "Error",
                error instanceof Error
                  ? error.message
                  : "Failed to reset database.",
              );
            }
          },
        },
      ],
    );
  }, [loadContacts]);

  const emptyState = useMemo(() => {
    const hasSearchQuery = searchQuery.trim().length > 0;
    const hasZeroContacts = contacts.length === 0;

    if (hasZeroContacts) {
      return {
        type: "first-time" as const,
        title: "No connections yet",
        subtitle: "Add a connection to start gently nurturing your circle.",
        showCTA: true,
      };
    }

    if (hasSearchQuery) {
      return {
        type: "search" as const,
        title: `No connections match '${searchQuery}'`,
        subtitle: "Try a different search term.",
        showCTA: false,
      };
    }

    if (filter === "due" && stats.due === 0) {
      return {
        type: "no-due" as const,
        title: "Everyone's resting",
        subtitle: "Enjoy the quiet.",
        showCTA: false,
      };
    }

    if (filter === "archived" && stats.archived === 0) {
      return {
        type: "no-archived" as const,
        title: "No archived connections",
        subtitle: null,
        showCTA: false,
      };
    }

    if (filter === "all" && stats.active === 0 && contacts.length > 0) {
      return {
        type: "all-archived" as const,
        title: "All your connections are archived",
        subtitle: `You have ${stats.archived} archived connection${stats.archived > 1 ? "s" : ""}`,
        showCTA: true,
      };
    }

    return {
      type: "default" as const,
      title: "No connections found",
      subtitle: null,
      showCTA: false,
    };
  }, [
    searchQuery,
    contacts.length,
    filter,
    stats.due,
    stats.archived,
    stats.active,
  ]);

  const filterOptions: {
    label: string;
    value: ContactFilter;
    count: number;
  }[] = [
    { label: "All", value: "all", count: stats.active },
    { label: "Due", value: "due", count: stats.due },
    { label: "Archived", value: "archived", count: stats.archived },
  ];

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator size="large" color="#9CA986" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-cream px-4 pt-4">
      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ContactRow
            contact={item}
            onArchive={
              item.isArchived ? undefined : () => handleArchive(item.id)
            }
            onUnarchive={
              item.isArchived ? () => handleUnarchive(item.id) : undefined
            }
            onPress={() => handleContactPress(item.id)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 24,
          flexGrow: filteredContacts.length === 0 ? 1 : undefined,
        }}
        ListHeaderComponent={
          <View className="pt-4 pb-4 mb-8">
            <Text className="text-3xl font-semibold text-warmgray">Connections</Text>
            <Text className="mt-1 text-base text-warmgray-muted">
              A gentle view of the people you want to stay close to.
            </Text>

            {contacts.length > 0 && (
              <>
                <TouchableOpacity
                  className="mt-4 w-full items-center rounded-2xl bg-sage py-4"
                  onPress={handleAddConnection}
                  activeOpacity={0.9}
                >
                  <Text className="text-base font-semibold text-white">
                    Add a connection
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="mt-3 w-full items-center rounded-2xl border border-sage bg-surface py-4"
                  onPress={handleImportPress}
                  activeOpacity={0.9}
                >
                  <Text className="text-base font-semibold text-sage">
                    Import from contacts
                  </Text>
                </TouchableOpacity>

                <View className="mt-6">
                  <View className="w-full min-h-14 rounded-2xl border border-border bg-surface shadow-sm px-4 py-3 flex-row items-center">
                    <TextInput
                      className="flex-1 text-base leading-5 text-warmgray"
                      placeholder="Search connections..."
                      placeholderTextColor="#a8a29e"
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      returnKeyType="search"
                      textAlignVertical="center"
                    />
                  </View>
                </View>

                <View className="mt-5 flex-row flex-wrap gap-2">
                  {filterOptions.map((option) => (
                    <FilterChip
                      key={option.value}
                      active={filter === option.value}
                      label={option.label}
                      count={option.count}
                      onPress={() => setFilter(option.value)}
                    />
                  ))}
                </View>
              </>
            )}
          </View>
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-16">
            <Text className="text-2xl font-semibold text-warmgray">
              {emptyState.title}
            </Text>
            {emptyState.subtitle && (
              <Text className="mt-1 text-base text-warmgray-muted text-center">
                {emptyState.subtitle}
              </Text>
            )}

            {emptyState.showCTA && (
              <>
                <TouchableOpacity
                  className="mt-5 rounded-2xl bg-sage px-6 py-4"
                  onPress={
                    emptyState.type === "all-archived"
                      ? () => setFilter("archived")
                      : handleAddConnection
                  }
                  activeOpacity={0.9}
                >
                  <Text className="text-lg font-semibold text-white">
                    {emptyState.type === "all-archived"
                      ? "View archived"
                      : "Add a connection"}
                  </Text>
                </TouchableOpacity>

                {emptyState.type !== "all-archived" && (
                  <TouchableOpacity
                    className="mt-3 rounded-2xl border border-sage bg-surface px-6 py-4"
                    onPress={handleImportPress}
                    activeOpacity={0.9}
                  >
                    <Text className="text-lg font-semibold text-sage">
                      Import from contacts
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}
