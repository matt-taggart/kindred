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
import { Contact, NewInteraction } from '@/db/schema';

const SCREEN_HEIGHT = Dimensions.get('window').height;

type InteractionType = NewInteraction['type'];

type Props = {
  visible: boolean;
  contact: Contact | null;
  onClose: () => void;
  onSubmit: (type: InteractionType, note: string) => void;
};

export default function ReachedOutSheet({ visible, contact, onClose, onSubmit }: Props) {
  const [note, setNote] = useState('');
  const [type, setType] = useState<InteractionType>('call');
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
    onSubmit(type, note.trim());
    setNote('');
    setType('call');
    setExpanded(false);
  }, [type, note, onSubmit]);

  const handleClose = useCallback(() => {
    setNote('');
    setType('call');
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
              onPress={(e) => e.stopPropagation?.()}
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

            {/* Interaction Type Section */}
            <View className="mb-6">
              <Text className="mb-3 text-base font-medium text-warmgray">
                How did you connect?
              </Text>
              <View className="flex-row gap-2">
                {(['call', 'text', 'email', 'meet'] as InteractionType[]).map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setType(t)}
                    className={`flex-1 items-center rounded-xl border py-3 ${
                      type === t ? 'border-sage bg-sage' : 'border-border bg-cream'
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold capitalize ${
                        type === t ? 'text-white' : 'text-warmgray-muted'
                      }`}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
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
