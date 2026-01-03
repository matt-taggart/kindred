import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Contact } from '@/db/schema';
import { getContacts, updateInteraction } from '@/services/contactService';

export default function LogInteractionModal() {
  const router = useRouter();
  const { contactId } = useLocalSearchParams<{ contactId?: string | string[] }>();
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const contact: Contact | undefined = useMemo(() => {
    if (!contactId || Array.isArray(contactId)) return undefined;
    return getContacts().find((item) => item.id === contactId);
  }, [contactId]);

  const handleSave = async () => {
    if (!contactId || Array.isArray(contactId)) {
      Alert.alert('Missing contact', 'No contact was selected.');
      return;
    }

    try {
      setSaving(true);
      await updateInteraction(contactId, 'call', note.trim() || undefined);
      router.back();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save interaction.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-4 pt-6">
      <Text className="text-2xl font-bold text-gray-900">Log Interaction</Text>
      <Text className="mt-2 text-base text-gray-700">
        {contact ? `Add a note for ${contact.name}` : 'Add a quick note for this interaction.'}
      </Text>

      <TextInput
        className="mt-4 min-h-[140px] rounded-2xl border border-gray-200 bg-gray-50 px-3 py-3 text-base text-gray-900"
        multiline
        placeholder="What did you talk about? (optional)"
        value={note}
        onChangeText={setNote}
        autoFocus
      />

      <View className="mt-6 flex-row gap-2">
        <TouchableOpacity
          className="flex-1 items-center rounded-xl bg-gray-200 py-3"
          onPress={() => router.back()}
          activeOpacity={0.85}
          disabled={saving}
        >
          <Text className="font-semibold text-gray-800">Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 items-center rounded-xl bg-green-600 py-3"
          onPress={handleSave}
          activeOpacity={0.85}
          disabled={saving}
        >
          <Text className="font-semibold text-white">{saving ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
