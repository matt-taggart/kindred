Implement the Paywall logic.
1. In `contactService.ts`, check the count of existing contacts before adding a new one.
2. If count >= 5 AND `user.isPro` is false, throw a "LimitReached" error.
3. Create a `components/PaywallModal.tsx` that explains the limit.
4. (Mock IAP for now): Add a "Restore Purchase" button that simply sets a boolean `isPro` in Zustand/AsyncStorage to true for testing purposes.
