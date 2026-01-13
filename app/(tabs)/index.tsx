import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Contact } from '@/db/schema';
import { getDueContacts, snoozeContact, isBirthdayToday, updateInteraction } from '@/services/contactService';
import CelebrationStatus from '@/components/CelebrationStatus';
import ReachedOutSheet from '@/components/ReachedOutSheet';
import { formatLastConnected } from '@/utils/timeFormatting';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

type ContactCardProps = {
  contact: Contact;
  onMarkDone: () => void;
  onSnooze: () => void;
  isSnoozing?: boolean;
  onPress: () => void;
};

const ContactCard = ({ contact, onMarkDone, onSnooze, isSnoozing = false, onPress }: ContactCardProps) => {
  const initial = useMemo(() => contact.name.charAt(0).toUpperCase(), [contact.name]);
  const isBirthday = isBirthdayToday(contact);

  return (
    <View className={`mb-3 rounded-2xl border p-5 shadow-sm ${isBirthday ? 'bg-terracotta border-terracotta' : 'bg-surface border-border'}`}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <View className="flex-row items-center gap-3">
          {contact.avatarUri ? (
            <Image
              source={{ uri: contact.avatarUri }}
              className="h-12 w-12 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <View className={`h-12 w-12 items-center justify-center rounded-full ${isBirthday ? 'bg-white/20' : 'bg-sage'}`}>
              <Text className="text-base font-semibold text-white">{initial}</Text>
            </View>
          )}

          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className={`text-xl font-semibold ${isBirthday ? 'text-white' : 'text-warmgray'}`}>{contact.name}</Text>
              {isBirthday && <Text className="text-xl">🎂</Text>}
            </View>

            {isBirthday ? (
              <Text className="text-base text-terracotta-100 font-medium">It's {contact.name}'s birthday</Text>
            ) : (
              <Text className="text-base text-warmgray-muted">{formatLastConnected(contact.lastContactedAt)}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>

      <View className="mt-4 flex-row gap-2">
        <TouchableOpacity
          className={`flex-1 items-center rounded-2xl py-3 border-2 ${isBirthday ? 'bg-white border-white' : 'bg-sage border-transparent'}`}
          onPress={onMarkDone}
          activeOpacity={0.85}
        >
          <Text className={`text-lg font-semibold ${isBirthday ? 'text-terracotta' : 'text-white'}`}>Reached out</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 items-center rounded-2xl py-3 border-2 ${
            isSnoozing
              ? (isBirthday ? 'bg-terracotta border-terracotta' : 'bg-gray-100 border-gray-200')
              : (isBirthday ? 'bg-transparent border-terracotta-100/50' : 'bg-transparent border-sage')
          }`}
          onPress={onSnooze}
          activeOpacity={0.85}
          disabled={isSnoozing}
        >
          <Text className={`text-lg font-semibold ${
            isSnoozing
              ? (isBirthday ? 'text-terracotta-100' : 'text-gray-400')
              : (isBirthday ? 'text-terracotta-100' : 'text-sage')
          }`}>
            {isSnoozing ? 'Later...' : 'Later'}
          </Text>
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
  const [snoozingContactId, setSnoozingContactId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showReachedOutSheet, setShowReachedOutSheet] = useState(false);

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

  const handleMarkDone = useCallback((contact: Contact) => {
    setSelectedContact(contact);
    setShowReachedOutSheet(true);
  }, []);

  const handleReachedOutSubmit = useCallback(async (note: string) => {
    if (!selectedContact) return;

    try {
      await updateInteraction(selectedContact.id, 'call', note || undefined);
      loadContacts();
    } catch (error) {
      Alert.alert('Error', 'Failed to save. Please try again.');
    } finally {
      setShowReachedOutSheet(false);
      setSelectedContact(null);
    }
  }, [selectedContact, loadContacts]);

  const handleContactPress = useCallback(
    (contactId: string) => {
      router.push(`/contacts/${contactId}`);
    },
    [router],
  );

  const handleSnooze = useCallback(
    async (contact: Contact) => {
      const now = Date.now();
      const options = [
        { text: '1 hour', value: now + 60 * 60 * 1000 },
        { text: 'Tomorrow', value: now + DAY_IN_MS },
        { text: '3 days', value: now + 3 * DAY_IN_MS },
        { text: '1 week', value: now + 7 * DAY_IN_MS },
        { text: 'Cancel', style: 'cancel' as const },
      ];

      Alert.alert(
        'Remind me later',
        'When would you like a gentle reminder?',
        [
          { text: '1 hour', onPress: () => handleSnoozeContact(contact.id, now + 60 * 60 * 1000) },
          { text: 'Tomorrow', onPress: () => handleSnoozeContact(contact.id, now + DAY_IN_MS) },
          { text: '3 days', onPress: () => handleSnoozeContact(contact.id, now + 3 * DAY_IN_MS) },
          { text: '1 week', onPress: () => handleSnoozeContact(contact.id, now + 7 * DAY_IN_MS) },
          { text: 'Cancel', style: 'cancel' },
        ],
      );
    },
    [],
  );

  const handleSnoozeContact = useCallback(
    async (contactId: string, untilDate: number) => {
      setSnoozingContactId(contactId);
      try {
        await snoozeContact(contactId, untilDate);
        loadContacts();
      } catch (error) {
        Alert.alert('Error', error instanceof Error ? error.message : 'Failed to snooze contact.');
      } finally {
        setSnoozingContactId(null);
      }
    },
    [loadContacts],
  );

  const renderItem = useCallback(
    ({ item }: { item: Contact }) => (
      <ContactCard
        contact={item}
        onMarkDone={() => handleMarkDone(item)}
        onSnooze={() => handleSnooze(item)}
        isSnoozing={snoozingContactId === item.id}
        onPress={() => handleContactPress(item.id)}
      />
    ),
    [handleMarkDone, handleSnooze, snoozingContactId, handleContactPress],
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
        <Text className="mb-1 text-3xl font-semibold text-warmgray">Today</Text>
        <Text className="mb-8 text-lg text-warmgray-muted font-medium">
          {currentDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </Text>

        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{
            paddingBottom: 24,
            flexGrow: contacts.length === 0 ? 1 : undefined,
          }}
          ListEmptyComponent={<CelebrationStatus />}
        />
      </View>

      <ReachedOutSheet
        visible={showReachedOutSheet}
        contact={selectedContact}
        onClose={() => {
          setShowReachedOutSheet(false);
          setSelectedContact(null);
        }}
        onSubmit={handleReachedOutSubmit}
      />
    </SafeAreaView>
  );
}
