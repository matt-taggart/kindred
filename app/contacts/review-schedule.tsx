import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

import BirthdayInput from "@/components/BirthdayInput";
import { EnhancedPaywallModal } from "@/components/EnhancedPaywallModal";
import FrequencyBadge from "@/components/FrequencyBadge";

import {
  CONTACT_LIMIT,
  addContact,
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
    async (contactsToImport: DistributionResult[]) => {
      let importedCount = 0;
      for (const distributed of contactsToImport) {
        const original = contactsData.find((c) => c.id === distributed.id);
        if (!original) continue;

        await addContact({
          name: original.name,
          phone: original.phone,
          bucket: original.bucket,
          avatarUri: original.avatarUri,
          customIntervalDays: original.customIntervalDays,
          nextContactDate: distributed.nextContactDate,
          birthday: original.birthday ?? null,
        });
        importedCount++;
      }
      return importedCount;
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

      await importContacts(distributedContacts);
      router.replace("/");
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
      const importedCount = await importContacts(contactsToImport);
      const skippedCount = distributedContacts.length - importedCount;

      Alert.alert(
        "Import Complete",
        `${importedCount} connection${importedCount !== 1 ? "s" : ""} imported successfully.${skippedCount > 0 ? ` ${skippedCount} skipped (limit reached).` : ""}`,
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

  if (distributedContacts.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-cream items-center justify-center">
        <ActivityIndicator size="large" color="#9CA986" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <Stack.Screen
        options={{
          title: "Review",
          headerBackTitle: "Back",
          headerShadowVisible: false,
          headerTitleStyle: { fontSize: 18, fontWeight: "700" },
        }}
      />

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
            {!isPro && distributedContacts.length > availableSlots && (
              <View className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <Text className="text-base font-bold text-amber-800">
                  Free plan limit reached
                </Text>
                <Text className="mt-1 text-sm text-amber-800">
                  Only the first {availableSlots} connection
                  {availableSlots !== 1 ? "s" : ""} will be imported unless you
                  upgrade.
                </Text>
              </View>
            )}

            <View className="rounded-2xl border border-border bg-surface p-5 shadow-sm mb-4">
              <Text className="text-xs font-semibold uppercase tracking-wide text-sage">
                Schedule preview
              </Text>
              <Text className="mt-1 text-lg font-semibold text-warmgray">
                Kindred has spread out your reminders.
              </Text>
              <Text className="mt-2 text-sm text-warmgray-muted">
                Kindred has distributed your {distributedContacts.length}{" "}
                connections across {stats.totalDays} days. Tap any connection to adjust their start date.
              </Text>
            </View>
          </View>
        }
        renderItem={({ item: [dateKey, contacts] }) => (
          <View className="mb-4">
            <Text className="text-sm font-semibold text-warmgray mb-2 px-1">
              {getDateLabel(new Date(dateKey).getTime())}
            </Text>
            {contacts.map((contact) => {
              const originalContact = contactsData.find(
                (c) => c.id === contact.id,
              );
              return (
                <View
                  key={contact.id}
                  className="mb-2 rounded-2xl border border-border bg-surface overflow-hidden"
                >
                  <TouchableOpacity
                    className="p-4"
                    onPress={() => handleEdit(contact.id, "startDate")}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-warmgray">
                          {contact.name}
                        </Text>
                        <Text className="text-sm text-warmgray-muted">
                          {bucketLabels[contact.bucket]}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <Text className="text-xs text-sage">Tap to edit</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    className={`px-4 py-3 border-t border-border/50 flex-row items-center justify-between ${
                      !originalContact?.birthday ? "bg-surface" : ""
                    }`}
                    onPress={() => handleEdit(contact.id, "birthday")}
                    activeOpacity={0.7}
                  >
                    {originalContact?.birthday ? (
                      <>
                        <View>
                          <Text className="text-xs font-medium text-warmgray-muted uppercase tracking-wide mb-1">
                            Birthday
                          </Text>
                          <Text className="text-sm text-warmgray">
                            🎂 {formatBirthdayDisplay(originalContact.birthday)}
                          </Text>
                        </View>
                        <Ionicons name="pencil" size={14} color="#9CA986" />
                      </>
                    ) : (
                      <View className="flex-row items-center gap-2">
                        <Ionicons name="add-circle-outline" size={18} color="#9CA986" />
                        <Text className="text-sm font-medium text-sage">
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

      <View className="border-t border-border bg-surface px-4 pb-4 pt-3">
        <TouchableOpacity
          className={`items-center rounded-xl py-4 ${!saving ? "bg-sage" : "bg-border"}`}
          onPress={handleImport}
          activeOpacity={0.9}
          disabled={saving}
        >
          <Text
            className={`text-base font-semibold ${!saving ? "text-white" : "text-warmgray-muted"}`}
          >
            {saving ? "Importing…" : "Looks good — import all"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* iOS Start Date Picker - Bottom Sheet */}
      {Platform.OS === "ios" && showDatePicker && editingState?.field === "startDate" && (
        <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-surface px-4 pb-8 pt-4">
          <View className="mb-2 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => {
                setShowDatePicker(false);
                setEditingState(null);
              }}
            >
              <Text className="text-base font-semibold text-warmgray-muted">
                Cancel
              </Text>
            </TouchableOpacity>
            <Text className="text-base font-bold text-warmgray">
              {editingContactName
                ? `${editingContactName}'s Start Date`
                : "Adjust Start Date"}
            </Text>
            <TouchableOpacity onPress={handleConfirmDate}>
              <Text className="text-base font-semibold text-sage">Done</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="spinner"
            minimumDate={new Date()}
            maximumDate={new Date(Date.now() + 365 * DAY_IN_MS)}
            onChange={(_e, date) => date && setSelectedDate(date)}
            accentColor="#9CA986"
            themeVariant="light"
          />
        </View>
      )}

      {/* iOS Birthday Input - Bottom Sheet */}
      {Platform.OS === "ios" && showDatePicker && editingState?.field === "birthday" && (
        <KeyboardAvoidingView
          behavior="padding"
          className="absolute bottom-0 left-0 right-0 border-t border-border bg-surface px-4 pb-8 pt-4"
        >
          <View className="mb-2 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => {
                setShowDatePicker(false);
                setEditingState(null);
              }}
            >
              <Text className="text-base font-semibold text-warmgray-muted">
                Cancel
              </Text>
            </TouchableOpacity>
            <Text className="text-base font-bold text-warmgray">
              Set Birthday
            </Text>
            <TouchableOpacity onPress={handleConfirmBirthday}>
              <Text className="text-base font-semibold text-sage">Done</Text>
            </TouchableOpacity>
          </View>
          <View className="py-4">
            <BirthdayInput
              value={birthdayInput}
              onChange={setBirthdayInput}
              autoFocus
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
          maximumDate={new Date(Date.now() + 365 * DAY_IN_MS)}
          onChange={handleDateChange}
          accentColor="#9CA986"
        />
      )}

      {/* Android Birthday Input */}
      {Platform.OS === "android" && showDatePicker && editingState?.field === "birthday" && (
        <View className="absolute bottom-0 left-0 right-0 top-0 bg-black/50 items-center justify-center p-4">
          <View className="bg-surface p-6 rounded-2xl w-full max-w-sm">
            <Text className="text-lg font-bold text-warmgray mb-4">Set Birthday</Text>
            <BirthdayInput
              value={birthdayInput}
              onChange={setBirthdayInput}
              autoFocus
            />
            <View className="flex-row justify-end gap-4 mt-4">
              <TouchableOpacity onPress={() => { setShowDatePicker(false); setEditingState(null); }}>
                <Text className="text-base font-medium text-warmgray-muted">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirmBirthday}>
                <Text className="text-base font-bold text-sage">Save</Text>
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
