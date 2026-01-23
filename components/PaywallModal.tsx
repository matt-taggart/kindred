import { useEffect } from 'react';
import { Modal, View } from 'react-native';
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
    const PurchasesUI = require('react-native-purchases-ui');
    RevenueCatUI = PurchasesUI.default || PurchasesUI;
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
        <View className="mt-auto h-[90%] rounded-t-3xl bg-surface overflow-hidden">
          {RevenueCatUI && (
            <RevenueCatUI.Paywall
              style={{ flex: 1 }}
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
              onDismiss={onClose}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};


