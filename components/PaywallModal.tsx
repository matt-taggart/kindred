import { useEffect } from 'react';
import { Modal, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import type { CustomerInfo } from 'react-native-purchases';

import { useUserStore } from '@/lib/userStore';

type PaywallModalProps = {
  visible: boolean;
  onClose: () => void;
};

export const PaywallModal = ({ visible, onClose }: PaywallModalProps) => {
  const { isPro, setIsPro } = useUserStore();
  let RevenueCatUI;
  try {
     RevenueCatUI = require('react-native-purchases-ui');
  } catch (e) {
    console.error('Failed to load react-native-purchases-ui', e);
  }

  useEffect(() => {
    if (isPro) {
      setTimeout(onClose, 500);
    }
  }, [isPro, onClose]);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/50">
        <SafeAreaView className="mt-auto h-[90%] rounded-t-3xl bg-white overflow-hidden">
          {RevenueCatUI && (
            <RevenueCatUI.Paywall
              onPurchaseCompleted={(customerInfo: CustomerInfo) => {
                const isPro = Boolean(customerInfo.entitlements.active['Kindred Pro']);
                setIsPro(isPro);
                if (isPro) onClose();
              }}
              onRestoreCompleted={(customerInfo: CustomerInfo) => {
                const isPro = Boolean(customerInfo.entitlements.active['Kindred Pro']);
                setIsPro(isPro);
                if (isPro) onClose();
              }}
            />
          )}
          <TouchableOpacity
            className="absolute top-4 right-4 z-10 p-2 bg-black/20 rounded-full"
            onPress={onClose}
          >
            <Text className="text-white font-bold">✕</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </Modal>
  );
};


