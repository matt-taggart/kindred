import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Alert, Linking, RefreshControl, SafeAreaView, ScrollView, TouchableOpacity, View, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Contact, Interaction } from '@/db/schema';
import { getContacts, getInteractionHistory, updateContact, updateContactCadence, archiveContact, unarchiveContact } from '@/services/contactService';
import EditContactModal from '@/components/EditContactModal';
import { ConnectionDetailHeader, ConnectionProfileSection, QuickActionTile, SharedMomentsSection } from '@/components';
import { Body, Caption, Heading } from '@/components/ui';
import type { Moment } from '@/components';
import { QuiltGrid } from '@/components/ui/QuiltGrid';
import { formatPhoneUrl } from '@/utils/phone';
import { formatLastConnected } from '@/utils/timeFormatting';
import Colors from '@/constants/Colors';

const mapInteractionsToMoments = (interactions: Interaction[]): Moment[] => {
  return interactions.slice(0, 5).map((interaction) => ({
    id: interaction.id,
    title: interaction.notes || 'Interaction',
    date: new Date(interaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    description: interaction.type || '',
    iconBgColor: 'bg-emerald-50',
    icon: 'chatbubble-outline',
  }));
};

export default function ContactDetailScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [contact, setContact] = useState<Contact | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
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

  if (loading) {
    return (
      <>
        <Stack.Screen options={screenOptions} />
        <SafeAreaView className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
          <ActivityIndicator size="large" color={Colors.primary} />
        </SafeAreaView>
      </>
    );
  }

  if (!contact) {
    return (
      <>
        <Stack.Screen options={screenOptions} />
        <SafeAreaView className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
          <Body>Connection not found</Body>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={screenOptions} />
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 48 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          showsVerticalScrollIndicator={false}
        >
          <ConnectionDetailHeader
            name={contact.name}
            relationship={contact.relationship || 'Connection'}
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
            relationship={contact.relationship || 'Connection'}
            lastConnected={formatLastConnected(contact.lastContactedAt)}
            isFavorite={contact.relationship?.toLowerCase().includes('partner') || contact.relationship?.toLowerCase().includes('spouse')}
          />

          {/* Quick Actions Grid */}
          <View className="mb-6">
            <QuiltGrid>
              <QuickActionTile variant="call" onPress={handleCall} />
              <QuickActionTile variant="text" onPress={handleText} />
            </QuiltGrid>
          </View>

          {/* Shared Moments */}
          <SharedMomentsSection
            moments={mapInteractionsToMoments(interactions)}
            onViewAll={interactions.length > 5 ? handleAddNote : undefined}
            onMomentPress={(moment) => {
              const interaction = interactions.find(i => i.id === moment.id);
              if (interaction) handleEditInteraction(interaction);
            }}
          />

          {/* Empty state when no moments */}
          {interactions.length === 0 && (
            <View className="mt-8">
              <View className="items-center justify-center rounded-3xl bg-white dark:bg-card-dark border border-slate-100 dark:border-slate-800 p-8 shadow-soft">
                <View className="w-16 h-16 rounded-full bg-sage-light dark:bg-accent-dark-sage items-center justify-center mb-4 border border-primary/10">
                  <Ionicons name="heart" size={32} color={Colors.primary} />
                </View>
                <Heading size={3} className="text-center mb-2">
                  No shared moments yet
                </Heading>
                <Body className="text-slate-500 dark:text-slate-400 text-center mb-6">
                  Your shared moments will appear here.
                </Body>
                <TouchableOpacity
                  className="px-8 py-4 rounded-2xl bg-primary shadow-sm"
                  onPress={handleAddNote}
                  activeOpacity={0.85}
                >
                  <Body weight="medium" className="text-white">
                    Add a moment
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
    </>
  );
}
