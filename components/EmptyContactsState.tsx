import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { View, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Heading, Body } from './ui';

const EmptyIllustration = () => (
  <View className="relative mb-8 items-center justify-center">
    <View className="w-48 h-48 bg-primary opacity-10 rounded-full absolute blur-3xl" />
    <View className="relative z-10 items-center justify-center">
      <Svg width={120} height={120} viewBox="0 0 24 24" fill="none">
        <Path
          d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C22,3 11,1 11,12C11,12.33 11,12.67 11.05,13C7,13 4,16 4,16C4,16 7,16 9,15C9,15 9,17 11,18C11,18 11,16 12,16C12,16 13,17 15,17C15,17 15,15 17,15C17,15 17,13 18,12C18,12 17,11 15,11L17,8Z"
          fill="#8BA88E"
          fillOpacity={0.8}
        />
      </Svg>
      <View className="absolute -bottom-2 -right-2 bg-accent-warm dark:bg-slate-700 w-12 h-12 rounded-full items-center justify-center shadow-sm">
        <Ionicons name="heart" size={24} color="#8BA88E" />
      </View>
    </View>
  </View>
);

const ActionButton = ({ icon, label, onPress }: { icon: any; label: string; onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    className="w-full bg-white dark:bg-card-dark py-4 px-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex-row items-center justify-between mb-3"
    activeOpacity={0.85}
  >
    <View className="flex-row items-center">
      <View className="w-10 h-10 bg-primary opacity-10 rounded-full items-center justify-center mr-3">
        <Ionicons name={icon} size={20} color="#79947D" />
      </View>
      <Body weight="medium">{label}</Body>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#D1D1D6" />
  </TouchableOpacity>
);

export default function EmptyContactsState() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center px-8">
      <EmptyIllustration />

      <Heading size={1} className="text-center mb-4 leading-tight">
        The people you care about{"\n"}will gather here.
      </Heading>

      <Body muted className="text-center mb-10 max-w-[280px]">
        Kindred helps you gently nurture the relationships that matter
      </Body>

      <View className="w-full">
        <ActionButton
          icon="people"
          label="Import from contacts"
          onPress={() => router.push('/contacts/import')}
        />
        <ActionButton
          icon="person-add"
          label="Add manually"
          onPress={() => router.push('/contacts/add')}
        />
      </View>
    </View>
  );
}
