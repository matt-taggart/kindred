import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';

export default function CelebrationStatus() {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <View className="mb-6 items-center justify-center">
        <Ionicons name="sunny-outline" size={80} color="#9CA986" />
      </View>

      <Text className="text-3xl font-bold text-warmgray text-center leading-tight">
        Your connections are resting
      </Text>

      <Text className="mt-4 text-xl text-warmgray-muted text-center leading-relaxed">
        Enjoy your day.
      </Text>
    </View>
  );
}
