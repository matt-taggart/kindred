import React from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { Body } from './ui';

type QuickActionVariant = 'call' | 'text';

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
    bgColor: 'bg-primary/10 dark:bg-primary/20',
    iconBgColor: 'bg-primary/20 dark:bg-primary/30',
    textColor: 'text-primary dark:text-primary',
    iconColor: Colors.primary,
  },
  text: {
    icon: 'chatbubble-outline',
    label: 'Text',
    bgColor: 'bg-sage-light dark:bg-accent-dark-sage',
    iconBgColor: 'bg-white dark:bg-card-dark',
    textColor: 'text-primary dark:text-primary',
    iconColor: Colors.primary,
  },
};

export function QuickActionTile({ variant, onPress }: QuickActionTileProps) {
  const config = variantConfigs[variant];

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={config.label}
      accessibilityHint={`variant-${variant}`}
      className={`p-6 rounded-3xl flex-col items-center justify-center gap-3 ${config.bgColor} active:scale-95 border border-slate-100 dark:border-slate-800`}
    >
      <View
        className={`w-12 h-12 rounded-2xl items-center justify-center ${config.iconBgColor} border border-primary/20`}
      >
        <Ionicons name={config.icon} size={24} color={config.iconColor} />
      </View>
      <Body weight="medium" className={`text-base ${config.textColor}`}>
        {config.label}
      </Body>
    </Pressable>
  );
}
