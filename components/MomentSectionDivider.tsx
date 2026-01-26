import React from 'react';
import { View, Text } from 'react-native';

type MomentSectionDividerProps = {
  title: string;
  highlighted?: boolean;
};

export function MomentSectionDivider({ title, highlighted = false }: MomentSectionDividerProps) {
  const lineColor = highlighted ? 'bg-primary/20' : 'bg-slate-200 dark:bg-slate-800';
  const textColor = highlighted ? 'text-primary' : 'text-slate-400';

  return (
    <View
      testID="moment-section-divider"
      accessibilityHint={highlighted ? 'highlighted' : 'default'}
      className="flex-row items-center gap-3 mb-4"
    >
      <View className={`h-[1px] flex-1 ${lineColor}`} />
      <Text className={`text-xs font-bold uppercase tracking-widest ${textColor} font-display`}>
        {title}
      </Text>
      <View className={`h-[1px] flex-1 ${lineColor}`} />
    </View>
  );
}
