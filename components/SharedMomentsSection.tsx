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
  'bg-amber-50': '#79947D',
  'bg-emerald-50': '#79947D',
  'bg-pink-50': '#79947D',
  'bg-sky-50': '#79947D',
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
        <Heading size={4} weight="semibold">Shared moments</Heading>
        {onViewAll && (
          <Pressable onPress={onViewAll}>
            <Body size="sm" weight="medium" className="text-primary font-bold uppercase tracking-wider">
              View all
            </Body>
          </Pressable>
        )}
      </View>

      {/* Moments list */}
      <View>
        {moments.map((moment) => {
          const iconColor = '#79947D';
          const iconName = (moment.icon || 'heart-outline') as keyof typeof Ionicons.glyphMap;
          const subtitle = moment.description
            ? `${moment.date} • ${moment.description}`
            : moment.date;

          return (
            <Pressable
              key={moment.id}
              onPress={() => onMomentPress?.(moment)}
              className="bg-white dark:bg-card-dark p-4 rounded-3xl flex-row items-center gap-4 border border-slate-100 dark:border-slate-800 shadow-soft mb-3"
            >
              {/* Thumbnail */}
              <View
                className={`w-16 h-16 rounded-2xl overflow-hidden shrink-0 items-center justify-center ${
                  moment.iconBgColor ? 'bg-sage-light dark:bg-accent-dark-sage' : 'bg-slate-100 dark:bg-slate-800'
                } border border-primary/10`}
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
                <Body weight="medium" numberOfLines={1} className="text-slate-900 dark:text-slate-100">
                  {moment.title}
                </Body>
                <Caption muted numberOfLines={1} className="font-medium">
                  {subtitle}
                </Caption>
              </View>

              {/* Chevron */}
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
