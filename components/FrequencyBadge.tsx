import { Ionicons } from '@expo/vector-icons';
import Badge from '@/components/Badge';

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

interface FrequencyBadgeProps {
  bucket: Contact['bucket'];
  onPress?: () => void;
}

export default function FrequencyBadge({ bucket, onPress }: FrequencyBadgeProps) {
  const isCustom = bucket === 'custom';

  return (
    <Badge
      label={bucketLabels[bucket]}
      variant={isCustom ? 'neutral' : 'sage'}
      size="sm"
      leftDot={!isCustom}
      onPress={onPress}
      right={
        onPress ? (
          <Ionicons name="chevron-down" size={14} color={isCustom ? '#8B9678' : '#9CA986'} />
        ) : null
      }
      accessibilityLabel={`${bucketLabels[bucket]} frequency`}
    />
  );
}
