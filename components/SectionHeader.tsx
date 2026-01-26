import React from 'react';
import { Text, View } from 'react-native';

type SectionHeaderProps = {
  title: string;
};

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <View className="mb-4 px-1">
      <Text className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
        {title}
      </Text>
    </View>
  );
}
