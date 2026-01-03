import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type UserState = {
  isPro: boolean;
  setIsPro: (value: boolean) => void;
  restorePurchase: () => Promise<void>;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      isPro: false,
      setIsPro: (value) => set({ isPro: value }),
      restorePurchase: async () => {
        set({ isPro: true });
      },
    }),
    {
      name: 'kindred-user',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
);
