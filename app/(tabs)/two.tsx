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

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const formatBucketLabel = (
  bucket: Contact["bucket"],
  customIntervalDays?: number | null,
) => {
  switch (bucket) {
    case "daily": return "Daily";
    case "weekly": return "Weekly";
    case "bi-weekly": return "Every 2 weeks";
    case "every-three-weeks": return "Every 3 weeks";
    case "monthly": return "Monthly";
    case "every-six-months": return "Seasonally";
    case "yearly": return "Yearly";
    case "custom": {
        if (!customIntervalDays) return "Custom";
        return `${customIntervalDays} days`;
    }
    default: return "Custom";
  }
};

const formatLastContacted = (lastContactedAt?: number | null) => {
  if (!lastContactedAt) return "No prior connection";

  const diff = Math.max(0, Date.now() - lastContactedAt);
  const days = Math.floor(diff / DAY_IN_MS);

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
};

const formatNextCheckIn = (nextContactDate?: number | null) => {
  if (!nextContactDate) return "None";

  const diff = nextContactDate - Date.now();
  if (diff <= 0) return "Due";

  const days = Math.ceil(diff / DAY_IN_MS);
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
};

const isContactDue = (contact: Contact) => {
  if (contact.isArchived) return false;
  if (!contact.nextContactDate) return true;
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
    className={`rounded-full border px-4 py-2 ${
      active ? "border-sage bg-sage" : "border-border bg-white"
    }`}
    onPress={onPress}
    activeOpacity={0.85}
  >
    <Text
      className={`text-sm font-medium ${active ? "text-white" : "text-slate-600"}`}
    >
      {label}
      <Text className={active ? "text-white" : "text-slate-400"}>
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
  const initial = contact.name.charAt(0).toUpperCase();

  return (
    <TouchableOpacity
      className="mb-4 rounded-3xl bg-surface p-5 shadow-sm shadow-slate-200/50 border border-border/50"
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View className="flex-row items-center justify-between mb-4">
         <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-sage/10">
                <Text className="text-base font-semibold text-sage">{initial}</Text>
            </View>
            <View>
                <Text className="text-lg font-semibold text-slate-900">{contact.name}</Text>
                <Text className="text-sm text-sage-muted">{formatBucketLabel(contact.bucket, contact.customIntervalDays)}</Text>
            </View>
         </View>

        {due && (
           <View className="bg-terracotta/10 px-3 py-1 rounded-full">
              <Text className="text-xs font-semibold text-terracotta">Due</Text>
           </View>
        )}
      </View>

      <View className="flex-row justify-between items-center border-t border-border/50 pt-3">
         <View>
             <Text className="text-xs font-medium uppercase tracking-wide text-slate-400">Last connected</Text>
             <Text className="text-sm font-medium text-slate-700 mt-0.5">{formatLastContacted(contact.lastContactedAt)}</Text>
         </View>
         <View className="items-end">
             <Text className="text-xs font-medium uppercase tracking-wide text-slate-400">Next</Text>
             <Text className="text-sm font-medium text-slate-700 mt-0.5">{formatNextCheckIn(contact.nextContactDate)}</Text>
         </View>
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

  const handleImportPress = useCallback(() => {
    router.push({ pathname: "/contacts/import", params: { autoRequest: "1" } });
  }, [router]);

  const handleAddPress = useCallback(() => {
    router.push("/contacts/new");
  }, [router]);

  const handleContactPress = useCallback(
    (contactId: string) => {
      router.push(`/contacts/${contactId}`);
    },
    [router],
  );

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
    <SafeAreaView className="flex-1 bg-cream">
      <View className="px-5 pt-4 pb-2 bg-cream">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-3xl font-semibold text-slate-900 tracking-tight">Contacts</Text>
            <TouchableOpacity 
                className="bg-sage h-10 w-10 items-center justify-center rounded-full shadow-sm"
                onPress={handleAddPress}
            >
                <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <View className="flex-col gap-3 mb-6 items-center">
            <TouchableOpacity
              className="w-full max-w-[260px] bg-sage py-3.5 rounded-2xl items-center justify-center shadow-sm shadow-sage/20"
              onPress={handleAddPress}
            >
              <Text className="text-white font-semibold text-center" numberOfLines={1}>
                Add a connection
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="w-full max-w-[260px] bg-white py-3.5 rounded-2xl items-center justify-center shadow-sm shadow-sage/30"
              onPress={handleImportPress}
            >
              <Text className="text-sage font-semibold text-center" numberOfLines={1}>
                Import from contacts
              </Text>
            </TouchableOpacity>
          </View>
          
          <View className="mb-4">
             <TextInput
                className="w-full bg-white border border-border rounded-xl px-4 py-3 text-base text-slate-900"
                placeholder="Search..."
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
             />
          </View>

          <View className="flex-row gap-2 mb-2">
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
      </View>

      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ContactRow
            contact={item}
            onPress={() => handleContactPress(item.id)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9CA986" />
        }
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 24,
          flexGrow: 1,
        }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20 opacity-60">
             <Text className="text-lg text-slate-500 font-medium">No contacts found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
