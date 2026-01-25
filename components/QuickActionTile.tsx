import React from 'react';
import { View, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type QuickActionVariant = 'call' | 'text' | 'voice' | 'later';

type QuickActionTileProps = {
  variant: QuickActionVariant;
  onPress: () => void;
};

type VariantConfig = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  bgColor: string;
  iconBgColor: string;
  textColor: string;
  iconColor: string;
};

const variantConfigs: Record<QuickActionVariant, VariantConfig> = {
  call: {
    icon: 'call',
    label: 'Call',
    bgColor: 'bg-secondary/20',
    iconBgColor: 'bg-secondary',
    textColor: 'text-pink-600 dark:text-pink-300',
    iconColor: '#ffffff',
  },
  text: {
    icon: 'chatbubble-outline',
    label: 'Text',
    bgColor: 'bg-primary/20',
    iconBgColor: 'bg-primary',
    textColor: 'text-emerald-600 dark:text-emerald-300',
    iconColor: '#1e293b',
  },
  voice: {
    icon: 'mic',
    label: 'Voice Note',
    bgColor: 'bg-accent/20',
    iconBgColor: 'bg-accent',
    textColor: 'text-amber-600 dark:text-amber-300',
    iconColor: '#1e293b',
  },
  later: {
    icon: 'create-outline',
    label: 'Write Later',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
    iconBgColor: 'bg-white dark:bg-slate-700',
    textColor: 'text-slate-500 dark:text-slate-400',
    iconColor: '#94a3b8',
  },
};

export function QuickActionTile({ variant, onPress }: QuickActionTileProps) {
  const config = variantConfigs[variant];

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={config.label}
      accessibilityHint={`variant-${variant}`}
      className={`p-6 rounded-3xl flex-col items-center justify-center gap-3 ${config.bgColor} active:scale-95`}
    >
      <View
        className={`w-12 h-12 rounded-2xl items-center justify-center ${config.iconBgColor}`}
      >
        <Ionicons name={config.icon} size={24} color={config.iconColor} />
      </View>
      <Text
        className={`font-body font-semibold text-base ${config.textColor}`}
      >
        {config.label}
      </Text>
    </Pressable>
  );
}
