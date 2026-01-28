import { useState, useCallback, useRef, useEffect } from 'react';
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

type ConnectionTypeConfig = {
  type: InteractionType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const CONNECTION_TYPES: ConnectionTypeConfig[] = [
  { type: 'call', label: 'Call', icon: 'call' },
  { type: 'text', label: 'Text', icon: 'chatbubble-outline' },
  { type: 'email', label: 'Voice', icon: 'mic-outline' },
  { type: 'meet', label: 'In person', icon: 'person-outline' },
];

type Props = {
  visible: boolean;
  contact: Contact | null;
  onClose: () => void;
  onSubmit: (type: InteractionType, note: string) => void;
};

export default function ReachedOutSheet({ visible, contact, onClose, onSubmit }: Props) {
  const [note, setNote] = useState('');
  const [type, setType] = useState<InteractionType>('call');
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
  }, [type, note, onSubmit]);

  const handleClose = useCallback(() => {
    setNote('');
    setType('call');
    onClose();
  }, [onClose]);

  if (!contact) return null;

  const renderConnectionTypeButton = (config: ConnectionTypeConfig) => {
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
              onPress={(e) => e.stopPropagation?.()}
            >
              {/* Handle bar */}
              <View className="mb-6 h-1.5 w-12 self-center rounded-full bg-slate-200 dark:bg-slate-800" />

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
                  onPress={handleSubmit}
                  activeOpacity={0.85}
                  className="px-4 py-1.5 rounded-full bg-sage-light dark:bg-accent-dark-sage"
                >
                  <Text className="font-medium text-primary">Save</Text>
                </TouchableOpacity>
              </View>

              {/* Title */}
              <Text className="text-2xl font-light text-center text-slate-900 dark:text-white mb-8">
                Connected with {contact.name}
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
              <View className="mb-4">
                <Text className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 text-center">
                  Anything to remember?
                </Text>

                <View
                  className="min-h-[150px] border-2 border-dashed rounded-3xl p-4"
                  style={{ borderColor: "rgba(125, 157, 122, 0.3)" }}
                >
                  <TextInput
                    className="bg-transparent text-lg leading-relaxed text-slate-700 dark:text-slate-300 p-0"
                    multiline
                    placeholder="Type your heart out..."
                    value={note}
                    onChangeText={setNote}
                    placeholderTextColor="#D1D5DB"
                    textAlignVertical="top"
                    style={{ minHeight: 120 }}
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
            </Pressable>
          </Animated.View>
        </View>
      </Pressable>
    </Modal>
  );
}


