import type { CustomerInfo } from 'react-native-purchases';

export type PaywallCustomerInfoEvent = { customerInfo?: CustomerInfo } | CustomerInfo | null | undefined;

export const extractCustomerInfoFromPaywallEvent = (
  event: PaywallCustomerInfoEvent
): CustomerInfo | null => {
  if (!event) {
    return null;
  }

  return 'entitlements' in event ? event : event.customerInfo ?? null;
};
