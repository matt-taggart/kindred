import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Alert, Linking, RefreshControl, SafeAreaView, ScrollView, TouchableOpacity, View, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Contact, Interaction, NewInteraction } from '@/db/schema';
import { getContacts, getInteractionHistory, updateContact, updateContactCadence, archiveContact, unarchiveContact, createInteraction, deleteInteraction, isReminderDueTodayOrOverdue } from '@/services/contactService';
import EditContactModal from '@/components/EditContactModal';
import InteractionComposerSheet, { InteractionKind } from '@/components/InteractionComposerSheet';
import { ConnectionDetailHeader, ConnectionProfileSection, QuickActionTile, SharedMomentsSection } from '@/components';
import { Body, Caption, Heading } from '@/components/ui';
import type { Moment } from '@/components';
import { QuiltGrid } from '@/components/ui/QuiltGrid';
import { formatPhoneUrl } from '@/utils/phone';
import { formatLastConnected, formatNextReminder, formatRhythmLabel } from '@/utils/timeFormatting';
import Colors from '@/constants/Colors';

const mapInteractionsToMoments = (interactions: Interaction[]): Moment[] => {
  const formatInteractionType = (type: Interaction['type']) => {
    switch (type) {
      case 'call':
        return 'Call';
      case 'text':
        return 'Text';
      case 'email':
        return 'Email';
      case 'meet':
        return 'In person';
      default:
        return '';
    }
  };

  return interactions.slice(0, 5).map((interaction) => ({
    id: interaction.id,
    title: interaction.notes || 'Interaction',
    date: new Date(interaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    description: formatInteractionType(interaction.type),
    tag: interaction.kind === 'memory' ? 'Memory' : 'Connected',
    iconBgColor: 'bg-sage-light',
    icon: 'chatbubble-outline',
  }));
};

export default function ContactDetailScreen() {
  type InteractionType = NewInteraction['type'];
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [contact, setContact] = useState<Contact | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [unarchiving, setUnarchiving] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [composerKind, setComposerKind] = useState<InteractionKind>('checkin');
  const [deletingInteractionId, setDeletingInteractionId] = useState<string | null>(null);

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

  const handleEditInteraction = useCallback(
    (interaction: Interaction) => {
      router.push({ pathname: '/modal', params: { interactionId: interaction.id, contactId: id } });
    },
    [router, id],
  );

  const handleEditContact = useCallback(() => {
    setShowEditModal(true);
  }, []);

  const handleDeleteMemory = useCallback(
    (interaction: Interaction) => {
      if (deletingInteractionId) return;

      Alert.alert(
        'Delete memory?',
        "This can't be undone.",
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                setDeletingInteractionId(interaction.id);
                await deleteInteraction(interaction.id);
                setInteractions((current) => current.filter((item) => item.id !== interaction.id));
              } catch {
                Alert.alert('Error', 'Failed to delete memory. Please try again.');
              } finally {
                setDeletingInteractionId(null);
              }
            },
          },
        ],
      );
    },
    [deletingInteractionId],
  );

  const handleOpenMemoryActions = useCallback(
    (interaction: Interaction) => {
      Alert.alert(
        'Memory options',
        undefined,
        [
          {
            text: 'Edit memory',
            onPress: () => handleEditInteraction(interaction),
          },
          {
            text: 'Delete memory',
            style: 'destructive',
            onPress: () => handleDeleteMemory(interaction),
          },
          { text: 'Cancel', style: 'cancel' },
        ],
      );
    },
    [handleDeleteMemory, handleEditInteraction],
  );

  const handleAddMemory = useCallback(() => {
    setComposerKind('memory');
    setShowComposer(true);
  }, []);

  const handleLogCheckIn = useCallback(() => {
    setComposerKind('checkin');
    setShowComposer(true);
  }, []);

  const handleComposerSubmit = useCallback(async ({ kind, type, note }: { kind: InteractionKind; type: InteractionType; note: string }) => {
    if (!contact) return;

    const isDueTodayOrOverdue = isReminderDueTodayOrOverdue(contact.nextContactDate);
    const normalizedNote = note.trim();

    try {
      await createInteraction(contact.id, type, normalizedNote || undefined, kind);
      loadContactData();
      setShowComposer(false);

      if (kind === 'memory' && isDueTodayOrOverdue) {
        setTimeout(() => {
          Alert.alert(
            'Mark as connected?',
            `${contact.name} is due for a check-in. Would you like to mark them as connected now?`,
            [
              { text: 'Not now', style: 'cancel' },
              {
                text: 'Mark as connected',
                onPress: () => {
                  setShowComposer(false);
                  void (async () => {
                    try {
                      await createInteraction(contact.id, type, undefined, 'checkin');
                      loadContactData();
                    } catch {
                      Alert.alert('Error', 'Failed to mark as connected. Please try again.');
                    }
                  })();
                },
              },
            ],
          );
        }, 0);
      }
    } catch {
      Alert.alert('Error', 'Failed to save. Please try again.');
    }
  }, [contact, loadContactData]);

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

      try {
        if (birthday !== undefined) {
          await updateContact(contact.id, { birthday });
        }
        const updated = await updateContactCadence(contact.id, newBucket, customIntervalDays, nextContactDate);
        setContact(updated);
        loadContactData();
      } catch (error) {
        Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update contact reminders.');
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
  const archiveIconColor = colorScheme === 'dark' ? Colors.warningDark : Colors.warning;
  const nextReminderLabel = contact?.nextContactDate
    ? formatNextReminder(contact.nextContactDate)
    : 'Not scheduled';
  const cadenceLabel = contact ? formatRhythmLabel(contact.bucket) : '';
  const reminderToneClassName = (
    nextReminderLabel === 'Overdue' || nextReminderLabel === 'Today'
  )
    ? 'text-primary dark:text-primary'
    : 'text-text-muted dark:text-slate-300';
  const memoryInteractions = useMemo(
    () => interactions.filter((interaction) => interaction.kind === 'memory'),
    [interactions],
  );
  const memoryMoments = useMemo(
    () => mapInteractionsToMoments(memoryInteractions),
    [memoryInteractions],
  );

  if (loading) {
    return (
      <>
        <Stack.Screen options={screenOptions} />
        <SafeAreaView className="flex-1 items-center justify-center bg-surface-page dark:bg-background-dark">
          <ActivityIndicator size="large" color={Colors.primary} />
        </SafeAreaView>
      </>
    );
  }

  if (!contact) {
    return (
      <>
        <Stack.Screen options={screenOptions} />
        <SafeAreaView className="flex-1 items-center justify-center bg-surface-page dark:bg-background-dark">
          <Body>Connection not found</Body>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={screenOptions} />
      <SafeAreaView className="flex-1 bg-surface-page dark:bg-background-dark">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 48 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          showsVerticalScrollIndicator={false}
        >
          <ConnectionDetailHeader
            onBackPress={() => router.back()}
            onMorePress={handleEditContact}
          />

          {contact.isArchived && (
            <View className="mb-6 rounded-3xl bg-amber-50 dark:bg-amber-900/35 border border-amber-200 dark:border-amber-700 p-6 shadow-soft">
              <View className="flex-row items-center mb-3">
                <Ionicons name="archive-outline" size={20} color={archiveIconColor} />
                <Caption uppercase className="ml-2 text-amber-800 dark:text-amber-100 tracking-wider font-semibold">
                  Archived connection
                </Caption>
              </View>
              <Body className="text-amber-700 dark:text-amber-200 mb-4">
                This connection is archived and will not appear in your regular lists. Restore it to receive reminders again.
              </Body>
              <TouchableOpacity
                className="flex-row items-center justify-center gap-2 rounded-2xl bg-amber-600 dark:bg-amber-500 py-4 shadow-sm"
                onPress={handleUnarchive}
                disabled={unarchiving}
                activeOpacity={0.85}
              >
                {unarchiving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="refresh-outline" size={20} color="#fff" />
                )}
                <Body weight="medium" className="text-white">
                  {unarchiving ? 'Restoring...' : 'Restore connection'}
                </Body>
              </TouchableOpacity>
            </View>
          )}

          <ConnectionProfileSection
            avatarUri={contact.avatarUri}
            name={contact.name}
            relationship={contact.relationship || ''}
            lastConnected={formatLastConnected(contact.lastContactedAt)}
            birthday={contact.birthday}
            isFavorite={contact.relationship?.toLowerCase().includes('partner') || contact.relationship?.toLowerCase().includes('spouse')}
            showRelationshipPill={false}
          />

          <View className="mb-8 rounded-3xl border border-stroke-soft bg-surface-card p-4 shadow-soft">
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1">
                <Caption uppercase muted={false} className="tracking-wider text-text-muted/80">
                  Reminder rhythm
                </Caption>
                <Body weight="medium" className="mt-1 text-text-strong dark:text-slate-100">
                  {cadenceLabel}
                </Body>
              </View>
              <View className="flex-1">
                <Caption uppercase muted={false} className="tracking-wider text-text-muted/80">
                  Next reminder
                </Caption>
                <Body weight="medium" className={`mt-1 ${reminderToneClassName}`}>
                  {nextReminderLabel}
                </Body>
              </View>
            </View>
          </View>

          {/* Connect */}
          <View className="mb-8">
            <Caption uppercase className="mb-3 tracking-wider">
              Connect
            </Caption>
            <QuiltGrid>
              <QuickActionTile variant="call" onPress={handleCall} />
              <QuickActionTile variant="text" onPress={handleText} />
            </QuiltGrid>
            <TouchableOpacity
              className="mt-3 w-full rounded-2xl bg-surface-card dark:bg-card-dark border border-stroke-soft dark:border-slate-800 px-4 py-3.5 flex-row items-center shadow-soft"
              onPress={handleLogCheckIn}
              activeOpacity={0.85}
              accessibilityLabel="Mark as connected"
            >
              <View className="w-9 h-9 rounded-xl bg-sage-light dark:bg-accent-dark-sage items-center justify-center">
                <Ionicons name="leaf-outline" size={18} color={Colors.primary} />
              </View>
              <Body weight="medium" className="ml-3 text-primary">
                Mark as connected
              </Body>
            </TouchableOpacity>
          </View>

          {/* Memories */}
          <View className="mb-2 flex-row items-center justify-between">
            <Caption uppercase className="tracking-wider">
              Memories
            </Caption>
            {memoryInteractions.length > 0 ? (
              <TouchableOpacity
                onPress={handleAddMemory}
                activeOpacity={0.8}
                className="flex-row items-center rounded-full bg-sage-light dark:bg-accent-dark-sage px-3 py-1.5"
                accessibilityRole="button"
                accessibilityLabel={`Add memory for ${contact.name}`}
              >
                <Ionicons name="add" size={14} color={Colors.primary} />
                <Body size="sm" weight="medium" className="ml-1 text-primary">
                  Add memory
                </Body>
              </TouchableOpacity>
            ) : null}
          </View>
          <SharedMomentsSection
            moments={memoryMoments}
            hideHeader
            onMomentPress={(moment) => {
              const interaction = memoryInteractions.find(i => i.id === moment.id);
              if (interaction) handleEditInteraction(interaction);
            }}
            onMomentLongPress={(moment) => {
              const interaction = memoryInteractions.find((item) => item.id === moment.id);
              if (interaction) handleOpenMemoryActions(interaction);
            }}
            onMomentOptionsPress={(moment) => {
              const interaction = memoryInteractions.find((item) => item.id === moment.id);
              if (interaction) handleOpenMemoryActions(interaction);
            }}
          />

          {/* Empty state when no moments */}
          {memoryInteractions.length === 0 && (
            <View className="mt-8">
              <View className="items-center justify-center rounded-3xl bg-surface-card dark:bg-card-dark border border-stroke-soft dark:border-slate-800 p-8 shadow-soft">
                <View className="w-16 h-16 rounded-full bg-sage-light dark:bg-accent-dark-sage items-center justify-center mb-4 border border-primary/10">
                  <Ionicons name="heart" size={32} color={Colors.primary} />
                </View>
                <Heading size={3} className="text-center mb-2">
                  No memories yet
                </Heading>
                <Body className="text-text-muted dark:text-slate-400 text-center mb-6">
                  Capture a shared moment, preference, or detail to personalize future outreach.
                </Body>
                <TouchableOpacity
                  className="px-8 py-4 rounded-2xl bg-primary shadow-sm"
                  onPress={handleAddMemory}
                  activeOpacity={0.85}
                >
                  <Body weight="medium" className="text-white">
                    Add first memory
                  </Body>
                </TouchableOpacity>
              </View>
            </View>
          )}
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

      <InteractionComposerSheet
        visible={showComposer}
        contact={contact}
        onClose={() => setShowComposer(false)}
        onSubmit={handleComposerSubmit}
        initialKind={composerKind}
      />
    </>
  );
}
