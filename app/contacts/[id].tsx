import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Image, Alert, Linking, RefreshControl, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Contact, Interaction } from '@/db/schema';
import { getContacts, getInteractionHistory, deleteInteraction, updateContactCadence, unarchiveContact } from '@/services/contactService';
import EditContactModal from '@/components/EditContactModal';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const bucketLabels: Record<Contact['bucket'], string> = {
  daily: 'Daily reminders',
  weekly: 'Weekly reminders',
  monthly: 'Monthly reminders',
  yearly: 'Yearly reminders',
};

const typeLabels: Record<Interaction['type'], string> = {
  call: 'Call',
  text: 'Text',
  meet: 'Meet',
};

const typeIcons: Record<Interaction['type'], keyof typeof Ionicons.glyphMap> = {
  call: 'call-outline',
  text: 'chatbubble-outline',
  meet: 'people-outline',
};

const formatLastContacted = (lastContactedAt?: number | null) => {
  if (!lastContactedAt) return 'Never';

  const diff = Math.max(0, Date.now() - lastContactedAt);
  const days = Math.floor(diff / DAY_IN_MS);

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
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

const formatInteractionDate = (date: number) => {
  const now = Date.now();
  const diff = now - date;
  const days = Math.floor(diff / DAY_IN_MS);

  const dateObj = new Date(date);
  const time = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  if (days === 0) return `Today at ${time}`;
  if (days === 1) return `Yesterday at ${time}`;
  if (days < 7) return `${days} days ago at ${time}`;

  return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ` at ${time}`;
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
            Linking.openURL(`tel:${contact.phone}`);
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
            Linking.openURL(`sms:${contact.phone}`);
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
                loadContactData();
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
    async (newBucket: Contact['bucket']) => {
      if (!contact) return;

      setSavingCadence(true);
      try {
        const updated = await updateContactCadence(contact.id, newBucket);
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

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-cream">
        <Text className="text-slate">Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!contact) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-cream">
        <Text className="text-slate">Contact not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: contact.name,
          headerBackTitle: 'Back',
          headerShown: true,
          headerRight: ({ tintColor }) => (
            <TouchableOpacity
              onPress={handleEditContact}
            >
              <Text className="text-lg font-semibold" style={{ color: tintColor }}>Edit</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView className="flex-1 bg-cream">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {contact.isArchived && (
            <View className="mb-6 rounded-2xl bg-amber-50 border border-amber-200 p-4">
              <View className="flex-row items-center mb-3">
                <Ionicons name="archive-outline" size={20} color="#d97706" />
                <Text className="ml-2 text-base font-semibold text-amber-800">Archived Contact</Text>
              </View>
              <Text className="text-sm text-amber-700 mb-3">
                This contact is archived and won't appear in your regular lists. Restore it to receive reminders again.
              </Text>
              <TouchableOpacity
                className="flex-row items-center justify-center gap-2 rounded-xl bg-amber-600 py-3"
                onPress={handleUnarchive}
                disabled={unarchiving}
                activeOpacity={0.85}
              >
                {unarchiving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="refresh-outline" size={20} color="#fff" />
                )}
                <Text className="text-base font-semibold text-white">
                  {unarchiving ? 'Restoring...' : 'Unarchive Contact'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Contact Info Header */}
          <View className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
            <View className="flex-row items-center gap-4">
              {contact.avatarUri ? (
                <View className="h-16 w-16 overflow-hidden rounded-full">
                  <Image
                    source={{ uri: contact.avatarUri }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                </View>
              ) : (
                <View className="h-16 w-16 items-center justify-center rounded-full bg-sage">
                  <Text className="text-2xl font-semibold text-white">{initial}</Text>
                </View>
              )}

              <View className="flex-1">
                <Text className="text-2xl font-bold text-slate">{contact.name}</Text>
                {contact.phone && (
                  <Text className="text-lg text-slate-600">{contact.phone}</Text>
                )}
                <Text className="text-base text-slate-500">{bucketLabels[contact.bucket]}</Text>
              </View>
            </View>

            <View className="mt-4 rounded-xl border border-sage-100 bg-cream p-3">
              <View className="flex-row justify-between">
                <View>
                  <Text className="text-sm text-gray-600">Last contacted</Text>
                  <Text className="text-lg font-semibold text-slate">{formatLastContacted(contact.lastContactedAt)}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-sm text-gray-600">Next check-in</Text>
                  <Text className="text-lg font-semibold text-slate">{formatNextCheckIn(contact.nextContactDate)}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Call/Text Action Buttons */}
          {contact.phone && (
            <View className="mb-6 flex-row gap-3">
              <TouchableOpacity
                className={`flex-1 flex-row items-center justify-center gap-2 rounded-2xl py-3 ${
                  contact.isArchived ? 'bg-gray-200 border border-gray-300' : 'bg-sage'
                }`}
                onPress={handleCall}
                disabled={contact.isArchived}
                activeOpacity={contact.isArchived ? 1 : 0.85}
              >
                <Ionicons name="call-outline" size={24} color={contact.isArchived ? '#6b7280' : '#fff'} />
                <Text className={`text-lg font-semibold ${contact.isArchived ? 'text-gray-400' : 'text-white'}`}>
                  Call
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-1 flex-row items-center justify-center gap-2 rounded-2xl py-3 ${
                  contact.isArchived ? 'bg-gray-200 border border-gray-300' : 'bg-sage'
                }`}
                onPress={handleText}
                disabled={contact.isArchived}
                activeOpacity={contact.isArchived ? 1 : 0.85}
              >
                <Ionicons name="chatbubble-outline" size={24} color={contact.isArchived ? '#6b7280' : '#fff'} />
                <Text className={`text-lg font-semibold ${contact.isArchived ? 'text-gray-400' : 'text-white'}`}>
                  Text
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Add Note Button */}
          <TouchableOpacity
            className="mb-6 flex-row items-center justify-center gap-2 rounded-2xl bg-white border-2 border-sage py-3"
            onPress={handleAddNote}
            activeOpacity={0.85}
          >
            <Ionicons name="pencil-outline" size={24} color="#9CA986" />
            <Text className="text-lg font-semibold text-sage">Add Note</Text>
          </TouchableOpacity>

          {/* Interaction History */}
          <View>
            <Text className="mb-3 text-xl font-bold text-slate">History</Text>

            {interactions.length === 0 ? (
              <View className="items-center justify-center rounded-2xl bg-white p-8 shadow-sm">
                <Ionicons name="time-outline" size={48} color="#94a3b8" />
                <Text className="mt-3 text-base text-slate-600">No interactions yet</Text>
                <Text className="mt-1 text-sm text-slate-500">
                  Your conversation history will appear here once you start logging interactions.
                </Text>
              </View>
            ) : (
              <View className="flex flex-col gap-4">
                {interactions.map((interaction) => (
                  <InteractionCard
                    key={interaction.id}
                    interaction={interaction}
                    onEdit={handleEditInteraction}
                    onDelete={() => handleDeleteInteraction(interaction.id)}
                  />
                ))}
              </View>
            )}
          </View>
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

interface InteractionCardProps {
  interaction: Interaction;
  onEdit: (interaction: Interaction) => void;
  onDelete: () => void;
}

function InteractionCard({ interaction, onEdit, onDelete }: InteractionCardProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
      onPress={() => onEdit(interaction)}
      activeOpacity={0.7}
    >
      <View className="flex-row items-start gap-3">
        <View className="mt-1">
          <Ionicons name={typeIcons[interaction.type]} size={24} color="#475569" />
        </View>

        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-slate">{typeLabels[interaction.type]}</Text>
            <TouchableOpacity onPress={onDelete} activeOpacity={0.7}>
              <Ionicons name="trash-outline" size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <Text className="text-base text-slate-500">{formatInteractionDate(interaction.date)}</Text>

          {interaction.notes && (
            <View className="mt-2 rounded-lg border border-sage-100 bg-cream p-3">
              <Text className="text-base text-slate">{interaction.notes}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
