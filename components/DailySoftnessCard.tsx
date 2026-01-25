import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Body } from './ui';
import Colors from '@/constants/Colors';

type DailySoftnessCardProps = {
  quote: string;
  onReflectPress: () => void;
};

export function DailySoftnessCard({ quote, onReflectPress }: DailySoftnessCardProps) {
  return (
    <View className="bg-primary/10 dark:bg-primary/20 p-6 rounded-2xl relative overflow-hidden mb-10">
      <View className="relative z-10">
        <View className="flex-row items-center gap-2 mb-2">
          <Ionicons
            testID="sparkle-icon"
            name="sparkles"
            size={20}
            color={Colors.primary}
          />
          <Body size="lg" weight="medium">Daily Softness</Body>
        </View>

        <Body size="sm" muted className="mb-4 italic">
          "{quote}"
        </Body>

        <TouchableOpacity
          testID="reflect-button"
          onPress={onReflectPress}
          className="bg-white/80 dark:bg-slate-800/80 self-start px-4 py-2 rounded-full flex-row items-center gap-2"
          activeOpacity={0.7}
        >
          <Body size="sm" weight="medium">Reflect</Body>
          <Ionicons name="arrow-forward" size={14} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Decorative blur circle */}
      <View className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/20 rounded-full" />
    </View>
  );
}
