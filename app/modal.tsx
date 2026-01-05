import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Contact, Interaction } from '@/db/schema';
import { addNoteOnly, getContacts, getInteractionHistory, updateInteraction, updateInteractionNote } from '@/services/contactService';

export default function LogInteractionModal() {
  const router = useRouter();
  const { contactId, interactionId, noteOnly } = useLocalSearchParams<{ contactId?: string | string[]; interactionId?: string; noteOnly?: string }>();
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const contact: Contact | undefined = useMemo(() => {
    if (!contactId || Array.isArray(contactId)) return undefined;
    return getContacts().find((item) => item.id === contactId);
  }, [contactId]);

  useEffect(() => {
    if (interactionId && !Array.isArray(interactionId) && contactId && !Array.isArray(contactId)) {
      setIsEditMode(true);
      const history = getInteractionHistory(contactId);
      const existingInteraction = history.find((i) => i.id === interactionId);
      if (existingInteraction?.notes) {
        setNote(existingInteraction.notes);
      }
    } else {
      setIsEditMode(false);
      setNote('');
    }
  }, [interactionId, contactId]);

  const handleSave = async () => {
    if (!contactId || Array.isArray(contactId)) {
      Alert.alert('Missing contact', 'No contact was selected.');
      return;
    }

    if (isEditMode && (typeof interactionId !== 'string' || Array.isArray(interactionId))) {
      Alert.alert('Error', 'Invalid interaction.');
      return;
    }

    try {
      setSaving(true);

      if (isEditMode && interactionId) {
        await updateInteractionNote(interactionId, note.trim());
      } else if (noteOnly === 'true') {
        await addNoteOnly(contactId, note.trim());
      } else {
        await updateInteraction(contactId, 'call', note.trim() || undefined);
      }

      router.back();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save interaction.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    router.back();
  };

  const handleSkip = async () => {
    if (!contactId || Array.isArray(contactId)) {
      Alert.alert('Missing contact', 'No contact was selected.');
      return;
    }

    try {
      setSaving(true);
      await updateInteraction(contactId, 'call', undefined);
      router.back();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to skip interaction.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="flex-1 px-6 pb-8 pt-6">
        <Text className="text-2xl font-bold text-slate">{isEditMode ? 'Edit Note' : 'Add a Note'}</Text>
        <Text className="mt-2 text-base text-slate">
          What did you talk about with {contact?.name || 'this contact'}?
        </Text>

        <TextInput
          className="mt-4 min-h-[140px] rounded-2xl border border-sage-100 bg-white px-3 py-3 text-base text-slate"
          multiline
          placeholder="What did you talk about? (optional)"
          value={note}
          onChangeText={setNote}
          autoFocus
          placeholderTextColor="#94a3b8"
        />

        <View className="mt-6 flex-row gap-2">
          {!isEditMode && (
            <TouchableOpacity
              className="flex-1 items-center rounded-xl bg-white py-3"
              onPress={noteOnly === 'true' ? handleClose : handleSkip}
              activeOpacity={0.85}
              disabled={saving}
            >
              <Text className="font-semibold text-slate">{noteOnly === 'true' ? 'Cancel' : 'Skip'}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            className="flex-1 items-center rounded-xl bg-sage py-3"
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={saving}
          >
            <Text className="font-semibold text-white">{saving ? 'Saving...' : 'Save'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
