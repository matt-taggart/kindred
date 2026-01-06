import { Modal, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Contact } from '@/db/schema';

interface FrequencyGuideProps {
  visible: boolean;
  onClose: () => void;
}

const bucketInfo: Record<
  Contact['bucket'],
  { label: string; description: string; example: string }
> = {
  daily: {
    label: 'Daily',
    description: 'For your closest relationships',
    example: 'Best friends, partner, immediate family you see every day',
  },
  weekly: {
    label: 'Weekly',
    description: 'For your inner circle',
    example: 'Close friends, best friends from school, family members',
  },
  monthly: {
    label: 'Monthly',
    description: 'For people you care about',
    example: 'Good friends, cousins, colleagues you enjoy',
  },
  yearly: {
    label: 'Yearly',
    description: 'For long-distance or seasonal connections',
    example: 'Old friends, holiday contacts, people you reach out to occasionally',
  },
  'bi-weekly': {
    label: 'Bi-weekly',
    description: 'Every two weeks',
    example: 'Not typically shown here',
  },
  'every-three-weeks': {
    label: 'Every three weeks',
    description: 'Legacy cadence',
    example: 'Existing contacts only',
  },
  'every-six-months': {
    label: 'Every six months',
    description: 'Legacy cadence',
    example: 'Existing contacts only',
  },
  custom: {
    label: 'Custom',
    description: 'Your own cadence',
    example: 'Configured per contact',
  },
};

const bucketColors: Record<Contact['bucket'], string> = {
  daily: 'bg-purple-100',
  weekly: 'bg-blue-100',
  'bi-weekly': 'bg-indigo-100',
  'every-three-weeks': 'bg-indigo-100',
  monthly: 'bg-teal-100',
  'every-six-months': 'bg-amber-100',
  yearly: 'bg-orange-100',
  custom: 'bg-sage-100',
};

export default function FrequencyGuide({ visible, onClose }: FrequencyGuideProps) {
  return (
    <Modal
      visible={visible}
      presentationStyle="pageSheet"
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-cream">
        <View className="flex-1 px-6 pb-8 pt-4">
          <View className="mb-6 flex-row items-center justify-between">
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Text className="font-semibold text-slate">Close</Text>
            </TouchableOpacity>
            <Text className="text-lg font-bold text-slate">How often to check in?</Text>
            <View className="w-12" />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text className="mb-4 text-base text-slate-600">
              Choosing the right frequency helps you stay connected with the people who matter most in your life.
            </Text>

            {(['daily', 'weekly', 'monthly', 'yearly'] as Contact['bucket'][]).map((bucket) => (
              <View key={bucket} className={`mb-4 rounded-2xl ${bucketColors[bucket]} p-4`}>
                <Text className="text-lg font-bold text-slate">{bucketInfo[bucket].label}</Text>
                <Text className="mt-2 text-base text-slate-700">{bucketInfo[bucket].description}</Text>
                <View className="mt-3 flex-row items-start gap-2">
                  <Text className="text-sm font-semibold text-slate-600">Example:</Text>
                  <Text className="flex-1 text-sm text-slate-700">{bucketInfo[bucket].example}</Text>
                </View>
              </View>
            ))}

            <View className="mt-4 rounded-2xl border border-sage-200 bg-white p-4">
              <Text className="text-sm font-semibold text-sage">💡 Pro tip</Text>
              <Text className="mt-2 text-base text-slate-700">
                You can always adjust these later in each contact's settings. Start with what feels right!
              </Text>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
