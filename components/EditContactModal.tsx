import { Modal, Pressable } from "react-native";
import { SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";
import { useEffect, useMemo, useState } from "react";

import { Contact } from "@/db/schema";

interface EditContactModalProps {
  contact: Contact;
  visible: boolean;
  onClose: () => void;
  onSave: (
    newBucket: Contact["bucket"],
    customIntervalDays?: number | null,
  ) => void;
}

const bucketLabels: Record<Contact["bucket"], string> = {
  daily: "Daily",
  weekly: "Weekly",
  "bi-weekly": "Bi-weekly",
  "every-three-weeks": "Every three weeks",
  monthly: "Monthly",
  "every-six-months": "Every six months",
  yearly: "Yearly",
  custom: "Custom",
};

const bucketDescriptions: Record<Contact["bucket"], string> = {
  daily: "Every day",
  weekly: "Every 7 days",
  "bi-weekly": "Every 14 days",
  "every-three-weeks": "Every 21 days",
  monthly: "Every 30 days",
  "every-six-months": "Every 182 days",
  yearly: "Every 365 days",
  custom: "Choose your own cadence",
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
}: EditContactModalProps) {
  const [selectedBucket, setSelectedBucket] = useState<Contact["bucket"]>(
    contact.bucket,
  );
  const [{ customUnit, customValue }, setCustomState] = useState(
    () => deriveCustomUnitAndValue(contact.customIntervalDays),
  );

  useEffect(() => {
    if (visible) {
      setSelectedBucket(contact.bucket);
      const derived = deriveCustomUnitAndValue(contact.customIntervalDays);
      setCustomState(derived);
    }
  }, [visible, contact.bucket, contact.customIntervalDays]);

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
    (!isCustom && contact.bucket === "custom");
  const saveDisabled = !isCustomValid || !hasChanges;

  const handleSave = () => {
    if (!isCustomValid) return;
    const customDays = selectedBucket === "custom" ? derivedCustomDays : null;
    if (hasChanges) {
      onSave(selectedBucket, customDays ?? null);
    }
    onClose();
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
              <Text className="font-semibold text-slate">Cancel</Text>
            </Pressable>
            <Text className="text-lg font-bold text-slate">
              Contact Settings
            </Text>
            <View className="w-12" />
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <Text className="mb-2 text-lg font-bold text-slate">
              {contact.name}
            </Text>
            <Text className="mb-2 text-base text-slate-500">
              How often would you like to check in with {contact.name}?
            </Text>

            <Text className="mb-3 text-base font-semibold text-slate">
              Contact Reminders
            </Text>

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
                        ? "border-sage bg-sage-10"
                        : "border-gray-200 bg-white"
                    } ${
                      bucket === "custom" && selectedBucket === "custom"
                        ? "rounded-t-2xl border-b-0"
                        : "rounded-2xl"
                    }`}
                    onPress={() => {
                      setSelectedBucket(bucket);
                      if (bucket === "custom") {
                        const derived = deriveCustomUnitAndValue(contact.customIntervalDays);
                        setCustomState(derived);
                      }
                    }}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text
                          className={`text-base font-semibold ${
                            selectedBucket === bucket
                              ? "text-slate"
                              : "text-slate-700"
                          }`}
                        >
                          {bucketLabels[bucket]}
                        </Text>
                        <Text className="mt-1 text-sm text-slate-500">
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
                            : "border-gray-300"
                        }`}
                      />
                    </View>
                  </Pressable>

                  {bucket === "custom" && selectedBucket === "custom" && (
                    <View className="rounded-b-2xl border-x-2 border-b-2 border-sage bg-white px-4 pb-4 pt-2">
                      <View className="mt-2 flex-col gap-3">
                        <View>
                          <Text className="text-xs font-medium text-slate-500 mb-1">
                            Frequency
                          </Text>
                          <View className="h-12 flex-row items-center rounded-xl border border-gray-200 bg-gray-50 px-3">
                            <TextInput
                              value={customValue}
                              onChangeText={(text) =>
                                setCustomState({
                                  customUnit,
                                  customValue: text.replace(/[^0-9]/g, ""),
                                })
                              }
                              keyboardType="number-pad"
                              className="flex-1 text-base leading-5 text-slate"
                              placeholder="e.g., 30"
                              placeholderTextColor="#94a3b8"
                              style={{ marginTop: -2 }}
                            />
                          </View>
                        </View>
                        <View>
                          <Text className="text-xs font-medium text-slate-500 mb-1">
                            Unit
                          </Text>
                          <View className="flex-row gap-1 bg-gray-100 p-1 rounded-xl">
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
                                    customUnit === unit ? "bg-white" : ""
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
                                        ? "text-slate-900"
                                        : "text-slate-500"
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
                        <Text className="mt-3 text-sm text-rose-500 font-medium">
                          Please enter a valid duration (1-365 days)
                        </Text>
                      )}

                      {isCustomValid && derivedCustomDays && (
                        <Text className="mt-3 text-sm text-slate-600">
                          We’ll remind you{" "}
                          <Text className="font-semibold text-sage-700">
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
              saveDisabled ? "bg-gray-200" : "bg-sage"
            }`}
          >
            <Text
              className={`text-lg font-semibold ${
                saveDisabled ? "text-gray-400" : "text-white"
              }`}
            >
              Save Changes
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
