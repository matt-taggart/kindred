import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Contact } from '@/db/schema';
import Colors from '@/constants/Colors';

type MomentCardProps = {
  contact: Contact;
  avatarIcon: keyof typeof Ionicons.glyphMap;
  rhythmLabel: string;
  timeLabel: string;
  isUrgent?: boolean;
  isResting?: boolean;
  onPress: () => void;
};

export function MomentCard({
  contact,
  avatarIcon,
  rhythmLabel,
  timeLabel,
  isUrgent = false,
  isResting = false,
  onPress,
}: MomentCardProps) {
  // Build style variants
  const cardBg = isResting ? 'bg-slate-50/50 dark:bg-slate-800/20' : 'bg-white dark:bg-slate-900/50';
  const borderStyle = isResting
    ? 'border-dashed border-slate-200 dark:border-slate-800'
    : 'border-slate-100 dark:border-slate-800/50';

  const avatarBg = isResting
    ? 'bg-slate-100 dark:bg-slate-800'
    : isUrgent
      ? 'bg-secondary/20'
      : 'bg-primary/20';

  // Build accessibility hint for testing
  const hintParts: string[] = [];
  if (isUrgent) hintParts.push('urgent');
  if (isResting) hintParts.push('resting');

  return (
    <TouchableOpacity
      testID="moment-card"
      accessibilityHint={hintParts.join(' ') || 'normal'}
      onPress={onPress}
      activeOpacity={0.7}
      className={`${cardBg} p-4 rounded-3xl flex-row items-center justify-between border ${borderStyle} shadow-soft mb-3`}
    >
      <View className="flex-row items-center gap-4">
        <View className={`w-12 h-12 rounded-2xl ${avatarBg} items-center justify-center`}>
          <Ionicons testID="moment-avatar-icon" name={avatarIcon} size={20} color={Colors.primary} style={isResting ? { opacity: 0.5 } : undefined} />
        </View>
        <View>
          <Text className="font-bold text-base text-slate-800 dark:text-slate-100 font-display">
            {contact.name}
          </Text>
          <Text className="text-xs opacity-50 font-body">{rhythmLabel}</Text>
        </View>
      </View>

      <View className="items-end">
        {isUrgent ? (
          <View className="bg-secondary/10 px-2 py-1 rounded-full">
            <Text className="text-[10px] font-bold uppercase text-secondary tracking-tight">
              {timeLabel}
            </Text>
          </View>
        ) : isResting ? (
          <View className="flex-col items-end">
            <Text className="text-[10px] font-bold uppercase text-slate-400 tracking-tight mb-1">
              {timeLabel}
            </Text>
            <View className="w-8 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
          </View>
        ) : (
          <Text className="text-[10px] font-bold uppercase text-slate-400 tracking-tight">
            {timeLabel}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
