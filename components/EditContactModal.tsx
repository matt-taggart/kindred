import { Modal, Pressable, TouchableOpacity, Platform } from "react-native";
import { SafeAreaView, ScrollView, Text, TextInput, View, Alert } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import BirthdayPicker from '@/components/BirthdayPicker';
import { hasYear, getMonthDay } from '@/utils/birthdayValidation';
import { getDateLabel } from '@/utils/scheduler';

import { Contact } from "@/db/schema";

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const formatBirthdayDisplay = (birthday: string): string => {
  if (!birthday) return '';

  let month: number;
  let day: number;
  let year: number | null = null;

  if (hasYear(birthday)) {
    // Format: YYYY-MM-DD
    const parts = birthday.split('-');
    year = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
    day = parseInt(parts[2], 10);
  } else {
    // Format: MM-DD
    const monthDay = getMonthDay(birthday);
    const parts = monthDay.split('-');
    month = parseInt(parts[0], 10);
    day = parseInt(parts[1], 10);
  }

  const monthName = MONTH_NAMES[month - 1];
  if (year) {
    return `${monthName} ${day}, ${year}`;
  }
  return `${monthName} ${day}`;
};

interface EditContactModalProps {
  contact: Contact;
  visible: boolean;
  onClose: () => void;
  onSave: (
    newBucket: Contact["bucket"],
    customIntervalDays?: number | null,
    birthday?: string | null,
    nextContactDate?: number | null,
  ) => void;
  onArchive?: () => void;
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

export default function EditContactModal({
  contact,
  visible,
  onClose,
  onSave,
  onArchive,
}: EditContactModalProps) {
  const [selectedBucket, setSelectedBucket] = useState<Contact["bucket"]>(
    contact.bucket,
  );
  const [{ customUnit, customValue }, setCustomState] = useState(() =>
    deriveCustomUnitAndValue(contact.customIntervalDays),
  );
  const [birthday, setBirthday] = useState<string>(contact.birthday || "");
  const [isBirthdayExpanded, setIsBirthdayExpanded] = useState(false);
  const [startDate, setStartDate] = useState(contact.nextContactDate ? new Date(contact.nextContactDate) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelectedBucket(contact.bucket);
      const derived = deriveCustomUnitAndValue(contact.customIntervalDays);
      setCustomState(derived);
      setBirthday(contact.birthday || "");
      setIsBirthdayExpanded(false);
      setStartDate(contact.nextContactDate ? new Date(contact.nextContactDate) : new Date());
      setShowDatePicker(false);
    }
  }, [visible, contact.bucket, contact.customIntervalDays, contact.birthday, contact.nextContactDate]);

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
    birthday !== (contact.birthday || "") ||
    startDate.getTime() !== (contact.nextContactDate || 0);

  const saveDisabled = !isCustomValid || !hasChanges;

  const handleSave = () => {
    if (!isCustomValid) return;
    const customDays = selectedBucket === "custom" ? derivedCustomDays : null;
    if (hasChanges) {
      onSave(selectedBucket, customDays ?? null, birthday || null, startDate.getTime());
    }
    onClose();
  };

  const handleArchive = () => {
    Alert.alert(
      "Archive Connection",
      `Are you sure you want to archive ${contact.name}? They won't appear in your main list, but you can restore them anytime.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Archive",
          style: "destructive",
          onPress: () => {
            onArchive?.();
            onClose();
          },
        },
      ],
    );
  };

  return (
    <Modal
      visible={visible}
      presentationStyle="pageSheet"
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
        <View className="flex-1 px-6 pb-6">
          {/* Header */}
          <View className="py-4 flex-row items-center justify-between">
            <Pressable onPress={onClose}>
              <Text className="text-primary font-medium text-lg">Cancel</Text>
            </Pressable>
            <Text className="text-xl font-semibold text-slate-800 dark:text-white">
              Connection settings
            </Text>
            <View className="w-12" />
          </View>

          {/* Profile Section */}
          <View className="items-center my-6">
            <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center mb-4">
              <Ionicons name="heart" size={28} color="#79947D" />
            </View>
            <Text className="text-2xl font-display text-slate-800 dark:text-white mb-2">
              {contact.name}
            </Text>
            <Text className="text-slate-500 dark:text-slate-400 italic">
              Every relationship has its own rhythm.
            </Text>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Rhythm Selection Cards */}
            <View className="space-y-4 mb-8">
              {(
                [
                  "daily",
                  "weekly",
                  "monthly",
                  "yearly",
                  "custom",
                ] as Contact["bucket"][]
              ).map((bucket) => {
                const isSelected = selectedBucket === bucket;
                const isCustomSelected = bucket === "custom" && isSelected;

                return (
                  <View key={bucket}>
                    <Pressable
                      className={`p-5 bg-card-light dark:bg-card-dark rounded-3xl shadow-sm border-2 ${
                        isSelected
                          ? 'border-primary'
                          : 'border-transparent'
                      } ${isCustomSelected ? 'rounded-b-none' : ''}`}
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
                          <Text className="text-lg font-semibold text-slate-800 dark:text-white">
                            {bucketLabels[bucket]}
                          </Text>
                          <Text className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {bucket === "custom"
                              ? formatCustomSummary(
                                  derivedCustomDays ?? contact.customIntervalDays,
                                )
                              : bucketDescriptions[bucket]}
                          </Text>
                        </View>
                        {/* Radio Indicator */}
                        <View
                          className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                            isSelected
                              ? "bg-primary border-primary"
                              : "border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          {isSelected && (
                            <View className="w-2.5 h-2.5 bg-white rounded-full" />
                          )}
                        </View>
                      </View>
                    </Pressable>

                    {/* Custom Rhythm Expansion */}
                    {isCustomSelected && (
                      <View className="bg-slate-50 dark:bg-slate-800 rounded-b-3xl border-2 border-t-0 border-primary px-5 pb-5 pt-3">
                        <View className="gap-4">
                          <View>
                            <Text className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                              Frequency
                            </Text>
                            <View className="h-12 flex-row items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3">
                              <TextInput
                                value={customValue}
                                onChangeText={(text) =>
                                  setCustomState({
                                    customUnit,
                                    customValue: text.replace(/[^0-9]/g, ""),
                                  })
                                }
                                keyboardType="number-pad"
                                className="flex-1 text-base text-slate-800 dark:text-white"
                                placeholder="e.g., 30"
                                placeholderTextColor="#94a3b8"
                              />
                            </View>
                          </View>
                          <View>
                            <Text className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                              Unit
                            </Text>
                            <View className="flex-row gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1 rounded-xl">
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
                                    className={`flex-1 items-center justify-center rounded-lg py-2 ${
                                      customUnit === unit
                                        ? 'bg-slate-100 dark:bg-slate-700'
                                        : ''
                                    }`}
                                  >
                                    <Text
                                      className={`text-sm font-medium ${
                                        customUnit === unit
                                          ? 'text-slate-800 dark:text-white'
                                          : 'text-slate-500 dark:text-slate-400'
                                      }`}
                                    >
                                      {unit.charAt(0).toUpperCase() + unit.slice(1)}
                                    </Text>
                                  </Pressable>
                                ),
                              )}
                            </View>
                          </View>
                        </View>

                        {!isCustomValid && (
                          <Text className="mt-4 text-sm text-red-500 font-medium">
                            Please enter a valid duration (1-365 days)
                          </Text>
                        )}

                        {isCustomValid && derivedCustomDays && (
                          <Text className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                            {"We'll remind you "}
                            <Text className="font-semibold text-primary">
                              {formatCustomSummary(derivedCustomDays)}
                            </Text>
                            .
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Birthday Section - Collapsible */}
            <View className="mb-4 rounded-2xl bg-surface p-4 shadow-sm border border-border">
              {/* Header Row */}
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View className="h-8 w-8 items-center justify-center rounded-full bg-sage-100">
                    <Text className="text-lg">🎂</Text>
                  </View>
                  <Text className="text-base font-semibold text-warmgray">
                    Birthday
                  </Text>
                </View>
                {isBirthdayExpanded ? (
                  <Pressable
                    onPress={() => setIsBirthdayExpanded(false)}
                    className="active:opacity-60"
                  >
                    <Text className="text-sm font-medium text-warmgray-muted">
                      Cancel
                    </Text>
                  </Pressable>
                ) : birthday ? (
                  <Pressable
                    onPress={() => setIsBirthdayExpanded(true)}
                    className="active:opacity-60"
                  >
                    <Text className="text-sm font-medium text-sage">
                      Edit
                    </Text>
                  </Pressable>
                ) : null}
              </View>

              {/* Content */}
              {isBirthdayExpanded ? (
                /* Expanded: Show BirthdayPicker */
                <>
                  <View className="py-2 mt-2">
                    <BirthdayPicker
                      value={birthday}
                      onChange={setBirthday}
                    />
                  </View>

                  <Text className="mt-3 text-xs text-warmgray-muted text-center">
                    {"We'll prioritize this over regular reminders on their birthday."}
                  </Text>
                </>
              ) : birthday ? (
                /* Collapsed with birthday set: Show formatted date */
                <Text className="text-base text-warmgray text-center py-4">
                  {formatBirthdayDisplay(birthday)}
                </Text>
              ) : (
                /* Collapsed without birthday: Show Add button */
                <Pressable
                  onPress={() => setIsBirthdayExpanded(true)}
                  className="py-4 items-center active:opacity-60"
                >
                  <View className="flex-row items-center gap-2 bg-sage-100 px-4 py-2 rounded-full">
                    <Ionicons name="add" size={18} color="#8B9678" />
                    <Text className="text-sm font-medium text-sage">
                      Add Birthday
                    </Text>
                  </View>
                </Pressable>
              )}
            </View>

            {/* Next Reminder Section */}
            <View className="mb-4 rounded-2xl bg-surface p-4 shadow-sm border border-border">
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="flex-row items-center justify-between"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center gap-3">
                  <View className="h-8 w-8 items-center justify-center rounded-full bg-sage-100">
                    <Ionicons name="calendar-outline" size={18} color="#8B9678" />
                  </View>
                  <View>
                    <Text className="text-base font-semibold text-warmgray">Next Reminder</Text>
                    <Text className="text-sm text-warmgray-muted">{getDateLabel(startDate.getTime())}</Text>
                  </View>
                </View>
                <Text className="text-sm font-medium text-sage">Edit</Text>
              </TouchableOpacity>

              {showDatePicker && Platform.OS === 'ios' && (
                <View className="mt-4 pt-4 border-t border-border">
                  <View className="flex-row justify-end mb-2">
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Text className="text-sm font-medium text-sage">Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={startDate}
                    mode="date"
                    display="spinner"
                    minimumDate={new Date()}
                    onChange={(_e, date) => date && setStartDate(date)}
                    themeVariant="light"
                    accentColor="#9CA986"
                  />
                </View>
              )}

              {showDatePicker && Platform.OS === 'android' && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onChange={(_e, date) => {
                    setShowDatePicker(false);
                    if (date) setStartDate(date);
                  }}
                />
              )}
            </View>
          </ScrollView>

          <Pressable
            onPress={handleSave}
            disabled={saveDisabled}
            className={`flex-row items-center justify-center rounded-2xl py-4 mt-5 ${
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

          {onArchive && !contact.isArchived && (
            <TouchableOpacity
              onPress={handleArchive}
              className="flex-row items-center justify-center gap-2 py-3"
              activeOpacity={0.85}
            >
              <Ionicons name="archive-outline" size={20} color="#8B9678" />
              <Text className="text-base text-warmgray-muted">
                Archive connection
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}
