import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { NewInteraction } from "@/db/schema";
import {
  addNoteOnly,
  getInteractionHistory,
  updateInteraction,
  updateInteractionNote,
} from "@/services/contactService";

type InteractionType = NewInteraction["type"];

type ConnectionTypeConfig = {
  type: InteractionType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const CONNECTION_TYPES: ConnectionTypeConfig[] = [
  { type: "call", label: "Call", icon: "call" },
  { type: "text", label: "Text", icon: "chatbubble-outline" },
  { type: "email", label: "Voice", icon: "mic-outline" },
  { type: "meet", label: "In person", icon: "person-outline" },
];

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
      Alert.alert("Missing connection", "No connection was selected.");
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
          note.trim() || undefined
        );
      }

      router.back();
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to save interaction."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    router.back();
  };

  const renderConnectionTypeButton = (config: ConnectionTypeConfig) => {
    const isSelected = interactionType === config.type;
    return (
      <TouchableOpacity
        key={config.type}
        onPress={() => setInteractionType(config.type)}
        className="flex-col items-center gap-3"
        activeOpacity={0.7}
      >
        <View
          className={`w-16 h-16 rounded-full items-center justify-center ${
            isSelected
              ? "bg-primary/10 dark:bg-primary/20"
              : "bg-sage-light dark:bg-accent-dark-sage"
          }`}
          style={
            isSelected
              ? {
                  borderWidth: 2,
                  borderColor: "#7D9D7A",
                  // Ring offset simulation
                  shadowColor: "#FDFBF7",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                }
              : undefined
          }
        >
          <Ionicons
            name={config.icon}
            size={24}
            color="#7D9D7A"
          />
        </View>
        <Text
          className={`text-sm ${
            isSelected
              ? "font-semibold text-primary"
              : "font-medium text-slate-500 dark:text-slate-400"
          }`}
        >
          {config.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="flex-1 px-6 pt-4">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity
            onPress={handleClose}
            activeOpacity={0.7}
            className="p-2 -ml-2"
          >
            <Ionicons
              name="close"
              size={24}
              color="#9CA3AF"
            />
          </TouchableOpacity>

          <View className="flex-row items-center gap-1">
            <Ionicons
              name="leaf"
              size={28}
              color="#7D9D7A"
            />
          </View>

          <TouchableOpacity
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={saving}
            className="px-4 py-1.5 rounded-full bg-sage-light dark:bg-accent-dark-sage"
          >
            <Text className="font-medium text-primary">
              {saving ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text className="text-2xl font-light text-center text-slate-900 dark:text-white mb-8">
          {isEditMode ? "Edit memory" : "Nurture a memory"}
        </Text>

        {/* Connection Type Section */}
        <View className="mb-10">
          <Text className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6 text-center">
            How did you connect?
          </Text>
          <View className="flex-row justify-between items-start">
            {CONNECTION_TYPES.map(renderConnectionTypeButton)}
          </View>
        </View>

        {/* Notes Section */}
        <View className="flex-1">
          <Text className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 text-center">
            Anything to remember?
          </Text>

          <View className="flex-1 min-h-[200px]">
            <View
              className="flex-1 border-2 border-dashed rounded-3xl p-4"
              style={{ borderColor: "rgba(125, 157, 122, 0.3)" }}
            >
              <TextInput
                className="flex-1 bg-transparent text-lg leading-relaxed text-slate-700 dark:text-slate-300 p-0"
                multiline
                placeholder="Type your heart out..."
                value={note}
                onChangeText={setNote}
                placeholderTextColor="#D1D5DB"
                textAlignVertical="top"
                style={{ minHeight: 150 }}
              />
            </View>

            {/* Privacy Note */}
            <View className="flex-row items-center justify-center gap-1 mt-4">

              <Ionicons
                name="sparkles"
                size={12}
                color="#9CA3AF"
              />
              <Text className="text-[10px] text-slate-400 dark:text-slate-600">
                Kindred thoughts are kept private
              </Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
