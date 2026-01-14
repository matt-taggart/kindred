import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Image, Alert, Linking, RefreshControl, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Contact, Interaction } from '@/db/schema';
import { getContacts, getInteractionHistory, deleteInteraction, updateContact, updateContactCadence, unarchiveContact, snoozeContact } from '@/services/contactService';
import EditContactModal from '@/components/EditContactModal';
import InteractionListItem from '@/components/InteractionListItem';
import { formatPhoneNumber, formatPhoneUrl } from '@/utils/phone';
import { formatLastConnected, formatNextReminder } from '@/utils/timeFormatting';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const bucketLabelMap: Record<Contact['bucket'], string> = {
  daily: 'Every day',
  weekly: 'Every week',
  'bi-weekly': 'Every few weeks',
  'every-three-weeks': 'Every few weeks',
  monthly: 'Once a month',
  'every-six-months': 'Seasonally',
  yearly: 'Once a year',
  custom: 'Custom rhythm',
};

const formatCustomLabel = (customIntervalDays?: number | null) => {
  if (!customIntervalDays || customIntervalDays < 1) return 'Only when I choose';

  if (customIntervalDays % 30 === 0) {
    const months = customIntervalDays / 30;
    return months === 1 ? 'Every month' : `Every ${months} months`;
  }

  if (customIntervalDays % 7 === 0) {
    const weeks = customIntervalDays / 7;
    return weeks === 1 ? 'Every week' : `Every ${weeks} weeks`;
  }

  if (customIntervalDays === 1) return 'Daily reminders';
  return `Every ${customIntervalDays} days`;
};

