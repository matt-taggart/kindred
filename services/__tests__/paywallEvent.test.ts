import type { CustomerInfo } from 'react-native-purchases';

import { extractCustomerInfoFromPaywallEvent } from '@/services/paywallEvent';

const createCustomerInfo = (): CustomerInfo =>
  ({
    entitlements: {
      active: {
        'Kindred Pro': { identifier: 'Kindred Pro' },
      },
    },
  } as unknown as CustomerInfo);

describe('extractCustomerInfoFromPaywallEvent', () => {
  it('returns customerInfo from wrapped paywall events', () => {
    const customerInfo = createCustomerInfo();

    const result = extractCustomerInfoFromPaywallEvent({
      customerInfo,
    });

    expect(result).toBe(customerInfo);
  });

  it('returns customerInfo when payload is already a CustomerInfo object', () => {
    const customerInfo = createCustomerInfo();

    const result = extractCustomerInfoFromPaywallEvent(customerInfo);

    expect(result).toBe(customerInfo);
  });

  it('returns null for empty payloads', () => {
    expect(extractCustomerInfoFromPaywallEvent(undefined)).toBeNull();
    expect(extractCustomerInfoFromPaywallEvent(null)).toBeNull();
  });
});
