import { Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { AddFlowLayout, RelationshipTypePicker } from '@/components';

export default function AddConnectionNameScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<string | null>(null);

  const trimmed = useMemo(() => name.trim(), [name]);
  const canContinue = trimmed.length > 0;

  const navigateToRhythm = () => {
    router.push({
      pathname: '/contacts/add/rhythm',
      params: { name: trimmed, relationship: relationship || '' },
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <AddFlowLayout
        currentStep={1}
        title="Add a connection"
        subtitle="Every relationship has its own rhythm..."
        onBack={() => router.back()}
        onNext={navigateToRhythm}
        nextDisabled={!canContinue}
        showBackButton
      >
        {/* Name Input */}
        <Text className="text-xs font-medium uppercase tracking-wider text-text-muted mb-2">
          Name
        </Text>
        <View className="bg-surface-card rounded-2xl border border-stroke-soft px-4 py-4">
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Type a name..."
            placeholderTextColor="#9AA3AF"
            className="text-xl text-text-strong leading-6 pt-0 pb-0"
            autoCapitalize="words"
            returnKeyType="done"
          />
        </View>

        {/* Spacer */}
        <View className="mb-8" />

        {/* Relationship Picker */}
        <Text className="text-xs font-medium uppercase tracking-wider text-text-muted mb-2">
          Relationship
        </Text>
        <RelationshipTypePicker
          selected={relationship}
          onSelect={setRelationship}
        />
      </AddFlowLayout>
    </>
  );
}
