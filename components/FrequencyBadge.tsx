import { TouchableOpacity, Text } from 'react-native';

import { Contact } from '@/db/schema';

const bucketLabels: Record<Contact['bucket'], string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

const bucketColors: Record<Contact['bucket'], string> = {
  daily: 'bg-terracotta-100',
  weekly: 'bg-sage-100',
  monthly: 'bg-blue-100',
  yearly: 'bg-purple-100',
};

const bucketTextColors: Record<Contact['bucket'], string> = {
  daily: 'text-terracotta',
  weekly: 'text-sage',
  monthly: 'text-blue-600',
  yearly: 'text-purple-600',
};

interface FrequencyBadgeProps {
  bucket: Contact['bucket'];
  onPress?: () => void;
}

export default function FrequencyBadge({ bucket, onPress }: FrequencyBadgeProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`rounded-full px-3 py-1 ${bucketColors[bucket]}`}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <Text className={`text-xs font-semibold ${bucketTextColors[bucket]}`}>{bucketLabels[bucket]}</Text>
    </TouchableOpacity>
  );
}
