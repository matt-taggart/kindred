import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AddFlowLayout } from "@/components";
import type { Contact } from "@/db/schema";
import Colors from "@/constants/Colors";

type RhythmOption = {
  label: string;
  value: Contact["bucket"];
  description: string;
};

const bucketDescriptions: Record<Contact["bucket"], string> = {
  daily: "For your closest relationships",
  weekly: "For your inner circle",
  "bi-weekly": "Every 14 days",
  "every-three-weeks": "Every 21 days",
  monthly: "For people you care about",
  "every-six-months": "Twice a year",
  yearly: "For long-distance friends",
  custom: "Choose your own rhythm",
};

const RHYTHMS: RhythmOption[] = [
  { label: "Every day", value: "daily", description: bucketDescriptions.daily },
  {
    label: "Every week",
    value: "weekly",
    description: bucketDescriptions.weekly,
  },
  {
    label: "Once a month",
    value: "monthly",
    description: bucketDescriptions.monthly,
  },
  {
    label: "Once a year",
    value: "yearly",
    description: bucketDescriptions.yearly,
  },
  {
    label: "Custom rhythm",
    value: "custom",
    description: bucketDescriptions.custom,
  },
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

export default function AddConnectionRhythmScreen() {
  const router = useRouter();
  const { name, relationship } = useLocalSearchParams<{
    name?: string;
    relationship?: string;
  }>();

  const connectionName = useMemo(
    () => (typeof name === "string" ? name.trim() : ""),
    [name],
  );
  const [selected, setSelected] = useState<RhythmOption>(RHYTHMS[1]);
  const [{ customUnit, customValue }, setCustomState] = useState(() =>
    deriveCustomUnitAndValue(),
  );

  const derivedCustomDays = useMemo(() => {
    const numericValue = Number(customValue);
    if (!Number.isFinite(numericValue) || numericValue <= 0) return null;
    return Math.round(numericValue * unitMultipliers[customUnit]);
  }, [customUnit, customValue]);

  const isCustom = selected.value === "custom";
  const isCustomValid =
    !isCustom ||
    (derivedCustomDays !== null &&
      derivedCustomDays >= 1 &&
      derivedCustomDays <= 365);
  const canProceed = !isCustom || isCustomValid;

  const handleNext = () => {
    if (!connectionName) {
      router.replace("/contacts/add");
      return;
    }
    router.push({
      pathname: "/contacts/add/birthday",
      params: {
        name: connectionName,
        relationship: relationship || "",
        bucket: selected.value,
        ...(isCustom && derivedCustomDays
          ? { customIntervalDays: String(derivedCustomDays) }
          : {}),
      },
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AddFlowLayout
        currentStep={2}
        title="Choose your rhythm"
        subtitle="How often do you want to connect?"
        onBack={() => router.back()}
        onNext={handleNext}
        nextDisabled={!canProceed}
        showBackButton
      >
        <View className="gap-3">
          {RHYTHMS.map((option) => {
            const active = selected.label === option.label;
            return (
              <View key={option.label}>
                <TouchableOpacity
                  className={`bg-white rounded-2xl border p-4 ${
                    active ? "border-primary bg-primary/5" : "border-slate-100"
                  }`}
                  onPress={() => {
                    setSelected(option);
                    if (option.value === "custom") {
                      const derived = deriveCustomUnitAndValue();
                      setCustomState(derived);
                    }
                  }}
                  activeOpacity={0.85}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-lg font-semibold text-slate-800">
                        {option.label}
                      </Text>
                      <Text className="text-sm text-slate-500 mt-1">
                        {option.value === "custom" && derivedCustomDays
                          ? formatCustomSummary(derivedCustomDays)
                          : option.description}
                      </Text>
                    </View>
                    {active && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={Colors.primary}
                      />
                    )}
                  </View>
                </TouchableOpacity>

                {option.value === "custom" && isCustom && (
                  <View className="bg-slate-50 rounded-xl p-4 mt-2">
                    <View className="flex-col gap-3">
                      <View>
                        <Text className="text-xs font-medium text-slate-500 mb-1">
                          Frequency
                        </Text>
                        <View className="h-12 flex-row items-center rounded-xl border border-slate-200 bg-white px-3">
                          <TextInput
                            value={customValue}
                            onChangeText={(text) =>
                              setCustomState({
                                customUnit,
                                customValue: text.replace(/[^0-9]/g, ""),
                              })
                            }
                            keyboardType="number-pad"
                            className="flex-1 text-base leading-5 text-slate-800"
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
                        <View className="flex-row gap-1 bg-white border border-slate-200 p-1 rounded-xl">
                          {(["days", "weeks", "months"] as CustomUnit[]).map(
                            (unit) => (
                              <TouchableOpacity
                                key={unit}
                                onPress={() =>
                                  setCustomState({
                                    customUnit: unit,
                                    customValue,
                                  })
                                }
                                className={`flex-1 items-center justify-center rounded-lg py-1.5 ${
                                  customUnit === unit ? "bg-slate-100" : ""
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
                                      ? "text-slate-800"
                                      : "text-slate-500"
                                  }`}
                                >
                                  {unit.charAt(0).toUpperCase() + unit.slice(1)}
                                </Text>
                              </TouchableOpacity>
                            ),
                          )}
                        </View>
                      </View>
                    </View>

                    {!isCustomValid && (
                      <Text className="mt-3 text-sm text-red-500 font-medium">
                        Please enter a valid duration (1-365 days)
                      </Text>
                    )}

                    {isCustomValid && derivedCustomDays && (
                      <Text className="mt-3 text-sm text-slate-500">
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
      </AddFlowLayout>
    </>
  );
}
