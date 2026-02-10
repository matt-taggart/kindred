import { Modal, Pressable } from "react-native";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
  Alert,
} from "react-native";
import { useEffect, useMemo, useState } from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import BirthdayPicker from "@/components/BirthdayPicker";
import { hasYear, getMonthDay } from "@/utils/birthdayValidation";

import { Contact } from "@/db/schema";
import Colors from "@/constants/Colors";
import { Body, Caption, Heading } from "@/components/ui";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const formatBirthdayDisplay = (birthday: string): string => {
  if (!birthday) return "";

  let month: number;
  let day: number;
  let year: number | null = null;

  if (hasYear(birthday)) {
    const parts = birthday.split("-");
    year = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
    day = parseInt(parts[2], 10);
  } else {
    const monthDay = getMonthDay(birthday);
    const parts = monthDay.split("-");
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

const EDITABLE_BUCKETS: Contact["bucket"][] = [
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "custom",
];

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

  useEffect(() => {
    if (visible) {
      setSelectedBucket(contact.bucket);
      setCustomState(deriveCustomUnitAndValue(contact.customIntervalDays));
      setBirthday(contact.birthday || "");
      setIsBirthdayExpanded(false);
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
      onSave(
        selectedBucket,
        customDays ?? null,
        birthday || null,
        contact.nextContactDate ?? null,
      );
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
        <View className="flex-1 px-6 pb-4">
          <View className="py-4 flex-row items-center justify-between">
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cancel connection settings"
            >
              <Body size="lg" weight="medium" className="text-primary">
                Cancel
              </Body>
            </Pressable>
            <Heading
              size={3}
              weight="semibold"
              className="text-brand-navy dark:text-white"
            >
              Connection settings
            </Heading>
            <View className="w-12" />
          </View>

          <View className="items-center mt-6 mb-6">
            <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center mb-3">
              <Ionicons name="heart" size={26} color={Colors.primary} />
            </View>
            <Heading
              size={2}
              weight="medium"
              className="mb-1 text-brand-navy dark:text-white"
            >
              {contact.name}
            </Heading>
            <Body className="italic text-slate-600 dark:text-slate-300">
              Every relationship has its own rhythm.
            </Body>
          </View>

          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 8 }}
          >
            <View
              className={`p-4 rounded-3xl border mb-6 ${
                isBirthdayExpanded
                  ? "bg-card-light dark:bg-card-dark border-primary"
                  : "bg-card-light dark:bg-card-dark border-slate-200 dark:border-slate-700"
              }`}
            >
              <View className="flex-row items-start justify-between mb-1">
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-full bg-primary items-center justify-center">
                    <MaterialCommunityIcons
                      name="cake-variant"
                      size={20}
                      color="#FFFFFF"
                    />
                  </View>
                  <View>
                    <Body
                      size="lg"
                      weight="medium"
                      className="text-slate-800 dark:text-white"
                    >
                      Birthday
                    </Body>
                  </View>
                </View>

                {isBirthdayExpanded ? (
                  <Pressable
                    onPress={() => setIsBirthdayExpanded(false)}
                    accessibilityRole="button"
                    accessibilityLabel="Cancel birthday editing"
                  >
                    <Body
                      size="sm"
                      weight="medium"
                      className="text-slate-600 dark:text-slate-300"
                    >
                      Cancel
                    </Body>
                  </Pressable>
                ) : birthday ? (
                  <Pressable
                    onPress={() => setIsBirthdayExpanded(true)}
                    accessibilityRole="button"
                    accessibilityLabel="Edit birthday"
                  >
                    <Body size="sm" weight="medium" className="text-primary">
                      Edit
                    </Body>
                  </Pressable>
                ) : null}
              </View>

              {isBirthdayExpanded ? (
                <>
                  <View className="py-1">
                    <BirthdayPicker value={birthday} onChange={setBirthday} />
                  </View>
                  <Caption
                    className="mt-3 text-center text-slate-600 dark:text-slate-300"
                    muted={false}
                  >
                    {
                      "We'll prioritize this over regular reminders on their birthday."
                    }
                  </Caption>
                </>
              ) : birthday ? (
                <View className="pt-0.5 pb-3">
                  <Heading
                    size={3}
                    weight="medium"
                    className="text-slate-700 dark:text-slate-200 text-center"
                  >
                    {formatBirthdayDisplay(birthday)}
                  </Heading>
                </View>
              ) : (
                <Pressable
                  onPress={() => setIsBirthdayExpanded(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Add birthday"
                  className="py-2 items-center"
                >
                  <View className="flex-row items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                    <Ionicons name="add" size={18} color={Colors.primary} />
                    <Body size="sm" weight="medium" className="text-primary">
                      Add Birthday
                    </Body>
                  </View>
                </Pressable>
              )}
            </View>

            <Caption
              uppercase
              muted={false}
              className="text-primary/75 tracking-[2px] mb-3"
            >
              Reminder rhythm
            </Caption>

            <View className="gap-3 mb-4" accessibilityRole="radiogroup">
              {EDITABLE_BUCKETS.map((bucket) => {
                const isSelected = selectedBucket === bucket;
                const isCustomSelected = bucket === "custom" && isSelected;

                return (
                  <View key={bucket}>
                    <Pressable
                      testID={`bucket-option-${bucket}`}
                      accessibilityRole="button"
                      accessibilityLabel={`${bucketLabels[bucket]} rhythm`}
                      accessibilityState={{ selected: isSelected }}
                      className={`p-5 rounded-3xl border ${
                        isSelected
                          ? "border-primary bg-card-light dark:bg-card-dark"
                          : "border-slate-200 dark:border-slate-700 bg-card-light dark:bg-card-dark"
                      } ${isCustomSelected ? "rounded-b-none" : ""}`}
                      style={({ pressed }) =>
                        pressed
                          ? {
                              opacity: 0.92,
                            }
                          : undefined
                      }
                      onPress={() => {
                        setSelectedBucket(bucket);
                        if (bucket === "custom") {
                          setCustomState(
                            deriveCustomUnitAndValue(
                              contact.customIntervalDays,
                            ),
                          );
                        }
                      }}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1 pr-3">
                          <Body
                            size="lg"
                            weight="medium"
                            className="text-slate-800 dark:text-white"
                          >
                            {bucketLabels[bucket]}
                          </Body>
                          <Body
                            size="sm"
                            className="text-slate-600 dark:text-slate-300 mt-1"
                          >
                            {bucket === "custom"
                              ? formatCustomSummary(
                                  derivedCustomDays ??
                                    contact.customIntervalDays,
                                )
                              : bucketDescriptions[bucket]}
                          </Body>
                        </View>

                        <View
                          className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                            isSelected
                              ? "bg-primary border-primary"
                              : "border-slate-300 dark:border-slate-600"
                          }`}
                        >
                          {isSelected ? (
                            <View className="w-2.5 h-2.5 bg-white rounded-full" />
                          ) : null}
                        </View>
                      </View>
                    </Pressable>

                    {isCustomSelected ? (
                      <View className="bg-slate-50 dark:bg-slate-800 rounded-b-3xl border-2 border-t-0 border-primary px-5 pb-5 pt-3">
                        <View className="h-px bg-slate-200 dark:bg-slate-700 mb-3" />
                        <View className="gap-4">
                          <View>
                            <Caption
                              muted={false}
                              className="text-slate-600 dark:text-slate-300 mb-2"
                            >
                              Frequency
                            </Caption>
                            <View className="h-12 flex-row items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3">
                              <TextInput
                                testID="custom-frequency-input"
                                value={customValue}
                                onChangeText={(text) =>
                                  setCustomState({
                                    customUnit,
                                    customValue: text.replace(/[^0-9]/g, ""),
                                  })
                                }
                                keyboardType="number-pad"
                                className="flex-1 h-full py-0 text-base leading-5 text-slate-800 dark:text-white"
                                placeholder="e.g., 30"
                                placeholderTextColor="#94a3b8"
                                textAlignVertical="center"
                                accessibilityLabel="Custom rhythm frequency"
                              />
                            </View>
                          </View>

                          <View>
                            <Caption
                              muted={false}
                              className="text-slate-600 dark:text-slate-300 mb-2"
                            >
                              Unit
                            </Caption>
                            <View className="flex-row gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1.5 rounded-lg">
                              {(
                                ["days", "weeks", "months"] as CustomUnit[]
                              ).map((unit) => (
                                <Pressable
                                  key={unit}
                                  accessibilityRole="button"
                                  accessibilityLabel={`Custom rhythm unit ${unit}`}
                                  accessibilityState={{
                                    selected: customUnit === unit,
                                  }}
                                  onPress={() =>
                                    setCustomState({
                                      customUnit: unit,
                                      customValue,
                                    })
                                  }
                                  className={`flex-1 items-center justify-center rounded-md py-2 ${
                                    customUnit === unit
                                      ? "bg-slate-100 dark:bg-slate-700"
                                      : ""
                                  }`}
                                >
                                  <Body
                                    size="sm"
                                    weight="medium"
                                    className={
                                      customUnit === unit
                                        ? "text-slate-800 dark:text-white"
                                        : "text-slate-600 dark:text-slate-300"
                                    }
                                  >
                                    {unit.charAt(0).toUpperCase() +
                                      unit.slice(1)}
                                  </Body>
                                </Pressable>
                              ))}
                            </View>
                          </View>
                        </View>

                        {!isCustomValid ? (
                          <Body
                            size="sm"
                            weight="medium"
                            className="mt-4 text-red-500"
                          >
                            Please enter a valid duration (1-365 days)
                          </Body>
                        ) : null}

                        {isCustomValid && derivedCustomDays ? (
                          <Body
                            size="sm"
                            className="mt-4 text-slate-600 dark:text-slate-300"
                          >
                            {"We'll remind you "}
                            <Text className="font-semibold text-primary">
                              {formatCustomSummary(derivedCustomDays)}
                            </Text>
                            .
                          </Body>
                        ) : null}
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          </ScrollView>

          <View className="mt-0 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Pressable
              testID="save-changes-button"
              onPress={handleSave}
              disabled={saveDisabled}
              accessibilityRole="button"
              accessibilityLabel="Save changes"
              accessibilityState={{ disabled: saveDisabled }}
              className={`w-full py-4 mt-4 rounded-full items-center justify-center ${
                saveDisabled ? "bg-slate-200 dark:bg-slate-700" : "bg-primary"
              }`}
              style={({ pressed }) => {
                if (saveDisabled) return undefined;
                return {
                  shadowColor: Colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                  opacity: pressed ? 0.92 : 1,
                };
              }}
            >
              <Body
                size="lg"
                weight="medium"
                className={
                  saveDisabled
                    ? "text-slate-500 dark:text-slate-400"
                    : "text-white"
                }
              >
                Save changes
              </Body>
            </Pressable>

            {onArchive && !contact.isArchived ? (
              <Pressable
                onPress={handleArchive}
                accessibilityRole="button"
                accessibilityLabel={`Archive ${contact.name}`}
                className="flex-row items-center justify-center gap-3 mt-3 py-0.5 rounded-2xl"
                style={({ pressed }) =>
                  pressed
                    ? {
                        backgroundColor: "rgba(239, 68, 68, 0.08)",
                      }
                    : undefined
                }
              >
                <View className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center">
                  <Ionicons name="archive-outline" size={20} color="#94a3b8" />
                </View>
                <View>
                  <Body
                    size="base"
                    weight="medium"
                    className="text-slate-700 dark:text-slate-300"
                  >
                    Archive connection
                  </Body>
                </View>
              </Pressable>
            ) : null}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
