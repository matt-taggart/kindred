import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

import type { Contact } from '@/db/schema';

const ProgressDots = ({ step }: { step: 1 | 2 | 3 }) => (
  <View className="flex-row items-center justify-center gap-2">
    {[1, 2, 3].map((i) => (
      <View
        key={i}
        className={`h-2.5 w-2.5 rounded-full ${i === step ? 'bg-sage' : 'bg-border'}`}
      />
    ))}
  </View>
);

type RhythmOption = {
  label: string;
  value: Contact['bucket'];
  description?: string;
  manual?: boolean;
};

const RHYTHMS: RhythmOption[] = [
  { label: 'Every week', value: 'weekly' },
  { label: 'Every few weeks', value: 'bi-weekly' },
  { label: 'Once a month', value: 'monthly' },
  { label: 'Seasonally', value: 'every-six-months' },
  { label: 'Only when I choose', value: 'custom', manual: true },
];

export default function AddConnectionRhythmScreen() {
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name?: string }>();

  const connectionName = useMemo(() => (typeof name === 'string' ? name.trim() : ''), [name]);
  const [selected, setSelected] = useState<RhythmOption>(RHYTHMS[1]);

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <Stack.Screen
        options={{
          title: connectionName || 'Add a connection',
          headerBackTitle: 'Back',
          headerShadowVisible: false,
        }}
      />

      <View className="flex-1 px-5 pt-6">
        <ProgressDots step={2} />

        <Text className="mt-8 text-2xl font-semibold text-warmgray">
          How often would you like a gentle reminder?
        </Text>
        <Text className="mt-2 text-base text-warmgray-muted">
          You can change this anytime.
        </Text>

        <View className="mt-8 gap-3">
          {RHYTHMS.map((option) => {
            const active = selected.label === option.label;
            return (
              <TouchableOpacity
                key={option.label}
                className={`rounded-2xl border p-4 ${active ? 'border-sage bg-sage-100' : 'border-border bg-surface'}`}
                onPress={() => setSelected(option)}
                activeOpacity={0.85}
              >
                <View className="flex-row items-center justify-between">
                  <Text className={`text-base font-semibold ${active ? 'text-warmgray' : 'text-warmgray'}`}>
                    {option.label}
                  </Text>
                  <View className={`h-6 w-6 rounded-full border-2 ${active ? 'border-sage bg-sage' : 'border-border bg-surface'}`} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          className="mt-8 items-center rounded-2xl bg-sage py-4"
          onPress={() => {
            if (!connectionName) {
              router.replace('/contacts/add');
              return;
            }
            router.push({
              pathname: '/contacts/add/birthday',
              params: {
                name: connectionName,
                bucket: selected.value,
                manual: selected.manual ? '1' : '0',
              },
            });
          }}
          activeOpacity={0.9}
        >
          <Text className="text-lg font-semibold text-white">Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
