import Purchases, {
  LOG_LEVEL,
  PurchasesPackage,
  CustomerInfo,
} from 'react-native-purchases';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export const ENTITLEMENT_ID = 'Kindred Pro';

type ExpoExtra = {
  revenueCatApiKey?: string;
};

const getExpoExtra = (): ExpoExtra | undefined => {
  const fromExpoConfig = Constants.expoConfig?.extra as ExpoExtra | undefined;
  if (fromExpoConfig?.revenueCatApiKey) {
    return fromExpoConfig;
  }

  const fromEmbeddedManifest = (Constants.manifest as { extra?: ExpoExtra } | null)?.extra;
  if (fromEmbeddedManifest?.revenueCatApiKey) {
    return fromEmbeddedManifest;
  }

  const fromUpdatesManifest = (
    Constants.manifest2 as { extra?: { expoClient?: { extra?: ExpoExtra } } } | null
  )?.extra?.expoClient?.extra;

  return fromUpdatesManifest;
};

const getApiKey = (): string => {
  const apiKey = getExpoExtra()?.revenueCatApiKey;
  return typeof apiKey === 'string' ? apiKey.trim() : '';
};

const getBundleIdentifier = (): string => {
  return (
    Constants.expoConfig?.ios?.bundleIdentifier ??
    (Constants.manifest as { ios?: { bundleIdentifier?: string } } | null)?.ios?.bundleIdentifier ??
    'unknown'
  );
};

const getExpectedApiKeyPrefix = (): string | null => {
  if (Platform.OS === 'ios') return 'appl_';
  if (Platform.OS === 'android') return 'goog_';
  return null;
};

export type PurchaseResult = {
  success: boolean;
  error?: string;
};

export const hasProEntitlement = (customerInfo: CustomerInfo | null | undefined) => {
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

      const apiKey = getApiKey();
      if (!apiKey) {
        throw new Error(
          `[RevenueCat] Missing API key at runtime. Expected expo.extra.revenueCatApiKey for bundle ${getBundleIdentifier()}.`
        );
      }

      const expectedPrefix = getExpectedApiKeyPrefix();
      if (expectedPrefix && !apiKey.startsWith(expectedPrefix)) {
        throw new Error(
          `[RevenueCat] Invalid API key for ${Platform.OS}. Expected key starting with "${expectedPrefix}".`
        );
      }

      Purchases.configure({ apiKey });
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
      return hasProEntitlement(customerInfo);
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
      return { success: true, isPro: hasProEntitlement(customerInfo) };
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
