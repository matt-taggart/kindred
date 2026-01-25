import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Alert, Linking, RefreshControl, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Contact, Interaction } from '@/db/schema';
import { getContacts, getInteractionHistory, deleteInteraction, updateContact, updateContactCadence, archiveContact, unarchiveContact, snoozeContact } from '@/services/contactService';
import EditContactModal from '@/components/EditContactModal';
import InteractionListItem from '@/components/InteractionListItem';
import { ConnectionDetailHeader, ConnectionProfileSection, ConnectionNotesCard, QuickActionTile } from '@/components';
import { QuiltGrid } from '@/components/ui/QuiltGrid';
import { formatPhoneUrl } from '@/utils/phone';
import { formatLastConnected } from '@/utils/timeFormatting';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const bucketLabelMap: Record<Contact['bucket'], string> = {
  daily: 'Every day',
  weekly: 'Every week',
  'bi-weekly': 'Every 2 weeks',
  'every-three-weeks': 'Every 3 weeks',
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
  const [notes, setNotes] = useState(contact?.notes || '');

  const loadContactData = useCallback(() => {
    if (!id) return;

    try {
      const contactsList = getContacts({ includeArchived: true });
      const foundContact = contactsList.find((c) => c.id === id);
      setContact(foundContact || null);
      setNotes(foundContact?.notes || '');

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

  const handleNotesChange = useCallback((text: string) => {
    setNotes(text);
    // Debounced save could be added later
    if (contact) {
      updateContact(contact.id, { notes: text }).catch(console.warn);
    }
  }, [contact]);

  const handleVoiceNote = useCallback(() => {
    Alert.alert('Coming soon', 'Voice notes will be available in a future update.');
  }, []);

  const handleWriteLater = useCallback(() => {
    Alert.alert('Coming soon', 'Write later reminders will be available in a future update.');
  }, []);

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

  const handleArchive = useCallback(async () => {
    if (!contact) return;

    try {
      await archiveContact(contact.id);
      loadContactData();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to archive connection.');
    }
  }, [contact, loadContactData]);

  const handleSaveCadence = useCallback(
    async (newBucket: Contact['bucket'], customIntervalDays?: number | null, birthday?: string | null, nextContactDate?: number | null) => {
      if (!contact) return;

      setSavingCadence(true);
      try {
        if (birthday !== undefined) {
          await updateContact(contact.id, { birthday });
        }
        const updated = await updateContactCadence(contact.id, newBucket, customIntervalDays, nextContactDate);
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

  // Screen options must be memoized and Stack.Screen must render in all code paths
  // to maintain navigation context consistency (fixes crash when deleting all notes)
  const screenOptions = useMemo(() => ({
    title: contact?.name || 'Connection',
    headerBackTitle: 'Back',
    headerShown: false,
  }), [contact]);

  if (loading) {
    return (
      <>
        <Stack.Screen options={screenOptions} />
        <SafeAreaView className="flex-1 items-center justify-center bg-background-light">
          <Text className="text-warmgray">Loading…</Text>
        </SafeAreaView>
      </>
    );
  }

  if (!contact) {
    return (
      <>
        <Stack.Screen options={screenOptions} />
        <SafeAreaView className="flex-1 items-center justify-center bg-background-light">
          <Text className="text-warmgray">Connection not found</Text>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={screenOptions} />
      <SafeAreaView className="flex-1 bg-background-light">
        <ConnectionDetailHeader
          name={contact.name}
          relationship={contact.relationship || 'Connection'}
          onBackPress={() => router.back()}
          onMorePress={handleEditContact}
        />
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        >
          {contact.isArchived && (
            <View className="mb-6 rounded-2xl bg-amber-50 border border-amber-200 p-4">
              <View className="flex-row items-center mb-3">
                <Ionicons name="archive-outline" size={20} color="#d97706" />
                <Text className="ml-2 text-base font-semibold text-amber-800">Archived connection</Text>
              </View>
              <Text className="text-sm text-amber-700 mb-3">
                This connection is archived and will not appear in your regular lists. Restore it to receive reminders again.
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

          <ConnectionProfileSection
            avatarUri={contact.avatarUri}
            name={contact.name}
            relationship={contact.relationship || 'Connection'}
            lastConnected={formatLastConnected(contact.lastContactedAt)}
            isFavorite={contact.relationship?.toLowerCase().includes('partner') || contact.relationship?.toLowerCase().includes('spouse')}
          />

          {/* Notes Card */}
          <View className="mb-6">
            <ConnectionNotesCard
              notes={notes}
              onChangeNotes={handleNotesChange}
            />
          </View>

          {/* Quick Actions Grid */}
          <View className="mb-6">
            <QuiltGrid>
              <QuickActionTile variant="call" onPress={handleCall} />
              <QuickActionTile variant="text" onPress={handleText} />
              <QuickActionTile variant="voice" onPress={handleVoiceNote} />
              <QuickActionTile variant="later" onPress={handleWriteLater} />
            </QuiltGrid>
          </View>

          {/* Shared Moments */}
          <View>
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-xl font-bold text-warmgray">Notes</Text>
              <TouchableOpacity 
                className="flex-row items-center gap-1 rounded-full bg-surface border border-sage px-3 py-1.5"
                onPress={handleAddNote}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={16} color="#9CA986" />
                <Text className="text-sm font-medium text-sage">Add note</Text>
              </TouchableOpacity>
            </View>

            {/* Stable outer View prevents full unmount/remount during list→empty transition */}
            <View className="flex flex-col gap-4">
              {interactions.length === 0 ? (
                <View className="items-center justify-center rounded-2xl bg-surface border border-border p-8">
                  <Ionicons name="bookmarks-outline" size={48} color="#8B9678" />
                  <Text className="mt-3 text-base text-warmgray">Your notes will appear here</Text>
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
          onArchive={handleArchive}
        />
      )}
    </>
  );
}

