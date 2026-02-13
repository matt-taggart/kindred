import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";

import BirthdayPicker from "@/components/BirthdayPicker";
import { EnhancedPaywallModal } from "@/components/EnhancedPaywallModal";
import FrequencyBadge from "@/components/FrequencyBadge";
import { PageHeader } from "@/components/PageHeader";
import Colors from "@/constants/Colors";

import {
  CONTACT_LIMIT,
  addContact,
  getContacts,
  getAvailableSlots,
} from "@/services/contactService";
import { useUserStore } from "@/lib/userStore";
import {
  DAY_IN_MS,
  DistributionResult,
  bucketOffsets,
  distributeContacts,
  getDateLabel,
  groupByDate,
} from "@/utils/scheduler";
import { formatBirthdayDisplay } from "@/utils/formatters";
import { buildContactDedupKey } from "@/utils/phone";

type ContactToImport = {
  id: string;
  name: string;
  phone: string;
  avatarUri?: string;
  bucket:
    | "daily"
    | "weekly"
    | "bi-weekly"
    | "every-three-weeks"
    | "monthly"
    | "every-six-months"
    | "yearly"
    | "custom";
  customIntervalDays?: number | null;
  birthday?: string;
};

type ImportContactsResult = {
  importedCount: number;
  duplicateCount: number;
};

const bucketLabels: Record<string, string> = {
  daily: "Every day",
  weekly: "Every week",
  "bi-weekly": "Every few weeks",
  "every-three-weeks": "Every few weeks",
  monthly: "Once a month",
  "every-six-months": "Seasonally",
  yearly: "Once a year",
  custom: "Custom rhythm",
};

const MAX_START_DATE_YEARS = 5;

