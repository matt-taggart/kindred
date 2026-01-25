import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Body } from './ui';

type AddConnectionTileProps = {
  onPress: () => void;
};

export function AddConnectionTile({ onPress }: AddConnectionTileProps) {
  return (
    <TouchableOpacity
      testID="add-connection-tile"
      accessibilityHint="dashed border button"
      onPress={onPress}
      activeOpacity={0.7}
      className="border-2 border-dashed border-slate-200 dark:border-slate-700 p-6 rounded-3xl flex-col items-center justify-center gap-2"
    >
      <View
        testID="add-icon"
        className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center"
      >
        <Ionicons name="add" size={24} color="#9ca3af" />
      </View>
      <Body size="sm" muted>Add a connection</Body>
    </TouchableOpacity>
  );
}
