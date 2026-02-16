import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  useWindowDimensions,
  View,
} from "react-native";

import Constants from "expo-constants";
import Colors from "@/constants/Colors";
import { Contact, NewInteraction } from "@/db/schema";
import {
  getDueContactsGrouped,
  GroupedDueContacts,
  isBirthdayToday,
  getContactCount,
  snoozeContact,
  createInteraction,
} from "@/services/contactService";
import EmptyContactsState from "@/components/EmptyContactsState";
import CelebrationStatus from "@/components/CelebrationStatus";
import { PageHeader } from "@/components/PageHeader";
import { ConnectionTile } from "@/components/ConnectionTile";
import InteractionComposerSheet, {
  InteractionKind,
} from "@/components/InteractionComposerSheet";
import { ConnectionQuickActionsSheet } from "@/components/ConnectionQuickActionsSheet";
import { QuiltGrid, Heading, Body } from "@/components/ui";
import { getTileSize } from "@/utils/tileVariant";

const GENERIC_DEVICE_NAME_TOKENS = new Set([
  "android",
  "device",
  "galaxy",
  "google",
  "iphone",
  "ipad",
  "ipod",
  "moto",
  "my",
  "oneplus",
  "phone",
  "pixel",
  "redmi",
  "samsung",
  "tablet",
  "the",
  "this",
  "xiaomi",
]);

const extractFirstNameFromDeviceName = (
  deviceName?: string | null,
): string | null => {
  if (!deviceName) return null;

  const normalized = deviceName.trim();
  if (!normalized) return null;

  const possessiveMatch = normalized.match(/^(.+?)['’]s\b/);
  const ownerChunk = possessiveMatch ? possessiveMatch[1] : normalized;
  const firstToken = ownerChunk.split(/\s+/)[0]?.replace(/[^A-Za-z-]/g, "");

  if (!firstToken) return null;
  if (GENERIC_DEVICE_NAME_TOKENS.has(firstToken.toLowerCase())) return null;

  return firstToken;
};

const alternatingTileVariants = ["primary", "secondary", "accent"] as const;

export default function HomeScreen() {
  type InteractionType = NewInteraction["type"];
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [groupedContacts, setGroupedContacts] = useState<GroupedDueContacts>({
    birthdays: [],
    reconnect: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [completionCount, setCompletionCount] = useState(0);
  const [totalContactCount, setTotalContactCount] = useState<number | null>(
    null,
  );
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showComposer, setShowComposer] = useState(false);

  const loadContacts = useCallback(() => {
    try {
      const results = getDueContactsGrouped();
      setGroupedContacts(results);
      setTotalContactCount(getContactCount());
    } catch (e) {
      console.warn("Failed to load contacts:", e);
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

    return all
      .sort((a, b) => {
        const aIsBirthday = isBirthdayToday(a);
        const bIsBirthday = isBirthdayToday(b);

        if (aIsBirthday && !bIsBirthday) return -1;
        if (!aIsBirthday && bIsBirthday) return 1;

        const aPriority =
          relationshipPriority[a.relationship?.toLowerCase() || ""] || 99;
        const bPriority =
          relationshipPriority[b.relationship?.toLowerCase() || ""] || 99;

        return aPriority - bPriority;
      })
      .slice(0, 6); // Limit to 6 tiles
  }, [groupedContacts]);

  const handleContactPress = useCallback(
    (contact: Contact) => {
      router.push(`/contacts/${contact.id}`);
    },
    [router],
  );

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

  const handleSnooze = useCallback(
    async (days: 1 | 3 | 7) => {
      if (!selectedContact) return;

      try {
        const untilDate = Date.now() + days * 24 * 60 * 60 * 1000;
        await snoozeContact(selectedContact.id, untilDate);
        setShowQuickActions(false);
        setSelectedContact(null);
        loadContacts();
      } catch {
        Alert.alert("Error", "Unable to snooze this connection right now.");
      }
    },
    [loadContacts, selectedContact],
  );

  const handleComposerSubmit = useCallback(
    async ({
      kind,
      type,
      note,
    }: {
      kind: InteractionKind;
      type: InteractionType;
      note: string;
    }) => {
      if (!selectedContact) return;

      try {
        await createInteraction(
          selectedContact.id,
          type,
          note || undefined,
          kind,
        );
        if (kind === "checkin") {
          setCompletionCount((count) => count + 1);
        }
        loadContacts();
      } catch {
        Alert.alert("Error", "Failed to save this interaction.");
      } finally {
        setShowComposer(false);
        setSelectedContact(null);
      }
    },
    [loadContacts, selectedContact],
  );

  const closeComposer = useCallback(() => {
    setShowComposer(false);
    setSelectedContact(null);
  }, []);

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };
  const greeting = getGreeting();
  const userFirstName = useMemo(
    () => extractFirstNameFromDeviceName(Constants.deviceName),
    [],
  );
  const todayLabel = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());
  const greetingSubject = userFirstName ?? todayLabel;
  const greetingSubtitle = `${greeting}, today is ${greetingSubject}.`;
  const isNarrowLayout = width < 390;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-surface-page dark:bg-background-dark">
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (totalContactCount === 0) {
    return (
      <SafeAreaView className="flex-1 bg-surface-page dark:bg-background-dark">
        <View className="flex-1 px-6 pt-14">
          <PageHeader
            title="Kindred"
            subtitle={greetingSubtitle}
            titleToSubtitleGapClassName="mb-1"
            subtitleSize="base"
          />
          <EmptyContactsState />
        </View>
      </SafeAreaView>
    );
  }

  const hasContacts = displayContacts.length > 0;

  if (!hasContacts) {
    return (
      <>
        <SafeAreaView className="flex-1 bg-surface-page dark:bg-background-dark">
          <View className="flex-1 px-6 pt-14">
            <PageHeader
              title="Kindred"
              subtitle={greetingSubtitle}
              titleToSubtitleGapClassName="mb-1"
              subtitleSize="base"
            />

            <View className="flex-1 justify-center pb-20">
              <CelebrationStatus completionCount={completionCount} />
            </View>
          </View>
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

  return (
    <>
      <SafeAreaView className="flex-1 bg-surface-page dark:bg-background-dark">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: 140,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          <PageHeader
            title="Kindred"
            subtitle={greetingSubtitle}
            titleToSubtitleGapClassName="mb-1"
            subtitleSize="base"
          />

          {/* Connections Section */}
          <View className="mt-4 mb-6">
            <View className="flex-row justify-between items-end mb-4">
              <View>
                <Heading size={2}>Today&apos;s connections</Heading>
                <Body size="sm" className="text-text-muted dark:text-slate-400">
                  Nurture your circle.
                </Body>
              </View>
            </View>

            <QuiltGrid columns={isNarrowLayout ? 1 : 2}>
              {displayContacts.map((contact, index) => {
                const isBirthday = isBirthdayToday(contact);
                return (
                  <ConnectionTile
                    key={contact.id}
                    contact={contact}
                    variant={
                      alternatingTileVariants[
                        index % alternatingTileVariants.length
                      ]
                    }
                    size={getTileSize(contact)}
                    isBirthday={isBirthday}
                    onPress={() => handleContactPress(contact)}
                    onOpenActions={() => handleOpenActions(contact)}
                  />
                );
              })}
            </QuiltGrid>
          </View>
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
