import React from 'react';
import { View, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Heading, Caption } from './ui';

type ConnectionDetailHeaderProps = {
  name: string;
  relationship: string;
  onBackPress: () => void;
  onMorePress: () => void;
};

export function ConnectionDetailHeader({
  name,
  relationship,
  onBackPress,
  onMorePress,
}: ConnectionDetailHeaderProps) {
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#f1f5f9' : '#94a3b8';

  return (
    <View className="flex-row items-center justify-between px-6 py-4">
      <TouchableOpacity
        onPress={onBackPress}
        accessibilityLabel="Go back"
        accessibilityRole="button"
        className="w-10 h-10 rounded-full bg-white dark:bg-card-dark shadow-sm border border-slate-100 dark:border-slate-800 items-center justify-center"
      >
        <Ionicons name="chevron-back" size={20} color={iconColor} />
      </TouchableOpacity>

      <View className="items-center flex-1 mx-4">
        <Heading size={4} weight="semibold">{name}</Heading>
        <Caption uppercase className="tracking-widest font-semibold text-primary/70">
          {relationship}
        </Caption>
      </View>

      <TouchableOpacity
        onPress={onMorePress}
        accessibilityLabel="More options"
        accessibilityRole="button"
        className="w-10 h-10 rounded-full bg-white dark:bg-card-dark shadow-sm border border-slate-100 dark:border-slate-800 items-center justify-center"
      >
        <Ionicons name="ellipsis-horizontal" size={20} color={iconColor} />
      </TouchableOpacity>
    </View>
  );
}
