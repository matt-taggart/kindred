import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Contact } from '@/db/schema';
import { getDueContacts, snoozeContact, isBirthdayToday, logInteraction } from '@/services/contactService';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const formatLastContacted = (lastContactedAt?: number | null) => {
  if (!lastContactedAt) {
    return 'No prior connection';
  }

  const diff = Math.max(0, Date.now() - lastContactedAt);
  const days = Math.floor(diff / DAY_IN_MS);

  if (days === 0) return 'Connected today';
  if (days === 1) return 'Connected yesterday';
  if (days < 7) return 'Connected recently';
  if (days < 14) return 'Connected last week';
  if (days < 30) return 'Connected this month';
  return 'Connected last month';
};

type HomeConnectionCardProps = {
  contact: Contact;
  onReachOut: () => void;
  onLater: () => void;
  onPress: () => void;
};

const HomeConnectionCard = ({ contact, onReachOut, onLater, onPress }: HomeConnectionCardProps) => {
  const initial = contact.name.charAt(0).toUpperCase();
  const isBirthday = isBirthdayToday(contact);

  return (
    <View className="mb-4 rounded-3xl bg-surface p-6 shadow-sm shadow-slate-200/50">
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <View className="flex-row items-center gap-4">
          {contact.avatarUri ? (
            <Image
              source={{ uri: contact.avatarUri }}
              className="h-14 w-14 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <View className={`h-14 w-14 items-center justify-center rounded-full ${isBirthday ? 'bg-terracotta' : 'bg-sage'}`}>
              <Text className="text-xl font-semibold text-white">{initial}</Text>
            </View>
          )}

          <View className="flex-1">
            <Text className="text-xl font-semibold text-slate-900">{contact.name}</Text>
            {isBirthday ? (
              <Text className="text-base text-terracotta font-medium">It's {contact.name}'s birthday</Text>
            ) : (
              <Text className="text-base text-sage-muted">{formatLastContacted(contact.lastContactedAt)}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>

      <View className="mt-6 flex-row gap-3">
        <TouchableOpacity
          className="flex-1 items-center justify-center rounded-full bg-sage py-3 shadow-sm shadow-sage/20"
          onPress={onReachOut}
          activeOpacity={0.9}
        >
          <Text className="text-base font-semibold text-white">Reached out</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 items-center justify-center rounded-full border border-border bg-transparent py-3"
          onPress={onLater}
          activeOpacity={0.7}
        >
          <Text className="text-base font-medium text-slate-600">Later</Text>
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
  const [currentDate] = useState(new Date());

  // Ritual Modal State
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [ritualStep, setRitualStep] = useState<'initial' | 'note'>('initial');
  const [note, setNote] = useState('');

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

  const handleReachOut = (contact: Contact) => {
    setActiveContact(contact);
    setRitualStep('initial');
    setNote('');
  };

  const handleLater = async (contact: Contact) => {
    // Default snooze to tomorrow for "Later"
    try {
      await snoozeContact(contact.id, Date.now() + DAY_IN_MS);
      loadContacts();
    } catch (e) {
      console.warn(e);
    }
  };

  const handleContactPress = (contactId: string) => {
    router.push(`/contacts/${contactId}`);
  };

  const completeRitual = async () => {
    if (!activeContact) return;
    try {
      await logInteraction({
        contactId: activeContact.id,
        type: 'call', // Defaulting to generic call/meet, could be enhanced later
        date: Date.now(),
        notes: note.trim() || undefined,
      });
      setActiveContact(null);
      loadContacts();
    } catch (e) {
      console.error(e);
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: Contact }) => (
      <HomeConnectionCard
        contact={item}
        onReachOut={() => handleReachOut(item)}
        onLater={() => handleLater(item)}
        onPress={() => handleContactPress(item.id)}
      />
    ),
    [handleContactPress],
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
      <View className="flex-1 px-5 pt-6">
        <View className="mb-8">
          <Text className="text-3xl font-semibold text-slate-900 tracking-tight">Today</Text>
          <Text className="text-lg text-sage-muted mt-1">
            {currentDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9CA986" />}
          contentContainerStyle={{
            paddingBottom: 40,
            flexGrow: 1,
          }}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20 opacity-60">
              <Ionicons name="leaf-outline" size={48} color="#9CA986" />
              <Text className="mt-4 text-lg text-slate-600 font-medium text-center">
                Your connections are resting.
              </Text>
              <Text className="text-base text-slate-500 text-center mt-1">
                Enjoy your day.
              </Text>
            </View>
          }
        />
      </View>

      {/* Flexible Ritual Modal */}
      <Modal
        visible={!!activeContact}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveContact(null)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-end bg-black/20"
        >
          <TouchableWithoutFeedback onPress={() => setActiveContact(null)}>
             <View className="absolute inset-0" />
          </TouchableWithoutFeedback>
          
          <View className="bg-surface rounded-t-3xl p-8 shadow-2xl">
            {ritualStep === 'initial' ? (
              <>
                <View className="items-center mb-6">
                  <View className="h-16 w-16 bg-sage/20 rounded-full items-center justify-center mb-4">
                    <Ionicons name="checkmark" size={32} color="#9CA986" />
                  </View>
                  <Text className="text-2xl font-semibold text-slate-900 text-center">
                    Connected with {activeContact?.name}
                  </Text>
                </View>

                <TouchableOpacity
                  className="w-full bg-cream border border-sage/30 rounded-2xl p-4 mb-4"
                  onPress={() => setRitualStep('note')}
                >
                  <Text className="text-slate-500 text-center text-lg">Add a note (optional)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="w-full bg-sage rounded-2xl p-4 items-center"
                  onPress={completeRitual}
                >
                  <Text className="text-white font-semibold text-lg">Done</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                 <Text className="text-xl font-semibold text-slate-900 mb-4">How was it?</Text>
                 <TextInput
                    className="w-full bg-cream rounded-2xl p-4 text-lg text-slate-900 min-h-[120px] mb-6"
                    multiline
                    placeholder="Caught up about her move—felt good to connect."
                    placeholderTextColor="#8B9678"
                    value={note}
                    onChangeText={setNote}
                    autoFocus
                    textAlignVertical="top"
                 />
                 <TouchableOpacity
                  className="w-full bg-sage rounded-2xl p-4 items-center"
                  onPress={completeRitual}
                >
                  <Text className="text-white font-semibold text-lg">Save Interaction</Text>
                </TouchableOpacity>
              </>
            )}
            <View className="h-8" />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
