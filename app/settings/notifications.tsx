import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
  ImageBackground,
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
  const router = useRouter();
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
      return `We’ll gently remind you to check in at ${times[0]} on days when connections are ready—no pressure.`;
    }
    if (times.length === 2) {
      return `We’ll gently remind you to check in at ${times[0]} and ${times[1]} on days when connections are ready—no pressure.`;
    }
    return `We’ll gently remind you to check in at ${times[0]}, ${times[1]}, and ${times[2]} on days when connections are ready—no pressure.`;
  })();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView className="flex-1 bg-background-light">
        {/* Header */}
        <View className="px-6 pb-4 pt-4 flex-row items-center justify-between">
          <Pressable 
            onPress={() => router.back()}
            className="flex-row items-center"
          >
            <Ionicons name="chevron-back" size={24} color="#79947D" />
            <Text className="text-[#79947D] font-heading font-semibold text-lg ml-1">Settings</Text>
          </Pressable>
          <Text className="text-lg font-bold font-heading text-[#1A1C19]">Reminders</Text>
          <View className="w-20" /> {/* Spacer for centering */}
        </View>

        <ScrollView
          className="flex-1 px-6 pt-6"
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Frequency Section */}
          <View className="mb-10">
            <Text className="text-xl font-display font-semibold text-[#1A1C19] mb-1">
              Reminder frequency
            </Text>
            <Text className="text-[#5C635C] font-heading text-sm mb-4">
              How many times per day would you like a reminder?
            </Text>

            <View className="flex-row gap-3">
              {frequencyOptions.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => handleFrequencyChange(option.value)}
                  className={`flex-1 items-center justify-center rounded-[24px] border-2 py-4 ${
                    frequency === option.value
                      ? "border-primary bg-primary"
                      : "border-slate-100 bg-white"
                  }`}
                >
                  <Text
                    className={`text-lg font-bold font-heading ${
                      frequency === option.value
                        ? "text-white"
                        : "text-[#1A1C19]"
                    }`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Times Section */}
          <View className="mb-10">
            <Text className="text-xl font-display font-semibold text-[#1A1C19] mb-1">
              Reminder times
            </Text>
            <Text className="text-[#5C635C] font-heading text-sm mb-4">
              Choose times that feel supportive.
            </Text>

            <View className="gap-3">
              {Array.from({ length: frequency }).map((_, index) => (
                <Pressable
                  key={index}
                  onPress={() => handleTimePress(index)}
                  className="flex-row items-center justify-between rounded-pill bg-white px-5 py-5 border border-slate-50 shadow-sm"
                >
                  <View className="flex-row items-center gap-3">
                    <Ionicons name="time" size={22} color="#94A3B8" />
                    <Text className="text-base font-medium font-heading text-[#5C635C]">
                      {timeLabels[index]}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-lg font-bold font-heading text-[#1A1C19]">
                      {formatDisplayTime(reminderTimes[index])}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#CBD5E1"
                    />
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Preview Section */}
          <View className="rounded-[32px] bg-soft-sand p-7 border border-slate-200/50 overflow-hidden relative">
            <View className="absolute -right-4 -top-4 opacity-[0.05]">
               <Ionicons name="heart" size={120} color="#79947D" />
            </View>
            
            <View className="relative z-10">
              <View className="flex-row items-center gap-2 mb-3">
                <Ionicons
                  name="information-circle"
                  size={18}
                  color="#79947D"
                />
                <Text className="text-xs font-bold font-heading text-[#79947D] uppercase tracking-wider">Gentle Preview</Text>
              </View>
              <Text className="font-display-italic text-[17px] text-[#1A1C19] leading-relaxed">
                &quot;{previewText}&quot;
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer with Save Button */}
        <View className="absolute bottom-0 left-0 right-0 p-6 bg-background-light/80">
          <Pressable 
            onPress={() => router.back()}
            className="w-full bg-primary py-5 rounded-full items-center justify-center shadow-lg shadow-primary/20"
          >
            <Text className="text-white font-bold text-lg font-heading">Save Rhythm</Text>
          </Pressable>
          <View className="h-1.5 w-32 bg-slate-200 rounded-full self-center mt-4 mb-2" />
        </View>

        {/* iOS Time Picker Modal */}
        {Platform.OS === "ios" && editingIndex !== null && tempTime && (
          <View className="absolute bottom-0 left-0 right-0 bg-white px-4 pb-10 pt-4 rounded-t-[32px] shadow-2xl border-t border-slate-100 z-50">
            <View className="mb-4 flex-row items-center justify-between">
              <Pressable onPress={handleTimeCancel}>
                <Text className="text-base font-semibold font-heading text-slate-400">
                  Cancel
                </Text>
              </Pressable>
              <Text className="text-base font-bold font-heading text-[#1A1C19]">
                {timeLabels[editingIndex]}
              </Text>
              <Pressable onPress={handleTimeConfirm}>
                <Text className="text-base font-semibold font-heading text-primary">Done</Text>
              </Pressable>
            </View>
            <DateTimePicker
              value={tempTime}
              mode="time"
              display="spinner"
              onChange={handleTimeChange}
              accentColor="#79947D"
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
            accentColor="#79947D"
          />
        )}
      </SafeAreaView>
    </>
  );
}
