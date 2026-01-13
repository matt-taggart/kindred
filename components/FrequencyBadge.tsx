import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, Text } from 'react-native';

import { Contact } from '@/db/schema';

const bucketLabels: Record<Contact['bucket'], string> = {
  daily: 'Every day',
  weekly: 'Every week',
  'bi-weekly': 'Every few weeks',
  'every-three-weeks': 'Every few weeks',
  monthly: 'Once a month',
  'every-six-months': 'Seasonally',
  yearly: 'Once a year',
  custom: 'Custom',
};

const bucketColors: Record<Contact['bucket'], string> = {
  daily: 'bg-purple-100',
  weekly: 'bg-blue-100',
  'bi-weekly': 'bg-indigo-100',
  'every-three-weeks': 'bg-indigo-100',
  monthly: 'bg-teal-100',
  'every-six-months': 'bg-amber-100',
  yearly: 'bg-orange-100',
  custom: 'bg-gray-200',
};

const bucketTextColors: Record<Contact['bucket'], string> = {
  daily: 'text-purple-700',
  weekly: 'text-blue-700',
  'bi-weekly': 'text-indigo-700',
  'every-three-weeks': 'text-indigo-700',
  monthly: 'text-teal-700',
  'every-six-months': 'text-amber-700',
  yearly: 'text-orange-700',
  custom: 'text-gray-800',
};

interface FrequencyBadgeProps {
  bucket: Contact['bucket'];
  onPress?: () => void;
}

export default function FrequencyBadge({ bucket, onPress }: FrequencyBadgeProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center rounded-full px-3 py-1 ${bucketColors[bucket]}`}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <Text className={`text-xs font-semibold ${bucketTextColors[bucket]}`}>{bucketLabels[bucket]}</Text>
      <Ionicons
        name="chevron-down"
        size={14}
        color={bucketTextColors[bucket]?.replace('text-', '')}
        style={{ marginLeft: 2 }}
      />
    </TouchableOpacity>
  );
}
