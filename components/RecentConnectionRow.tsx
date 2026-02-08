import React from 'react';
import { View, TouchableOpacity, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Contact } from '@/db/schema';
import Colors from '@/constants/Colors';

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
      className="flex-row items-center justify-between bg-white dark:bg-card-dark/40 px-4 py-5 rounded-3xl border border-slate-100 dark:border-slate-800/50 mb-4"
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
        <View className="py-0.5">
          <Text className="text-base leading-6 font-semibold text-slate-800 dark:text-white">
            {contact.name}
          </Text>
          <Text className="text-sm leading-5 text-slate-600 dark:text-slate-300">{connectedLabel}</Text>
        </View>
      </View>
      <Ionicons
        testID="check-icon"
        name="checkmark-circle"
        size={20}
        color={Colors.primary}
      />
    </TouchableOpacity>
  );
}
