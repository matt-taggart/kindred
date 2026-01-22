import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as Contacts from "expo-contacts";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  FlatList,
  Image,
  Linking,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { EnhancedPaywallModal } from "@/components/EnhancedPaywallModal";
import FrequencyBadge from "@/components/FrequencyBadge";
import { formatPhoneNumber } from "@/utils/phone";
import { formatBirthdayDisplay } from "@/utils/formatters";

type Bucket = "daily" | "weekly" | "monthly" | "yearly" | "custom";

const bucketLabels: Record<Bucket, string> = {
  daily: "Every day",
  weekly: "Every week",
  monthly: "Once a month",
  yearly: "Once a year",
  custom: "Custom rhythm",
};

const bucketDescriptions: Record<Bucket, string> = {
  daily: "For your closest relationships",
  weekly: "For your inner circle",
  monthly: "For people you care about",
  yearly: "For long-distance friends",
  custom: "Choose your own rhythm",
};

type CustomUnit = "days" | "weeks" | "months";

const unitMultipliers: Record<CustomUnit, number> = {
  days: 1,
  weeks: 7,
  months: 30,
};

const DEFAULT_CUSTOM_DAYS = 5;

const deriveCustomUnitAndValue = (
  days?: number | null,
): { customUnit: CustomUnit; customValue: string } => {
  if (!days || days < 1) {
    return { customUnit: "days", customValue: String(DEFAULT_CUSTOM_DAYS) };
  }

  return { customUnit: "days", customValue: String(days) };
};

const formatCustomSummary = (days?: number | null) => {
  if (!days || days < 1) return "Set a custom frequency";
  if (days === 1) return "Every day";
  if (days % 30 === 0) {
    const months = days / 30;
    return months === 1 ? "Every month" : `Every ${months} months`;
  }
  if (days % 7 === 0) {
    const weeks = days / 7;
    return weeks === 1 ? "Every week" : `Every ${weeks} weeks`;
  }
  return `Every ${days} days`;
};

type ImportableContact = {
  id: string;
  name: string;
  phone: string;
  avatarUri?: string;
  birthday?: string;  // Format: "YYYY-MM-DD" or "MM-DD"
};

