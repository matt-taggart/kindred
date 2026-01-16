import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import { Contact } from '@/db/schema';

const SCREEN_HEIGHT = Dimensions.get('window').height;

type Props = {
  visible: boolean;
  contact: Contact | null;
  onClose: () => void;
  onSubmit: (note: string) => void;
};

export default function ReachedOutSheet({ visible, contact, onClose, onSubmit }: Props) {
  const [note, setNote] = useState('');
  const [expanded, setExpanded] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      slideAnim.setValue(SCREEN_HEIGHT);
    }
  }, [visible, slideAnim]);

  const handleSubmit = useCallback(() => {
    onSubmit(note.trim());
    setNote('');
    setExpanded(false);
  }, [note, onSubmit]);

  const handleClose = useCallback(() => {
    setNote('');
    setExpanded(false);
    onClose();
  }, [onClose]);

  if (!contact) return null;

  const prompt = "Anything you'd like to remember?";
  const placeholder = `Add a note for ${contact.name}`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable className="flex-1 bg-black/30" onPress={handleClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-end"
        >
          <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
            <Pressable
              className="bg-surface rounded-t-3xl px-6 pb-8 pt-6"
              onPress={(e) => e.stopPropagation()}
            >
            {/* Handle bar */}
            <View className="mb-4 h-1 w-10 self-center rounded-full bg-border" />

            {/* Confirmation */}
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-xl font-semibold text-warmgray">
                Connected with {contact.name}
              </Text>
              <Text className="text-2xl text-sage">✓</Text>
            </View>

            {/* Note input */}
            {expanded ? (
              <View className="mb-6">
                <Text className="mb-2 text-base text-warmgray-muted">{prompt}</Text>
                <TextInput
                  className="min-h-[100px] rounded-2xl border border-border bg-cream p-4 text-base text-warmgray"
                  placeholder={placeholder}
                  placeholderTextColor="#8B9678"
                  value={note}
                  onChangeText={setNote}
                  multiline
                  textAlignVertical="top"
                  autoFocus
                />
              </View>
            ) : (
              <TouchableOpacity
                className="mb-6 rounded-2xl border border-border bg-cream p-4"
                onPress={() => setExpanded(true)}
                activeOpacity={0.7}
              >
                <Text className="text-base text-warmgray-muted">
                  Add a note (optional)
                </Text>
              </TouchableOpacity>
            )}

            {/* Submit button */}
            <TouchableOpacity
              className="items-center rounded-2xl bg-sage py-4"
              onPress={handleSubmit}
              activeOpacity={0.85}
            >
              <Text className="text-lg font-semibold text-white">Done</Text>
            </TouchableOpacity>
            </Pressable>
          </Animated.View>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
