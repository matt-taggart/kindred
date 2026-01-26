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
      className="bg-white dark:bg-slate-900/50 p-4 rounded-2xl flex-row items-center border border-slate-100 dark:border-slate-800/50 shadow-soft mb-3"
    >
      {/* Avatar */}
      <View className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center mr-3 overflow-hidden">
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
        <View className="flex-row items-center mb-1">
          <Text className="font-bold text-base text-slate-800 dark:text-slate-100 font-display">
            {contact.name}
          </Text>
          {isReady && (
            <View className="ml-2 bg-primary/20 px-2 py-0.5 rounded-full">
              <Text className="text-[10px] font-bold text-primary uppercase tracking-tight">
                READY
              </Text>
            </View>
          )}
        </View>
        <Text className="text-xs text-slate-500 dark:text-slate-400 font-body mb-2">
          {rhythmLabel}
        </Text>

        {/* Labels Row */}
        <View className="flex-row gap-4">
          <View>
            <Text className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-body">
              Last Connected
            </Text>
            <Text className="text-xs text-slate-600 dark:text-slate-300 font-body">
              {lastConnectedLabel}
            </Text>
          </View>
          <View>
            <Text className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-body">
              Next Reminder
            </Text>
            <Text className="text-xs text-slate-600 dark:text-slate-300 font-body">
              {nextReminderLabel}
            </Text>
          </View>
        </View>
      </View>

      {/* Chevron */}
      <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
    </TouchableOpacity>
  );
}
