import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Contact } from '@/db/schema';
import { formatRhythmLabel } from '@/utils/timeFormatting';
import { normalizeAvatarUri } from '@/utils/avatar';

type ConnectionCardProps = {
  contact: Contact;
  lastConnectedLabel: string;
  nextReminderLabel: string;
  isReady: boolean;
  isOverdue?: boolean;
  onPress: () => void;
};

export function ConnectionCard({
  contact,
  lastConnectedLabel,
  nextReminderLabel,
  isReady,
  isOverdue = false,
  onPress,
}: ConnectionCardProps) {
  const rhythmLabel = formatRhythmLabel(contact.bucket);
  const normalizedAvatarUri = normalizeAvatarUri(contact.avatarUri);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const showAvatarImage = Boolean(normalizedAvatarUri) && !avatarLoadFailed;

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [normalizedAvatarUri]);

  return (
    <TouchableOpacity
      testID="connection-card"
      accessibilityLabel={`Navigate to ${contact.name}`}
      accessibilityRole="button"
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-surface-card dark:bg-slate-900/50 px-4 py-4 rounded-3xl flex-row items-center border border-stroke-soft dark:border-slate-800/50 shadow-soft mb-4"
    >
      {/* Avatar */}
      <View className="w-12 h-12 rounded-full bg-surface-soft border border-primary/10 dark:bg-slate-800 items-center justify-center mr-3.5 overflow-hidden">
        {showAvatarImage ? (
          <Image
            source={{ uri: normalizedAvatarUri }}
            className="w-12 h-12 rounded-full"
            testID="connection-card-avatar-image"
            onError={() => setAvatarLoadFailed(true)}
          />
        ) : (
          <Ionicons
            testID="connection-card-avatar-fallback"
            name="person"
            size={24}
            color="#9AA3AF"
          />
        )}
      </View>

      {/* Content */}
      <View className="flex-1">
        {/* Name and Rhythm */}
        <View className="flex-row items-center mb-1.5">
            <Text className="font-semibold text-lg text-text-strong dark:text-slate-100 font-display leading-6">
              {contact.name}
            </Text>
            {isReady && (
              <View className="ml-2 bg-sage-light border border-primary/25 px-2.5 py-1 rounded-full">
                <Text className="text-[11px] font-semibold text-primary uppercase tracking-[0.8px]">
                  READY
                </Text>
              </View>
            )}
          </View>
        <Text className="text-[13px] text-text-muted dark:text-slate-300 font-body mb-2.5 leading-5">
          {rhythmLabel}
        </Text>

        {/* Labels Row */}
        <View className="flex-row gap-4 mt-0.5">
          <View className="flex-1">
            <Text className="text-[11px] text-text-muted/80 dark:text-slate-400 uppercase tracking-[1px] font-body leading-4">
              Last Connected
            </Text>
            <Text className="text-sm text-text-muted dark:text-slate-200 font-body leading-5">
              {lastConnectedLabel}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-[11px] text-text-muted/80 dark:text-slate-400 uppercase tracking-[1px] font-body leading-4">
              Next Reminder
            </Text>
            <Text
              className={`text-sm font-body leading-5 ${
                isOverdue
                  ? 'text-secondary dark:text-secondary'
                  : isReady
                    ? 'text-primary dark:text-primary'
                    : 'text-text-muted dark:text-slate-200'
              }`}
            >
              {nextReminderLabel}
            </Text>
          </View>
        </View>

        </View>

      {/* Chevron */}
      <Ionicons name="chevron-forward" size={20} color="#9AA3AF" />
    </TouchableOpacity>
  );
}
