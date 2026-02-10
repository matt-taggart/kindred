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
  const iconColor = isUrgent ? '#8F6B56' : Colors.primary;

  // Build style variants
  const cardBg = isResting ? 'bg-surface-soft dark:bg-slate-800/20' : 'bg-surface-card dark:bg-slate-900/50';
  const borderStyle = isResting
    ? 'border-dashed border-stroke-soft dark:border-slate-800'
    : 'border-stroke-soft dark:border-slate-800/50';

  const avatarBg = isResting
    ? 'bg-slate-100 dark:bg-slate-800'
      : isUrgent
        ? 'bg-accent-soft border border-accent-border'
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
          <Ionicons testID="moment-avatar-icon" name={avatarIcon} size={20} color={iconColor} style={isResting ? { opacity: 0.5 } : undefined} />
        </View>
        <View>
          <Text className="font-bold text-base text-text-strong dark:text-slate-100 font-display">
            {contact.name}
          </Text>
          <Text className="text-xs text-text-muted/80 font-body">{rhythmLabel}</Text>
        </View>
      </View>

      <View className="items-end">
        {isUrgent ? (
          <View className="bg-accent-soft border border-accent-border px-2 py-1 rounded-full">
            <Text className="text-[10px] font-bold uppercase text-text-strong tracking-[0.7px]">
              {timeLabel}
            </Text>
          </View>
        ) : isResting ? (
          <View className="flex-col items-end">
            <Text className="text-[10px] font-bold uppercase text-text-muted/75 tracking-tight mb-1">
              {timeLabel}
            </Text>
            <View className="w-8 h-1 bg-stroke-soft dark:bg-slate-700 rounded-full" />
          </View>
        ) : (
          <Text className="text-[10px] font-bold uppercase text-text-muted/75 tracking-tight">
            {timeLabel}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
