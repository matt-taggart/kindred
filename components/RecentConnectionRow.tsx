import React from 'react';
import { View, TouchableOpacity, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Contact } from '@/db/schema';

type RecentConnectionRowProps = {
  contact: Contact;
  connectedLabel: string;
  onPress: () => void;
};

export function RecentConnectionRow({
  contact,
  connectedLabel,
  onPress,
}: RecentConnectionRowProps) {
  return (
    <TouchableOpacity
      testID="recent-connection-row"
      onPress={onPress}
      accessibilityLabel={`Navigate to ${contact.name}`}
      accessibilityRole="button"
      activeOpacity={0.7}
      className="flex-row items-center justify-between bg-white dark:bg-card-dark/40 p-4 rounded-3xl border border-slate-100 dark:border-slate-800/50 mb-3"
    >
      <View className="flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden items-center justify-center">
          {contact.avatarUri ? (
            <Image
              source={{ uri: contact.avatarUri }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="person" size={18} color="#94a3b8" />
          )}
        </View>
        <View>
          <Text className="text-sm font-semibold text-warmgray dark:text-white">
            {contact.name}
          </Text>
          <Text className="text-[11px] text-slate-400">{connectedLabel}</Text>
        </View>
      </View>
      <Ionicons
        testID="check-icon"
        name="checkmark-circle"
        size={18}
        color="#cbd5e1"
      />
    </TouchableOpacity>
  );
}
