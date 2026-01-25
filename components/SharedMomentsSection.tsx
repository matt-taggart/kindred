import React from 'react';
import { View, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Heading, Body, Caption } from './ui';

export interface Moment {
  id: string;
  title: string;
  date: string;
  description: string;
  imageUri?: string;
  icon?: string;
  iconBgColor?: string;
}

type SharedMomentsSectionProps = {
  moments: Moment[];
  onViewAll?: () => void;
  onMomentPress?: (moment: Moment) => void;
};

const ICON_COLORS: Record<string, string> = {
  'bg-amber-50': '#fcd34d',
  'bg-emerald-50': '#6ee7b7',
  'bg-pink-50': '#f9a8d4',
  'bg-sky-50': '#7dd3fc',
};

export function SharedMomentsSection({
  moments,
  onViewAll,
  onMomentPress,
}: SharedMomentsSectionProps) {
  if (moments.length === 0) {
    return null;
  }

  return (
    <View className="mt-8">
      {/* Header */}
      <View className="flex-row items-center justify-between px-2 mb-4">
        <Heading size={4}>Shared moments</Heading>
        {onViewAll && (
          <Pressable onPress={onViewAll}>
            <Body size="sm" weight="medium" className="text-primary">
              View all
            </Body>
          </Pressable>
        )}
      </View>

      {/* Moments list */}
      <View>
        {moments.map((moment) => {
          const iconColor = moment.iconBgColor
            ? ICON_COLORS[moment.iconBgColor] || '#94a3b8'
            : '#94a3b8';
          const iconName = (moment.icon || 'heart-outline') as keyof typeof Ionicons.glyphMap;
          const subtitle = moment.description
            ? `${moment.date} • ${moment.description}`
            : moment.date;

          return (
            <Pressable
              key={moment.id}
              onPress={() => onMomentPress?.(moment)}
              className="bg-white dark:bg-slate-800 p-4 rounded-3xl flex-row items-center gap-4 border border-slate-100 dark:border-slate-700 shadow-soft mb-3"
            >
              {/* Thumbnail */}
              <View
                className={`w-16 h-16 rounded-2xl overflow-hidden shrink-0 items-center justify-center ${
                  moment.iconBgColor || 'bg-slate-100'
                }`}
              >
                {moment.imageUri ? (
                  <Image
                    source={{ uri: moment.imageUri }}
                    className="w-full h-full"
                  />
                ) : (
                  <Ionicons name={iconName} size={28} color={iconColor} />
                )}
              </View>

              {/* Content */}
              <View className="flex-1 min-w-0">
                <Body weight="semibold" numberOfLines={1}>
                  {moment.title}
                </Body>
                <Caption muted numberOfLines={1}>
                  {subtitle}
                </Caption>
              </View>

              {/* Chevron */}
              <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
