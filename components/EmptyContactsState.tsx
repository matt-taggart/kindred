import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { View, TouchableOpacity, Image } from 'react-native';
import { Heading, Body } from './ui';
import Colors from '@/constants/Colors';

const EmptyIllustration = () => (
  <View className="relative mb-8 items-center justify-center">
    <Image
      source={require('../assets/images/icon_filled_final.png')}
      style={{ width: 72, height: 72, opacity: 0.9 }}
      resizeMode="contain"
    />
  </View>
);

const ActionButton = ({ icon, label, onPress }: { icon: any; label: string; onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    className="w-full bg-white dark:bg-card-dark py-4 px-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex-row items-center justify-between mb-3"
    activeOpacity={0.85}
  >
    <View className="flex-row items-center">
      <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-3">
        <Ionicons name={icon} size={20} color={Colors.primary} />
      </View>
      <Body weight="medium">{label}</Body>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#D1D1D6" />
  </TouchableOpacity>
);

export default function EmptyContactsState() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center px-8 -mt-24">
      <EmptyIllustration />

      <Heading size={1} className="text-center mb-4 leading-tight">
        The people you care about{"\n"}will gather here.
      </Heading>

      <Body muted className="text-center mb-10 max-w-[280px]">
        Kindred helps you gently nurture the relationships that matter
      </Body>

      <View className="w-full">
        <ActionButton
          icon="people-outline"
          label="Import from contacts"
          onPress={() => router.push('/contacts/import')}
        />
        <ActionButton
          icon="person-add-outline"
          label="Add manually"
          onPress={() => router.push('/contacts/add')}
        />
      </View>
    </View>
  );
}