const getName = (contact: any) => {
  const parts = [contact.firstName, contact.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return (contact.name ?? parts).trim() || "Unnamed Contact";
};

const toImportable = (contact: Contacts.Contact & { id: string }): ImportableContact | null => {
  const phoneNumber = contact.phoneNumbers?.find((entry) =>
    entry.number?.trim(),
  );

  if (!phoneNumber?.number) {
    return null;
  }

  let birthday: string | undefined;
  if (contact.birthday) {
    const { day, month, year } = contact.birthday;
    if (day !== undefined && month !== undefined) {
      const mm = String(month + 1).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      birthday = year ? `${year}-${mm}-${dd}` : `${mm}-${dd}`;
    }
  }

  return {
    id: contact.id,
    name: getName(contact),
    phone: phoneNumber.number.trim(),
    avatarUri: contact.imageAvailable
      ? (contact.image?.uri ?? undefined)
      : undefined,
    birthday,
  };
};

const ContactRow = ({
  contact,
  selected,
  onToggle,
  frequency,
  onFrequencyChange,
}: {
  contact: ImportableContact;
  selected: boolean;
  onToggle: () => void;
  frequency: Bucket;
  onFrequencyChange: (bucket: Bucket) => void;
}) => {
  const initial = useMemo(
    () => contact.name.charAt(0).toUpperCase(),
    [contact.name],
  );

  return (
    <TouchableOpacity
      className="mb-3 rounded-2xl border border-border bg-surface p-4 shadow-sm"
      onPress={onToggle}
      activeOpacity={0.85}
    >
      <View className="flex-row items-center gap-3">
        {contact.avatarUri ? (
          <Image
            source={{ uri: contact.avatarUri }}
            className="h-10 w-10 rounded-full"
          />
        ) : (
          <View className="h-10 w-10 items-center justify-center rounded-full bg-sage">
            <Text className="text-sm font-semibold text-white">{initial}</Text>
          </View>
        )}

        <View className="flex-1">
          <Text className="text-base font-semibold text-warmgray">
            {contact.name}
          </Text>
          <Text className="text-sm text-warmgray-muted">
            {formatPhoneNumber(contact.phone)}
          </Text>
          {contact.birthday && (
            <Text className="text-xs text-warmgray-muted mt-0.5">
              🎂 {formatBirthdayDisplay(contact.birthday, { includeYear: true })}
            </Text>
          )}
        </View>

        <FrequencyBadge
          bucket={frequency}
          onPress={() => onFrequencyChange(frequency)}
        />

        <TouchableOpacity
          className="h-6 w-6 items-center justify-center rounded border border-border bg-surface"
          onPress={onToggle}
          activeOpacity={0.7}
        >
          <View
            className={`h-5 w-5 items-center justify-center rounded ${
              selected ? 'bg-sage' : 'bg-surface'
            }`}
          >
            {selected ? (
              <Text className="text-xs font-bold text-white">✓</Text>
            ) : null}
          </View>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default function ImportContactsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ autoRequest?: string }>();
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<ImportableContact[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [contactFrequencies, setContactFrequencies] = useState<
    Record<string, Bucket>
  >({});
  const [showFrequencySelector, setShowFrequencySelector] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [customIntervals, setCustomIntervals] = useState<
    Record<string, number>
  >({});
  const [customValue, setCustomValue] = useState("");
  const [customUnit, setCustomUnit] = useState<CustomUnit>("days");

  const derivedCustomDays = useMemo(() => {
    const numericValue = parseInt(customValue, 10);
    if (!Number.isFinite(numericValue) || numericValue <= 0) return null;
    return numericValue * unitMultipliers[customUnit];
  }, [customUnit, customValue]);

  const shouldAutoRequest = useMemo(() => {
    const value = params.autoRequest;
    if (Array.isArray(value)) {
      return value.includes("1") || value.includes("true");
    }
    return value === "1" || value === "true";
  }, [params.autoRequest]);

  const loadContacts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Image,
          Contacts.Fields.Birthday,
        ],
        sort: Contacts.SortTypes.FirstName,
      });

      const withPhones: ImportableContact[] = data
        .map(toImportable)
        .filter((item): item is ImportableContact => Boolean(item));

      setContacts(withPhones);
      setSelected(new Set());

      const initialFrequencies = withPhones.reduce(
        (acc, contact) => {
          acc[contact.id] = "weekly";
          return acc;
        },
        {} as Record<string, Bucket>,
      );
      setContactFrequencies(initialFrequencies);
      setEditingContactId(null);
      setShowFrequencySelector(false);
      setPermissionDenied(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const requestPermissionAndLoad = useCallback(async () => {
    setPermissionDenied(false);
    setLoading(true);

    try {
      const permission = await Contacts.requestPermissionsAsync();

      if (permission.status !== Contacts.PermissionStatus.GRANTED) {
        setPermissionDenied(true);
        setContacts([]);
        setSelected(new Set());

        if (!permission.canAskAgain) {
          Alert.alert(
            "Permission needed",
            "Enable contact access in Settings to import from your address book.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Open Settings",
                onPress: () => Linking.openSettings?.(),
              },
            ],
          );
        }
        return;
      }

      await loadContacts();
    } finally {
      setLoading(false);
    }
  }, [loadContacts]);

  useEffect(() => {
    const initialize = async () => {
      const permission = await Contacts.getPermissionsAsync();

      if (permission.status === Contacts.PermissionStatus.GRANTED) {
        await loadContacts();
        return;
      }

      if (shouldAutoRequest) {
        await requestPermissionAndLoad();
      }
    };

    initialize();
  }, [loadContacts, requestPermissionAndLoad, shouldAutoRequest]);

  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          const permission = await Contacts.getPermissionsAsync();
          if (permission.status === Contacts.PermissionStatus.GRANTED) {
            await loadContacts();
          }
        }
        appState.current = nextAppState;
      },
    );

    return () => subscription.remove();
  }, [loadContacts]);

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selected.size === contacts.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(contacts.map((c) => c.id)));
    }
  }, [contacts, selected]);

  const handleFrequencyChange = useCallback(
    (contactId: string) => {
      setEditingContactId(contactId);
      const existingDays = customIntervals[contactId];
      const { customUnit: u, customValue: v } =
        deriveCustomUnitAndValue(existingDays);
      setCustomUnit(u);
      setCustomValue(v);
      setShowFrequencySelector(true);
    },
    [customIntervals],
  );

  const handleSelectFrequency = useCallback(
    (bucket: Bucket) => {
      if (editingContactId) {
        setContactFrequencies((prev) => ({
          ...prev,
          [editingContactId]: bucket,
        }));
      }

      if (bucket === "custom") {
        const existingDays = editingContactId
          ? customIntervals[editingContactId]
          : undefined;
        const { customUnit: u, customValue: v } =
          deriveCustomUnitAndValue(existingDays);
        setCustomUnit(u);
        setCustomValue(v);
        return;
      }
    },
    [customIntervals, editingContactId],
  );

  const handleSaveFrequencyChange = useCallback(() => {
    if (!editingContactId) {
      setShowFrequencySelector(false);
      return;
    }

    const bucket = contactFrequencies[editingContactId] || "weekly";

    if (bucket === "custom") {
      const numericValue = parseInt(customValue, 10);
      if (!Number.isFinite(numericValue) || numericValue <= 0) {
        Alert.alert("Invalid Input", "Please enter a valid number.");
        return;
      }

      const days = numericValue * unitMultipliers[customUnit];
      if (days < 1 || days > 365) {
        Alert.alert(
          "Invalid cadence",
          "Custom reminders must be between 1 and 365 days.",
        );
        return;
      }

      setCustomIntervals((prev) => ({
        ...prev,
        [editingContactId]: days,
      }));
      setContactFrequencies((prev) => ({
        ...prev,
        [editingContactId]: "custom",
      }));
    }

    setShowFrequencySelector(false);
    setEditingContactId(null);
  }, [contactFrequencies, customUnit, customValue, editingContactId]);

  const handleSetAllFrequency = useCallback(
    (bucket: Bucket) => {
      const newFrequencies = contacts.reduce(
        (acc, contact) => {
          acc[contact.id] = bucket;
          return acc;
        },
        {} as Record<string, Bucket>,
      );
      setContactFrequencies(newFrequencies);
    },
    [contacts],
  );

  const handleImportPress = useCallback(async () => {
    await requestPermissionAndLoad();
  }, [requestPermissionAndLoad]);

  const handleAddMoreContacts = useCallback(() => {
    Alert.alert(
      "Add More Contacts",
      "To share more contacts with Kindred, update your contact access in Settings.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open Settings",
          onPress: async () => {
            await Linking.openSettings();
          },
        },
      ],
    );
  }, []);

  const handleSave = useCallback(() => {
    if (selected.size === 0) {
      return;
    }

    const chosen = contacts.filter((contact) => selected.has(contact.id));
    const contactsToImport = chosen.map((contact) => ({
      id: contact.id,
      name: contact.name,
      phone: contact.phone,
      avatarUri: contact.avatarUri,
      birthday: contact.birthday,
      bucket: contactFrequencies[contact.id] || "weekly",
      customIntervalDays:
        contactFrequencies[contact.id] === "custom"
          ? customIntervals[contact.id]
          : undefined,
    }));

    router.push({
      pathname: "/contacts/review-schedule",
      params: { contacts: JSON.stringify(contactsToImport) },
    });
  }, [contacts, router, selected, contactFrequencies, customIntervals]);

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <Stack.Screen
        options={{
          title: 'Import from contacts',
          headerBackTitle: 'Connections',
          headerShadowVisible: false,
          headerTitleStyle: { fontSize: 18, fontWeight: "700" },
        }}
      />

      {loading ? (
        <View className="flex-1 items-center justify-center px-4">
          <ActivityIndicator size="large" color="#9CA986" />
          <Text className="mt-3 text-sm font-semibold text-warmgray">
            Fetching contacts…
          </Text>
        </View>
      ) : (
        <View className="flex-1 px-4 pt-4">
          <FlatList
            data={contacts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ContactRow
                contact={item}
                selected={selected.has(item.id)}
                onToggle={() => toggleSelect(item.id)}
                frequency={contactFrequencies[item.id] || "weekly"}
                onFrequencyChange={() => handleFrequencyChange(item.id)}
              />
            )}
            ListHeaderComponent={
              <View className="pb-3">
                <View className="mb-6 rounded-2xl border border-border bg-surface p-5 shadow-sm">
                  <Text className="text-xs font-semibold uppercase tracking-wide text-sage">
                    Import
                  </Text>
                  <Text className="mt-1 text-xl font-bold text-warmgray">
                    {contacts.length > 0
                      ? 'Select who to import'
                      : 'Bring your people to Kindred'}
                  </Text>
                  <Text className="mt-2 text-sm text-warmgray-muted">
                    {contacts.length > 0
                      ? 'Choose which connections you’d like to add.'
                      : 'Give permission, pick who you’d like to bring in, and save them to Kindred.'}
                  </Text>

                  {contacts.length === 0 ? (
                    <TouchableOpacity
                      className="mt-4 items-center rounded-xl bg-sage py-4"
                      onPress={handleImportPress}
                      activeOpacity={0.9}
                    >
                      <Text className="text-base font-semibold text-white">
                        Import from contacts
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      className="mt-4 items-center rounded-xl border-2 border-sage bg-transparent py-4"
                      onPress={handleAddMoreContacts}
                      activeOpacity={0.9}
                    >
                      <Text className="text-base font-semibold text-sage">
                        Add more contacts
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {contacts.length > 0 && (
                  <TouchableOpacity
                    className="mb-2 flex-row items-center justify-between rounded-2xl border border-border bg-surface p-4 shadow-sm"
                    onPress={handleSelectAll}
                    activeOpacity={0.7}
                  >
                    <Text className="text-base font-semibold text-warmgray">
                      Select all
                    </Text>
                    <View
                      className={`h-6 w-6 items-center justify-center rounded border border-border ${
                        selected.size === contacts.length
                          ? "bg-sage border-sage"
                          : 'bg-surface'
                      }`}
                    >
                      <View
                        className={`h-5 w-5 items-center justify-center rounded ${
                          selected.size === contacts.length
                            ? "bg-sage"
                            : 'bg-surface'
                        }`}
                      >
                        {selected.size === contacts.length ? (
                          <Text className="text-xs font-bold text-white">
                            ✓
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  </TouchableOpacity>
                )}

                {permissionDenied ? (
                  <View className="rounded-2xl border border-red-200 bg-red-50 p-4">
                    <Text className="text-sm font-semibold text-red-700">
                      Permission denied
                    </Text>
                    <Text className="mt-1 text-sm text-red-600">
                      Enable contact access in Settings to import from your
                      address book.
                    </Text>
                  </View>
                ) : null}
              </View>
            }
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center px-6 py-14">
                <View
                  className="mb-6 items-center justify-center"
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                >
                  <View className="relative">
                    <Ionicons name="people-outline" size={80} color="#9CA986" />
                    <View className="absolute -bottom-1 -right-1 rounded-full bg-cream p-1">
                      <Ionicons name="heart" size={24} color="#C4A484" />
                    </View>
                  </View>
                </View>

                <Text className="text-2xl font-semibold text-warmgray text-center leading-tight mb-2">
                  {permissionDenied
                    ? "Contacts access needed"
                    : "Your contacts will show up here"}
                </Text>
                <Text className="text-base text-center text-warmgray-muted">
                  {permissionDenied
                    ? "Enable contact access in Settings to import from your address book."
                    : "Tap “Import from contacts” above to choose who you’d like to bring into Kindred."}
                </Text>
              </View>
            }
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: 140,
              paddingTop: 4,
              flexGrow: contacts.length === 0 ? 1 : undefined,
            }}
          />
        </View>
      )}

      <View className="border-t border-border bg-surface px-4 pb-4 pt-3">
        <TouchableOpacity
          className={`items-center rounded-xl py-4 ${selected.size > 0 ? 'bg-sage' : 'bg-border'}`}
          onPress={handleSave}
          activeOpacity={0.9}
          disabled={selected.size === 0}
        >
          <Text
            className={`text-base font-semibold ${selected.size > 0 ? 'text-white' : 'text-warmgray-muted'}`}
          >
            {`Import and Review (${selected.size})`}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showFrequencySelector}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFrequencySelector(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/50 px-6">
          <View className="w-full rounded-2xl bg-surface p-6 shadow-lg">
            <Text className="mb-2 text-lg font-bold text-warmgray">
              Reminder rhythm
            </Text>
            {editingContactId && (
              <Text className="mb-4 text-base text-warmgray-muted">
                How often would you like a gentle reminder to connect with{' '}
                {contacts.find((c) => c.id === editingContactId)?.name}?
              </Text>
            )}

            <ScrollView showsVerticalScrollIndicator={false}>
              {(
                [
                  "daily",
                  "weekly",
                  "monthly",
                  "yearly",
                  "custom",
                ] as Bucket[]
              ).map((bucket) => (
                <View key={bucket} className="mb-3">
                  <TouchableOpacity
                    className={`rounded-2xl border-2 p-4 ${
                      contactFrequencies[editingContactId || ""] === bucket
                        ? 'border-sage bg-sage-100'
                        : 'border-border bg-surface'
                    }`}
                    onPress={() => handleSelectFrequency(bucket)}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text
                          className={`text-base font-semibold ${
                            contactFrequencies[editingContactId || ""] ===
                            bucket
                              ? 'text-warmgray'
                              : 'text-warmgray'
                          }`}
                        >
                          {bucketLabels[bucket]}
                        </Text>
                        <Text className="mt-1 text-sm text-warmgray-muted">
                          {bucket === "custom"
                            ? contactFrequencies[editingContactId || ""] ===
                                "custom" &&
                              (derivedCustomDays ||
                                customIntervals[editingContactId || ""])
                              ? formatCustomSummary(
                                  derivedCustomDays ||
                                    customIntervals[editingContactId || ""],
                                )
                              : bucketDescriptions[bucket]
                            : bucketDescriptions[bucket]}
                        </Text>
                      </View>
                      <View
                        className={`h-6 w-6 rounded-full border-2 ${
                          contactFrequencies[editingContactId || ""] === bucket
                            ? "border-sage bg-sage"
                            : 'border-border'
                        }`}
                      />
                    </View>
                  </TouchableOpacity>

                  {bucket === "custom" &&
                    contactFrequencies[editingContactId || ""] === "custom" && (
                      <View className="mt-2 rounded-xl border border-sage/20 bg-surface px-4 pb-4 pt-2">
                        <View className="mt-2 flex-col gap-3">
                          <View>
                            <Text className="mb-1 text-xs font-medium text-warmgray-muted">
                              Frequency
                            </Text>
                            <View className="h-12 flex-row items-center rounded-xl border border-border bg-cream px-3">
                              <TextInput
                                value={customValue}
                                onChangeText={(text) =>
                                  setCustomValue(text.replace(/[^0-9]/g, ""))
                                }
                                keyboardType="number-pad"
                                className="flex-1 text-base leading-5 text-warmgray"
                                placeholder="e.g., 30"
                                placeholderTextColor="#94a3b8"
                                autoFocus
                                style={{ marginTop: -2 }}
                              />
                            </View>
                          </View>
                          <View>
                            <Text className="mb-1 text-xs font-medium text-warmgray-muted">
                              Unit
                            </Text>
                            <View className="flex-row gap-1 rounded-xl bg-cream p-1 border border-border">
                              {(
                                ["days", "weeks", "months"] as CustomUnit[]
                              ).map((unit) => (
                                <TouchableOpacity
                                  key={unit}
                                  onPress={() => setCustomUnit(unit)}
                                  className={`flex-1 items-center justify-center rounded-lg py-1.5 ${
                                    customUnit === unit ? 'bg-surface' : ''
                                  }`}
                                  style={
                                    customUnit === unit
                                      ? {
                                          shadowColor: "#000",
                                          shadowOffset: { width: 0, height: 1 },
                                          shadowOpacity: 0.05,
                                          shadowRadius: 2,
                                          elevation: 1,
                                        }
                                      : undefined
                                  }
                                >
                                  <Text
                                    className={`text-sm font-medium ${
                                      customUnit === unit
                                        ? 'text-warmgray'
                                        : 'text-warmgray-muted'
                                    }`}
                                  >
                                    {unit.charAt(0).toUpperCase() +
                                      unit.slice(1)}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          </View>
                        </View>

                      </View>
                    )}
                </View>
              ))}
            </ScrollView>

            <View className="mt-4 flex-col gap-3">
              <TouchableOpacity
                className="items-center rounded-xl bg-sage py-3"
                onPress={handleSaveFrequencyChange}
                activeOpacity={0.9}
              >
                <Text className="font-semibold text-white">Save Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="items-center rounded-xl bg-cream border border-border py-3"
                onPress={() => setShowFrequencySelector(false)}
                activeOpacity={0.7}
              >
                <Text className="font-semibold text-warmgray-muted">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <EnhancedPaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
      />
    </SafeAreaView>
  );
}
