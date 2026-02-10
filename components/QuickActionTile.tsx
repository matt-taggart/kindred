import React from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { Body } from './ui';

type QuickActionVariant = 'call' | 'text' | 'checkin' | 'memory';

type QuickActionTileProps = {
  variant: QuickActionVariant;
  onPress: () => void;
};

type VariantConfig = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  tileClassName: string;
  iconWrapperClassName: string;
  labelClassName: string;
  iconColor: string;
};

const variantConfigs: Record<QuickActionVariant, VariantConfig> = {
  call: {
    icon: 'call',
    label: 'Call',
    tileClassName: 'bg-primary/10 dark:bg-primary/20 border border-primary/20',
    iconWrapperClassName: 'bg-primary/20 dark:bg-primary/30 border border-primary/25',
    labelClassName: 'text-primary dark:text-primary',
    iconColor: Colors.primary,
  },
  text: {
    icon: 'chatbubble-outline',
    label: 'Text',
    tileClassName: 'bg-info-mist/35 dark:bg-primary/20 border border-info-mist',
    iconWrapperClassName: 'bg-info-mist/60 dark:bg-primary/30 border border-info-mist',
    labelClassName: 'text-text-muted dark:text-primary',
    iconColor: Colors.textMuted,
  },
  checkin: {
    icon: 'leaf-outline',
    label: 'Mark as connected',
    tileClassName: 'bg-accent-soft/40 border border-primary/30 dark:border-primary/50',
    iconWrapperClassName: 'bg-primary/10 dark:bg-primary/20 border border-primary/25',
    labelClassName: 'text-primary dark:text-primary',
    iconColor: Colors.primary,
  },
  memory: {
    icon: 'document-text-outline',
    label: 'Add memory',
    tileClassName: 'bg-accent-soft/40 border border-primary/30 dark:border-primary/50',
    iconWrapperClassName: 'bg-primary/10 dark:bg-primary/20 border border-primary/25',
    labelClassName: 'text-primary dark:text-primary',
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
      className={`p-6 rounded-3xl flex-col items-center justify-center gap-3 active:scale-95 ${config.tileClassName}`}
    >
      <View className={`w-12 h-12 rounded-2xl items-center justify-center ${config.iconWrapperClassName}`}>
        <Ionicons name={config.icon} size={24} color={config.iconColor} />
      </View>
      <Body weight="medium" className={`text-base ${config.labelClassName}`}>
        {config.label}
      </Body>
    </Pressable>
  );
}
