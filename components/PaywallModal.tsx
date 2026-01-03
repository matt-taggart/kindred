import { useMemo, useState } from 'react';
import { Modal, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

import { useUserStore } from '@/lib/userStore';

type PaywallModalProps = {
  visible: boolean;
  onClose: () => void;
};

export const PaywallModal = ({ visible, onClose }: PaywallModalProps) => {
  const { isPro, restorePurchase } = useUserStore();
  const [restoring, setRestoring] = useState(false);

  const headline = useMemo(() => (isPro ? 'Pro Unlocked' : 'Upgrade to Kindred Pro'), [isPro]);

  const handleRestore = async () => {
    if (restoring || isPro) return;

    setRestoring(true);

    try {
      await restorePurchase();
    } finally {
      setRestoring(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/50">
        <SafeAreaView className="mt-auto rounded-t-3xl bg-white px-6 py-6">
          <View className="mb-4 h-1 w-12 self-center rounded-full bg-gray-200" />

          <Text className="text-2xl font-bold text-gray-900">{headline}</Text>
          <Text className="mt-2 text-base text-gray-700">
            Free plan allows up to 5 contacts. Upgrade to keep everyone in your circle organized and
            never miss a check-in.
          </Text>

          <View className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <Text className="text-sm font-semibold text-gray-900">Pro unlocks:</Text>
            <View className="mt-2 gap-1">
              <Text className="text-sm text-gray-700">• Unlimited contacts</Text>
              <Text className="text-sm text-gray-700">• Ongoing reminders</Text>
              <Text className="text-sm text-gray-700">• All future updates</Text>
            </View>
          </View>

          <TouchableOpacity
            className={`mt-6 items-center rounded-xl py-3 ${isPro ? 'bg-emerald-600' : 'bg-indigo-600'}`}
            onPress={handleRestore}
            activeOpacity={0.9}
            disabled={restoring || isPro}
          >
            <Text className="text-base font-semibold text-white">
              {isPro ? 'Restored' : restoring ? 'Restoring...' : 'Restore Purchase'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="mt-3 items-center rounded-xl bg-gray-200 py-3"
            onPress={onClose}
            activeOpacity={0.9}
          >
            <Text className="text-base font-semibold text-gray-800">Close</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </Modal>
  );
};
