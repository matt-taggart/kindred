import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  Linking,
  Platform,
  RefreshControl,
  SafeAreaView,
  SectionList,
  Text,
  TouchableOpacity,
  UIManager,
  View,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Contact } from '@/db/schema';
import { getDueContactsGrouped, GroupedDueContacts, snoozeContact, isBirthdayToday, updateInteraction } from '@/services/contactService';
import CelebrationStatus from '@/components/CelebrationStatus';
import ReachedOutSheet from '@/components/ReachedOutSheet';
import { formatLastConnected, getClockColor, ClockColor } from '@/utils/timeFormatting';
import { formatPhoneUrl } from '@/utils/phone';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Section = {
  title: string;
  data: Contact[];
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;

type ContactCardProps = {
  contact: Contact;
  onMarkDone: () => void;
  onSnooze: () => void;
  isSnoozing?: boolean;
  onPress: () => void;
  highlightReachedOut?: boolean;
};

const ContactCard = ({ contact, onMarkDone, onSnooze, isSnoozing = false, onPress, highlightReachedOut }: ContactCardProps) => {
  const initial = useMemo(() => contact.name.charAt(0).toUpperCase(), [contact.name]);
  const isBirthday = isBirthdayToday(contact);

  const handleCall = useCallback(() => {
    if (!contact.phone) return;
    Linking.openURL(`tel:${formatPhoneUrl(contact.phone)}`);
  }, [contact.phone]);

  const handleText = useCallback(() => {
    if (!contact.phone) return;
    Linking.openURL(`sms:${formatPhoneUrl(contact.phone)}`);
  }, [contact.phone]);

  const clockColor = isBirthday ? null : getClockColor(contact.lastContactedAt);

  const clockColorClass: Record<ClockColor, string> = {
    'sage': '#9CA986',
    'warmgray-muted': '#9A9A8E',
    'amber': '#D4A574',
  };

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
              ? (isBirthday ? 'bg-terracotta border-terracotta' : 'bg-cream border-border')
              : (isBirthday ? 'bg-transparent border-terracotta-100/50' : 'bg-transparent border-sage')
          }`}
          onPress={onSnooze}
          activeOpacity={0.85}
          disabled={isSnoozing}
        >
          <Text className={`text-lg font-semibold ${
            isSnoozing
              ? (isBirthday ? 'text-terracotta-100' : 'text-warmgray-muted')
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
  const [groupedContacts, setGroupedContacts] = useState<GroupedDueContacts>({ birthdays: [], reconnect: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [snoozingContactId, setSnoozingContactId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showReachedOutSheet, setShowReachedOutSheet] = useState(false);
  const [completionCount, setCompletionCount] = useState(0);

  const loadContacts = useCallback(() => {
    try {
      const results = getDueContactsGrouped();
      setGroupedContacts(results);
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

  const sections: Section[] = useMemo(() => {
    const result: Section[] = [];
    if (groupedContacts.birthdays.length > 0) {
      result.push({ title: 'Birthdays', data: groupedContacts.birthdays });
    }
    if (groupedContacts.reconnect.length > 0) {
      result.push({ title: 'Time to reconnect', data: groupedContacts.reconnect });
    }
    return result;
  }, [groupedContacts]);

  const totalContacts = groupedContacts.birthdays.length + groupedContacts.reconnect.length;

  const handleMarkDone = useCallback((contact: Contact) => {
    setSelectedContact(contact);
    setShowReachedOutSheet(true);
  }, []);

  const handleReachedOutSubmit = useCallback(async (note: string) => {
    if (!selectedContact) return;

    try {
      await updateInteraction(selectedContact.id, 'call', note || undefined);
      setCompletionCount(prev => prev + 1);

      // Animate the list change
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
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

  const renderSectionHeader = useCallback(({ section }: { section: Section }) => (
    <Text className="text-lg font-semibold text-warmgray-muted mb-3 mt-6">
      {section.title}
    </Text>
  ), []);

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
      <View className="flex-1 px-4 pt-6">
        <Text className="mb-1 text-3xl font-semibold text-warmgray">Today</Text>
        <Text className="text-lg text-warmgray-muted font-medium">
          {currentDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </Text>

        {totalContacts > 0 && (
          <Text className="mt-2 text-base text-warmgray-muted">
            Who would you like to reach out to?
          </Text>
        )}

        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{
            paddingBottom: 24,
            flexGrow: totalContacts === 0 ? 1 : undefined,
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<CelebrationStatus completionCount={completionCount} />}
          ListFooterComponent={
            totalContacts > 0 && completionCount > 0 ? (
              <Text className="text-center text-warmgray-muted mt-6">
                {completionCount} {completionCount === 1 ? 'connection' : 'connections'} nurtured today
              </Text>
            ) : null
          }
          stickySectionHeadersEnabled={false}
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
