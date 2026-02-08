import React from 'react';
import { Text, View } from 'react-native';

type SectionHeaderProps = {
  title: string;
};

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <View className="mb-4 mt-1 px-1">
      <Text className="text-[13px] font-semibold uppercase tracking-[2px] text-slate-500 dark:text-slate-400">
        {title}
      </Text>
    </View>
  );
}