export default function ReviewScheduleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ contacts: string }>();

  const [distributedContacts, setDistributedContacts] = useState<
    DistributionResult[]
  >([]);
  const [contactsData, setContactsData] = useState<ContactToImport[]>([]);
  const [saving, setSaving] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  
  const [editingState, setEditingState] = useState<{
    id: string;
    field: "startDate" | "birthday";
  } | null>(null);
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [birthdayInput, setBirthdayInput] = useState("");
  const [availableSlots, setAvailableSlots] = useState<number>(5);
  const isPro = useUserStore((s) => s.isPro);

  const maxStartDate = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear() + MAX_START_DATE_YEARS, 11, 31);
  }, []);

  useEffect(() => {
    setAvailableSlots(getAvailableSlots());
  }, []);

  useEffect(() => {
    if (params.contacts) {
      try {
        const parsed: ContactToImport[] = JSON.parse(params.contacts);
        setContactsData(parsed);

        const distributed = distributeContacts(
          parsed.map((c) => ({
            id: c.id,
            name: c.name,
            bucket: c.bucket,
            customIntervalDays: c.customIntervalDays,
          })),
        );
        setDistributedContacts(distributed);
      } catch (e) {
        Alert.alert("Error", "Failed to parse contacts data");
        router.back();
      }
    }
  }, [params.contacts, router]);

  const groupedByDate = useMemo(() => {
    const grouped = groupByDate(distributedContacts);
    const sortedEntries = Array.from(grouped.entries()).sort(
      ([a], [b]) => new Date(a).getTime() - new Date(b).getTime(),
    );
    return sortedEntries;
  }, [distributedContacts]);

  const stats = useMemo(() => {
    const totalDays = groupedByDate.length;
    const maxPerDay = Math.max(
      ...groupedByDate.map(([, contacts]) => contacts.length),
      0,
    );
    const avgValue = totalDays > 0 ? distributedContacts.length / totalDays : 0;
    const avgPerDay = Number.isInteger(avgValue)
      ? avgValue.toString()
      : avgValue.toFixed(1);
    return { totalDays, maxPerDay, avgPerDay };
  }, [groupedByDate, distributedContacts]);

  const handleEdit = useCallback(
    (contactId: string, field: "startDate" | "birthday") => {
      if (field === "startDate") {
        const contact = distributedContacts.find((c) => c.id === contactId);
        if (contact) {
          setEditingState({ id: contactId, field });
          setSelectedDate(new Date(contact.nextContactDate));
          setShowDatePicker(true);
        }
      } else {
        const originalContact = contactsData.find((c) => c.id === contactId);
        if (originalContact) {
          setEditingState({ id: contactId, field });
          setBirthdayInput(originalContact.birthday || "");
          setShowDatePicker(true);
        }
      }
    },
    [distributedContacts, contactsData],
  );

  const handleDateChange = useCallback(
    (_event: any, date?: Date) => {
      if (Platform.OS === "android") {
        setShowDatePicker(false);
      }

      if (date && editingState?.field === "startDate") {
        setDistributedContacts((prev) =>
          prev.map((c) =>
            c.id === editingState.id
              ? { ...c, nextContactDate: date.getTime() }
              : c,
          ),
        );
        if (Platform.OS === "android") {
          setEditingState(null);
        }
      }
    },
    [editingState],
  );

  const handleConfirmBirthday = useCallback(() => {
    if (!editingState || editingState.field !== "birthday") return;

    setContactsData((prev) =>
      prev.map((c) =>
        c.id === editingState.id
          ? { ...c, birthday: birthdayInput || undefined }
          : c,
      ),
    );

    setShowDatePicker(false);
    setEditingState(null);
  }, [editingState, birthdayInput]);

  const handleConfirmDate = useCallback(() => {
    if (editingState) {
      if (editingState.field === "startDate") {
        setDistributedContacts((prev) =>
          prev.map((c) =>
            c.id === editingState.id
              ? { ...c, nextContactDate: selectedDate.getTime() }
              : c,
          ),
        );
      }
    }
    setShowDatePicker(false);
    setEditingState(null);
  }, [editingState, selectedDate]);

  const importContacts = useCallback(
    async (contactsToImport: DistributionResult[]): Promise<ImportContactsResult> => {
      const existingDedupKeys = new Set(
        getContacts()
          .map((contact) => buildContactDedupKey(contact.name, contact.phone))
          .filter((key): key is string => Boolean(key)),
      );

      let importedCount = 0;
      let duplicateCount = 0;
      for (const distributed of contactsToImport) {
        const original = contactsData.find((c) => c.id === distributed.id);
        if (!original) continue;

        const dedupKey = buildContactDedupKey(original.name, original.phone);
        if (dedupKey && existingDedupKeys.has(dedupKey)) {
          duplicateCount++;
          continue;
        }

        await addContact({
          name: original.name,
          phone: original.phone,
          bucket: original.bucket,
          avatarUri: original.avatarUri,
          customIntervalDays: original.customIntervalDays,
          nextContactDate: distributed.nextContactDate,
          birthday: original.birthday ?? null,
        });

        if (dedupKey) {
          existingDedupKeys.add(dedupKey);
        }
        importedCount++;
      }
      return { importedCount, duplicateCount };
    },
    [contactsData],
  );

  const handleImport = useCallback(async () => {
    if (saving) return;
    setSaving(true);

    try {
      const slots = getAvailableSlots();
      setAvailableSlots(slots);

      if (!isPro && distributedContacts.length > slots) {
        setShowPaywall(true);
        setSaving(false);
        return;
      }

      const { importedCount, duplicateCount } = await importContacts(distributedContacts);

      if (duplicateCount > 0) {
        Alert.alert(
          "Import Complete",
          importedCount > 0
            ? `${importedCount} connection${importedCount !== 1 ? "s" : ""} imported successfully. ${duplicateCount} duplicate${duplicateCount !== 1 ? "s were" : " was"} skipped.`
            : `${duplicateCount} duplicate connection${duplicateCount !== 1 ? "s were" : " was"} skipped. No new connections were imported.`,
          [{ text: "OK", onPress: () => router.replace("/") }],
        );
      } else {
        router.replace("/");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to import contacts.",
      );
      setSaving(false);
    }
  }, [distributedContacts, router, saving, isPro, importContacts]);

  const handlePartialImport = useCallback(async () => {
    setShowPaywall(false);
    setSaving(true);

    try {
      const contactsToImport = distributedContacts.slice(0, availableSlots);
      const { importedCount, duplicateCount } = await importContacts(contactsToImport);
      const limitSkippedCount = Math.max(0, distributedContacts.length - contactsToImport.length);

      const details = [
        `${importedCount} connection${importedCount !== 1 ? "s" : ""} imported successfully.`,
      ];

      if (duplicateCount > 0) {
        details.push(
          `${duplicateCount} duplicate connection${duplicateCount !== 1 ? "s were" : " was"} skipped.`,
        );
      }
      if (limitSkippedCount > 0) {
        details.push(
          `${limitSkippedCount} skipped (limit reached).`,
        );
      }

      Alert.alert(
        "Import Complete",
        details.join(" "),
        [{ text: "OK", onPress: () => router.replace("/") }],
      );
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to import contacts.",
      );
      setSaving(false);
    }
  }, [distributedContacts, availableSlots, importContacts, router]);

  const editingContactName = useMemo(() => {
    if (!editingState) return null;
    return distributedContacts.find((c) => c.id === editingState.id)?.name;
  }, [distributedContacts, editingState]);

  const exceedsFreeLimit = !isPro && distributedContacts.length > availableSlots;
  const hasNoFreeSlots = exceedsFreeLimit && availableSlots === 0;
  const primaryCtaLabel = saving
    ? "Importing…"
    : hasNoFreeSlots
      ? "Upgrade to Pro"
      : "Looks good — import all";

  if (distributedContacts.length === 0) {
    return (
      <SafeAreaView
        edges={["top"]}
        className="flex-1 bg-surface-page items-center justify-center"
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-surface-page">
      <View className="px-6 pt-2 pb-0">
        <PageHeader
          title="Review schedule"
          subtitle="Tap any connection to adjust their start date."
          showBranding={false}
          leftElement={
            <TouchableOpacity
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full bg-surface-card border border-stroke-soft"
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={20} color={Colors.brandNavy} />
            </TouchableOpacity>
          }
        />
      </View>

      <FlatList
        data={groupedByDate}
        keyExtractor={([dateKey]) => dateKey}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 140,
          paddingTop: 8,
        }}
        ListHeaderComponent={
          <View className="mb-4">
            {exceedsFreeLimit && (
              <View className="mb-4 border border-amber-100 bg-amber-50 p-5" style={{ borderRadius: 16 }}>
                <Text className="text-base font-bold text-amber-800">
                  Free plan limit reached
                </Text>
                <Text className="mt-1 text-sm text-amber-800">
                  {hasNoFreeSlots
                    ? "No contacts will be imported unless you upgrade."
                    : `Only the first ${availableSlots} connection${availableSlots !== 1 ? "s" : ""} will be imported unless you upgrade.`}
                </Text>
              </View>
            )}

            <View className="border border-stroke-soft bg-surface-card p-5 shadow-sm mb-4" style={{ borderRadius: 16 }}>
              <Text className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                Schedule preview
              </Text>
              <Text className="mt-1 text-lg font-semibold text-text-strong">
                Kindred has spread out your reminders.
              </Text>
              <Text className="mt-2 text-sm text-text-muted">
                Your {distributedContacts.length}{" "}
                connections have been distributed across {stats.totalDays} days.
              </Text>
            </View>
          </View>
        }
        renderItem={({ item: [dateKey, contacts] }) => (
          <View className="mb-4">
            <Text className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3 px-1">
              {getDateLabel(new Date(dateKey).getTime())}
            </Text>
            {contacts.map((contact) => {
              const originalContact = contactsData.find(
                (c) => c.id === contact.id,
              );
              return (
                <View
                  key={contact.id}
                  className="mb-2 border border-stroke-soft bg-surface-card"
                  style={{ borderRadius: 16 }}
                >
                  <TouchableOpacity
                    className="px-5 py-4"
                    onPress={() => handleEdit(contact.id, "startDate")}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-text-strong">
                          {contact.name}
                        </Text>
                        <Text className="text-sm text-text-muted mt-0.5">
                          {bucketLabels[contact.bucket]}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <Text className="text-xs text-stone-400">Tap to edit</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    className="px-5 py-3 border-t border-stroke-soft flex-row items-center justify-between"
                    onPress={() => handleEdit(contact.id, "birthday")}
                    activeOpacity={0.7}
                  >
                    {originalContact?.birthday ? (
                      <>
                        <View>
                          <Text className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-1">
                            Birthday
                          </Text>
                          <Text className="text-sm text-text-strong">
                            🎂 {formatBirthdayDisplay(originalContact.birthday, { includeYear: true })}
                          </Text>
                        </View>
                        <Ionicons name="pencil" size={14} color={Colors.primary} />
                      </>
                    ) : (
                      <View className="flex-row items-center gap-2">
                        <Ionicons name="add-circle-outline" size={18} color={Colors.primary} />
                        <Text className="text-sm font-medium text-primary">
                          Add birthday
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      />

      <View
        className="border-t border-stroke-soft px-6"
        style={{
          backgroundColor: "rgba(253,251,247,0.95)",
          minHeight: 88,
          paddingTop: 16,
          paddingBottom: 10,
          justifyContent: "flex-start",
        }}
      >
        <TouchableOpacity
          className={`items-center rounded-full py-4 ${!saving ? "bg-primary" : "bg-stone-200"}`}
          onPress={handleImport}
          activeOpacity={0.9}
          disabled={saving}
          style={!saving ? { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 10, elevation: 4 } : undefined}
        >
          <Text
            className={`text-base font-bold ${!saving ? "text-white" : "text-stone-400"}`}
          >
            {primaryCtaLabel}
          </Text>
        </TouchableOpacity>
      </View>

      {/* iOS Start Date Picker - Bottom Sheet */}
      {Platform.OS === "ios" && showDatePicker && editingState?.field === "startDate" && (
        <View className="absolute bottom-0 left-0 right-0 border-t border-stroke-soft bg-surface-card px-4 pb-8 pt-4">
          <View className="mb-2 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => {
                setShowDatePicker(false);
                setEditingState(null);
              }}
            >
              <Text className="text-base font-semibold text-text-soft">
                Cancel
              </Text>
            </TouchableOpacity>
            <Text className="text-base font-bold text-text-strong">
              {editingContactName
                ? `${editingContactName}'s Start Date`
                : "Adjust Start Date"}
            </Text>
            <TouchableOpacity onPress={handleConfirmDate}>
              <Text className="text-base font-semibold text-primary">Done</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="spinner"
            minimumDate={new Date()}
            maximumDate={maxStartDate}
            onChange={(_e, date) => date && setSelectedDate(date)}
            accentColor={Colors.primary}
            themeVariant="light"
          />
        </View>
      )}

      {/* iOS Birthday Input - Bottom Sheet */}
      {Platform.OS === "ios" && showDatePicker && editingState?.field === "birthday" && (
        <KeyboardAvoidingView
          behavior="padding"
          className="absolute bottom-0 left-0 right-0 border-t border-stroke-soft bg-surface-card px-4 pb-8 pt-4"
        >
          <View className="mb-2 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => {
                setShowDatePicker(false);
                setEditingState(null);
              }}
            >
              <Text className="text-base font-semibold text-text-soft">
                Cancel
              </Text>
            </TouchableOpacity>
            <Text className="text-base font-bold text-text-strong">
              Set Birthday
            </Text>
            <TouchableOpacity onPress={handleConfirmBirthday}>
              <Text className="text-base font-semibold text-primary">Done</Text>
            </TouchableOpacity>
          </View>
          <View className="py-4">
            <BirthdayPicker
              value={birthdayInput}
              onChange={setBirthdayInput}
            />
          </View>
        </KeyboardAvoidingView>
      )}

      {/* Android Start Date Picker */}
      {Platform.OS === "android" && showDatePicker && editingState?.field === "startDate" && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          minimumDate={new Date()}
          maximumDate={maxStartDate}
          onChange={handleDateChange}
          accentColor={Colors.primary}
        />
      )}

      {/* Android Birthday Input */}
      {Platform.OS === "android" && showDatePicker && editingState?.field === "birthday" && (
        <View className="absolute bottom-0 left-0 right-0 top-0 bg-black/50 items-center justify-center p-4">
          <View className="bg-surface-card p-6 rounded-2xl w-full max-w-sm border border-stroke-soft">
            <Text className="text-lg font-bold text-text-strong mb-4">Set Birthday</Text>
            <BirthdayPicker
              value={birthdayInput}
              onChange={setBirthdayInput}
            />
            <View className="flex-row justify-end gap-4 mt-4">
              <TouchableOpacity onPress={() => { setShowDatePicker(false); setEditingState(null); }}>
                <Text className="text-base font-medium text-text-soft">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirmBirthday}>
                <Text className="text-base font-bold text-primary">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <EnhancedPaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        importContext={{
          selectedCount: distributedContacts.length,
          availableSlots,
          onImportPartial: handlePartialImport,
        }}
      />
    </SafeAreaView>
  );
}
