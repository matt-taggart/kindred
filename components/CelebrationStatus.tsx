import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';

export default function CelebrationStatus() {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <View className="mb-6 items-center justify-center">
        <Ionicons name="checkmark-circle" size={80} color="#9CA986" />
      </View>
      
      <Text className="text-3xl font-bold text-gray-900 text-center">
        You&apos;re all caught up!
      </Text>
      
      <Text className="mt-3 text-base text-gray-600 text-center leading-relaxed">
        Great job staying on top of your relationships. Take a well-deserved break!
      </Text>
    </View>
  );
}
