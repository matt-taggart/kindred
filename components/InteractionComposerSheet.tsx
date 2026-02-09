import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Contact, NewInteraction } from '@/db/schema';

const SCREEN_HEIGHT = Dimensions.get('window').height;

type InteractionType = NewInteraction['type'];
export type InteractionKind = NewInteraction['kind'];

type ConnectionTypeConfig = {
  type: InteractionType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const CONNECTION_TYPES: ConnectionTypeConfig[] = [
  { type: 'call', label: 'Call', icon: 'call' },
  { type: 'text', label: 'Text', icon: 'chatbubble-outline' },
  { type: 'email', label: 'Email', icon: 'mail-outline' },
  { type: 'meet', label: 'In person', icon: 'person-outline' },
];

type SubmitPayload = {
  kind: InteractionKind;
  type: InteractionType;
  note: string;
};

type Props = {
  visible: boolean;
  contact: Contact | null;
  onClose: () => void;
  onSubmit: (payload: SubmitPayload) => void | Promise<void>;
  initialKind?: InteractionKind;
};

export default function InteractionComposerSheet({
  visible,
  contact,
  onClose,
  onSubmit,
  initialKind = 'checkin',
}: Props) {
  const [note, setNote] = useState('');
  const [type, setType] = useState<InteractionType>('call');
  const [kind, setKind] = useState<InteractionKind>(initialKind);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      setKind(initialKind);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      slideAnim.setValue(SCREEN_HEIGHT);
    }
  }, [initialKind, visible, slideAnim]);

  const reset = useCallback(() => {
    setNote('');
    setType('call');
    setKind(initialKind);
  }, [initialKind]);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  const handleSubmit = useCallback(() => {
    onSubmit({ kind, type, note: note.trim() });
    reset();
  }, [kind, type, note, onSubmit, reset]);

  const title = useMemo(() => (
    kind === 'checkin'
      ? `How did you connect with ${contact?.name ?? ''}?`
      : `Add memory for ${contact?.name ?? ''}`
  ), [contact?.name, kind]);

  if (!contact) return null;

  const helperText = kind === 'checkin'
    ? 'This updates your next reminder.'
    : 'This keeps reminder timing unchanged';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable className="flex-1 bg-black/30" onPress={handleClose}>
        <View className="flex-1 justify-end">
          <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
            <Pressable
              className="bg-background-light dark:bg-background-dark rounded-t-[40px] px-6 pb-12 pt-8"
              onPress={(event) => event.stopPropagation?.()}
            >
              <View className="mb-6 h-1.5 w-12 self-center rounded-full bg-slate-200 dark:bg-slate-800" />

              <View className="flex-row items-center justify-between mb-6">
                <TouchableOpacity onPress={handleClose} activeOpacity={0.7} className="p-2 -ml-2">
                  <Ionicons name="close" size={24} color="#9CA3AF" />
                </TouchableOpacity>

                <Ionicons name="leaf" size={28} color="#7D9D7A" />

                <TouchableOpacity
                  onPress={handleSubmit}
                  activeOpacity={0.85}
                  className="px-4 py-1.5 rounded-full bg-sage-light dark:bg-accent-dark-sage"
                >
                  <Text className="font-medium text-primary">Save</Text>
                </TouchableOpacity>
              </View>

              <Text className="text-2xl font-light text-center text-slate-900 dark:text-white mb-4">
                {title}
              </Text>

              <Text className="text-xs text-center text-slate-500 dark:text-slate-400 mb-6">
                {helperText}
              </Text>

              <View className="mb-8">
                <Text className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6 text-center">
                  How did you connect?
                </Text>
                <View className="flex-row justify-between items-start">
                  {CONNECTION_TYPES.map((config) => {
                    const isSelected = type === config.type;
                    return (
                      <TouchableOpacity
                        key={config.type}
                        onPress={() => setType(config.type)}
                        className="flex-col items-center gap-3"
                        activeOpacity={0.7}
                      >
                        <View
                          className={`w-16 h-16 rounded-full items-center justify-center ${
                            isSelected
                              ? 'bg-primary/10 dark:bg-primary/20'
                              : 'bg-sage-light dark:bg-accent-dark-sage'
                          }`}
                          style={isSelected ? { borderWidth: 2, borderColor: '#7D9D7A' } : undefined}
                        >
                          <Ionicons name={config.icon} size={24} color="#7D9D7A" />
                        </View>
                        <Text
                          className={`text-sm ${
                            isSelected
                              ? 'font-semibold text-primary'
                              : 'font-medium text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {config.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 text-center">
                  Anything to remember?
                </Text>

                <View
                  className="min-h-[150px] border-2 border-dashed rounded-3xl p-4"
                  style={{ borderColor: 'rgba(125, 157, 122, 0.3)' }}
                >
                  <TextInput
                    className="bg-transparent text-lg leading-relaxed text-slate-700 dark:text-slate-300 p-0"
                    multiline
                    placeholder={kind === 'checkin' ? 'How did it go?' : 'Capture a memory...'}
                    value={note}
                    onChangeText={setNote}
                    placeholderTextColor="#D1D5DB"
                    textAlignVertical="top"
                    style={{ minHeight: 120 }}
                  />
                </View>
              </View>
            </Pressable>
          </Animated.View>
        </View>
      </Pressable>
    </Modal>
  );
}
