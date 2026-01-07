import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { IAPService } from '@/services/iapService';

type PurchaseState = {
  isPurchasing: boolean;
  isRestoring: boolean;
  error: string | null;
};

export type NotificationFrequency = 1 | 2 | 3;

export type NotificationSettings = {
  frequency: NotificationFrequency;
  reminderTimes: string[]; // HH:mm format, e.g., ["09:00", "14:00", "19:00"]
};

type UserState = {
  isPro: boolean;
  purchaseState: PurchaseState;
  notificationSettings: NotificationSettings;
  setIsPro: (value: boolean) => void;
  purchasePro: () => Promise<void>;
  restorePurchase: () => Promise<void>;
  clearError: () => void;
  setNotificationFrequency: (frequency: NotificationFrequency) => void;
  setReminderTime: (index: number, time: string) => void;
};

const DEFAULT_REMINDER_TIMES = ['09:00', '14:00', '19:00'];

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      isPro: false,
      purchaseState: {
        isPurchasing: false,
        isRestoring: false,
        error: null,
      },
      notificationSettings: {
        frequency: 1,
        reminderTimes: DEFAULT_REMINDER_TIMES,
      },
      setIsPro: (value) => set({ isPro: value }),
      clearError: () => set({ purchaseState: { ...get().purchaseState, error: null } }),
      setNotificationFrequency: (frequency) => set({
        notificationSettings: { ...get().notificationSettings, frequency },
      }),
      setReminderTime: (index, time) => {
        const { notificationSettings } = get();
        const newTimes = [...notificationSettings.reminderTimes];
        newTimes[index] = time;
        set({ notificationSettings: { ...notificationSettings, reminderTimes: newTimes } });
      },
      purchasePro: async () => {
        const { purchaseState } = get();

        if (purchaseState.isPurchasing) {
          return;
        }

        set({ purchaseState: { ...purchaseState, isPurchasing: true, error: null } });

        try {
          const result = await IAPService.purchaseLifetime();

          if (result.success) {
            set({ isPro: true, purchaseState: { ...get().purchaseState, isPurchasing: false, error: null } });
          } else {
            set({
              purchaseState: {
                ...get().purchaseState,
                isPurchasing: false,
                error: result.error || 'Purchase failed',
              },
            });
          }
        } catch (error: any) {
          set({
            purchaseState: {
              ...get().purchaseState,
              isPurchasing: false,
              error: error.message || 'Purchase failed',
            },
          });
        }
      },
      restorePurchase: async () => {
        const { purchaseState } = get();

        if (purchaseState.isRestoring) {
          return;
        }

        set({ purchaseState: { ...purchaseState, isRestoring: true, error: null } });

        try {
          const result = await IAPService.restorePurchases();

          if (result.success && result.isPro) {
            set({ isPro: true, purchaseState: { ...get().purchaseState, isRestoring: false, error: null } });
          } else {
            set({
              purchaseState: {
                ...get().purchaseState,
                isRestoring: false,
                error: result.error || 'No purchases found',
              },
            });
          }
        } catch (error: any) {
          set({
            purchaseState: {
              ...get().purchaseState,
              isRestoring: false,
              error: error.message || 'Restore failed',
            },
          });
        }
      },
    }),
    {
      name: 'kindred-user',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      onRehydrateStorage: () => async (state) => {
        if (!state) return;

        if (__DEV__) {
          return;
        }

        try {
          const isPro = await IAPService.checkCurrentPurchase();
          if (isPro && !state.isPro) {
            state.isPro = isPro;
          }
        } catch (error) {
          console.error('Failed to check purchase status on rehydration:', error);
        }
      },
    },
  ),
);
