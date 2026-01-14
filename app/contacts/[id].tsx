import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Image, Alert, Linking, RefreshControl, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Contact, Interaction } from '@/db/schema';
import { getContacts, getInteractionHistory, deleteInteraction, updateContact, updateContactCadence, unarchiveContact, snoozeContact } from '@/services/contactService';
import EditContactModal from '@/components/EditContactModal';
import InteractionListItem from '@/components/InteractionListItem';
import { formatPhoneNumber, formatPhoneUrl } from '@/utils/phone';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const formatLastContacted = (lastContactedAt?: number | null) => {
  if (!lastContactedAt) return 'No prior connection';

  const diff = Math.max(0, Date.now() - lastContactedAt);
  const days = Math.floor(diff / DAY_IN_MS);

  if (days === 0) return 'Connected today';
  if (days === 1) return 'Connected yesterday';
  if (days < 30) return 'Connected recently';
  return 'Connected last month';
};

const formatNextCheckIn = (nextContactDate?: number | null) => {
  if (!nextContactDate) return 'No reminder set';

  const diff = nextContactDate - Date.now();
  if (diff <= 0) return 'Due now';

  const days = Math.ceil(diff / DAY_IN_MS);
  if (days === 1) return 'Reminder tomorrow';
  return `Next reminder in ${days} days`;
};

