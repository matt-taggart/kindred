import React, { useState } from 'react';
import { View, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Body } from './ui';
import Colors from '@/constants/Colors';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type ExpandableFABProps = {
  onAddManually: () => void;
  onImportContacts: () => void;
};

export function ExpandableFAB({ onAddManually, onImportContacts }: ExpandableFABProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const handleAddManually = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(false);
    onAddManually();
  };

  const handleImportContacts = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(false);
    onImportContacts();
  };

  return (
    <View className="absolute bottom-6 right-6 items-end">
      {/* Secondary actions - only visible when expanded */}
      {isExpanded && (
        <View className="mb-4 gap-3">
          {/* Add Manually Action */}
          <View className="flex-row items-center gap-3">
            <View className="bg-white dark:bg-slate-800 px-3 py-2 rounded-full shadow-sm">
              <Body className="text-slate-700 dark:text-slate-200">Add manually</Body>
            </View>
            <TouchableOpacity
              testID="add-manually-fab"
              onPress={handleAddManually}
              accessibilityLabel="Add contact manually"
              accessibilityRole="button"
              className="w-12 h-12 rounded-full bg-secondary items-center justify-center shadow-lg"
              activeOpacity={0.8}
            >
              <Ionicons name="create-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Import Contacts Action */}
          <View className="flex-row items-center gap-3">
            <View className="bg-white dark:bg-slate-800 px-3 py-2 rounded-full shadow-sm">
              <Body className="text-slate-700 dark:text-slate-200">Import contacts</Body>
            </View>
            <TouchableOpacity
              testID="import-contacts-fab"
              onPress={handleImportContacts}
              accessibilityLabel="Import contacts"
              accessibilityRole="button"
              className="w-12 h-12 rounded-full bg-secondary items-center justify-center shadow-lg"
              activeOpacity={0.8}
            >
              <Ionicons name="people-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Primary FAB */}
      <TouchableOpacity
        testID="primary-fab"
        onPress={toggleExpanded}
        accessibilityLabel={isExpanded ? 'Close menu' : 'Add connection'}
        accessibilityRole="button"
        className="w-14 h-14 rounded-full items-center justify-center shadow-lg"
        style={{ backgroundColor: Colors.primary }}
        activeOpacity={0.8}
      >
        <Ionicons
          name={isExpanded ? 'close' : 'add'}
          size={28}
          color="#fff"
        />
      </TouchableOpacity>
    </View>
  );
}
