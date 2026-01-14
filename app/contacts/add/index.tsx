import { Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';

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

export default function AddConnectionNameScreen() {
  const router = useRouter();
  const [name, setName] = useState('');

  const trimmed = useMemo(() => name.trim(), [name]);
  const canContinue = trimmed.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <Stack.Screen
        options={{
          title: 'Add a connection',
          headerBackTitle: 'Connections',
          headerShadowVisible: false,
        }}
      />

      <View className="flex-1 px-5 pt-6">
        <ProgressDots step={1} />

        <Text className="mt-8 text-2xl font-semibold text-warmgray">
          Who would you like to stay connected with?
        </Text>
        <Text className="mt-2 text-base text-warmgray-muted">
          Every relationship has its own rhythm.
        </Text>

        <View className="mt-8 h-16 rounded-2xl border border-border bg-surface px-4 flex-row items-center">
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Name"
            placeholderTextColor="#8B9678"
            className="flex-1 text-2xl leading-8 text-warmgray"
            autoCapitalize="words"
            returnKeyType="done"
            textAlignVertical="center"
            style={{ marginTop: -2.5, paddingVertical: 0, height: '100%' }}
          />
        </View>

        <TouchableOpacity
          className={`mt-6 items-center rounded-2xl py-4 ${canContinue ? 'bg-sage' : 'bg-border'}`}
          onPress={() => {
            if (!canContinue) return;
            router.push({ pathname: '/contacts/add/rhythm', params: { name: trimmed } });
          }}
          activeOpacity={0.9}
          disabled={!canContinue}
        >
          <Text className={`text-lg font-semibold ${canContinue ? 'text-white' : 'text-warmgray-muted'}`}>
            Continue
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-4 items-center py-3"
          onPress={() => router.push({ pathname: '/contacts/import', params: { autoRequest: '1' } })}
          activeOpacity={0.8}
        >
          <Text className="text-base font-semibold text-sage">Or import from contacts ↗</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
