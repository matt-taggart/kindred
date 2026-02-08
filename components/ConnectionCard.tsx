import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Contact } from '@/db/schema';
import { formatRhythmLabel } from '@/utils/timeFormatting';

type ConnectionCardProps = {
  contact: Contact;
  lastConnectedLabel: string;
  nextReminderLabel: string;
  isReady: boolean;
  onPress: () => void;
};

export function ConnectionCard({
  contact,
  lastConnectedLabel,
  nextReminderLabel,
  isReady,
  onPress,
}: ConnectionCardProps) {
  const rhythmLabel = formatRhythmLabel(contact.bucket);

  return (
    <TouchableOpacity
      testID="connection-card"
      accessibilityLabel={`Navigate to ${contact.name}`}
      accessibilityRole="button"
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-white dark:bg-slate-900/50 px-4 py-5 rounded-3xl flex-row items-center border border-slate-100 dark:border-slate-800/50 shadow-soft mb-4"
    >
      {/* Avatar */}
      <View className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center mr-3.5 overflow-hidden">
        {contact.avatarUri ? (
          <Image
            source={{ uri: contact.avatarUri }}
            className="w-12 h-12 rounded-full"
          />
        ) : (
          <Ionicons name="person" size={24} color="#94a3b8" />
        )}
      </View>

      {/* Content */}
      <View className="flex-1">
        {/* Name and Rhythm */}
        <View className="flex-row items-center mb-2">
          <Text className="font-semibold text-lg text-slate-800 dark:text-slate-100 font-display leading-6">
            {contact.name}
          </Text>
          {isReady && (
            <View className="ml-2 bg-primary/20 px-2.5 py-1 rounded-full">
              <Text className="text-[11px] font-semibold text-primary uppercase tracking-wide">
                READY
              </Text>
            </View>
          )}
        </View>
        <Text className="text-sm text-slate-600 dark:text-slate-300 font-body mb-3 leading-5">
          {rhythmLabel}
        </Text>

        {/* Labels Row */}
        <View className="flex-row gap-4 mt-0.5">
          <View className="flex-1">
            <Text className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-[1px] font-body leading-4">
              Last Connected
            </Text>
            <Text className="text-sm text-slate-700 dark:text-slate-200 font-body leading-5">
              {lastConnectedLabel}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-[1px] font-body leading-4">
              Next Reminder
            </Text>
            <Text className="text-sm text-slate-700 dark:text-slate-200 font-body leading-5">
              {nextReminderLabel}
            </Text>
          </View>
        </View>
      </View>

      {/* Chevron */}
      <Ionicons name="chevron-forward" size={20} color="#A3AFBF" />
    </TouchableOpacity>
  );
}
