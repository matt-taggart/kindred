import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ConnectionsHeaderProps = {
  onSearchPress: () => void;
};

export function ConnectionsHeader({ onSearchPress }: ConnectionsHeaderProps) {
  return (
    <View className="mb-6">
      <View className="flex-row justify-between items-start mb-2">
        <View>
          <View className="flex-row items-center gap-2 mb-1">
            <View className="w-8 h-8 items-center justify-center bg-primary/10 rounded-full">
              <Ionicons name="heart" size={16} color="#9DBEBB" />
            </View>
            <Text className="text-xs font-semibold tracking-widest uppercase text-primary/70">
              KINDRED
            </Text>
          </View>
          <Text className="text-4xl font-semibold tracking-tight text-warmgray dark:text-white">
            Connections
          </Text>
        </View>
        <TouchableOpacity
          testID="search-button"
          onPress={onSearchPress}
          accessibilityLabel="Search connections"
          accessibilityRole="button"
          className="p-3 bg-white dark:bg-card-dark shadow-sm border border-slate-100 dark:border-slate-800 rounded-full items-center justify-center"
          activeOpacity={0.7}
        >
          <Ionicons name="search" size={20} color="#94a3b8" />
        </TouchableOpacity>
      </View>
      <Text className="text-slate-500 dark:text-slate-400 text-lg">
        Stay close to the people who matter most.
      </Text>
    </View>
  );
}
