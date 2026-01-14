import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';

type Props = {
  completionCount?: number;
};

export default function CelebrationStatus({ completionCount = 0 }: Props) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <View className="mb-6 items-center justify-center">
        <Ionicons name="sunny-outline" size={80} color="#9CA986" />
      </View>

      <Text className="text-3xl font-bold text-warmgray text-center leading-tight">
        All caught up!
      </Text>

      {completionCount > 0 ? (
        <Text className="mt-4 text-xl text-warmgray-muted text-center leading-relaxed">
          {completionCount} {completionCount === 1 ? 'connection' : 'connections'} nurtured today.{'\n'}
          Enjoy your day.
        </Text>
      ) : (
        <Text className="mt-4 text-xl text-warmgray-muted text-center leading-relaxed">
          Enjoy your day.
        </Text>
      )}
    </View>
  );
}
