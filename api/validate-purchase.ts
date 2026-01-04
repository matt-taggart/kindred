// Apple App Store Server API
import { 
  AppStoreServerAPIClient, 
  Environment,
  decodeTransaction,
} from 'app-store-server-api';

// Google Play
import { androidpublisher_v3 } from 'googleapis';

// Product ID constant for lifetime purchase
const LIFETIME_PRODUCT_ID = 'com.kindred.lifetime';

// Environment configuration
const isTestEnvironment = process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview';

/**
 * Validates an iOS receipt with Apple App Store Server API
 */
async function validateIOSReceipt(request: {
  productId: string;
  transactionId: string;
  receipt?: string;
}): Promise<{ valid: boolean; error?: string }> {
  try {
    const bundleId = process.env.APPLE_BUNDLE_ID;
    const issuerId = process.env.APPLE_ISSUER_ID;
    const privateKeyId = process.env.APPLE_PRIVATE_KEY_ID;
    const privateKey = process.env.APPLE_PRIVATE_KEY;

    if (!bundleId || !issuerId || !privateKeyId || !privateKey) {
      return { valid: false, error: 'iOS configuration missing' };
    }

    const environment = isTestEnvironment ? Environment.SANDBOX : Environment.PRODUCTION;

    const client = new AppStoreServerAPIClient(
      issuerId,
      privateKeyId,
      privateKey,
      bundleId,
      environment,
    );

    // Decode and verify transaction
    const signedTransaction = request.receipt;
    if (!signedTransaction) {
      return { valid: false, error: 'Receipt not provided' };
    }

    const transactionInfo = await decodeTransaction(signedTransaction);

    if (!transactionInfo) {
      return { valid: false, error: 'Failed to decode transaction' };
    }

    // Verify product ID matches
    if (transactionInfo.productId !== LIFETIME_PRODUCT_ID) {
      return { valid: false, error: 'Invalid product ID' };
    }

    // Verify transaction ID matches if provided
    if (request.transactionId && transactionInfo.transactionId !== request.transactionId) {
      return { valid: false, error: 'Transaction ID mismatch' };
    }

    // Check transaction type
    if (transactionInfo.type !== 'Auto-Renewable' && transactionInfo.type !== 'Non-Consumable') {
      return { valid: false, error: 'Invalid transaction type' };
    }

    // For non-consumable purchases, we just need to verify it exists
    return { valid: true };
  } catch (error: any) {
    console.error('[IAP] iOS validation error:', error);
    return { valid: false, error: error.message || 'iOS validation failed' };
  }
}

/**
 * Validates an Android purchase with Google Play Billing API
 */
async function validateAndroidPurchase(request: {
  productId: string;
  purchaseToken: string;
}): Promise<{ valid: boolean; error?: string }> {
  try {
    const packageName = process.env.GOOGLE_PLAY_PACKAGE_NAME;
    const privateKey = process.env.GOOGLE_PLAY_PRIVATE_KEY;
    const clientEmail = process.env.GOOGLE_PLAY_CLIENT_EMAIL;

    if (!packageName || !privateKey || !clientEmail) {
      return { valid: false, error: 'Android configuration missing' };
    }

    // Create authenticated client
    const auth = new googleapis.auth.GoogleAuth({
      credentials: {
        private_key: privateKey,
        client_email: clientEmail,
      },
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    });

    const androidpublisher = androidpublisher_v3.Androidpublisher({
      auth,
    });

    // Verify subscription/purchase
    const response = await androidpublisher.purchases.products.get({
      packageName,
      productId: request.productId,
      token: request.purchaseToken,
    });

    const purchase = response.data;

    if (!purchase) {
      return { valid: false, error: 'Purchase not found' };
    }

    // Verify product ID
    if (purchase.productId !== LIFETIME_PRODUCT_ID) {
      return { valid: false, error: 'Invalid product ID' };
    }

    // Check purchase state
    // purchaseState: 0 = Purchased, 1 = Canceled, 2 = Pending
    if (purchase.purchaseState !== 0) {
      return { valid: false, error: 'Purchase not valid or canceled' };
    }

    // Check if consumed (for non-consumable products, it should not be consumed)
    if (purchase.consumptionState === 1) {
      return { valid: false, error: 'Purchase already consumed' };
    }

    return { valid: true };
  } catch (error: any) {
    console.error('[IAP] Android validation error:', error);
    
    // Handle specific Google API errors
    if (error.response?.status === 404) {
      return { valid: false, error: 'Purchase not found' };
    }
    
    return { valid: false, error: error.message || 'Android validation failed' };
  }
}

/**
 * Vercel Serverless Function
 * POST /api/validate-purchase
 * Validates purchase receipts with Apple App Store or Google Play
 */
export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ valid: false, error: 'Method not allowed' });
  }

  try {
    const { platform, productId, receipt, transactionId, purchaseToken } = req.body;

    // Validate required fields
    if (!platform) {
      return res.status(400).json({ valid: false, error: 'Platform is required' });
    }

    if (!productId) {
      return res.status(400).json({ valid: false, error: 'Product ID is required' });
    }

    // Verify product ID matches expected value
    if (productId !== LIFETIME_PRODUCT_ID) {
      return res.status(400).json({ valid: false, error: 'Invalid product ID' });
    }

    let result: { valid: boolean; error?: string };

    if (platform === 'ios') {
      // iOS validation
      if (!transactionId && !receipt) {
        return res.status(400).json({ 
          valid: false, 
          error: 'Transaction ID or receipt is required for iOS' 
        });
      }

      result = await validateIOSReceipt({ productId, transactionId, receipt });
    } else if (platform === 'android') {
      // Android validation
      if (!purchaseToken) {
        return res.status(400).json({ 
          valid: false, 
          error: 'Purchase token is required for Android' 
        });
      }

      result = await validateAndroidPurchase({ productId, purchaseToken });
    } else {
      return res.status(400).json({ valid: false, error: 'Invalid platform' });
    }

    if (result.valid) {
      return res.status(200).json({
        valid: true,
        productId,
        platform,
        isTestEnvironment,
      });
    } else {
      return res.status(400).json({
        valid: false,
        productId,
        platform,
        isTestEnvironment,
        error: result.error,
      });
    }
  } catch (error: any) {
    console.error('[IAP] API endpoint error:', error);
    return res.status(500).json({ valid: false, error: 'Internal server error' });
  }
}
