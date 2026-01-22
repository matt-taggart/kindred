import Purchases, {
  LOG_LEVEL,
  PURCHASES_ERROR_CODE,
  PurchasesOfferings,
  PurchasesPackage,
  PurchasesStoreProduct,
  CustomerInfo,
} from 'react-native-purchases';
import Constants from 'expo-constants';

const ENTITLEMENT_ID = 'Kindred Pro';
const API_KEY = Constants.expoConfig?.extra?.revenueCatApiKey;

export type PurchaseResult = {
  success: boolean;
  error?: string;
};

const isUserPro = (customerInfo: CustomerInfo) => {
  return Boolean(customerInfo?.entitlements?.active?.[ENTITLEMENT_ID]);
};

export const IAPService = {
  isInitialized: false,

  async initialize(): Promise<void> {
    try {
      if (this.isInitialized) return;

      if (__DEV__) {
        await Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }

      Purchases.configure({ apiKey: API_KEY });
      this.isInitialized = true;
      console.log('[RevenueCat] Service initialized successfully');
    } catch (error) {
      console.error('[RevenueCat] Failed to initialize:', error);
      throw error;
    }
  },

  async checkCurrentPurchase(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return isUserPro(customerInfo);
    } catch (error) {
      console.error('[RevenueCat] Failed to check current purchase:', error);
      return false;
    }
  },

  async restorePurchases(): Promise<{ success: boolean; isPro?: boolean; error?: string }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const customerInfo = await Purchases.restorePurchases();
      return { success: true, isPro: isUserPro(customerInfo) };
    } catch (error: any) {
      console.error('[RevenueCat] Restore failed:', error);
      return { success: false, error: error.message };
    }
  },

  async showCustomerCenter(): Promise<void> {
    try {
      const { CustomerCenter } = require('react-native-purchases-ui');
      await CustomerCenter.present();
    } catch (error) {
      console.error('[RevenueCat] Failed to show Customer Center:', error);
    }
  },
  async getProducts(): Promise<PurchasesPackage[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
        return offerings.current.availablePackages;
      }
      return [];
    } catch (error) {
      console.error('[RevenueCat] Failed to fetch products:', error);
      return [];
    }
  }
};