const getBucketLabel = (bucket: Contact['bucket'], customIntervalDays?: number | null) => {
  if (bucket === 'custom') return formatCustomLabel(customIntervalDays);
  return bucketLabelMap[bucket];
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
      'Remind me later',
      'When would you like a gentle reminder?',
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
      Alert.alert('No phone number', "This connection doesn't have a phone number yet.");
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
      Alert.alert('No phone number', "This connection doesn't have a phone number yet.");
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
      Alert.alert('Success', 'Connection restored.');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to restore connection.');
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

  // Screen options must be memoized and Stack.Screen must render in all code paths
  // to maintain navigation context consistency (fixes crash when deleting all notes)
  const screenOptions = useMemo(() => ({
    title: contact?.name || 'Connection',
    headerBackTitle: 'Back',
    headerShown: true,
    headerRight: contact ? ({ tintColor }: { tintColor?: string }) => (
      <TouchableOpacity onPress={handleEditContact}>
        <Text className="text-lg font-semibold" style={{ color: tintColor }}>Edit</Text>
      </TouchableOpacity>
    ) : undefined,
  }), [contact, handleEditContact]);

  if (loading) {
    return (
      <>
        <Stack.Screen options={screenOptions} />
        <SafeAreaView className="flex-1 items-center justify-center bg-cream">
          <Text className="text-warmgray">Loading…</Text>
        </SafeAreaView>
      </>
    );
  }

  if (!contact) {
    return (
      <>
        <Stack.Screen options={screenOptions} />
        <SafeAreaView className="flex-1 items-center justify-center bg-cream">
          <Text className="text-warmgray">Connection not found</Text>
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
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {contact.isArchived && (
            <View className="mb-6 rounded-2xl bg-amber-50 border border-amber-200 p-4">
              <View className="flex-row items-center mb-3">
                <Ionicons name="archive-outline" size={20} color="#d97706" />
                <Text className="ml-2 text-base font-semibold text-amber-800">Archived connection</Text>
              </View>
              <Text className="text-sm text-amber-700 mb-3">
                This connection is archived and won't appear in your regular lists. Restore it to receive reminders again.
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
                  {unarchiving ? 'Restoring...' : 'Restore connection'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Contact Info Header */}
          <View className="mb-6 rounded-2xl bg-surface p-6 shadow-sm">
            <View className="items-center">
              {contact.avatarUri ? (
                <View className="h-20 w-20 overflow-hidden rounded-full">
                  <Image
                    source={{ uri: contact.avatarUri }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                </View>
              ) : (
                <View className="h-20 w-20 items-center justify-center rounded-full bg-sage">
                  <Text className="text-3xl font-semibold text-white">{initial}</Text>
                </View>
              )}

              <Text className="mt-3 text-2xl font-semibold text-warmgray">{contact.name}</Text>
              {contact.phone && (
                <Text className="mt-1 text-base text-warmgray-muted">{formatPhoneNumber(contact.phone)}</Text>
              )}
              <Text className="mt-1 text-base text-warmgray-muted">{getBucketLabel(contact.bucket, contact.customIntervalDays)}</Text>

              <View className="mt-4 items-center">
                <Text className="text-base text-warmgray-muted">{formatLastConnected(contact.lastContactedAt)}</Text>
                {contact.nextContactDate ? (
                  <Text className="mt-1 text-base text-warmgray-muted">Next reminder {formatNextReminder(contact.nextContactDate).toLowerCase()}</Text>
                ) : (
                  <Text className="mt-1 text-base text-warmgray-muted">No reminders scheduled</Text>
                )}
              </View>
            </View>
          </View>

          {/* Quick Actions Row */}
          <View className="mb-6 flex-row gap-2">
            {contact.phone && (
              <>
                <TouchableOpacity
                  className={`flex-row items-center justify-center gap-1.5 rounded-full px-4 py-2 ${
                    contact.isArchived ? 'bg-gray-100 border border-gray-300' : 'border border-sage bg-surface'
                  }`}
                  onPress={handleCall}
                  disabled={contact.isArchived}
                  activeOpacity={contact.isArchived ? 1 : 0.85}
                >
                  <Ionicons name="call-outline" size={18} color={contact.isArchived ? '#9ca3af' : '#9CA986'} />
                  <Text className={`text-base font-medium ${contact.isArchived ? 'text-gray-400' : 'text-sage'}`}>
                    Call
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`flex-row items-center justify-center gap-1.5 rounded-full px-4 py-2 ${
                    contact.isArchived ? 'bg-gray-100 border border-gray-300' : 'border border-sage bg-surface'
                  }`}
                  onPress={handleText}
                  disabled={contact.isArchived}
                  activeOpacity={contact.isArchived ? 1 : 0.85}
                >
                  <Ionicons name="chatbubble-outline" size={18} color={contact.isArchived ? '#9ca3af' : '#9CA986'} />
                  <Text className={`text-base font-medium ${contact.isArchived ? 'text-gray-400' : 'text-sage'}`}>
                    Text
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              className="flex-row items-center justify-center gap-1.5 rounded-full border border-sage bg-surface px-4 py-2"
              onPress={handleAddNote}
              activeOpacity={0.85}
            >
              <Ionicons name="pencil-outline" size={18} color="#9CA986" />
              <Text className="text-base font-medium text-sage">Note</Text>
            </TouchableOpacity>
          </View>

          {/* Mark Done / Snooze Actions */}
          {!contact.isArchived && (
            <View className="mb-6 flex-row gap-3">
              <TouchableOpacity
                className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border-2 border-sage py-3"
                onPress={handleMarkDone}
                activeOpacity={0.85}
              >
                <Ionicons name="checkmark-circle-outline" size={24} color="#9CA986" />
                <Text className="text-lg font-semibold text-sage">Reached out</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border-2 border-sage py-3"
                onPress={handleSnooze}
                disabled={snoozing}
                activeOpacity={0.85}
              >
                <Ionicons name="alarm-outline" size={24} color="#9CA986" />
                <Text className="text-lg font-semibold text-sage">
                  {snoozing ? 'Later...' : 'Later'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Shared Moments */}
          <View>
            <Text className="mb-3 text-xl font-bold text-warmgray">Shared moments</Text>

            {/* Stable outer View prevents full unmount/remount during list→empty transition */}
            <View className="flex flex-col gap-4">
              {interactions.length === 0 ? (
                <View className="items-center justify-center rounded-2xl bg-surface border border-border p-8">
                  <Ionicons name="heart-outline" size={48} color="#8B9678" />
                  <Text className="mt-3 text-base text-warmgray">Your story together starts here.</Text>
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

