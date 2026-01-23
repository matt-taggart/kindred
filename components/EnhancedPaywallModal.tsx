import { useEffect } from 'react';
import { Modal, TouchableOpacity, View, Text } from 'react-native';
import type { CustomerInfo } from 'react-native-purchases';

import { useUserStore } from '@/lib/userStore';

type PaywallModalProps = {
  visible: boolean;
  onClose: () => void;
  importContext?: {
    selectedCount: number;
    availableSlots: number;
    onImportPartial: () => void;
  };
};

export const EnhancedPaywallModal = ({ visible, onClose, importContext }: PaywallModalProps) => {
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
          {importContext && importContext.availableSlots > 0 && (
            <TouchableOpacity
              className="absolute top-14 right-4 z-10 py-2 px-3 bg-black/70 rounded-full"
              onPress={importContext.onImportPartial}
            >
              <Text className="text-white font-semibold text-sm">Import {importContext.availableSlots} first</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};



type FeatureItemProps = {
  icon: string | React.ReactNode;
  iconColor?: string;
  iconBg: string;
  text: string;
  detail: string;
};

function FeatureItem({ icon, iconColor, iconBg, text, detail }: FeatureItemProps) {
  return (
    <View className="flex-row items-center gap-4 bg-surface p-3 rounded-xl border border-border">
      <View className={`w-10 h-10 ${iconBg} rounded-full items-center justify-center`}>
        {typeof icon === 'string' ? (
          <Text className={`text-lg font-bold ${iconColor}`}>{icon}</Text>
        ) : (
          icon
        )}
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-warmgray">{text}</Text>
        <Text className="text-xs text-warmgray-muted">{detail}</Text>
      </View>
    </View>
  );
}
