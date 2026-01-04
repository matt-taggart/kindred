import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Contact } from '@/db/schema';
import { getDueContacts } from '@/services/contactService';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const formatLastSpoke = (lastContactedAt?: number | null) => {
  if (!lastContactedAt) {
    return 'Never';
  }

  const diff = Math.max(0, Date.now() - lastContactedAt);
  const days = Math.floor(diff / DAY_IN_MS);

  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
};

type ContactCardProps = {
  contact: Contact;
  onMarkDone: () => void;
  onSnooze: () => void;
};

const ContactCard = ({ contact, onMarkDone, onSnooze }: ContactCardProps) => {
  const initial = useMemo(() => contact.name.charAt(0).toUpperCase(), [contact.name]);

  return (
    <View className="mb-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <View className="flex-row items-center gap-3">
        {contact.avatarUri ? (
          <Image
            source={{ uri: contact.avatarUri }}
            className="h-12 w-12 rounded-full"
            resizeMode="cover"
          />
        ) : (
          <View className="h-12 w-12 items-center justify-center rounded-full bg-sage">
            <Text className="text-base font-semibold text-white">{initial}</Text>
          </View>
        )}

        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900">{contact.name}</Text>
          <Text className="text-sm text-gray-500">Last spoke: {formatLastSpoke(contact.lastContactedAt)}</Text>
        </View>
      </View>

      <View className="mt-4 flex-row gap-2">
        <TouchableOpacity
          className="flex-1 items-center rounded-lg bg-sage py-4"
          onPress={onMarkDone}
          activeOpacity={0.85}
        >
          <Text className="font-semibold text-white">Mark Done</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 items-center rounded-lg bg-gray-200 py-4"
          onPress={onSnooze}
          activeOpacity={0.85}
        >
          <Text className="font-semibold text-gray-800">Snooze</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadContacts = useCallback(() => {
    try {
      const results = getDueContacts();
      setContacts(results);
    } catch (e) {
      console.warn('Failed to load contacts:', e);
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

  const handleMarkDone = useCallback(
    (contactId: string) => {
      router.push({ pathname: '/modal', params: { contactId } });
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: Contact }) => (
      <ContactCard
        contact={item}
        onMarkDone={() => handleMarkDone(item.id)}
        onSnooze={() => {}}
      />
    ),
    [handleMarkDone],
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadContacts();
  }, [loadContacts]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator size="large" color="#9CA986" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="flex-1 px-4 pt-4">
        <Text className="mb-4 text-2xl font-bold text-gray-900">Today</Text>

        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{
            paddingBottom: 24,
            flexGrow: contacts.length === 0 ? 1 : undefined,
          }}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center">
              <Text className="text-base text-gray-500">You&apos;re all caught up for today.</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}
