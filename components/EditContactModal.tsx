import { Modal, Pressable, Platform } from "react-native";
import { SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";
import { useEffect, useMemo, useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";

import { Contact } from "@/db/schema";

interface EditContactModalProps {
  contact: Contact;
  visible: boolean;
  onClose: () => void;
  onSave: (
    newBucket: Contact["bucket"],
    customIntervalDays?: number | null,
    birthday?: string | null,
  ) => void;
}

const bucketLabels: Record<Contact["bucket"], string> = {
  daily: "Every day",
  weekly: "Every week",
  "bi-weekly": "Every few weeks",
  "every-three-weeks": "Every few weeks",
  monthly: "Once a month",
  "every-six-months": "Seasonally",
  yearly: "Once a year",
  custom: "Custom rhythm",
};

const bucketDescriptions: Record<Contact["bucket"], string> = {
  daily: "For your closest relationships",
  weekly: "For your inner circle",
  "bi-weekly": "Every 14 days",
  "every-three-weeks": "Every 21 days",
  monthly: "For people you care about",
  "every-six-months": "For seasonal connections",
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

const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const parseDate = (dateString: string) => {
  const [y, m, d] = dateString.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export default function EditContactModal({
  contact,
  visible,
  onClose,
  onSave,
}: EditContactModalProps) {
  const [selectedBucket, setSelectedBucket] = useState<Contact["bucket"]>(
    contact.bucket,
  );
  const [{ customUnit, customValue }, setCustomState] = useState(() =>
    deriveCustomUnitAndValue(contact.customIntervalDays),
  );
  const [birthday, setBirthday] = useState<string>(contact.birthday || "");

  useEffect(() => {
    if (visible) {
      setSelectedBucket(contact.bucket);
      const derived = deriveCustomUnitAndValue(contact.customIntervalDays);
      setCustomState(derived);
      setBirthday(contact.birthday || "");
    }
  }, [visible, contact.bucket, contact.customIntervalDays, contact.birthday]);

  const derivedCustomDays = useMemo(() => {
    const numericValue = Number(customValue);
    if (!Number.isFinite(numericValue) || numericValue <= 0) return null;
    return Math.round(numericValue * unitMultipliers[customUnit]);
  }, [customUnit, customValue]);

  const isCustom = selectedBucket === "custom";
  const isCustomValid =
    !isCustom ||
    (derivedCustomDays !== null &&
      derivedCustomDays >= 1 &&
      derivedCustomDays <= 365);
  const hasChanges =
    selectedBucket !== contact.bucket ||
    (isCustom && derivedCustomDays !== contact.customIntervalDays) ||
    (!isCustom && contact.bucket === "custom") ||
    birthday !== (contact.birthday || "");

  const saveDisabled = !isCustomValid || !hasChanges;

  const handleSave = () => {
    if (!isCustomValid) return;
    const customDays = selectedBucket === "custom" ? derivedCustomDays : null;
    if (hasChanges) {
      onSave(selectedBucket, customDays ?? null, birthday || null);
    }
    onClose();
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setBirthday(formatDate(selectedDate));
    }
  };

  return (
    <Modal
      visible={visible}
      presentationStyle="pageSheet"
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-cream">
        <View className="flex-1 px-6 pb-4 pt-6">
          <View className="mb-6 flex-row items-center justify-between">
            <Pressable onPress={onClose}>
              <Text className="font-semibold text-warmgray-muted">Cancel</Text>
            </Pressable>
            <Text className="text-lg font-bold text-warmgray">
              Connection settings
            </Text>
            <View className="w-12" />
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <Text className="mb-2 text-lg font-bold text-warmgray">
              {contact.name}
            </Text>
            <Text className="mb-6 text-base text-warmgray-muted">
              How often would you like a gentle reminder to connect?
            </Text>

            <View className="mb-8 rounded-2xl bg-surface p-4 shadow-sm border border-border">
              <View className="flex-row items-center justify-between mb-2.5">
                <View className="flex-row items-center gap-2">
                  <View className="h-8 w-8 items-center justify-center rounded-full bg-sage-100">
                    <Text className="text-lg">🎂</Text>
                  </View>
                  <Text className="text-base font-semibold text-warmgray">
                    Birthday
                  </Text>
                </View>
                {birthday ? (
                  <Pressable
                    onPress={() => setBirthday("")}
                    className="active:opacity-60"
                  >
                    <Text className="text-sm font-medium text-terracotta">
                      Remove
                    </Text>
                  </Pressable>
                ) : null}
              </View>

              {!birthday ? (
                <Pressable
                  onPress={() => setBirthday(formatDate(new Date()))}
                  className="flex-row items-center justify-center rounded-xl border border-sage/20 bg-cream py-4"
                >
                  <Text className="text-base font-bold text-sage">
                    Add birthday (optional)
                  </Text>
                </Pressable>
              ) : (
                <View className="flex-row items-center justify-between rounded-xl border border-border bg-surface p-3">
                  <DateTimePicker
                    value={parseDate(birthday)}
                    mode="date"
                    display="compact"
                    onChange={handleDateChange}
                    accentColor="#9CA986" // Sage
                    themeVariant="light"
                  />
                </View>
              )}
              <Text className="mt-3 text-xs text-warmgray-muted text-center">
                We'll prioritize this over regular reminders on their birthday.
              </Text>
            </View>

            <View className="mb-3 flex-row items-center gap-2">
              <Text className="text-base font-semibold text-warmgray">
                Reminder rhythm
              </Text>
            </View>

            <View className="mb-4 flex gap-2">
              {(
                [
                  "daily",
                  "weekly",
                  "bi-weekly",
                  "monthly",
                  "yearly",
                  "custom",
                ] as Contact["bucket"][]
              ).map((bucket) => (
                <View key={bucket}>
                  <Pressable
                    className={`border-2 p-4 ${
                      selectedBucket === bucket
                        ? 'border-sage bg-sage-100'
                        : 'border-border bg-surface'
                    } ${
                      bucket === "custom" && selectedBucket === "custom"
                        ? "rounded-t-2xl border-b-0"
                        : "rounded-2xl"
                    }`}
                    onPress={() => {
                      setSelectedBucket(bucket);
                      if (bucket === "custom") {
                        const derived = deriveCustomUnitAndValue(
                          contact.customIntervalDays,
                        );
                        setCustomState(derived);
                      }
                    }}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text
                          className={`text-base font-semibold ${
                            selectedBucket === bucket
                              ? 'text-warmgray'
                              : 'text-warmgray'
                          }`}
                        >
                          {bucketLabels[bucket]}
                        </Text>
                        <Text className="mt-1 text-sm text-warmgray-muted">
                          {bucket === "custom"
                            ? formatCustomSummary(
                                derivedCustomDays ?? contact.customIntervalDays,
                              )
                            : bucketDescriptions[bucket]}
                        </Text>
                      </View>
                      <View
                        className={`h-6 w-6 rounded-full border-2 ${
                          selectedBucket === bucket
                            ? "border-sage bg-sage"
                            : 'border-border'
                        }`}
                      />
                    </View>
                  </Pressable>

                  {bucket === "custom" && selectedBucket === "custom" && (
                    <View className="rounded-b-2xl border-x-2 border-b-2 border-sage bg-surface px-4 pb-4 pt-2">
                      <View className="mt-2 flex-col gap-3">
                        <View>
                          <Text className="text-xs font-medium text-warmgray-muted mb-1">
                            Frequency
                          </Text>
                          <View className="h-12 flex-row items-center rounded-xl border border-border bg-cream px-3">
                            <TextInput
                              value={customValue}
                              onChangeText={(text) =>
                                setCustomState({
                                  customUnit,
                                  customValue: text.replace(/[^0-9]/g, ""),
                                })
                              }
                              keyboardType="number-pad"
                              className="flex-1 text-base leading-5 text-warmgray"
                              placeholder="e.g., 30"
                              placeholderTextColor="#8B9678"
                              style={{ marginTop: -2 }}
                            />
                          </View>
                        </View>
                        <View>
                          <Text className="text-xs font-medium text-warmgray-muted mb-1">
                            Unit
                          </Text>
                          <View className="flex-row gap-1 bg-cream border border-border p-1 rounded-xl">
                            {(["days", "weeks", "months"] as CustomUnit[]).map(
                              (unit) => (
                                <Pressable
                                  key={unit}
                                  onPress={() =>
                                    setCustomState({
                                      customUnit: unit,
                                      customValue,
                                    })
                                  }
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
                                </Pressable>
                              ),
                            )}
                          </View>
                        </View>
                      </View>

                      {!isCustomValid && (
                        <Text className="mt-3 text-sm text-terracotta font-medium">
                          Please enter a valid duration (1-365 days)
                        </Text>
                      )}

                      {isCustomValid && derivedCustomDays && (
                        <Text className="mt-3 text-sm text-warmgray-muted">
                          We’ll remind you{' '}
                          <Text className="font-semibold text-sage">
                            {formatCustomSummary(derivedCustomDays)}
                          </Text>
                          .
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              ))}
            </View>
          </ScrollView>

          <Pressable
            onPress={handleSave}
            disabled={saveDisabled}
            className={`flex-row items-center justify-center rounded-2xl py-4 ${
              saveDisabled ? 'bg-border' : 'bg-sage'
            }`}
          >
            <Text
              className={`text-lg font-semibold ${
                saveDisabled ? 'text-warmgray-muted' : 'text-white'
              }`}
            >
              Save changes
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
