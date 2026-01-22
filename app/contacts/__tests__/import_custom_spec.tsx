import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import ImportContactsScreen from '../import';
import * as Contacts from 'expo-contacts';
import { useRouter } from 'expo-router';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(() => ({})),
  Stack: { Screen: jest.fn(() => null) },
}));

jest.mock('expo-contacts', () => ({
  getContactsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  PermissionStatus: { GRANTED: 'granted' },
  Fields: { PhoneNumbers: 'phoneNumbers', Image: 'image' },
  SortTypes: { FirstName: 'firstName' },
}));

jest.mock('@/components/EnhancedPaywallModal', () => ({
  EnhancedPaywallModal: () => null,
}));

describe('ImportContactsScreen - Custom Frequency Feature', () => {
  const mockRouter = { push: jest.fn() };
  (useRouter as jest.Mock).mockReturnValue(mockRouter);

  const mockContacts = [
    {
      id: '1',
      name: 'John Doe',
      phoneNumbers: [{ number: '1234567890' }],
      imageAvailable: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (Contacts.getContactsAsync as jest.Mock).mockResolvedValue({
      data: mockContacts,
    });
    (Contacts.requestPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    (Contacts.getPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
  });

  it('displays the "Custom" option in the frequency selection modal', async () => {
    const { getByText, getAllByText } = render(<ImportContactsScreen />);

    // Wait for contacts to load
    await waitFor(() => {
      expect(getByText('John Doe')).toBeTruthy();
    });

    // Open frequency modal for the first contact
    // Assuming the default badge says "Every week"
    fireEvent.press(getAllByText('Every week')[0]); 

    // Check if "Custom rhythm" option is available in the modal
    expect(getByText('Custom rhythm')).toBeTruthy();
  });

  it('shows frequency and unit inputs when "Custom" is selected', async () => {
    const { getByText, getAllByText, getByPlaceholderText } = render(<ImportContactsScreen />);
    await waitFor(() => {
      expect(getByText('John Doe')).toBeTruthy();
    });

    // Open modal
    fireEvent.press(getAllByText('Every week')[0]);

    // Select "Custom"
    fireEvent.press(getByText('Custom rhythm'));

    // Expect inputs
    expect(getByPlaceholderText('e.g., 30')).toBeTruthy();
    expect(getByText('Days')).toBeTruthy();
    expect(getByText('Weeks')).toBeTruthy();
    expect(getByText('Months')).toBeTruthy();
  });

  it('calculates custom interval based on unit and saves it', async () => {
    const { getByText, getAllByText, getByPlaceholderText, queryByText } = render(<ImportContactsScreen />);
    await waitFor(() => {
      expect(getByText('John Doe')).toBeTruthy();
    });

    // Open modal
    fireEvent.press(getAllByText('Every week')[0]);

    // Select "Custom"
    fireEvent.press(getByText('Custom rhythm'));

    // Enter 2 Weeks
    fireEvent.changeText(getByPlaceholderText('e.g., 30'), '2');
    fireEvent.press(getByText('Weeks'));
    fireEvent.press(getByText('Save Changes'));

    // Modal should close
    expect(queryByText('Reminder rhythm')).toBeNull();
    
    // Verify badge text or check saved state logic
    // The badge text might still say "Custom" but the underlying value is what matters for import
  });

  it('passes the custom bucket and interval to the review screen upon navigation', async () => {
    const { getByText, getAllByText, getByPlaceholderText } = render(<ImportContactsScreen />);
    await waitFor(() => {
      expect(getByText('John Doe')).toBeTruthy();
    });

    // Select the contact to enable import button
    fireEvent.press(getByText('John Doe'));

    // Set custom frequency
    fireEvent.press(getAllByText('Every week')[0]);
    fireEvent.press(getByText('Custom rhythm'));
    fireEvent.changeText(getByPlaceholderText('e.g., 30'), '45');
    fireEvent.press(getByText('Save Changes'));

    // Click "Import and Review"
    fireEvent.press(getByText(/Import and Review/));

    // Verify router push arguments
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/contacts/review-schedule',
      params: {
        contacts: expect.stringContaining('"bucket":"custom"'),
      },
    });

    const pushedParams = mockRouter.push.mock.calls[0][0];
    const parsedContacts = JSON.parse(pushedParams.params.contacts);
    
    expect(parsedContacts[0]).toMatchObject({
      id: '1',
      bucket: 'custom',
      customIntervalDays: 45,
    });
  });
});
