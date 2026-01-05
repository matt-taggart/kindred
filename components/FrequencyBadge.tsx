import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, Text } from 'react-native';

import { Contact } from '@/db/schema';

const bucketLabels: Record<Contact['bucket'], string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

const bucketColors: Record<Contact['bucket'], string> = {
  daily: 'bg-purple-100',
  weekly: 'bg-blue-100',
  monthly: 'bg-teal-100',
  yearly: 'bg-orange-100',
};

const bucketTextColors: Record<Contact['bucket'], string> = {
  daily: 'text-purple-700',
  weekly: 'text-blue-700',
  monthly: 'text-teal-700',
  yearly: 'text-orange-700',
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
        name="chevron-forward"
        size={14}
        color={bucketTextColors[bucket]?.replace('text-', '')}
        style={{ marginLeft: 2 }}
      />
    </TouchableOpacity>
  );
}
