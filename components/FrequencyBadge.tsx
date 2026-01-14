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
  custom: 'Custom rhythm',
};

const bucketPillClasses: Record<Contact['bucket'], string> = {
  daily: 'bg-sage-100 border border-sage/20',
  weekly: 'bg-sage-100 border border-sage/20',
  'bi-weekly': 'bg-sage-100 border border-sage/20',
  'every-three-weeks': 'bg-sage-100 border border-sage/20',
  monthly: 'bg-sage-100 border border-sage/20',
  'every-six-months': 'bg-sage-100 border border-sage/20',
  yearly: 'bg-sage-100 border border-sage/20',
  custom: 'bg-cream border border-border',
};

const bucketTextClasses: Record<Contact['bucket'], string> = {
  daily: 'text-sage',
  weekly: 'text-sage',
  'bi-weekly': 'text-sage',
  'every-three-weeks': 'text-sage',
  monthly: 'text-sage',
  'every-six-months': 'text-sage',
  yearly: 'text-sage',
  custom: 'text-warmgray-muted',
};

interface FrequencyBadgeProps {
  bucket: Contact['bucket'];
  onPress?: () => void;
}

export default function FrequencyBadge({ bucket, onPress }: FrequencyBadgeProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center rounded-full px-3 py-1 ${bucketPillClasses[bucket]}`}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <Text className={`text-xs font-semibold ${bucketTextClasses[bucket]}`}>{bucketLabels[bucket]}</Text>
      {onPress ? (
        <Ionicons
          name="chevron-down"
          size={14}
          color={bucket === 'custom' ? '#8B9678' : '#9CA986'}
          style={{ marginLeft: 2 }}
        />
      ) : null}
    </TouchableOpacity>
  );
}
