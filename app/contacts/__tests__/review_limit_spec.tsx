import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import ReviewScheduleScreen from '../review-schedule';
import { useUserStore } from '@/lib/userStore';
import { getAvailableSlots } from '@/services/contactService';
import { useLocalSearchParams } from 'expo-router';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const mockRouter = { replace: jest.fn(), back: jest.fn() };

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => mockRouter),
  useLocalSearchParams: jest.fn(),
  Stack: { Screen: jest.fn(() => null) },
}));

jest.mock('@/services/contactService', () => ({
  addContact: jest.fn(),
  getContacts: jest.fn(),
  getAvailableSlots: jest.fn(),
  CONTACT_LIMIT: 5,
}));

jest.mock('@/lib/userStore', () => ({
  useUserStore: jest.fn(),
}));

jest.mock('@/components/EnhancedPaywallModal', () => ({
  EnhancedPaywallModal: () => null,
}));

jest.mock('@/components/FrequencyBadge', () => 'FrequencyBadge');

// Helper to mock store state
const mockStore = (state: any) => {
  (useUserStore as unknown as jest.Mock).mockImplementation((selector) => selector(state));
};

describe('ReviewScheduleScreen - Import Limits', () => {
  const mockContacts = Array(6).fill(null).map((_, i) => ({
    id: String(i),
    name: `Contact ${i}`,
    phone: `123456789${i}`,
    bucket: 'weekly',
  }));

  beforeEach(() => {
    jest.clearAllMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      contacts: JSON.stringify(mockContacts),
    });
    (getAvailableSlots as jest.Mock).mockReturnValue(5);
    // Reset user store to default (Free user)
    (useUserStore as unknown as jest.Mock).mockImplementation((cb) =>
      cb({ isPro: false }),
    );
  });

  it('shows a warning message when user is Free and exceeds the contact limit', async () => {
    // Arrange: User is Free, Limit is 5, Selected is 6
    mockStore({ isPro: false });
    (getAvailableSlots as jest.Mock).mockReturnValue(5);

    // Act
    const { getByText } = render(<ReviewScheduleScreen />);

    // Assert
    // Expect a warning message to be present
    await waitFor(() => {
      expect(getByText(/Free plan limit reached/i)).toBeTruthy();
      expect(getByText(/Only the first 5 connections? will be imported/i)).toBeTruthy();
    });
  });

  it("does NOT show a warning when user is Pro, even if exceeding limit", async () => {
    (useUserStore as unknown as jest.Mock).mockImplementation((cb) =>
      cb({ isPro: true }),
    );

    const { queryByText } = render(<ReviewScheduleScreen />);

    await waitFor(() => {
      expect(queryByText(/Free plan limit reached/i)).toBeNull();
    });
  });

  it("does NOT show a warning when user is Free but within limit", async () => {
    // Only 3 contacts
    const fewContacts = mockContacts.slice(0, 3);
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      contacts: JSON.stringify(fewContacts),
    });

    const { queryByText } = render(<ReviewScheduleScreen />);

    await waitFor(() => {
      expect(queryByText(/Free plan limit reached/i)).toBeNull();
    });
  });

  it("indicates that only the available number of contacts will be imported", async () => {
     const { getByText } = render(<ReviewScheduleScreen />);

     // Assert
     // Check for specific copy or indication that truncation will occur
     await waitFor(() => {
         expect(getByText(/Only the first 5 connections? will be imported/i)).toBeTruthy();
     });
  });

  it("shows zero-slots warning copy and an upgrade CTA when no free slots remain", async () => {
    (getAvailableSlots as jest.Mock).mockReturnValue(0);

    const { getByText, queryByText } = render(<ReviewScheduleScreen />);

    await waitFor(() => {
      expect(getByText(/Free plan limit reached/i)).toBeTruthy();
      expect(getByText(/No contacts will be imported unless you upgrade/i)).toBeTruthy();
      expect(getByText(/Upgrade to Pro/i)).toBeTruthy();
      expect(queryByText(/Looks good — import all/i)).toBeNull();
    });
  });
});
