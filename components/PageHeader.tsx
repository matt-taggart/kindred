import React from 'react';
import { Image, View } from 'react-native';
import { Heading, Body, Caption } from './ui';

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  leftElement?: React.ReactNode;
  showBranding?: boolean;
  brandingToHeadingGapClassName?: string;
  titleToSubtitleGapClassName?: string;
  subtitleSize?: 'sm' | 'base' | 'lg';
};

export function PageHeader({
  title,
  subtitle,
  rightElement,
  leftElement,
  showBranding = true,
  brandingToHeadingGapClassName = 'mb-2',
  titleToSubtitleGapClassName = 'mb-2',
  subtitleSize = 'lg',
}: PageHeaderProps) {
  return (
    <View className="mb-4">
      {showBranding && (
        <View className={`flex-row items-center gap-2 ${brandingToHeadingGapClassName}`}>
          <View className="w-8 h-8 items-center justify-center">
            <Image
              source={require('../assets/images/icon.png')}
              className="w-7 h-7"
              resizeMode="contain"
            />
          </View>
          <Caption uppercase muted={false} className="text-primary/70 font-semibold tracking-[3px]">
            KINDRED
          </Caption>
        </View>
      )}
      
      <View className={`flex-row justify-between items-center ${titleToSubtitleGapClassName}`}>
        <View className="flex-1 flex-row items-center gap-3">
          {leftElement && (
            <View>
              {leftElement}
            </View>
          )}
          <Heading size={1} className="text-text-strong dark:text-slate-100 flex-1">
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
        <Body size={subtitleSize} className="text-text-muted dark:text-slate-400">
          {subtitle}
        </Body>
      )}
    </View>
  );
}
