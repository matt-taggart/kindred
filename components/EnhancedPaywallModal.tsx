import { useEffect, useMemo } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useUserStore } from '@/lib/userStore';

type PaywallModalProps = {
  visible: boolean;
  onClose: () => void;
};

export const EnhancedPaywallModal = ({ visible, onClose }: PaywallModalProps) => {
  const { isPro, purchasePro, restorePurchase, purchaseState, clearError } =
    useUserStore();

  const headline = useMemo(
    () => (isPro ? 'Welcome to Pro!' : 'Never Lose Touch Again'),
    [isPro],
  );
  const subheadline = useMemo(
    () =>
      isPro
        ? 'You now have everything you need to stay connected.'
        : 'Invest in your relationships forever.',
    [isPro],
  );
  const isLoading = purchaseState.isPurchasing || purchaseState.isRestoring;

  useEffect(() => {
    if (isPro && visible) {
      setTimeout(onClose, 800);
    }
  }, [isPro, visible, onClose]);

  const handlePurchase = async () => {
    clearError();
    await purchasePro();
  };

  const handleRestore = async () => {
    clearError();
    await restorePurchase();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/60">
        <SafeAreaView className="mt-auto max-h-[85%] rounded-t-3xl bg-white px-6 py-6">
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="mb-4 h-1 w-12 self-center rounded-full bg-gray-200" />

            <Text className="text-center text-2xl font-bold text-gray-900">
              {headline}
            </Text>
            <Text className="mt-2 text-center text-base text-gray-600">
              {subheadline}
            </Text>

            {!isPro && (
              <View className="mt-4 items-center rounded-xl bg-orange-50 px-4 py-3">
                <Text className="text-3xl font-bold text-gray-900">$14.99</Text>
                <Text className="mt-1 text-sm text-gray-600">
                  Lifetime access • No subscriptions
                </Text>
              </View>
            )}

            {!isPro && (
              <>
                <View className="mt-6 space-y-4">
                  <View className="flex-row justify-between rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <View className="flex-1 pr-4">
                      <Text className="font-semibold text-gray-700">Free</Text>
                      <Text className="mt-1 text-sm text-gray-500">
                        Up to 5 contacts
                      </Text>
                    </View>
                    <View className="w-[1px] bg-gray-200" />
                    <View className="flex-1 pl-4">
                      <Text className="font-semibold text-terracotta">Pro</Text>
                      <Text className="mt-1 text-sm font-medium text-gray-600">
                        Unlimited contacts
                      </Text>
                    </View>
                  </View>

                  <Text className="mt-4 text-lg font-semibold text-gray-900">
                    What you get:
                  </Text>

                  <View className="space-y-3">
                    <FeatureItem
                      icon="🚀"
                      text="Smart contact bucketing"
                      detail="Daily, weekly, monthly, yearly"
                    />
                    <FeatureItem
                      icon="⚡"
                      text="One-tap interaction logging"
                      detail="Call, text, or meet with notes"
                    />
                    <FeatureItem icon="📅" text="Calendar integration" detail="Visualize upcoming contacts" />
                    <FeatureItem
                      icon="🔔"
                      text="Automatic reminders"
                      detail="Never miss a check-in"
                    />
                    <FeatureItem
                      icon="🔒"
                      text="Privacy-first"
                      detail="Data never leaves your device"
                    />
                    <FeatureItem
                      icon="✨"
                      text="All future features"
                      detail="Lifetime updates included"
                    />
                  </View>
                </View>

                <View className="mt-6 rounded-xl border border-green-100 bg-green-50 px-4 py-3">
                  <Text className="text-center text-sm font-medium text-gray-700">
                    ✅ One-time payment • No hidden fees
                  </Text>
                </View>
              </>
            )}

            {!isPro && (
              <>
                <TouchableOpacity
                  className={`mt-6 items-center rounded-xl py-4 ${purchaseState.isPurchasing ? 'bg-gray-400' : 'bg-terracotta'}`}
                  onPress={handlePurchase}
                  activeOpacity={0.9}
                  disabled={isLoading}
                >
                  <Text className="text-lg font-semibold text-white">
                    {purchaseState.isPurchasing
                      ? 'Processing...'
                      : 'Unlock Pro - $14.99'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`mt-3 items-center rounded-xl bg-gray-100 py-3 ${purchaseState.isRestoring ? 'opacity-50' : ''}`}
                  onPress={handleRestore}
                  activeOpacity={0.9}
                  disabled={isLoading}
                >
                  <Text className="text-base font-semibold text-gray-700">
                    {purchaseState.isRestoring
                      ? 'Restoring...'
                      : 'Restore Purchase'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="mt-3 items-center rounded-xl border border-gray-300 py-3"
                  onPress={onClose}
                  activeOpacity={0.9}
                >
                  <Text className="text-base font-semibold text-gray-600">
                    Not Now
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {isPro && (
              <TouchableOpacity
                className="mt-6 items-center rounded-xl bg-terracotta py-4"
                onPress={onClose}
                activeOpacity={0.9}
              >
                <Text className="text-lg font-semibold text-white">
                  Continue to App
                </Text>
              </TouchableOpacity>
            )}

            {purchaseState.error && (
              <View className="mt-4 rounded-lg bg-red-50 p-3">
                <Text className="text-sm text-red-600">{purchaseState.error}</Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

type FeatureItemProps = {
  icon: string;
  text: string;
  detail: string;
};

function FeatureItem({ icon, text, detail }: FeatureItemProps) {
  return (
    <View className="flex-row items-start gap-3">
      <Text className="text-xl">{icon}</Text>
      <View className="flex-1">
        <Text className="text-base font-medium text-gray-900">{text}</Text>
        <Text className="text-sm text-gray-500">{detail}</Text>
      </View>
      <Text className="text-lg">✓</Text>
    </View>
  );
}
