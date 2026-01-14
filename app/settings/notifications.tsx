import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Stack } from "expo-router";
import { useState } from "react";
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";

import { NotificationFrequency, useUserStore } from "@/lib/userStore";

const frequencyOptions: { value: NotificationFrequency; label: string }[] = [
  { value: 1, label: "1x" },
  { value: 2, label: "2x" },
  { value: 3, label: "3x" },
];

const timeLabels = ["First Reminder", "Second Reminder", "Third Reminder"];

function parseTime(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function formatDisplayTime(timeStr: string): string {
  const date = parseTime(timeStr);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function NotificationSettingsScreen() {
  const { notificationSettings, setNotificationFrequency, setReminderTime } =
    useUserStore();
  const { frequency, reminderTimes } = notificationSettings;

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempTime, setTempTime] = useState<Date | null>(null);

  const handleFrequencyChange = (newFrequency: NotificationFrequency) => {
    setNotificationFrequency(newFrequency);
  };

  const handleTimePress = (index: number) => {
    setEditingIndex(index);
    setTempTime(parseTime(reminderTimes[index]));
  };

  const handleTimeChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setEditingIndex(null);
      if (selectedDate && editingIndex !== null) {
        setReminderTime(editingIndex, formatTime(selectedDate));
      }
    } else if (selectedDate) {
      setTempTime(selectedDate);
    }
  };

  const handleTimeConfirm = () => {
    if (editingIndex !== null && tempTime) {
      setReminderTime(editingIndex, formatTime(tempTime));
    }
    setEditingIndex(null);
    setTempTime(null);
  };

  const handleTimeCancel = () => {
    setEditingIndex(null);
    setTempTime(null);
  };

  const previewText = (() => {
    const times = reminderTimes.slice(0, frequency).map(formatDisplayTime);
    if (times.length === 1) {
      return `You'll receive a gentle reminder at ${times[0]} on days when connections are ready.`;
    }
    if (times.length === 2) {
      return `You'll receive gentle reminders at ${times[0]} and ${times[1]} on days when connections are ready.`;
    }
    return `You'll receive gentle reminders at ${times[0]}, ${times[1]}, and ${times[2]} on days when connections are ready.`;
  })();

  return (
    <>
      <Stack.Screen
        options={{
          title: "Reminders",
          headerBackTitle: "Settings",
          headerShown: true,
        }}
      />
      <SafeAreaView className="flex-1 bg-cream">
        <ScrollView
          className="flex-1 px-4 pt-6"
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Frequency Section */}
          <View className="mb-8">
            <Text className="mb-2 text-lg font-bold text-warmgray">
              Reminder frequency
            </Text>
            <Text className="mb-4 text-base text-warmgray-muted">
              How many times per day would you like a reminder?
            </Text>

            <View className="flex-row gap-3">
              {frequencyOptions.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => handleFrequencyChange(option.value)}
                  className={`flex-1 items-center justify-center rounded-2xl border-2 py-4 ${
                    frequency === option.value
                      ? "border-sage bg-sage"
                      : "border-border bg-surface"
                  }`}
                >
                  <Text
                    className={`text-xl font-bold ${
                      frequency === option.value
                        ? "text-white"
                        : "text-warmgray"
                    }`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Times Section */}
          <View className="mb-8">
            <Text className="mb-2 text-lg font-bold text-warmgray">
              Reminder times
            </Text>
            <Text className="mb-4 text-base text-warmgray-muted">
              Choose times that feel supportive.
            </Text>

            <View className="gap-3">
              {Array.from({ length: frequency }).map((_, index) => (
                <Pressable
                  key={index}
                  onPress={() => handleTimePress(index)}
                  className="flex-row items-center justify-between rounded-2xl border border-border bg-surface px-4 py-4"
                >
                  <View className="flex-row items-center gap-3">
                    <Ionicons name="time-outline" size={22} color="#5C6356" />
                    <Text className="text-base text-warmgray">
                      {timeLabels[index]}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-base font-semibold text-sage">
                      {formatDisplayTime(reminderTimes[index])}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#8B9678"
                    />
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Preview Section */}
          <View className="rounded-2xl border border-sage/20 bg-sage-100 p-4">
            <View className="mb-2 flex-row items-center gap-2">
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#9CA986"
              />
              <Text className="text-sm font-semibold text-sage">Preview</Text>
            </View>
            <Text className="text-base text-warmgray">{previewText}</Text>
          </View>
        </ScrollView>

        {/* iOS Time Picker Modal */}
        {Platform.OS === "ios" && editingIndex !== null && tempTime && (
          <View className="border-t border-border bg-surface px-4 pb-8 pt-4">
            <View className="mb-4 flex-row items-center justify-between">
              <Pressable onPress={handleTimeCancel}>
                <Text className="text-base font-semibold text-warmgray-muted">
                  Cancel
                </Text>
              </Pressable>
              <Text className="text-base font-bold text-warmgray">
                {timeLabels[editingIndex]}
              </Text>
              <Pressable onPress={handleTimeConfirm}>
                <Text className="text-base font-semibold text-sage">Done</Text>
              </Pressable>
            </View>
            <DateTimePicker
              value={tempTime}
              mode="time"
              display="spinner"
              onChange={handleTimeChange}
              accentColor="#9CA986"
              themeVariant="light"
            />
          </View>
        )}

        {/* Android Time Picker */}
        {Platform.OS === "android" && editingIndex !== null && tempTime && (
          <DateTimePicker
            value={tempTime}
            mode="time"
            display="default"
            onChange={handleTimeChange}
            accentColor="#9CA986"
          />
        )}
      </SafeAreaView>
    </>
  );
}
