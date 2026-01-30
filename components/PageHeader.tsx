import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Heading, Body, Caption } from './ui';
import Colors from '@/constants/Colors';

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  showBranding?: boolean;
};

export function PageHeader({
  title,
  subtitle,
  rightElement,
  showBranding = true,
}: PageHeaderProps) {
  return (
    <View className="mb-6">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          {showBranding && (
            <View className="flex-row items-center gap-2 mb-1">
              <View className="w-8 h-8 items-center justify-center">
                <Ionicons name="heart" size={16} color={Colors.primary} />
              </View>
              <Caption uppercase muted={false} className="text-primary/70 font-semibold tracking-[3px]">
                KINDRED
              </Caption>
            </View>
          )}
          <Heading size={1} className="text-brand-navy dark:text-slate-100">
            {title}
          </Heading>
        </View>
        {rightElement && (
          <View className="ml-4">
            {rightElement}
          </View>
        )}
      </View>
      {subtitle && (
        <Body size="lg" className="text-slate-500 dark:text-slate-400">
          {subtitle}
        </Body>
      )}
    </View>
  );
}
