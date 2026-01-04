import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { IAPService } from '@/services/iapService';

type PurchaseState = {
  isPurchasing: boolean;
  isRestoring: boolean;
  error: string | null;
};

type UserState = {
  isPro: boolean;
  purchaseState: PurchaseState;
  setIsPro: (value: boolean) => void;
  purchasePro: () => Promise<void>;
  restorePurchase: () => Promise<void>;
  clearError: () => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      isPro: false,
      purchaseState: {
        isPurchasing: false,
        isRestoring: false,
        error: null,
      },
      setIsPro: (value) => set({ isPro: value }),
      clearError: () => set({ purchaseState: { ...get().purchaseState, error: null } }),
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
