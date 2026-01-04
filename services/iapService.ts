import { Platform } from 'react-native';

let InAppPurchases: typeof import('expo-in-app-purchases') | null = null;

async function getIAPModule() {
  if (__DEV__) {
    return null;
  }
  if (!InAppPurchases) {
    InAppPurchases = await import('expo-in-app-purchases');
  }
  return InAppPurchases || null;
}

const PRODUCT_IDS = {
  LIFETIME: 'com.kindred.lifetime',
};

type PurchaseResult = {
  success: boolean;
  error?: string;
};

type ValidationResult = {
  valid: boolean;
  error?: string;
};

const VALIDATION_API_URL = __DEV__
  ? 'http://localhost:8081/api/validate-purchase'
  : 'https://api.kindred.app/api/validate-purchase';

async function validateReceipt(
  purchase: any,
): Promise<ValidationResult> {
  if (__DEV__) {
    console.log('[IAP] Development mode - skipping receipt validation');
    return { valid: true };
  }

  try {
    const platform = Platform.OS;
    const payload: any = {
      platform,
      productId: purchase.productId,
    };

    if (platform === 'ios') {
      payload.receipt = purchase.transactionReceipt;
      payload.transactionId = purchase.orderId;
    } else if (platform === 'android') {
      payload.purchaseToken = purchase.purchaseToken;
    }

    const response = await fetch(VALIDATION_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[IAP] Validation API error:', data);
      return { valid: false, error: data.error || 'Validation failed' };
    }

    return {
      valid: data.valid,
      error: !data.valid ? data.error : undefined,
    };
  } catch (error) {
    console.error('[IAP] Receipt validation failed:', error);
    return { valid: false, error: 'Validation error' };
  }
}

export const IAPService = {
  isInitialized: false,
  purchaseResolver: null as ((value: PurchaseResult) => void) | null,
  currentPurchase: null as any,

  async initialize(): Promise<void> {
    const IAP = await getIAPModule();
    if (!IAP) {
      console.log('[IAP] Development mode detected - using mock IAP');
      return;
    }

    try {
      IAP.setPurchaseListener(({ responseCode, results, errorCode }: any) => {
        if (responseCode === IAP.IAPResponseCode.OK && results) {
          for (const purchase of results) {
            if (purchase.acknowledged) {
              continue;
            }

            if (
              purchase.productId === PRODUCT_IDS.LIFETIME &&
              purchase.purchaseState === IAP.InAppPurchaseState.PURCHASED
            ) {
              this.currentPurchase = purchase;

              const handlePurchase = async () => {
                try {
                  const validation = await validateReceipt(purchase);

                  if (!validation.valid) {
                    if (this.purchaseResolver) {
                      this.purchaseResolver({
                        success: false,
                        error: validation.error || 'Invalid purchase receipt',
                      });
                      this.purchaseResolver = null;
                    }
                    return;
                  }

                  IAP.finishTransactionAsync(purchase, false).catch((err: any) => {
                    console.error('[IAP] Failed to finish transaction:', err);
                  });

                  if (this.purchaseResolver) {
                    this.purchaseResolver({ success: true });
                    this.purchaseResolver = null;
                  }
                } catch (error) {
                  console.error('[IAP] Purchase handling error:', error);
                  if (this.purchaseResolver) {
                    this.purchaseResolver({
                      success: false,
                      error: 'Purchase validation failed',
                    });
                    this.purchaseResolver = null;
                  }
                } finally {
                  this.currentPurchase = null;
                }
              };

              handlePurchase();
            }
          }
        } else if (responseCode === IAP.IAPResponseCode.USER_CANCELED) {
          if (this.purchaseResolver) {
            this.purchaseResolver({ success: false, error: 'Purchase cancelled' });
            this.purchaseResolver = null;
          }
        } else {
          console.error('[IAP] Purchase error:', errorCode);
          if (this.purchaseResolver) {
            this.purchaseResolver({
              success: false,
              error: `Purchase failed: ${errorCode}`,
            });
            this.purchaseResolver = null;
          }
        }
      });

      await IAP.connectAsync();
      this.isInitialized = true;
      console.log('[IAP] Service initialized successfully');
    } catch (error) {
      console.error('[IAP] Failed to initialize:', error);
      throw error;
    }
  },

  async getProducts() {
    const IAP = await getIAPModule();
    if (!IAP) {
      console.log('[IAP] Development mode - returning mock product');
      return [
        {
          productId: PRODUCT_IDS.LIFETIME,
          price: '$14.99',
          title: 'Kindred Pro - Lifetime',
          description: 'Unlock unlimited contacts and all features',
        },
      ];
    }

    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const { results } = await IAP.getProductsAsync(Object.values(PRODUCT_IDS));
      return results ?? [];
    } catch (error) {
      console.error('[IAP] Failed to fetch products:', error);
      return [];
    }
  },

  async purchaseLifetime(): Promise<PurchaseResult> {
    const IAP = await getIAPModule();
    if (!IAP) {
      console.log('[IAP] Development mode - mocking purchase');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { success: true };
    }

    if (!this.isInitialized) {
      await this.initialize();
    }

    return new Promise((resolve) => {
      this.purchaseResolver = resolve;
      IAP.purchaseItemAsync(PRODUCT_IDS.LIFETIME).catch((error: any) => {
        if (this.purchaseResolver) {
          this.purchaseResolver({
            success: false,
            error: error.message || 'Purchase failed',
          });
          this.purchaseResolver = null;
        }
      });
    });
  },

  async restorePurchases(): Promise<{ success: boolean; isPro?: boolean; error?: string }> {
    const IAP = await getIAPModule();
    if (!IAP) {
      console.log('[IAP] Development mode - mocking restore');
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { success: true, isPro: true };
    }

    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const { results } = await IAP.getPurchaseHistoryAsync();
      const hasLifetimePurchase = results?.some(
        (purchase: any) =>
          purchase.productId === PRODUCT_IDS.LIFETIME &&
          (purchase.purchaseState === IAP.InAppPurchaseState.PURCHASED ||
            purchase.purchaseState === IAP.InAppPurchaseState.RESTORED),
      );

      return { success: true, isPro: hasLifetimePurchase ?? false };
    } catch (error: any) {
      console.error('[IAP] Restore failed:', error);
      return { success: false, error: error.message };
    }
  },

  async checkCurrentPurchase(): Promise<boolean> {
    const IAP = await getIAPModule();
    if (!IAP) {
      return false;
    }

    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const { results } = await IAP.getPurchaseHistoryAsync();
      return results?.some(
        (purchase: any) =>
          purchase.productId === PRODUCT_IDS.LIFETIME &&
          (purchase.purchaseState === IAP.InAppPurchaseState.PURCHASED ||
            purchase.purchaseState === IAP.InAppPurchaseState.RESTORED),
      ) ?? false;
    } catch (error) {
      console.error('[IAP] Failed to check current purchase:', error);
      return false;
    }
  },
};
