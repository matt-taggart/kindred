import React from 'react';
import { Text, View } from 'react-native';

type SectionHeaderProps = {
  title: string;
};

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <View className="mb-4 mt-1 flex-row items-center gap-3 px-1">
      <View className="h-[1px] flex-1 bg-stroke-soft dark:bg-slate-800" />
      <Text className="text-[12px] font-semibold uppercase tracking-[2px] text-text-muted dark:text-slate-400">
        {title}
      </Text>
      <View className="h-[1px] w-8 bg-stroke-soft dark:bg-slate-800" />
    </View>
  );
}
