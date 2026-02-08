import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Body, Heading } from './ui';
import Colors from '@/constants/Colors';

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
  return (
    <View className="mb-2">
      <View className="flex-row items-center justify-between">
        <TouchableOpacity
          onPress={onBackPress}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          className="w-10 h-10 bg-white dark:bg-card-dark shadow-sm border border-slate-100 dark:border-slate-800 rounded-full items-center justify-center"
        >
          <Ionicons name="chevron-back" size={18} color={Colors.textSoft} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onMorePress}
          accessibilityLabel="More options"
          accessibilityRole="button"
          className="w-10 h-10 bg-white dark:bg-card-dark shadow-sm border border-slate-100 dark:border-slate-800 rounded-full items-center justify-center"
        >
          <Ionicons name="ellipsis-horizontal" size={18} color={Colors.textSoft} />
        </TouchableOpacity>
      </View>

      <View className="mt-3">
        <Heading size={1} className="text-brand-navy dark:text-slate-100">
          {name}
        </Heading>
        <Body size="base" className="text-slate-500 dark:text-slate-400 mt-1">
          {relationship}
        </Body>
      </View>
    </View>
  );
}
