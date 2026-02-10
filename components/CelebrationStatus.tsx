import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';

type Props = {
  completionCount?: number;
};

export default function CelebrationStatus({ completionCount = 0 }: Props) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <View className="mb-6 h-24 w-24 rounded-full border border-primary/20 bg-sage-light items-center justify-center">
        <Ionicons name="sunny-outline" size={44} color="#9DBEBB" />
      </View>

      <Text className="text-3xl font-bold text-text-strong text-center leading-tight">
        All caught up!
      </Text>

      {completionCount > 0 ? (
        <Text className="mt-4 text-xl text-text-muted text-center leading-relaxed">
          {completionCount} {completionCount === 1 ? 'connection' : 'connections'} nurtured today.{'\n'}
          Enjoy your day.
        </Text>
      ) : (
        <Text className="mt-4 text-xl text-text-muted text-center leading-relaxed">
          Enjoy your day.
        </Text>
      )}
    </View>
  );
}
