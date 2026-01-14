import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Contact, Interaction, NewInteraction } from "@/db/schema";
import {
  addNoteOnly,
  getContacts,
  getInteractionHistory,
  updateInteraction,
  updateInteractionNote,
} from "@/services/contactService";

type InteractionType = NewInteraction["type"];

export default function LogInteractionModal() {
  const router = useRouter();
  const { contactId, interactionId, noteOnly } = useLocalSearchParams<{
    contactId?: string | string[];
    interactionId?: string;
    noteOnly?: string;
  }>();
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [interactionType, setInteractionType] =
    useState<InteractionType>("call");

  const contact: Contact | undefined = useMemo(() => {
    if (!contactId || Array.isArray(contactId)) return undefined;
    return getContacts().find((item) => item.id === contactId);
  }, [contactId]);

  useEffect(() => {
    if (
      interactionId &&
      !Array.isArray(interactionId) &&
      contactId &&
      !Array.isArray(contactId)
    ) {
      setIsEditMode(true);
      const history = getInteractionHistory(contactId);
      const existingInteraction = history.find((i) => i.id === interactionId);
      if (existingInteraction?.notes) {
        setNote(existingInteraction.notes);
      }
      if (existingInteraction?.type) {
        setInteractionType(existingInteraction.type as InteractionType);
      }
    } else {
      setIsEditMode(false);
      setNote("");
      setInteractionType("call");
    }
  }, [interactionId, contactId]);

  const handleSave = async () => {
    if (!contactId || Array.isArray(contactId)) {
      Alert.alert('Missing connection', 'No connection was selected.');
      return;
    }

    if (
      isEditMode &&
      (typeof interactionId !== "string" || Array.isArray(interactionId))
    ) {
      Alert.alert("Error", "Invalid interaction.");
      return;
    }

    try {
      setSaving(true);

      if (isEditMode && interactionId) {
        await updateInteractionNote(interactionId, note.trim());
      } else if (noteOnly === "true") {
        await addNoteOnly(contactId, note.trim(), interactionType);
      } else {
        await updateInteraction(
          contactId,
          interactionType,
          note.trim() || undefined,
        );
      }

      router.back();
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to save interaction.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    router.back();
  };

  const handleSkip = async () => {
    if (!contactId || Array.isArray(contactId)) {
      Alert.alert('Missing connection', 'No connection was selected.');
      return;
    }

    try {
      setSaving(true);
      await updateInteraction(contactId, "call", undefined);
      router.back();
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to skip interaction.",
      );
    } finally {
      setSaving(false);
    }
  };

  const renderTypeButton = (type: InteractionType, label: string) => {
    const isSelected = interactionType === type;
    return (
      <TouchableOpacity
        onPress={() => setInteractionType(type)}
        className={`flex-1 items-center rounded-xl border py-3 ${
          isSelected ? 'border-sage bg-sage' : 'border-border bg-surface'
        }`}
      >
        <Text
          className={`font-medium ${isSelected ? 'text-white' : 'text-warmgray-muted'}`}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="flex-1 px-6 pb-8 pt-6">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-warmgray">
            {isEditMode ? 'Edit shared moment' : 'Add a shared moment'}
          </Text>
          <TouchableOpacity
            onPress={handleClose}
            activeOpacity={0.7}
            className="py-2 pl-4"
          >
            <Text className="text-base font-semibold text-warmgray-muted">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>

        <View className="mt-6">
          <Text className="mb-3 text-base font-medium text-warmgray">
            How did you connect?
          </Text>
          <View className="flex-row gap-3">
            {renderTypeButton("call", "Call")}
            {renderTypeButton("text", "Text")}
            {renderTypeButton("email", "Email")}
            {renderTypeButton("meet", "Meet")}
          </View>
        </View>

        <Text className="mt-6 text-base text-warmgray">
          Anything you'd like to remember?
        </Text>

        <TextInput
          className="mt-4 min-h-[140px] rounded-2xl border border-border bg-surface px-4 py-3 text-base text-warmgray"
          multiline
          placeholder={`Add a note for ${contact?.name ?? 'them'}...`}
          value={note}
          onChangeText={setNote}
          // autoFocus // Removed autoFocus to prevent keyboard from popping up immediately over the type selection
          placeholderTextColor="#8B9678"
        />

        <View className="mt-6 gap-4">
          <View className="flex-row gap-2">
            {!isEditMode && noteOnly !== "true" && (
              <TouchableOpacity
                className="flex-1 items-center rounded-2xl bg-surface border border-border py-4"
                onPress={handleSkip}
                activeOpacity={0.85}
                disabled={saving}
              >
                <Text className="font-semibold text-warmgray">Not now</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              className="flex-1 items-center rounded-2xl bg-sage py-4"
              onPress={handleSave}
              activeOpacity={0.85}
              disabled={saving}
            >
              <Text className="font-semibold text-white">
                {saving ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
