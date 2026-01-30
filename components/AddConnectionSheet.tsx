import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Animated,
  Dimensions,
  StyleSheet,
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
            style={[
              styles.sheetContainer,
              { transform: [{ translateY: slideAnim }] }
            ]}
          >
            <Pressable
              className="bg-[#F9F8F6] dark:bg-slate-900 rounded-t-[40px] px-6 pb-10 pt-3 shadow-2xl"
              onPress={(e) => e.stopPropagation?.()}
            >
              {/* Handle bar */}
              <View className="mb-6 h-1.5 w-10 self-center rounded-full bg-slate-300 dark:bg-slate-700 opacity-50" />

              {/* Header */}
              <View className="text-center mb-8 items-center">
                <Text className="text-2xl font-serif text-brand-navy dark:text-slate-100 italic" style={styles.serifFont}>
                  Add a connection
                </Text>
                <Text className="text-sm text-slate-500 mt-2 font-body text-center">
                  Who would you like to nurture today?
                </Text>
              </View>

              {/* Buttons */}
              <View className="gap-y-4">
                <TouchableOpacity 
                  onPress={onAddManually}
                  activeOpacity={0.9}
                  className="w-full bg-white dark:bg-slate-800 p-5 rounded-[28px] flex-row items-center gap-4 soft-shadow border border-white dark:border-slate-700"
                  style={styles.softShadow}
                >
                  <View className="w-12 h-12 rounded-2xl bg-[#8E9B97]/10 flex items-center justify-center">
                    <Ionicons name="person-add-outline" size={24} color="#8E9B97" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-brand-navy dark:text-slate-200">Add manually</Text>
                    <Text className="text-xs text-slate-400">Enter details from scratch</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#cbd5e1" />
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={onImportContacts}
                  activeOpacity={0.9}
                  className="w-full bg-white dark:bg-slate-800 p-5 rounded-[28px] flex-row items-center gap-4 soft-shadow border border-white dark:border-slate-700"
                  style={styles.softShadow}
                >
                  <View className="w-12 h-12 rounded-2xl bg-[#D4A3A1]/10 flex items-center justify-center">
                    <Ionicons name="people-outline" size={24} color="#D4A3A1" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-brand-navy dark:text-slate-200">Import from contacts</Text>
                    <Text className="text-xs text-slate-400">Sync with your address book</Text>
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

const styles = StyleSheet.create({
  sheetContainer: {
    width: '100%',
  },
  serifFont: {
    fontFamily: 'PlayfairDisplay_500Medium_Italic', // Best fit for the requested italic serif
  },
  softShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 30,
    elevation: 2,
  }
});
