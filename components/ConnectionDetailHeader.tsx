import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

type ConnectionDetailHeaderProps = {
  onBackPress: () => void;
  onMorePress: () => void;
};

export function ConnectionDetailHeader({
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
    </View>
  );
}
