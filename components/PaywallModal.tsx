import { useEffect } from 'react';
import { Modal, View } from 'react-native';

import { useUserStore } from '@/lib/userStore';
import { hasProEntitlement } from '@/services/iapService';
import { extractCustomerInfoFromPaywallEvent, PaywallCustomerInfoEvent } from '@/services/paywallEvent';

type PaywallModalProps = {
  visible: boolean;
  onClose: () => void;
};

export const PaywallModal = ({ visible, onClose }: PaywallModalProps) => {
  const { isPro, setIsPro } = useUserStore();
  const handlePurchaseEvent = (event: PaywallCustomerInfoEvent) => {
    const customerInfo = extractCustomerInfoFromPaywallEvent(event);
    const nextIsPro = hasProEntitlement(customerInfo);
    setIsPro(nextIsPro);
    if (nextIsPro) {
      onClose();
    }
  };

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
              onPurchaseCompleted={handlePurchaseEvent}
              onRestoreCompleted={handlePurchaseEvent}
              onDismiss={onClose}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};