export default function ContactDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [contact, setContact] = useState<Contact | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [savingCadence, setSavingCadence] = useState(false);
  const [unarchiving, setUnarchiving] = useState(false);
  const [snoozing, setSnoozing] = useState(false);

  const loadContactData = useCallback(() => {
    if (!id) return;

    try {
      const contactsList = getContacts({ includeArchived: true });
      const foundContact = contactsList.find((c) => c.id === id);
      setContact(foundContact || null);

      if (foundContact) {
        const history = getInteractionHistory(foundContact.id);
        setInteractions(history);
      } else {
        setInteractions([]);
      }
    } catch (error) {
      console.warn('Failed to load contact data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadContactData();
    }, [loadContactData]),
  );

  const handleMarkDone = useCallback(() => {
    if (!id) return;
    router.push({ pathname: '/modal', params: { contactId: id } });
  }, [router, id]);

  const handleSnooze = useCallback(async () => {
    if (!contact) return;

    const now = Date.now();
    
    Alert.alert(
      'Snooze Reminder',
      'When would you like to be reminded?',
      [
        { text: '1 hour', onPress: () => handleSnoozeContact(now + 60 * 60 * 1000) },
        { text: 'Tomorrow', onPress: () => handleSnoozeContact(now + DAY_IN_MS) },
        { text: '3 days', onPress: () => handleSnoozeContact(now + 3 * DAY_IN_MS) },
        { text: '1 week', onPress: () => handleSnoozeContact(now + 7 * DAY_IN_MS) },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  }, [contact]);

  const handleSnoozeContact = useCallback(
    async (untilDate: number) => {
      if (!contact) return;
      
      setSnoozing(true);
      try {
        await snoozeContact(contact.id, untilDate);
        loadContactData();
      } catch (error) {
        Alert.alert('Error', error instanceof Error ? error.message : 'Failed to snooze contact.');
      } finally {
        setSnoozing(false);
      }
    },
    [contact, loadContactData],
  );

  const handleCall = useCallback(() => {
    if (!contact?.phone) {
      Alert.alert('No Phone Number', 'This contact does not have a phone number.');
      return;
    }
    Alert.alert(
      `Call ${contact.name}?`,
      'This will open your phone app.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => {
            Linking.openURL(`tel:${formatPhoneUrl(contact.phone)}`);
          },
        },
      ],
    );
  }, [contact]);

  const handleText = useCallback(() => {
    if (!contact?.phone) {
      Alert.alert('No Phone Number', 'This contact does not have a phone number.');
      return;
    }
    Alert.alert(
      `Text ${contact.name}?`,
      'This will open your messaging app.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Text',
          onPress: () => {
            Linking.openURL(`sms:${formatPhoneUrl(contact.phone)}`);
          },
        },
      ],
    );
  }, [contact]);

  const handleDeleteInteraction = useCallback(
    (interactionId: string) => {
      Alert.alert(
        'Delete Interaction?',
        'This cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteInteraction(interactionId);
                // Defer to next frame to let navigation context stabilize
                requestAnimationFrame(() => {
                  loadContactData();
                });
              } catch (error) {
                Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete interaction.');
              }
            },
          },
        ],
      );
    },
    [loadContactData],
  );

  const handleEditInteraction = useCallback(
    (interaction: Interaction) => {
      router.push({ pathname: '/modal', params: { interactionId: interaction.id, contactId: id } });
    },
    [router, id],
  );

  const handleEditContact = useCallback(() => {
    setShowEditModal(true);
  }, []);

  const handleAddNote = useCallback(() => {
    router.push({ pathname: '/modal', params: { contactId: id, noteOnly: 'true' } });
  }, [router, id]);

  const handleUnarchive = useCallback(async () => {
    if (!contact) return;

    setUnarchiving(true);
    try {
      await unarchiveContact(contact.id);
      loadContactData();
      Alert.alert('Success', 'Contact has been restored.');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to unarchive contact.');
    } finally {
      setUnarchiving(false);
    }
  }, [contact, loadContactData]);

  const handleSaveCadence = useCallback(
    async (newBucket: Contact['bucket'], customIntervalDays?: number | null, birthday?: string | null) => {
      if (!contact) return;

      setSavingCadence(true);
      try {
        if (birthday !== undefined) {
          await updateContact(contact.id, { birthday });
        }
        const updated = await updateContactCadence(contact.id, newBucket, customIntervalDays);
        setContact(updated);
        loadContactData();
      } catch (error) {
        Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update contact reminders.');
      } finally {
        setSavingCadence(false);
      }
    },
    [contact, loadContactData],
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadContactData();
  }, [loadContactData]);

  const initial = contact?.name?.charAt(0).toUpperCase() || '?';
  const isDue = contact?.nextContactDate && contact.nextContactDate <= Date.now();

  const screenOptions = useMemo(() => ({
    headerTitle: '',
    headerBackTitle: 'Back',
    headerShadowVisible: false,
    headerStyle: { backgroundColor: '#F3F0E6' },
    headerRight: contact ? ({ tintColor }: { tintColor?: string }) => (
      <TouchableOpacity onPress={handleEditContact} className="px-2">
        <Text className="text-base font-medium text-sage-muted">Edit</Text>
      </TouchableOpacity>
    ) : undefined,
  }), [contact, handleEditContact]);

  if (loading) {
    return (
      <>
        <Stack.Screen options={screenOptions} />
        <SafeAreaView className="flex-1 items-center justify-center bg-cream">
          <ActivityIndicator size="small" color="#9CA986" />
        </SafeAreaView>
      </>
    );
  }

  if (!contact) {
    return (
      <>
        <Stack.Screen options={screenOptions} />
        <SafeAreaView className="flex-1 items-center justify-center bg-cream">
          <Text className="text-slate">Contact not found</Text>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={screenOptions} />
      <SafeAreaView className="flex-1 bg-cream">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9CA986" />}
        >
          {/* Header Card */}
          <View className="items-center mb-8">
             {contact.avatarUri ? (
                <Image
                  source={{ uri: contact.avatarUri }}
                  className="h-24 w-24 rounded-full mb-4 border-4 border-white shadow-sm"
                  resizeMode="cover"
                />
              ) : (
                <View className="h-24 w-24 items-center justify-center rounded-full bg-sage mb-4 border-4 border-white shadow-sm">
                  <Text className="text-3xl font-semibold text-white">{initial}</Text>
                </View>
              )}
              
              <Text className="text-2xl font-semibold text-slate-900 mb-1">{contact.name}</Text>
              {contact.phone && (
                 <Text className="text-base text-slate-500 mb-4">{formatPhoneNumber(contact.phone)}</Text>
              )}

              <View className="items-center gap-1">
                 <Text className="text-sm text-sage-muted font-medium">{formatLastContacted(contact.lastContactedAt)}</Text>
                 <Text className="text-sm text-sage-muted">{formatNextCheckIn(contact.nextContactDate)}</Text>
              </View>
          </View>

          {/* Quick Actions */}
          <View className="flex-row justify-center gap-3 mb-8">
              {contact.phone && (
                 <>
                    <TouchableOpacity
                      className="flex-row items-center gap-2 px-5 py-3 rounded-full border border-sage/50 bg-white shadow-sm"
                      onPress={handleCall}
                    >
                       <Ionicons name="call-outline" size={18} color="#5C6356" />
                       <Text className="text-sm font-semibold text-slate-600">Call</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-row items-center gap-2 px-5 py-3 rounded-full border border-sage/50 bg-white shadow-sm"
                      onPress={handleText}
                    >
                       <Ionicons name="chatbubble-outline" size={18} color="#5C6356" />
                       <Text className="text-sm font-semibold text-slate-600">Text</Text>
                    </TouchableOpacity>
                 </>
              )}
              
               <TouchableOpacity
                  className="flex-row items-center gap-2 px-5 py-3 rounded-full border border-sage/50 bg-white shadow-sm"
                  onPress={handleAddNote}
                >
                   <Ionicons name="pencil-outline" size={18} color="#5C6356" />
                   <Text className="text-sm font-semibold text-slate-600">Note</Text>
                </TouchableOpacity>
          </View>

          {/* Reach Out Section (If Due) */}
          {isDue && !contact.isArchived && (
             <View className="mb-8 p-6 bg-surface rounded-3xl shadow-sm border border-border">
                <Text className="text-lg font-semibold text-slate-900 mb-4 text-center">Ready to connect?</Text>
                <View className="flex-row gap-3">
                   <TouchableOpacity
                      className="flex-1 items-center justify-center rounded-full bg-sage py-3 shadow-sm"
                      onPress={handleMarkDone}
                    >
                      <Text className="text-base font-semibold text-white">Reached out</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-1 items-center justify-center rounded-full border border-border bg-white py-3"
                      onPress={handleSnooze}
                      disabled={snoozing}
                    >
                      <Text className="text-base font-medium text-slate-600">{snoozing ? '...' : 'Later'}</Text>
                    </TouchableOpacity>
                </View>
             </View>
          )}

          {/* Shared Moments */}
          <View>
            <Text className="mb-4 text-xl font-semibold text-slate-900 px-1">Shared moments</Text>

            <View className="flex flex-col">
              {interactions.length === 0 ? (
                <View className="items-center justify-center rounded-3xl bg-surface p-8 shadow-sm border border-border/50">
                  <Ionicons name="book-outline" size={32} color="#9CA986" style={{ opacity: 0.5 }} />
                  <Text className="mt-3 text-base text-slate-600 font-medium">Your story starts here</Text>
                  <Text className="mt-1 text-sm text-sage-muted text-center max-w-[200px]">
                    Log your first interaction to start building a history.
                  </Text>
                </View>
              ) : (
                interactions.map((interaction) => (
                  <InteractionListItem
                    key={interaction.id}
                    interaction={interaction}
                    onEdit={handleEditInteraction}
                    onDelete={() => handleDeleteInteraction(interaction.id)}
                  />
                ))
              )}
            </View>
          </View>

          {contact.isArchived && (
             <TouchableOpacity
               className="mt-8 flex-row items-center justify-center gap-2 rounded-xl bg-amber-100 py-3 mx-4"
               onPress={handleUnarchive}
               disabled={unarchiving}
             >
               <Ionicons name="refresh-outline" size={20} color="#92400e" />
               <Text className="text-base font-semibold text-amber-800">
                 {unarchiving ? 'Restoring...' : 'Unarchive Contact'}
               </Text>
             </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>

      {contact && (
        <EditContactModal
          visible={showEditModal}
          contact={contact}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveCadence}
        />
      )}
    </>
  );
}

