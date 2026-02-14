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
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { EnhancedPaywallModal } from "@/components/EnhancedPaywallModal";
import { PageHeader } from "@/components/PageHeader";
import { getContacts } from "@/services/contactService";
import { buildContactDedupKey, formatPhoneNumber } from "@/utils/phone";
import { formatBirthdayDisplay } from "@/utils/formatters";
import { normalizeAvatarUri } from "@/utils/avatar";
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
const CUSTOM_OPTION_TOP_GUTTER = 8;
const DEFAULT_FREQUENCY_MODAL_PADDING_BOTTOM = 140;

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

type DuplicateSummary = {
  alreadyImported: number;
  duplicateInAddressBook: number;
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
      ? normalizeAvatarUri(contact.image?.uri ?? undefined)
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
  const normalizedAvatarUri = normalizeAvatarUri(contact.avatarUri);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const showAvatarImage = Boolean(normalizedAvatarUri) && !avatarLoadFailed;

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [normalizedAvatarUri]);

  return (
    <TouchableOpacity
      className={`mx-6 rounded-2xl p-4 flex-row items-start gap-4 ${
        selected
          ? 'mb-3 bg-sage-light border border-primary/25'
          : 'mb-3 bg-surface-card border border-stroke-soft'
      }`}
      onPress={onToggle}
      activeOpacity={0.9}
      style={selected ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 } : undefined}
    >
      <View
        className={`h-12 w-12 items-center justify-center rounded-full ${
          selected ? 'border-2 border-white overflow-hidden' : ''
        }`}
        style={!showAvatarImage ? { backgroundColor: getAvatarColor(initial).bg } : undefined}
      >
        {showAvatarImage ? (
          <Image
            source={{ uri: normalizedAvatarUri }}
            className="h-12 w-12 rounded-full"
            onError={() => setAvatarLoadFailed(true)}
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
        <Text className="text-base font-medium text-text-strong mb-0.5">
          {contact.name}
        </Text>
        <View className="flex-row items-center flex-wrap">
          <Text className="text-sm text-text-muted">
            {formatPhoneNumber(contact.phone)}
          </Text>
          {contact.birthday && (
            <>
              <Text className="text-text-muted/45 mx-1.5">·</Text>
              <View className="flex-row items-center gap-1">
                <Ionicons name="calendar-outline" size={11} color={Colors.textSoft} />
                <Text className="text-xs text-text-muted">
                  {formatBirthdayDisplay(contact.birthday, { includeYear: false })}
                </Text>
              </View>
            </>
          )}
        </View>
        
        {selected && (
          <TouchableOpacity
            onPress={() => onFrequencyChange(frequency)}
            className="mt-2 w-full flex-row items-center justify-between px-3 py-2.5 rounded-xl border border-accent-border bg-accent-soft"
          >
            <Text className="text-xs font-medium text-text-muted">
              {bucketLabels[frequency]}
            </Text>
            <Ionicons name="chevron-down" size={12} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      <View className={selected ? 'mt-1' : ''}>
        <View
          className={`h-7 w-7 items-center justify-center rounded-full border ${
            selected ? 'bg-primary border-primary' : 'border-stroke-soft'
          }`}
        >
          {selected && <Ionicons name="checkmark" size={15} color="white" />}
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
  const [duplicateSummary, setDuplicateSummary] = useState<DuplicateSummary>({
    alreadyImported: 0,
    duplicateInAddressBook: 0,
  });
  const [customValue, setCustomValue] = useState("");
  const [customUnit, setCustomUnit] = useState<CustomUnit>("days");
  const frequencyScrollViewRef = useRef<ScrollView | null>(null);
  const customOptionLayoutYRef = useRef<number | null>(null);
  const shouldScrollToCustomCadenceRef = useRef(false);

  const isCustomFrequencySelected = useMemo(() => {
    if (!editingContactId) return false;
    return contactFrequencies[editingContactId] === "custom";
  }, [contactFrequencies, editingContactId]);

  const scrollToCustomFormOptions = useCallback((animated = true) => {
    setTimeout(() => {
      const customOptionLayoutY = customOptionLayoutYRef.current;
      if (customOptionLayoutY !== null) {
        frequencyScrollViewRef.current?.scrollTo({
          y: Math.max(customOptionLayoutY - CUSTOM_OPTION_TOP_GUTTER, 0),
          animated,
        });
      }
      shouldScrollToCustomCadenceRef.current = false;
    }, 0);
  }, []);

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

      const existingDedupKeys = new Set(
        getContacts()
          .map((contact) => buildContactDedupKey(contact.name, contact.phone))
          .filter((key): key is string => Boolean(key)),
      );

      const seenAddressBookDedupKeys = new Set<string>();
      let alreadyImported = 0;
      let duplicateInAddressBook = 0;

      const deduped = withPhones.filter((contact) => {
        const dedupKey = buildContactDedupKey(contact.name, contact.phone);
        if (!dedupKey) return true;

        if (existingDedupKeys.has(dedupKey)) {
          alreadyImported += 1;
          return false;
        }

        if (seenAddressBookDedupKeys.has(dedupKey)) {
          duplicateInAddressBook += 1;
          return false;
        }

        seenAddressBookDedupKeys.add(dedupKey);
        return true;
      });

      setDuplicateSummary({
        alreadyImported,
        duplicateInAddressBook,
      });
      setContacts(deduped);
      setSelected(new Set());

      const initialFrequencies = deduped.reduce(
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
        setDuplicateSummary({ alreadyImported: 0, duplicateInAddressBook: 0 });
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

  useEffect(() => {
    if (!showFrequencySelector || !isCustomFrequencySelected) return;

    shouldScrollToCustomCadenceRef.current = true;
    scrollToCustomFormOptions();
  }, [
    isCustomFrequencySelected,
    scrollToCustomFormOptions,
    showFrequencySelector,
  ]);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const subscription = Keyboard.addListener(showEvent, () => {
      if (showFrequencySelector && isCustomFrequencySelected) {
        scrollToCustomFormOptions();
      }
    });

    return () => subscription.remove();
  }, [
    isCustomFrequencySelected,
    scrollToCustomFormOptions,
    showFrequencySelector,
  ]);

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
      customOptionLayoutYRef.current = null;
      shouldScrollToCustomCadenceRef.current = false;
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
        shouldScrollToCustomCadenceRef.current = true;
        const existingDays = editingContactId
          ? customIntervals[editingContactId]
          : undefined;
        const { customUnit: u, customValue: v } =
          deriveCustomUnitAndValue(existingDays);
        setCustomUnit(u);
        setCustomValue(v);
        scrollToCustomFormOptions();
        return;
      }

      shouldScrollToCustomCadenceRef.current = false;
    },
    [customIntervals, editingContactId, scrollToCustomFormOptions],
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

  const duplicatesFilteredCount =
    duplicateSummary.alreadyImported + duplicateSummary.duplicateInAddressBook;
  const duplicateSummaryParts = [
    duplicateSummary.alreadyImported > 0
      ? `${duplicateSummary.alreadyImported} already in Kindred`
      : null,
    duplicateSummary.duplicateInAddressBook > 0
      ? `${duplicateSummary.duplicateInAddressBook} repeated in your address book`
      : null,
  ].filter((part): part is string => Boolean(part));

  return (
    <SafeAreaView className="flex-1 bg-surface-page">
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
          <Text className="mt-3 text-sm font-semibold text-text-muted">
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
                  className="w-full py-4 px-6 bg-surface-card border border-stroke-soft rounded-2xl flex-row items-center justify-center gap-2 mb-4 active:bg-surface-soft"
                  onPress={contacts.length === 0 ? handleImportPress : handleAddMoreContacts}
                  activeOpacity={0.9}
                >
                  <Ionicons name="person-add" size={20} color={Colors.primary} />
                  <Text className="font-medium text-text-strong text-base">
                    Add more contacts
                  </Text>
                </TouchableOpacity>

                {duplicatesFilteredCount > 0 && (
                  <View className="rounded-2xl border border-blue-200 bg-blue-50 p-4 mb-4">
                    <Text className="text-sm font-semibold text-blue-700">
                      Duplicates skipped
                    </Text>
                    <Text className="mt-1 text-sm text-blue-700">
                      {duplicateSummaryParts.join(", ")}. They won't be imported again.
                    </Text>
                  </View>
                )}

                {contacts.length > 0 && (
                  <View className="mb-3 flex-row items-center justify-between rounded-2xl border border-stroke-soft bg-surface-card px-4 py-3">
                    <View className="flex-row items-center">
                      <View className="h-7 w-7 items-center justify-center rounded-full bg-sage-light">
                        <Ionicons name="checkmark-done-outline" size={14} color={Colors.primary} />
                      </View>
                      <Text className="ml-2 text-sm font-semibold text-text-strong">
                        {selected.size} selected
                      </Text>
                    </View>
                    <Text className="text-xs text-text-muted">Tap a card to toggle</Text>
                  </View>
                )}

                {contacts.length > 0 && (
                  <View className="flex-row items-center justify-end px-2 mb-2">
                  <TouchableOpacity
                    className="flex-row items-center gap-2"
                    onPress={handleSelectAll}
                    activeOpacity={0.7}
                  >
                    <Text className="font-medium text-text-muted text-sm">Select all</Text>
                    <View
                      className={`h-5 w-5 items-center justify-center rounded-full border ${
                        selected.size === contacts.length ? 'bg-primary border-primary' : 'border-stroke-soft'
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
                <Text className="text-2xl font-semibold text-text-strong text-center leading-tight mb-2 mt-4 font-heading">
                  {permissionDenied ? "Contacts access needed" : "Your connections will gather here"}
                </Text>
                <Text className="text-base text-center text-text-muted font-body max-w-[280px]">
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
        <View className="border-t border-stroke-soft px-6 pb-10 pt-4" style={{ backgroundColor: 'rgba(253,251,247,0.95)' }}>
          <TouchableOpacity
            className={`w-full py-4 rounded-full items-center justify-center ${
              selected.size > 0 ? 'bg-primary' : 'bg-surface-soft border border-stroke-soft'
            }`}
            style={selected.size > 0
              ? { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 10, elevation: 4 }
              : { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }
            }
            onPress={handleSave}
            activeOpacity={0.9}
            disabled={selected.size === 0}
          >
            <Text className={`text-lg font-bold ${selected.size > 0 ? 'text-white' : 'text-text-muted/50'}`}>
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
        <SafeAreaView className="flex-1 bg-surface-page">
          <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
          >
            <View className="flex-1 px-6">
              <View className="items-center pt-3 pb-2">
                <View className="h-1 w-10 rounded-full bg-stone-300" />
              </View>
              <View className="flex-row justify-end pb-2">
                <TouchableOpacity
                  onPress={() => setShowFrequencySelector(false)}
                  className="p-2"
                >
                  <Ionicons name="close" size={24} color={Colors.textSoft} />
                </TouchableOpacity>
              </View>
              <Text className="mb-2 text-lg font-bold text-text-strong">
                Reminder rhythm
              </Text>
              {editingContactId && (
                <Text className="mb-4 text-base text-text-muted">
                  How often would you like a gentle reminder to connect with{' '}
                  {contacts.find((c) => c.id === editingContactId)?.name}?
                </Text>
              )}

              <ScrollView
                ref={frequencyScrollViewRef}
                onContentSizeChange={() => {
                  if (shouldScrollToCustomCadenceRef.current) {
                    scrollToCustomFormOptions();
                  }
                }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingBottom: DEFAULT_FREQUENCY_MODAL_PADDING_BOTTOM,
                }}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode={
                  Platform.OS === "ios" ? "interactive" : "on-drag"
                }
              >
                {(
                  [
                    "daily",
                    "weekly",
                    "monthly",
                    "yearly",
                    "custom",
                  ] as Bucket[]
                ).map((bucket) => {
                  const isSelected = contactFrequencies[editingContactId || ""] === bucket;
                  return (
                  <View
                    key={bucket}
                    testID={bucket === "custom" ? "custom-rhythm-option" : undefined}
                    onLayout={
                      bucket === "custom"
                        ? (event) => {
                            customOptionLayoutYRef.current = event.nativeEvent.layout.y;
                            if (shouldScrollToCustomCadenceRef.current) {
                              scrollToCustomFormOptions();
                            }
                          }
                        : undefined
                    }
                    className="mb-3"
                  >
                    <TouchableOpacity
                      className={`rounded-2xl border px-5 py-4 ${
                        isSelected
                          ? 'border-primary bg-sage-light'
                          : 'border-stroke-soft bg-surface-card'
                      }`}
                      onPress={() => handleSelectFrequency(bucket)}
                      activeOpacity={0.7}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                          <Text className="text-base font-semibold text-text-strong">
                            {bucketLabels[bucket]}
                          </Text>
                          <Text className="mt-1 text-sm text-text-muted">
                            {bucket === "custom"
                              ? isSelected &&
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
                          className={`h-7 w-7 items-center justify-center rounded-full border ${
                            isSelected
                              ? "border-primary bg-primary"
                              : 'border-stroke-soft'
                          }`}
                        >
                          {isSelected && <Ionicons name="checkmark" size={15} color="white" />}
                        </View>
                      </View>
                    </TouchableOpacity>

                    {bucket === "custom" && isSelected && (
                        <View
                          testID="custom-cadence-form"
                          className="mt-2 rounded-2xl border border-stroke-soft bg-surface-card px-5 pb-5 pt-3"
                        >
                          <View className="mt-2 flex-col gap-3">
                            <View>
                              <Text className="mb-1 text-xs font-medium text-text-muted">
                                Frequency
                              </Text>
                              <View className="h-12 flex-row items-center rounded-xl border border-stroke-soft bg-surface-page px-3">
                                <TextInput
                                  value={customValue}
                                  onChangeText={(text) =>
                                    setCustomValue(text.replace(/[^0-9]/g, ""))
                                  }
                                  onFocus={() => scrollToCustomFormOptions()}
                                  keyboardType="number-pad"
                                  className="flex-1 text-base leading-5 text-text-strong"
                                  placeholder="e.g., 30"
                                  placeholderTextColor="#9AA3AF"
                                  autoFocus
                                  style={{ marginTop: -2 }}
                                />
                              </View>
                            </View>
                            <View>
                              <Text className="mb-1 text-xs font-medium text-text-muted">
                                Unit
                              </Text>
                              <View className="flex-row gap-1 rounded-xl bg-surface-page p-1 border border-stroke-soft">
                                {(
                                  ["days", "weeks", "months"] as CustomUnit[]
                                ).map((unit) => (
                                  <TouchableOpacity
                                    key={unit}
                                    onPress={() => setCustomUnit(unit)}
                                    className={`flex-1 items-center justify-center rounded-lg py-1.5 ${
                                      customUnit === unit ? 'bg-surface-card' : ''
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
                                          ? 'text-text-strong'
                                          : 'text-text-muted'
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
                  );
                })}
              </ScrollView>

              <View
                className="absolute bottom-0 left-0 right-0 px-6 pb-10 pt-4"
                style={{ backgroundColor: 'rgba(253,251,247,0.95)' }}
              >
                <TouchableOpacity
                  className="items-center rounded-full bg-primary py-4"
                  onPress={handleSaveFrequencyChange}
                  activeOpacity={0.9}
                  style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 10, elevation: 4 }}
                >
                  <Text className="font-bold text-white text-base">Save Changes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="items-center rounded-full py-4 mt-2"
                  onPress={() => setShowFrequencySelector(false)}
                  activeOpacity={0.7}
                >
                  <Text className="font-semibold text-text-muted text-base">Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      <EnhancedPaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
      />
      </SafeAreaView>
  );
}
