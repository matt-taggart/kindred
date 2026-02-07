import * as Contacts from "expo-contacts";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import { PageHeader } from "@/components/PageHeader";
import { formatPhoneNumber } from "@/utils/phone";
import { formatBirthdayDisplay } from "@/utils/formatters";
import Colors from "@/constants/Colors";

type Bucket = "daily" | "weekly" | "monthly" | "yearly" | "custom";

const bucketLabels: Record<Bucket, string> = {
  daily: "Daily rhythm",
  weekly: "Weekly rhythm",
  monthly: "Monthly rhythm",
  yearly: "Yearly rhythm",
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

const avatarPalette = [
  { bg: '#E8EFEA', text: '#436850' },  // sage
  { bg: '#F8E9E9', text: '#8B5E5E' },  // quilt-pink
  { bg: '#FFE5D9', text: '#8B6B5C' },  // accent warm
  { bg: '#F3F0E6', text: '#6B6352' },  // cream
];

const getAvatarColor = (initial: string) =>
  avatarPalette[initial.charCodeAt(0) % avatarPalette.length];

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
      className={`mx-6 rounded-2xl p-4 flex-row items-start gap-4 ${
        selected
          ? 'mb-3 bg-sage-50 border border-sage-200'
          : 'mb-2 bg-white border border-stone-100'
      }`}
      onPress={onToggle}
      activeOpacity={0.9}
      style={selected ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 } : undefined}
    >
      <View
        className={`h-12 w-12 items-center justify-center rounded-full ${
          selected ? 'border-2 border-white overflow-hidden' : ''
        }`}
        style={!contact.avatarUri ? { backgroundColor: getAvatarColor(initial).bg } : undefined}
      >
        {contact.avatarUri ? (
          <Image
            source={{ uri: contact.avatarUri }}
            className="h-12 w-12 rounded-full"
          />
        ) : (
          <Text
            className="text-base font-medium font-serif"
            style={{ color: getAvatarColor(initial).text }}
          >
            {initial}
          </Text>
        )}
      </View>

      <View className="flex-1">
        <Text className="text-base font-medium text-brand-navy mb-0.5">
          {contact.name}
        </Text>
        <View className="flex-row items-center flex-wrap">
          <Text className="text-sm text-stone-500">
            {formatPhoneNumber(contact.phone)}
          </Text>
          {contact.birthday && (
            <>
              <Text className="text-stone-300 mx-1.5">·</Text>
              <View className="flex-row items-center gap-1">
                <Ionicons name="gift-outline" size={11} color="#a8a29e" />
                <Text className="text-xs text-stone-500">
                  {formatBirthdayDisplay(contact.birthday, { includeYear: false })}
                </Text>
              </View>
            </>
          )}
        </View>
        
        {selected && (
          <TouchableOpacity
            onPress={() => onFrequencyChange(frequency)}
            className="mt-2 w-full flex-row items-center justify-between px-3 py-2.5 rounded-xl border border-sage-200 bg-cream"
          >
            <Text className="text-xs font-medium text-sage-700 font-heading">
              {bucketLabels[frequency]}
            </Text>
            <Ionicons name="chevron-down" size={12} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      <View className={selected ? 'mt-1' : ''}>
        <View
          className={`h-6 w-6 items-center justify-center rounded-full border ${
            selected ? 'bg-primary border-primary' : 'border-stone-300'
          }`}
        >
          {selected && <Ionicons name="checkmark" size={14} color="white" />}
        </View>
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
    <SafeAreaView className="flex-1 bg-background-light">
      <View className="px-6 pt-2 pb-0">
        <PageHeader 
          title="Gather your connections" 
          subtitle="The people you care about will gather here." 
          showBranding={false}
          rightElement={
             <TouchableOpacity
              onPress={() => router.back()}
              className="p-2"
            >
              <Ionicons name="close" size={24} color={Colors.textSoft} />
            </TouchableOpacity>
          }
        />
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center px-4">
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text className="mt-3 text-sm font-semibold text-text-soft">
            Fetching contacts…
          </Text>
        </View>
      ) : (
        <View className="flex-1">
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
              <View className="px-6 pt-2 pb-3">

                <TouchableOpacity
                  className="w-full py-4 px-6 bg-white border border-stone-200 border-dashed rounded-2xl flex-row items-center justify-center gap-2 mb-4 active:bg-stone-50"
                  onPress={contacts.length === 0 ? handleImportPress : handleAddMoreContacts}
                  activeOpacity={0.9}
                >
                  <Ionicons name="person-add" size={20} color={Colors.primary} />
                  <Text className="font-medium text-brand-navy text-base">
                    Add more contacts
                  </Text>
                </TouchableOpacity>

                {contacts.length > 0 && (
                  <View className="flex-row items-center justify-end px-2 mb-4">
                  <TouchableOpacity
                    className="flex-row items-center gap-2"
                    onPress={handleSelectAll}
                    activeOpacity={0.7}
                  >
                    <Text className="font-medium text-stone-500 text-sm">Select all</Text>
                    <View
                      className={`h-5 w-5 items-center justify-center rounded-full border ${
                        selected.size === contacts.length ? 'bg-primary border-primary' : 'border-stone-300'
                      }`}
                    >
                      {selected.size === contacts.length && <Ionicons name="checkmark" size={12} color="white" />}
                    </View>
                  </TouchableOpacity>
                  </View>
                )}

                {permissionDenied && (
                  <View className="rounded-2xl border border-red-200 bg-red-50 p-4 mb-4">
                    <Text className="text-sm font-semibold text-red-700">
                      Permission denied
                    </Text>
                    <Text className="mt-1 text-sm text-red-600">
                      Enable contact access in Settings to import from your address book.
                    </Text>
                  </View>
                )}
              </View>
            }
            ListFooterComponent={
              contacts.length > 0 ? (
                <View className="mt-8 mb-12 flex-row justify-center" style={{ opacity: 0.2 }}>
                  <Ionicons name="leaf" size={60} color={Colors.primary} />
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center px-6 py-14">
                <Ionicons name="people-outline" size={80} color={Colors.primary} />
                <Text className="text-2xl font-semibold text-brand-navy text-center leading-tight mb-2 mt-4 font-heading">
                  {permissionDenied ? "Contacts access needed" : "Your connections will gather here"}
                </Text>
                <Text className="text-base text-center text-text-soft font-body max-w-[280px]">
                  {permissionDenied
                    ? "Enable contact access in Settings to import from your address book."
                    : "Tap “Add more contacts” above to choose who you’d like to bring into Kindred."}
                </Text>
              </View>
            }
            contentContainerStyle={{
              paddingBottom: 140,
              flexGrow: contacts.length === 0 ? 1 : undefined,
            }}
            className="flex-1"
            style={{ paddingHorizontal: 0 }}
          />
        </View>
      )}

      <View className="absolute bottom-0 left-0 right-0">
        <View className="h-12" style={{ backgroundColor: 'transparent' }} />
        <View className="border-t border-stone-100 px-6 pb-10 pt-4" style={{ backgroundColor: 'rgba(253,251,247,0.95)' }}>
          <TouchableOpacity
            className={`w-full py-4 rounded-full items-center justify-center ${
              selected.size > 0 ? 'bg-primary' : 'bg-sage-50 border border-stone-200'
            }`}
            style={selected.size > 0
              ? { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 10, elevation: 4 }
              : { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }
            }
            onPress={handleSave}
            activeOpacity={0.9}
            disabled={selected.size === 0}
          >
            <Text className={`text-lg font-semibold ${selected.size > 0 ? 'text-white' : 'text-stone-300'}`}>
              Add selected ({selected.size})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showFrequencySelector}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFrequencySelector(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          <View style={{ flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 24 }}>
            <View style={{ paddingTop: 16, paddingBottom: 8 }}>
              <TouchableOpacity
                onPress={() => setShowFrequencySelector(false)}
                style={{ alignSelf: 'flex-end', padding: 8 }}
              >
                <Ionicons name="close" size={24} color={Colors.textSoft} />
              </TouchableOpacity>
            </View>
            <View style={{ backgroundColor: '#FFFFFF' }}>
            <Text className="mb-2 text-lg font-bold text-brand-navy">
              Reminder rhythm
            </Text>
            {editingContactId && (
              <Text className="mb-4 text-base text-text-soft">
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
                    className={`rounded-xl border-2 px-6 py-4 ${
                      contactFrequencies[editingContactId || ""] === bucket
                        ? 'border-primary bg-sage-50'
                        : 'border-stone-200 bg-background-light'
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
                              ? 'text-brand-navy'
                              : 'text-brand-navy'
                          }`}
                        >
                          {bucketLabels[bucket]}
                        </Text>
                        <Text className="mt-1 text-sm text-text-soft">
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
                            ? "border-primary bg-primary"
                            : 'border-stone-200'
                        }`}
                      />
                    </View>
                  </TouchableOpacity>

                  {bucket === "custom" &&
                    contactFrequencies[editingContactId || ""] === "custom" && (
                      <View className="mt-2 rounded-xl border bg-sage-50 px-5 pb-5 pt-3 border-sage-200">
                        <View className="mt-2 flex-col gap-3">
                          <View>
                            <Text className="mb-1 text-xs font-medium text-text-soft">
                              Frequency
                            </Text>
                            <View className="h-12 flex-row items-center rounded-lg border border-stone-200 bg-white px-3">
                              <TextInput
                                value={customValue}
                                onChangeText={(text) =>
                                  setCustomValue(text.replace(/[^0-9]/g, ""))
                                }
                                keyboardType="number-pad"
                                className="flex-1 text-base leading-5 text-brand-navy"
                                placeholder="e.g., 30"
                                placeholderTextColor="#94a3b8"
                                autoFocus
                                style={{ marginTop: -2 }}
                              />
                            </View>
                          </View>
                          <View>
                            <Text className="mb-1 text-xs font-medium text-text-soft">
                              Unit
                            </Text>
                            <View className="flex-row gap-1 rounded-lg bg-background-light p-1 border border-stone-200">
                              {(
                                ["days", "weeks", "months"] as CustomUnit[]
                              ).map((unit) => (
                                <TouchableOpacity
                                  key={unit}
                                  onPress={() => setCustomUnit(unit)}
                                  className={`flex-1 items-center justify-center rounded-lg py-1.5 ${
                                    customUnit === unit ? 'bg-white' : ''
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
                                        ? 'text-brand-navy'
                                        : 'text-text-soft'
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
                className="items-center rounded-full bg-primary py-3"
                onPress={handleSaveFrequencyChange}
                activeOpacity={0.9}
              >
                <Text className="font-semibold text-white">Save Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="items-center rounded-xl bg-cream border border-stone-200 py-3"
                onPress={() => setShowFrequencySelector(false)}
                activeOpacity={0.7}
              >
                <Text className="font-semibold text-text-soft">Cancel</Text>
              </TouchableOpacity>
            </View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      <EnhancedPaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
      />
      </SafeAreaView>
  );
}
