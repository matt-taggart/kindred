import { useEffect, useMemo, useRef } from 'react';
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Animated,
  PanResponder,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUserStore } from '@/lib/userStore';

const SCREEN_HEIGHT = Dimensions.get('window').height;

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
  const { isPro, purchasePro, restorePurchase, purchaseState, clearError } =
    useUserStore();
  
  const insets = useSafeAreaInsets();
  const panY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const animatedOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      panY.setValue(SCREEN_HEIGHT);
      animatedOpacity.setValue(0);
      
      Animated.parallel([
        Animated.spring(panY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 4,
          speed: 12,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, panY, animatedOpacity]);

  const animateOut = (callback: () => void) => {
    Animated.parallel([
      Animated.timing(panY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(animatedOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(callback);
  };

  const handleClose = () => {
    animateOut(onClose);
  };

  const handlePartialImport = () => {
    if (importContext) {
      animateOut(importContext.onImportPartial);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 0;
      },
      onPanResponderMove: Animated.event([null, { dy: panY }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          handleClose();
        } else {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 8,
          }).start();
        }
      },
    })
  ).current;

  const headline = useMemo(() => {
    if (isPro) return 'Welcome to Pro!';
    if (importContext) return 'Unlock Unlimited Contacts';
    return 'Never Lose Touch Again';
  }, [isPro, importContext]);

  const subheadline = useMemo(() => {
    if (isPro) return 'You now have everything you need to stay connected.';
    if (importContext) {
      const { availableSlots } = importContext;
      if (availableSlots === 0) {
        return 'Your free plan is full.';
      }
      return `You have ${availableSlots} contacts remaining in your free plan.`;
    }
    return 'Invest in your relationships forever.';
  }, [isPro, importContext]);
  
  const isLoading = purchaseState.isPurchasing || purchaseState.isRestoring;

  useEffect(() => {
    if (isPro && visible) {
      setTimeout(handleClose, 1500);
    }
  }, [isPro, visible]);

  const handlePurchase = async () => {
    clearError();
    await purchasePro();
  };

  const handleRestore = async () => {
    clearError();
    await restorePurchase();
  };

  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={handleClose}>
      <View className="flex-1">
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View 
            style={{ opacity: animatedOpacity }}
            className="absolute inset-0 bg-black/60"
          />
        </TouchableWithoutFeedback>

        {/* Content */}
        <Animated.View 
          style={{ 
            transform: [{ translateY: panY }],
          }}
          className="mt-auto h-[90%] rounded-t-3xl bg-cream overflow-hidden flex flex-col shadow-2xl"
        >
          {/* Drag Handle */}
          <View 
            {...panResponder.panHandlers} 
            className="w-full items-center pt-5 pb-6 bg-cream z-10"
          >
            <View className="h-1.5 w-12 rounded-full bg-gray-200" />
          </View>

          {/* Fixed Header */}
          <View className="px-6 pb-4 bg-cream border-b border-sage/10 z-10">
            <Text className="text-center text-2xl font-bold text-gray-900 leading-tight">
              {headline}
            </Text>
            <Text className="mt-2 text-center text-base text-gray-700 leading-snug">
              {subheadline}
            </Text>
          </View>

          {/* Scrollable Content */}
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
            className="flex-1"
            bounces={true}
          >
            <View className="px-6 py-6">
              {/* Price Tag */}
              {!isPro && (
                <View className="items-center mb-8">
                    <View className="bg-sage/10 px-4 py-1.5 rounded-full mb-3 border border-sage/20">
                    <Text className="text-sage text-xs font-bold uppercase tracking-wider">
                      ✨ One-time payment
                    </Text>
                  </View>
                  <View className="flex-row items-baseline">
                    <Text className="text-4xl font-extrabold text-gray-900">$14.99</Text>
                    <Text className="text-lg font-medium text-gray-500 ml-1">/ lifetime</Text>
                  </View>
                  <Text className="text-sm text-gray-500 mt-1">One payment. A lifetime of connection.</Text>
                </View>
              )}

              {!isPro && (
                <>
                  {/* Comparison Card */}
                  <View className="bg-white rounded-2xl shadow-sm border border-sage/10 overflow-hidden mb-8">
                    <View className="flex-row">
                      <View className="flex-1 p-5 items-center justify-center border-r border-sage/10">
                        <Text className="font-bold text-gray-400 uppercase tracking-widest text-[10px] mb-1">Free</Text>
                        <Text className="text-gray-400 text-sm font-medium">5 contacts</Text>
                      </View>
                      <View className="flex-1 p-5 bg-sage/5 items-center justify-center">
                        <Text className="font-bold text-sage uppercase tracking-widest text-[10px] mb-1">PRO</Text>
                        <Text className="font-bold text-sage text-sm">unlimited contacts</Text>
                      </View>
                    </View>
                  </View>

                  {/* Features List */}
                  <Text className="text-[11px] font-bold text-sage uppercase tracking-[2px] mb-4">
                    PRO Features
                  </Text>

                  <View className="space-y-4">
                    <FeatureItem
                      icon="∞"
                      iconColor="text-sage"
                      iconBg="bg-sage-100"
                      text="Unlimited Contacts"
                      detail="Add as many people as you want"
                    />
                    <FeatureItem
                      icon="🔔"
                      iconColor="text-terracotta"
                      iconBg="bg-terracotta-100"
                      text="Smart Reminders"
                      detail="Custom daily, weekly, or yearly nudges"
                    />
                    <FeatureItem
                      icon="📊"
                      iconColor="text-sage"
                      iconBg="bg-sage-100"
                      text="Interaction History"
                      detail="Track every call, text, and meetup"
                    />
                      <FeatureItem
                      icon={<Ionicons name="sparkles" size={18} color="#9CA986" />}
                      iconBg="bg-sage-100"
                      text="Future Updates"
                      detail="All new features included forever"
                    />
                  </View>
                </>
              )}

              {isPro && (
                <View className="items-center py-8">
                  <View className="w-20 h-20 bg-sage/10 rounded-full items-center justify-center mb-6">
                    <Ionicons name="sparkles" size={40} color="#9CA986" />
                  </View>
                  <Text className="text-2xl font-bold text-gray-900">Welcome to Kindred Pro</Text>
                  <Text className="text-center text-gray-600 mt-2 px-6">
                    You've unlocked the full potential of your circle.
                  </Text>
                </View>
              )}

                {purchaseState.error && (
                <View className="mt-6 rounded-xl bg-red-50 p-4 border border-red-100">
                  <Text className="text-sm text-red-600 font-medium text-center">
                    {purchaseState.error}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Sticky Footer */}
          {!isPro && (
            <View 
              className="bg-white px-6 pt-4 border-t border-sage/10 shadow-2xl"
              style={{ paddingBottom: Math.max(insets.bottom, 24) }}
            >
              <TouchableOpacity
                className={`w-full items-center justify-center rounded-2xl py-4 shadow-sm ${
                  purchaseState.isPurchasing ? 'bg-sage/60' : 'bg-sage'
                }`}
                onPress={handlePurchase}
                activeOpacity={0.9}
                disabled={isLoading}
              >
                <Text className="text-lg font-bold text-white">
                  {purchaseState.isPurchasing ? 'Processing...' : 'Unlock Kindred Pro'}
                </Text>
              </TouchableOpacity>

              <View className="flex-row justify-center items-center mt-6 mb-2 gap-8">
                <TouchableOpacity 
                  onPress={handleRestore}
                  disabled={isLoading}
                  hitSlop={15}
                >
                  <Text className={`text-[10px] font-bold uppercase tracking-widest ${purchaseState.isRestoring ? 'text-gray-300' : 'text-gray-400'}`}>
                    {purchaseState.isRestoring ? 'Restoring...' : 'Restore Purchase'}
                  </Text>
                </TouchableOpacity>

                <View className="w-[1px] h-3 bg-gray-200" />

                <TouchableOpacity 
                  onPress={importContext ? handlePartialImport : handleClose}
                  disabled={isLoading}
                  hitSlop={15}
                >
                  <Text className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      {importContext
                      ? importContext.availableSlots > 0
                        ? `Import First ${importContext.availableSlots}`
                        : 'Not Now'
                      : 'Not Now'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Animated.View>
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
    <View className="flex-row items-center gap-4 bg-white p-3 rounded-xl border border-gray-100">
      <View className={`w-10 h-10 ${iconBg} rounded-full items-center justify-center`}>
        {typeof icon === 'string' ? (
          <Text className={`text-lg font-bold ${iconColor}`}>{icon}</Text>
        ) : (
          icon
        )}
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-900">{text}</Text>
        <Text className="text-xs text-gray-500">{detail}</Text>
      </View>
    </View>
  );
}
