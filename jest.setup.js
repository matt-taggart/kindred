jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(async () => ({ granted: true })),
  requestPermissionsAsync: jest.fn(async () => ({ granted: true })),
  setNotificationChannelAsync: jest.fn(async () => undefined),
  getAllScheduledNotificationsAsync: jest.fn(async () => []),
  cancelScheduledNotificationAsync: jest.fn(async () => undefined),
  scheduleNotificationAsync: jest.fn(async () => 'mock-notification-id'),
  AndroidImportance: { DEFAULT: 3 },
  SchedulableTriggerInputTypes: { DATE: 'date', DAILY: 'daily' },
}));

jest.mock('react-native-calendars', () => ({
  Calendar: jest.fn(() => null),
}));

jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      revenueCatApiKey: 'test-revenuecat-key',
    },
  },
}));

jest.mock('react-native-purchases-ui', () => ({
  Paywall: () => null,
  CustomerCenter: {
    present: jest.fn(),
  },
}));

jest.mock('react-native-purchases', () => {
  const mockPurchases = {
    PRODUCT_CATEGORY: { NON_SUBSCRIPTION: 'NON_SUBSCRIPTION' },
    PURCHASES_ERROR_CODE: { PURCHASE_CANCELLED_ERROR: 'PURCHASE_CANCELLED_ERROR' },
    LOG_LEVEL: { DEBUG: 'DEBUG' },
    setLogLevel: jest.fn(),
    configure: jest.fn(),
    getOfferings: jest.fn(async () => ({ all: {}, current: null })),
    getProducts: jest.fn(async () => []),
    purchaseStoreProduct: jest.fn(async () => ({ customerInfo: { entitlements: { active: {} } } })),
    purchasePackage: jest.fn(async () => ({ customerInfo: { entitlements: { active: {} } } })),
    restorePurchases: jest.fn(async () => ({ entitlements: { active: {} } })),
    getCustomerInfo: jest.fn(async () => ({ entitlements: { active: {} } })),
  };

  return {
    __esModule: true,
    default: mockPurchases,
    ...mockPurchases,
  };
});