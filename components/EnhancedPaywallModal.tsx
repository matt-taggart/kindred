import { useEffect } from 'react';
import { Modal, SafeAreaView, TouchableOpacity, View, Text } from 'react-native';
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
            onPress={importContext ? importContext.onImportPartial : onClose}
          >
             <View className="flex-row items-center gap-1 px-2">
              <Text className="text-white font-bold">{importContext && importContext.availableSlots > 0 ? `Import ${importContext.availableSlots} first` : '✕'}</Text>
            </View>
          </TouchableOpacity>
        </SafeAreaView>
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
