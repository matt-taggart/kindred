import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Contact } from '@/db/schema';
import { getContacts } from '@/services/contactService';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const bucketLabels: Record<Contact['bucket'], string> = {
  daily: 'Daily cadence',
  weekly: 'Weekly cadence',
  monthly: 'Monthly cadence',
  yearly: 'Yearly cadence',
};

const formatLastSpoke = (lastContactedAt?: number | null) => {
  if (!lastContactedAt) return 'Never';

  const diff = Math.max(0, Date.now() - lastContactedAt);
  const days = Math.floor(diff / DAY_IN_MS);

  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
};

const formatNextCheckIn = (nextContactDate?: number | null) => {
  if (!nextContactDate) return 'Not scheduled';

  const diff = nextContactDate - Date.now();
  if (diff <= 0) return 'Due now';

  const days = Math.ceil(diff / DAY_IN_MS);
  if (days === 1) return 'Tomorrow';
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
      active ? 'border-indigo-600 bg-indigo-600' : 'border-gray-200 bg-white'
    }`}
    onPress={onPress}
    activeOpacity={0.85}
  >
    <Text className={`text-sm font-semibold ${active ? 'text-white' : 'text-gray-700'}`}>
      {label}
      <Text className={active ? 'text-white' : 'text-gray-400'}> · {count}</Text>
    </Text>
  </TouchableOpacity>
);

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <View className="min-w-[30%] flex-1 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
    <Text className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</Text>
    <Text className="mt-2 text-2xl font-bold text-gray-900">{value}</Text>
  </View>
);

const ContactRow = ({ contact }: { contact: Contact }) => {
  const due = isContactDue(contact);

  return (
    <View className="mb-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-lg font-semibold text-gray-900">{contact.name}</Text>
          <Text className="text-sm text-gray-500">{bucketLabels[contact.bucket]}</Text>
        </View>

        <View
          className={`rounded-full px-3 py-1 ${due ? 'bg-amber-100' : 'bg-emerald-50'}`}
        >
          <Text className={`text-xs font-semibold ${due ? 'text-amber-700' : 'text-emerald-700'}`}>
            {due ? 'Due' : 'Upcoming'}
          </Text>
        </View>
      </View>

      <View className="mt-4 rounded-2xl border border-dashed border-gray-200 p-3">
        <Text className="text-xs font-semibold uppercase tracking-wide text-gray-500">Last spoke</Text>
        <Text className="text-base font-semibold text-gray-900">{formatLastSpoke(contact.lastContactedAt)}</Text>

        <Text className="mt-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Next check-in
        </Text>
        <Text className="text-base font-semibold text-gray-900">
          {formatNextCheckIn(contact.nextContactDate)}
        </Text>
      </View>

      {contact.phone ? (
        <Text className="mt-3 text-sm text-gray-500">Phone · {contact.phone}</Text>
      ) : null}

      {contact.isArchived ? (
        <Text className="mt-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Archived
        </Text>
      ) : null}
    </View>
  );
};

type ContactFilter = 'all' | 'due' | 'archived';

export default function ContactsScreen() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<ContactFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadContacts = useCallback(() => {
    try {
      const results = getContacts({ includeArchived: true });
      setContacts(results);
    } catch (error) {
      console.warn('Failed to load contacts:', error);
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
        (contact.phone ?? '').toLowerCase().includes(normalizedQuery)
      );
    };

    return contacts.filter((contact) => {
      if (filter === 'archived') {
        return contact.isArchived && matchesQuery(contact);
      }

      if (filter === 'due') {
        return !contact.isArchived && isContactDue(contact) && matchesQuery(contact);
      }

      return !contact.isArchived && matchesQuery(contact);
    });
  }, [contacts, filter, searchQuery]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadContacts();
  }, [loadContacts]);

  const handleImportPress = useCallback(() => {
    router.push('/contacts/import');
  }, [router]);

  const filterOptions: { label: string; value: ContactFilter; count: number }[] = [
    { label: 'All', value: 'all', count: stats.active },
    { label: 'Due', value: 'due', count: stats.due },
    { label: 'Archived', value: 'archived', count: stats.archived },
  ];

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#4f46e5" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 px-4 pt-4">
      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ContactRow contact={item} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{
          paddingBottom: 24,
          flexGrow: filteredContacts.length === 0 ? 1 : undefined,
        }}
        ListHeaderComponent={
          <View className="pb-2">
            <Text className="text-2xl font-bold text-gray-900">Contacts</Text>
            <Text className="mt-1 text-sm text-gray-500">
              Import friends from your phone and see who is due next.
            </Text>

            <View className="mt-4 flex-row gap-3">
              <TextInput
                className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900"
                placeholder="Search by name or number"
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
              />

              <TouchableOpacity
                className="items-center justify-center rounded-2xl bg-indigo-600 px-4"
                onPress={handleImportPress}
                activeOpacity={0.9}
              >
                <Text className="text-base font-semibold text-white">Import</Text>
              </TouchableOpacity>
            </View>

            <View className="mt-3 flex-row flex-wrap gap-2">
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

            <View className="mt-4 flex-row flex-wrap gap-3">
              <StatCard label="Active" value={stats.active} />
              <StatCard label="Due" value={stats.due} />
              <StatCard label="Archived" value={stats.archived} />
            </View>
          </View>
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-16">
            <Text className="text-base text-gray-500">No contacts yet.</Text>
            <Text className="mt-1 text-sm text-gray-400 text-center">
              Import from your phone to start building your circle.
            </Text>

            <TouchableOpacity
              className="mt-5 rounded-2xl bg-indigo-600 px-6 py-3"
              onPress={handleImportPress}
              activeOpacity={0.9}
            >
              <Text className="text-base font-semibold text-white">Import from Phone</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}
