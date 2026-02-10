import React from 'react';
import { Modal, Pressable, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Contact } from '@/db/schema';
import { Body, Caption, Heading } from '@/components/ui';
import Colors from '@/constants/Colors';

type SnoozeDays = 1 | 3 | 7;

type Props = {
  visible: boolean;
  contact: Contact | null;
  onClose: () => void;
  onLogCheckIn: () => void;
  onSnooze: (days: SnoozeDays) => void;
};

function ActionButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="w-full rounded-2xl bg-surface-card dark:bg-card-dark border border-stroke-soft dark:border-slate-800 px-4 py-4 flex-row items-center"
    >
      <View className="w-9 h-9 rounded-xl bg-sage-light dark:bg-accent-dark-sage items-center justify-center">
        <Ionicons name={icon} size={18} color={Colors.primary} />
      </View>
      <Body weight="medium" className="ml-3">
        {label}
      </Body>
    </TouchableOpacity>
  );
}

export function ConnectionQuickActionsSheet({
  visible,
  contact,
  onClose,
  onLogCheckIn,
  onSnooze,
}: Props) {
  if (!contact) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/30 justify-end" onPress={onClose}>
        <Pressable
          className="bg-surface-page dark:bg-background-dark rounded-t-[32px] px-6 pt-6 pb-10"
          onPress={(event) => event.stopPropagation?.()}
        >
          <View className="h-1.5 w-12 self-center rounded-full bg-slate-200 dark:bg-slate-800 mb-5" />
          <Caption uppercase className="text-center tracking-wider">
            Quick actions
          </Caption>
          <Heading size={3} className="text-center mt-1 mb-5">
            {contact.name}
          </Heading>

          <View className="gap-3">
            <ActionButton icon="checkmark-circle-outline" label="Mark as connected" onPress={onLogCheckIn} />
          </View>

          <View className="mt-6">
            <Caption uppercase className="mb-3 tracking-wider">
              Snooze reminder
            </Caption>
            <View className="flex-row gap-2">
        <TouchableOpacity
                onPress={() => onSnooze(1)}
                className="flex-1 rounded-full border border-stroke-soft dark:border-slate-700 px-3 py-2.5 items-center"
              >
                <Body size="sm" weight="medium">1 day</Body>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onSnooze(3)}
                className="flex-1 rounded-full border border-stroke-soft dark:border-slate-700 px-3 py-2.5 items-center"
              >
                <Body size="sm" weight="medium">3 days</Body>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onSnooze(7)}
                className="flex-1 rounded-full border border-stroke-soft dark:border-slate-700 px-3 py-2.5 items-center"
              >
                <Body size="sm" weight="medium">1 week</Body>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
