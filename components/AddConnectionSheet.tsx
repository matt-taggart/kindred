import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const SCREEN_HEIGHT = Dimensions.get('window').height;

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function AddConnectionSheet({ visible, onClose }: Props) {
  const router = useRouter();
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

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const onAddManually = () => {
    handleClose();
    router.push('/contacts/add');
  };

  const onImportContacts = () => {
    handleClose();
    router.push('/contacts/import');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable className="flex-1 bg-brand-navy/30" onPress={handleClose}>
        <View className="flex-1 justify-end">
          <Animated.View 
            className="w-full"
            style={[
              { transform: [{ translateY: slideAnim }] }
            ]}
          >
            <Pressable
              className="bg-background-light dark:bg-slate-900 rounded-t-2xl px-6 pb-10 pt-3 shadow-2xl"
              onPress={(e) => e.stopPropagation?.()}
            >
              {/* Handle bar */}
              <View className="mb-6 h-1.5 w-10 self-center rounded-full bg-slate-300 dark:bg-slate-700 opacity-50" />

              {/* Header */}
              <View className="text-center mb-8 items-center">
                <Text className="text-3xl font-display text-brand-navy dark:text-slate-100">
                  Add a connection
                </Text>
                <Text className="text-sm text-text-soft mt-2 font-body text-center">
                  Who would you like to nurture today?
                </Text>
              </View>

              {/* Buttons */}
              <View className="gap-y-4">
                <TouchableOpacity 
                  onPress={onImportContacts}
                  activeOpacity={0.9}
                  className="w-full bg-white dark:bg-slate-800 p-5 rounded-xl flex-row items-center gap-4 shadow-soft border border-white dark:border-slate-700"
                >
                  <View className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Ionicons name="people-outline" size={24} color="#9DBEBB" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-brand-navy dark:text-slate-200">Import from contacts</Text>
                    <Text className="text-xs text-text-soft">Sync with your address book</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#cbd5e1" />
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={onAddManually}
                  activeOpacity={0.9}
                  className="w-full bg-white dark:bg-slate-800 p-5 rounded-xl flex-row items-center gap-4 shadow-soft border border-white dark:border-slate-700"
                >
                  <View className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Ionicons name="person-add-outline" size={24} color="#9DBEBB" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-brand-navy dark:text-slate-200">Add manually</Text>
                    <Text className="text-xs text-text-soft">Enter details from scratch</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#cbd5e1" />
                </TouchableOpacity>
              </View>

              {/* Cancel */}
              <TouchableOpacity 
                onPress={handleClose}
                className="w-full mt-6 py-4 items-center"
              >
                <Text className="text-slate-400 font-medium text-sm">Cancel</Text>
              </TouchableOpacity>
              
              <View className="h-6" />
            </Pressable>
          </Animated.View>
        </View>
      </Pressable>
    </Modal>
  );
}

