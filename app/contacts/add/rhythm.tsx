import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import type { Contact } from "@/db/schema";

const ProgressDots = ({ step }: { step: 1 | 2 | 3 }) => (
  <View className="flex-row items-center justify-center gap-2">
    {[1, 2, 3].map((i) => (
      <View
        key={i}
        className={`h-2.5 w-2.5 rounded-full ${i === step ? "bg-sage" : "bg-border"}`}
      />
    ))}
  </View>
);

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
  const { name } = useLocalSearchParams<{ name?: string }>();

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

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <Stack.Screen
        options={{
          title: connectionName || "Add a connection",
          headerBackTitle: "Back",
          headerShadowVisible: false,
        }}
      />

      <View className="flex-1 px-5 pt-6">
        <ProgressDots step={2} />

        <Text className="mt-8 text-2xl font-semibold text-warmgray">
          How often would you like a gentle reminder to connect?
        </Text>
        <Text className="mt-2 text-base text-warmgray-muted">
          You can change this anytime.
        </Text>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="mt-8 gap-3">
            {RHYTHMS.map((option) => {
              const active = selected.label === option.label;
              return (
                <View key={option.label}>
                  <TouchableOpacity
                    className={`border-2 p-4 ${
                      active
                        ? "border-sage bg-sage-100"
                        : "border-border bg-surface"
                    } ${
                      option.value === "custom" && isCustom
                        ? "rounded-t-2xl border-b-0"
                        : "rounded-2xl"
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
                        <Text
                          className={`text-base font-semibold ${active ? "text-warmgray" : "text-warmgray"}`}
                        >
                          {option.label}
                        </Text>
                        <Text className="mt-1 text-sm text-warmgray-muted">
                          {option.value === "custom" && derivedCustomDays
                            ? formatCustomSummary(derivedCustomDays)
                            : option.description}
                        </Text>
                      </View>
                      <View
                        className={`h-6 w-6 rounded-full border-2 ${active ? "border-sage bg-sage" : "border-border bg-surface"}`}
                      />
                    </View>
                  </TouchableOpacity>

                  {option.value === "custom" && isCustom && (
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
                                <TouchableOpacity
                                  key={unit}
                                  onPress={() =>
                                    setCustomState({
                                      customUnit: unit,
                                      customValue,
                                    })
                                  }
                                  className={`flex-1 items-center justify-center rounded-lg py-1.5 ${
                                    customUnit === unit ? "bg-surface" : ""
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
                                        ? "text-warmgray"
                                        : "text-warmgray-muted"
                                    }`}
                                  >
                                    {unit.charAt(0).toUpperCase() +
                                      unit.slice(1)}
                                  </Text>
                                </TouchableOpacity>
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
                          {"We'll remind you "}
                          <Text className="font-semibold text-sage">
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
        </ScrollView>

        <TouchableOpacity
          className={`mt-8 items-center rounded-2xl py-4 ${canProceed ? "bg-sage" : "bg-border"}`}
          disabled={!canProceed}
          onPress={() => {
            if (!connectionName) {
              router.replace("/contacts/add");
              return;
            }
            router.push({
              pathname: "/contacts/add/birthday",
              params: {
                name: connectionName,
                bucket: selected.value,
                ...(isCustom && derivedCustomDays
                  ? { customIntervalDays: String(derivedCustomDays) }
                  : {}),
              },
            });
          }}
          activeOpacity={0.9}
        >
          <Text
            className={`text-lg font-semibold ${canProceed ? "text-white" : "text-warmgray-muted"}`}
          >
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
