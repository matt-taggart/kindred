import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
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
} from 'react-native';

import { Contact } from '@/db/schema';
import { archiveContact, getContacts, resetDatabase, unarchiveContact } from '@/services/contactService';
import { sendTestNotification } from '@/services/notificationService';
import { isDevelopment } from '@/utils/env';
import { ensureDemoContacts } from '@/services/demoSeed';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const bucketLabels: Record<Contact['bucket'], string> = {
  daily: 'Daily reminders',
  weekly: 'Weekly reminders',
  monthly: 'Monthly reminders',
  yearly: 'Yearly reminders',
};

const formatLastContacted = (lastContactedAt?: number | null) => {
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
    className={`rounded-full border px-4 py-3 ${
      active ? 'border-sage bg-sage' : 'border-gray-200 bg-white'
    }`}
    onPress={onPress}
    activeOpacity={0.85}
  >
    <Text className={`text-base font-semibold ${active ? 'text-white' : 'text-gray-700'}`}>
      {label}
      <Text className={active ? 'text-white' : 'text-gray-400'}> · {count}</Text>
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

  return (
    <TouchableOpacity
      className="mb-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-xl font-semibold text-gray-900">{contact.name}</Text>
          <Text className="text-base text-gray-500">{bucketLabels[contact.bucket]}</Text>
        </View>

        <View className="flex-row items-center gap-2">
          <View
            className={`rounded-full px-4 py-2 ${due ? 'bg-terracotta-100' : 'bg-sage'}`}
          >
            <Text className={`text-sm font-semibold ${due ? 'text-terracotta' : 'text-white'}`}>
              {due ? 'Due' : 'Upcoming'}
            </Text>
          </View>
          <Text className="text-2xl text-gray-400 -mt-0.5">›</Text>
        </View>
      </View>

      <View className="mt-4 rounded-2xl border border-dashed border-gray-200 p-3">
        <Text className="text-sm font-semibold uppercase tracking-wide text-gray-500">Last contacted</Text>
        <Text className="text-lg font-semibold text-gray-900">{formatLastContacted(contact.lastContactedAt)}</Text>

        <Text className="mt-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Next check-in
        </Text>
        <Text className="text-lg font-semibold text-gray-900">
          {formatNextCheckIn(contact.nextContactDate)}
        </Text>
      </View>

      {contact.phone ? (
        <Text className="mt-3 text-base text-gray-500">Phone · {contact.phone}</Text>
      ) : null}

      {contact.isArchived ? (
        <View className="mt-3 items-end">
          <TouchableOpacity
            className="rounded-xl border border-sage px-4 py-3"
            onPress={(e) => {
              e.stopPropagation();
              onUnarchive?.();
            }}
            activeOpacity={0.85}
          >
            <Text className="text-sm font-semibold text-sage">Unarchive</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {!contact.isArchived && onArchive ? (
        <TouchableOpacity
          className="mt-3 rounded-xl border border-gray-300 px-4 py-3 self-end"
          onPress={(e) => {
            e.stopPropagation();
            onArchive?.();
          }}
          activeOpacity={0.85}
        >
          <Text className="text-sm font-semibold text-gray-600">Archive</Text>
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
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

  const handleArchive = useCallback(
    async (contactId: string) => {
      try {
        await archiveContact(contactId);
        loadContacts();
      } catch (error) {
        Alert.alert('Error', error instanceof Error ? error.message : 'Failed to archive contact.');
      }
    },
    [loadContacts],
  );

  const handleUnarchive = useCallback(
    async (contactId: string) => {
      try {
        await unarchiveContact(contactId);
        loadContacts();
      } catch (error) {
        Alert.alert('Error', error instanceof Error ? error.message : 'Failed to unarchive contact.');
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
      'Reset Database',
      'This will delete all contacts and interactions. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetDatabase();
              await ensureDemoContacts();
              loadContacts();
              Alert.alert('Success', 'Database has been reset with demo contacts restored.');
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to reset database.');
            }
          },
        },
      ],
    );
  }, [loadContacts]);

  const handleTestNotification = useCallback(async () => {
    try {
      const result = await sendTestNotification();
      if (result.success) {
        Alert.alert(
          'Test Notification Sent',
          'A test notification will appear in 2 seconds. If you do not see it, please check your notification permissions.',
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to send test notification.');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to send test notification.');
    }
  }, []);

  const emptyState = useMemo(() => {
    const hasSearchQuery = searchQuery.trim().length > 0;
    const hasZeroContacts = contacts.length === 0;

    if (hasZeroContacts) {
      return {
        type: 'first-time' as const,
        title: 'No contacts yet.',
        subtitle: 'Import from your phone to start building your circle.',
        showCTA: true,
      };
    }

    if (hasSearchQuery) {
      return {
        type: 'search' as const,
        title: `No contacts match '${searchQuery}'.`,
        subtitle: 'Try a different search term.',
        showCTA: false,
      };
    }

    if (filter === 'due' && stats.due === 0) {
      return {
        type: 'no-due' as const,
        title: 'No contacts are due right now.',
        subtitle: "Great job staying on top of things!",
        showCTA: false,
      };
    }

    if (filter === 'archived' && stats.archived === 0) {
      return {
        type: 'no-archived' as const,
        title: 'No archived contacts.',
        subtitle: null,
        showCTA: false,
      };
    }

    if (filter === 'all' && stats.active === 0 && contacts.length > 0) {
      return {
        type: 'all-archived' as const,
        title: 'All your contacts are archived.',
        subtitle: null,
        showCTA: false,
      };
    }

    return {
      type: 'default' as const,
      title: 'No contacts found.',
      subtitle: null,
      showCTA: false,
    };
  }, [searchQuery, contacts.length, filter, stats.due, stats.archived, stats.active]);

  const filterOptions: { label: string; value: ContactFilter; count: number }[] = [
    { label: 'All', value: 'all', count: stats.active },
    { label: 'Due', value: 'due', count: stats.due },
    { label: 'Archived', value: 'archived', count: stats.archived },
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
            onArchive={item.isArchived ? undefined : () => handleArchive(item.id)}
            onUnarchive={item.isArchived ? () => handleUnarchive(item.id) : undefined}
            onPress={() => handleContactPress(item.id)}
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 24,
          flexGrow: filteredContacts.length === 0 ? 1 : undefined,
        }}
        ListHeaderComponent={
          <View className="pb-4">
            <Text className="text-2xl font-bold text-gray-900">Contacts</Text>
            <Text className="mt-1 text-base text-gray-500">
              See who is due next and manage your circle.
            </Text>

            <TouchableOpacity
              className="mt-4 w-full items-center rounded-2xl bg-sage py-4"
              onPress={handleImportPress}
              activeOpacity={0.9}
            >
              <Text className="text-base font-semibold text-white">Import from Phone</Text>
            </TouchableOpacity>

            <View className="mt-6">
              <TextInput
                className="w-full h-12 rounded-2xl border border-gray-200 bg-white text-base text-gray-900 shadow-sm px-4 justify-center"
                placeholder="Search by name or number"
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
              />
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

            {isDevelopment() && (
              <>
                <View className="mt-6 border-t border-dashed border-gray-300 pt-6">
                  <Text className="text-xs font-bold uppercase text-gray-400 tracking-wide">
                    Development Tools
                  </Text>
                  <View className="mt-3 flex-row gap-3">
                    <TouchableOpacity
                      className="flex-1 items-center rounded-xl border border-blue-300 bg-blue-50 px-4 py-3"
                      onPress={handleTestNotification}
                      activeOpacity={0.7}
                    >
                      <Text className="text-sm font-semibold text-blue-600">Test Notification</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 items-center rounded-xl border border-red-300 bg-red-50 px-4 py-3"
                      onPress={handleResetDatabase}
                      activeOpacity={0.7}
                    >
                      <Text className="text-sm font-semibold text-red-600">Reset Database</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-16">
            <Text className="text-base text-gray-500">{emptyState.title}</Text>
            {emptyState.subtitle && (
              <Text className="mt-1 text-sm text-gray-400 text-center">
                {emptyState.subtitle}
              </Text>
            )}

            {emptyState.showCTA && (
              <TouchableOpacity
                className="mt-5 rounded-2xl bg-sage px-6 py-4"
                onPress={handleImportPress}
                activeOpacity={0.9}
              >
                <Text className="text-base font-semibold text-white">Import from Phone</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}
