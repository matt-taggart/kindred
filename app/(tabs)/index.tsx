import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { Contact } from '@/db/schema';
import { getDueContactsGrouped, GroupedDueContacts, isBirthdayToday, getContactCount } from '@/services/contactService';
import EmptyContactsState from '@/components/EmptyContactsState';
import CelebrationStatus from '@/components/CelebrationStatus';
import { PageHeader } from '@/components/PageHeader';
import { ConnectionTile } from '@/components/ConnectionTile';
import { AddConnectionTile } from '@/components/AddConnectionTile';
import { QuiltGrid } from '@/components/ui';
import { Heading, Body, Caption } from '@/components/ui';
import { getTileVariant, getTileSize } from '@/utils/tileVariant';

export default function HomeScreen() {
  const router = useRouter();
  const [groupedContacts, setGroupedContacts] = useState<GroupedDueContacts>({ birthdays: [], reconnect: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [completionCount, setCompletionCount] = useState(0);
  const [totalContactCount, setTotalContactCount] = useState<number | null>(null);

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

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  const greeting = getGreeting();

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
            <QuiltGrid>
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
                  />
                );
              })}
              <AddConnectionTile onPress={handleAddConnection} />
            </QuiltGrid>
          ) : (
            <CelebrationStatus completionCount={completionCount} />
          )}
        </View>

        {completionCount > 0 && (
          <Body muted className="text-center mt-6">
            {completionCount} {completionCount === 1 ? 'connection' : 'connections'} nurtured today
          </Body>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
