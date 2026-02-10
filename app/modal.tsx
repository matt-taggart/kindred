import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  InputAccessoryView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { getInteractionHistory, updateInteractionNote } from '@/services/contactService';

const NOTE_ACCESSORY_ID = 'edit-note-toolbar';

export default function EditInteractionModal() {
  const router = useRouter();
  const { contactId, interactionId } = useLocalSearchParams<{
    contactId?: string | string[];
    interactionId?: string;
  }>();
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (
      !interactionId ||
      !contactId ||
      Array.isArray(interactionId) ||
      Array.isArray(contactId)
    ) {
      return;
    }

    const history = getInteractionHistory(contactId);
    const existingInteraction = history.find((interaction) => interaction.id === interactionId);
    setNote(existingInteraction?.notes || '');
  }, [interactionId, contactId]);

  const handleSave = async () => {
    if (!interactionId || Array.isArray(interactionId)) {
      Alert.alert('Error', 'Invalid interaction.');
      return;
    }

    try {
      setSaving(true);
      await updateInteractionNote(interactionId, note.trim());
      router.back();
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to save interaction.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <View className="flex-1 px-6 pt-4">
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} className="p-2 -ml-2">
            <Ionicons name="close" size={24} color="#9CA3AF" />
          </TouchableOpacity>

          <Ionicons name="leaf" size={28} color="#7D9D7A" />

          <TouchableOpacity
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={saving}
            className="px-4 py-1.5 rounded-full bg-sage-light dark:bg-accent-dark-sage"
          >
            <Text className="font-medium text-primary">
              {saving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text className="text-2xl font-light text-center text-slate-900 dark:text-white mb-8">
          Edit memory
        </Text>

        <View className="flex-1 min-h-[200px]">
          <View
            className="flex-1 border-2 border-dashed rounded-3xl p-4"
            style={{ borderColor: 'rgba(125, 157, 122, 0.3)' }}
          >
            <TextInput
              className="flex-1 bg-transparent text-lg leading-relaxed text-slate-700 dark:text-slate-300 p-0"
              multiline
              placeholder="Update your note..."
              value={note}
              onChangeText={setNote}
              placeholderTextColor="#D1D5DB"
              textAlignVertical="top"
              style={{ minHeight: 150 }}
              inputAccessoryViewID={Platform.OS === 'ios' ? NOTE_ACCESSORY_ID : undefined}
            />
          </View>
        </View>
      </View>
      </KeyboardAvoidingView>

      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={NOTE_ACCESSORY_ID}>
          <View className="flex-row justify-end items-center px-4 py-2 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
            <TouchableOpacity onPress={Keyboard.dismiss} activeOpacity={0.7}>
              <Text className="text-base font-semibold text-primary">Done</Text>
            </TouchableOpacity>
          </View>
        </InputAccessoryView>
      )}
    </SafeAreaView>
  );
}
