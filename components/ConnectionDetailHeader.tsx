import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PageHeader } from './PageHeader';
import Colors from '@/constants/Colors';

type ConnectionDetailHeaderProps = {
  name: string;
  relationship: string;
  onBackPress: () => void;
  onMorePress: () => void;
};

export function ConnectionDetailHeader({
  name,
  relationship,
  onBackPress,
  onMorePress,
}: ConnectionDetailHeaderProps) {
  return (
    <PageHeader
      title={name}
      subtitle={relationship}
      showBranding={false}
      leftElement={(
        <TouchableOpacity
          onPress={onBackPress}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          className="p-3.5 bg-white dark:bg-card-dark shadow-sm border border-slate-100 dark:border-slate-800 rounded-full items-center justify-center"
        >
          <Ionicons name="chevron-back" size={22} color={Colors.textSoft} />
        </TouchableOpacity>
      )}
      rightElement={(
        <TouchableOpacity
          onPress={onMorePress}
          accessibilityLabel="More options"
          accessibilityRole="button"
          className="p-3.5 bg-white dark:bg-card-dark shadow-sm border border-slate-100 dark:border-slate-800 rounded-full items-center justify-center"
        >
          <Ionicons name="ellipsis-horizontal" size={22} color={Colors.textSoft} />
        </TouchableOpacity>
      )}
    />
  );
}
