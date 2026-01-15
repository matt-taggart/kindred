import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';

export default function EmptyContactsState() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center px-8">
      <View className="mb-6 items-center justify-center">
        <View className="relative">
          <Ionicons name="people-outline" size={80} color="#9CA986" />
          <View className="absolute -bottom-1 -right-1 rounded-full bg-cream p-1">
            <Ionicons name="heart" size={24} color="#C4A484" />
          </View>
        </View>
      </View>

      <Text className="text-2xl font-semibold text-warmgray text-center leading-tight mb-2">
        The people you care about{'\n'}will gather here.
      </Text>

      <Text className="text-base text-warmgray-muted text-center mb-8">
        Start by adding your first connection.
      </Text>

      <TouchableOpacity
        className="w-full items-center rounded-2xl bg-sage py-4 mb-3"
        onPress={() => router.push('/contacts/import')}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Import contacts from phone"
      >
        <Text className="text-lg font-semibold text-white">Import from contacts</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/contacts/new')}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Add a connection manually"
      >
        <Text className="text-base font-medium text-sage">Add manually</Text>
      </TouchableOpacity>
    </View>
  );
}
