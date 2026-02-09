import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { Contact, NewInteraction } from '@/db/schema';
import { getDueContactsGrouped, GroupedDueContacts, isBirthdayToday, getContactCount, snoozeContact, createInteraction } from '@/services/contactService';
import EmptyContactsState from '@/components/EmptyContactsState';
import CelebrationStatus from '@/components/CelebrationStatus';
import { PageHeader } from '@/components/PageHeader';
import { ConnectionTile } from '@/components/ConnectionTile';
import InteractionComposerSheet, { InteractionKind } from '@/components/InteractionComposerSheet';
import { ConnectionQuickActionsSheet } from '@/components/ConnectionQuickActionsSheet';
import { QuiltGrid } from '@/components/ui';
import { Heading, Body, Caption } from '@/components/ui';
import { getTileVariant, getTileSize } from '@/utils/tileVariant';

export default function HomeScreen() {
  type InteractionType = NewInteraction['type'];
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [groupedContacts, setGroupedContacts] = useState<GroupedDueContacts>({ birthdays: [], reconnect: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [completionCount, setCompletionCount] = useState(0);
  const [totalContactCount, setTotalContactCount] = useState<number | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showComposer, setShowComposer] = useState(false);

  const loadContacts = useCallback(() => {
    try {
      const results = getDueContactsGrouped();
      setGroupedContacts(results);
      setTotalContactCount(getContactCount());
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

  // Flatten and sort contacts for quilt grid
  const displayContacts = useMemo(() => {
    const all = [...groupedContacts.birthdays, ...groupedContacts.reconnect];

    // Sort: birthdays first, then by relationship priority
    const relationshipPriority: Record<string, number> = {
      partner: 1,
      spouse: 1,
      family: 2,
      friend: 3,
    };

    return all.sort((a, b) => {
      const aIsBirthday = isBirthdayToday(a);
      const bIsBirthday = isBirthdayToday(b);

      if (aIsBirthday && !bIsBirthday) return -1;
      if (!aIsBirthday && bIsBirthday) return 1;

      const aPriority = relationshipPriority[a.relationship?.toLowerCase() || ''] || 99;
      const bPriority = relationshipPriority[b.relationship?.toLowerCase() || ''] || 99;

      return aPriority - bPriority;
    }).slice(0, 6); // Limit to 6 tiles
  }, [groupedContacts]);

  const handleContactPress = useCallback((contact: Contact) => {
    router.push(`/contacts/${contact.id}`);
  }, [router]);

  const handleAddConnection = useCallback(() => {
    router.push('/contacts/add');
  }, [router]);

  const handleSeeAll = useCallback(() => {
    router.push('/(tabs)/two');
  }, [router]);

  const handleAvatarPress = useCallback(() => {
    router.push('/settings');
  }, [router]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadContacts();
  }, [loadContacts]);

  const handleOpenActions = useCallback((contact: Contact) => {
    setSelectedContact(contact);
    setShowQuickActions(true);
  }, []);

  const closeQuickActions = useCallback(() => {
    setShowQuickActions(false);
    setSelectedContact(null);
  }, []);

  const handleLogCheckIn = useCallback(() => {
    setShowQuickActions(false);
    setShowComposer(true);
  }, []);

  const handleSnooze = useCallback(async (days: 1 | 3 | 7) => {
    if (!selectedContact) return;

    try {
      const untilDate = Date.now() + days * 24 * 60 * 60 * 1000;
      await snoozeContact(selectedContact.id, untilDate);
      setShowQuickActions(false);
      setSelectedContact(null);
      loadContacts();
    } catch (error) {
      Alert.alert('Error', 'Unable to snooze this connection right now.');
    }
  }, [loadContacts, selectedContact]);

  const handleComposerSubmit = useCallback(async ({ kind, type, note }: { kind: InteractionKind; type: InteractionType; note: string }) => {
    if (!selectedContact) return;

    try {
      await createInteraction(selectedContact.id, type, note || undefined, kind);
      if (kind === 'checkin') {
        setCompletionCount((count) => count + 1);
      }
      loadContacts();
    } catch {
      Alert.alert('Error', 'Failed to save this interaction.');
    } finally {
      setShowComposer(false);
      setSelectedContact(null);
    }
  }, [loadContacts, selectedContact]);

  const closeComposer = useCallback(() => {
    setShowComposer(false);
    setSelectedContact(null);
  }, []);

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  const greeting = getGreeting();
  const isNarrowLayout = width < 390;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (totalContactCount === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
        <View className="flex-1 px-6 pt-10">
          <PageHeader
            title="Kindred"
            subtitle={`${greeting}, friend`}
            showBranding={false}
            rightElement={
              <TouchableOpacity onPress={handleAvatarPress} className="relative">
                <View className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-soft">
                  <View className="w-full h-full bg-primary items-center justify-center">
                    <Ionicons name="person" size={24} color="white" />
                  </View>
                </View>
              </TouchableOpacity>
            }
          />
          <EmptyContactsState />
        </View>
      </SafeAreaView>
    );
  }

  const hasContacts = displayContacts.length > 0;

  return (
    <>
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 140 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          <PageHeader
            title="Kindred"
            subtitle={`${greeting}, friend`}
            showBranding={false}
            rightElement={
              <TouchableOpacity onPress={handleAvatarPress} className="relative">
                <View className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-soft">
                  <View className="w-full h-full bg-primary items-center justify-center">
                    <Ionicons name="person" size={24} color="white" />
                  </View>
                </View>
              </TouchableOpacity>
            }
          />

          {/* Connections Section */}
          <View className="mb-6">
            <View className="flex-row justify-between items-end mb-4">
              <View>
                <Heading size={2}>Your connections</Heading>
                <Caption muted>Nurturing your inner circle</Caption>
              </View>
              {hasContacts && (
                <Body
                  size="sm"
                  className="text-primary"
                  onPress={handleSeeAll}
                >
                  See all
                </Body>
              )}
            </View>

            {hasContacts ? (
              <QuiltGrid columns={isNarrowLayout ? 1 : 2}>
                {displayContacts.map((contact) => {
                  const isBirthday = isBirthdayToday(contact);
                  return (
                    <ConnectionTile
                      key={contact.id}
                      contact={contact}
                      variant={getTileVariant(contact, isBirthday)}
                      size={getTileSize(contact)}
                      isBirthday={isBirthday}
                      onPress={() => handleContactPress(contact)}
                      onOpenActions={() => handleOpenActions(contact)}
                    />
                  );
                })}
              </QuiltGrid>
            ) : (
              <CelebrationStatus completionCount={completionCount} />
            )}

            <TouchableOpacity
              onPress={handleAddConnection}
              activeOpacity={0.85}
              className="mt-4 rounded-2xl border border-dashed border-primary/35 dark:border-primary/40 px-4 py-3.5 bg-white/80 dark:bg-card-dark/90 flex-row items-center justify-center"
            >
              <Ionicons name="add-circle-outline" size={18} color={Colors.primary} />
              <Body size="sm" weight="medium" className="ml-2 text-primary">
                Add a connection
              </Body>
            </TouchableOpacity>
          </View>

          {completionCount > 0 && (
            <Body muted className="text-center mt-6">
              {completionCount} {completionCount === 1 ? 'connection' : 'connections'} nurtured today
            </Body>
          )}
        </ScrollView>
      </SafeAreaView>
      <ConnectionQuickActionsSheet
        visible={showQuickActions}
        contact={selectedContact}
        onClose={closeQuickActions}
        onLogCheckIn={handleLogCheckIn}
        onSnooze={handleSnooze}
      />
      <InteractionComposerSheet
        visible={showComposer}
        contact={selectedContact}
        onClose={closeComposer}
        onSubmit={handleComposerSubmit}
        initialKind="checkin"
      />
    </>
  );
}
