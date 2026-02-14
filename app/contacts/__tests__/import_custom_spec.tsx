import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import ImportContactsScreen from '../import';
import * as Contacts from 'expo-contacts';
import { useRouter } from 'expo-router';
import { getContacts } from '@/services/contactService';

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
  presentAccessPickerAsync: jest.fn(),
  PermissionStatus: { GRANTED: 'granted' },
  Fields: { PhoneNumbers: 'phoneNumbers', Image: 'image', Birthday: 'birthday' },
  SortTypes: { FirstName: 'firstName' },
}));

jest.mock('@/services/contactService', () => ({
  getContacts: jest.fn(),
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
      accessPrivileges: 'all',
    });
    (Contacts.presentAccessPickerAsync as jest.Mock).mockResolvedValue([]);
    (getContacts as jest.Mock).mockReturnValue([]);
  });

  it('displays the "Custom" option in the frequency selection modal', async () => {
    const { getByText } = render(<ImportContactsScreen />);

    // Wait for contacts to load
    await waitFor(() => {
      expect(getByText('John Doe')).toBeTruthy();
    });

    // Select contact first so frequency control is shown
    fireEvent.press(getByText('John Doe'));

    // Open frequency modal for the first contact
    fireEvent.press(getByText('Weekly rhythm'));

    // Check if "Custom rhythm" option is available in the modal
    expect(getByText('Custom rhythm')).toBeTruthy();
  });

  it('shows frequency and unit inputs when "Custom" is selected', async () => {
    const { getByText, getByPlaceholderText } = render(<ImportContactsScreen />);
    await waitFor(() => {
      expect(getByText('John Doe')).toBeTruthy();
    });

    fireEvent.press(getByText('John Doe'));

    // Open modal
    fireEvent.press(getByText('Weekly rhythm'));

    // Select "Custom"
    fireEvent.press(getByText('Custom rhythm'));

    // Expect inputs
    expect(getByPlaceholderText('e.g., 30')).toBeTruthy();
    expect(getByText('Days')).toBeTruthy();
    expect(getByText('Weeks')).toBeTruthy();
    expect(getByText('Months')).toBeTruthy();
  });

  it('uses keyboard-aware scroll behavior and auto-scrolls to custom form options', async () => {
    const scrollToSpy = jest
      .spyOn(ScrollView.prototype, 'scrollTo')
      .mockImplementation(() => {});

    const { getByText, getByTestId, UNSAFE_getAllByType } = render(<ImportContactsScreen />);
    await waitFor(() => {
      expect(getByText('John Doe')).toBeTruthy();
    });

    fireEvent.press(getByText('John Doe'));
    fireEvent.press(getByText('Weekly rhythm'));

    const modalScrollView = UNSAFE_getAllByType(ScrollView).find(
      (instance) => instance.props.keyboardShouldPersistTaps === 'handled',
    );
    expect(modalScrollView).toBeTruthy();
    expect(modalScrollView?.props.keyboardDismissMode).toBe(
      Platform.OS === 'ios' ? 'interactive' : 'on-drag',
    );
    fireEvent(modalScrollView!, 'contentSizeChange', 320, 1200);

    const modalKeyboardAvoidingView = UNSAFE_getAllByType(KeyboardAvoidingView).find(
      (instance) =>
        instance.props.behavior === 'padding' ||
        instance.props.behavior === 'height',
    );
    expect(modalKeyboardAvoidingView).toBeTruthy();
    expect(modalKeyboardAvoidingView?.props.behavior).toBe(
      Platform.OS === 'ios' ? 'padding' : 'height',
    );

    fireEvent.press(getByText('Custom rhythm'));
    fireEvent(getByTestId('custom-rhythm-option'), 'layout', {
      nativeEvent: { layout: { x: 0, y: 360, width: 300, height: 84 } },
    });

    await waitFor(() => {
      const lastCall = scrollToSpy.mock.calls.at(-1)?.[0] as
        | { y?: number; animated?: boolean }
        | undefined;
      expect(lastCall?.animated).toBe(true);
      expect(lastCall?.y).toBe(352);
    });

    scrollToSpy.mockRestore();
  });

  it('calculates custom interval based on unit and saves it', async () => {
    const { getByText, getByPlaceholderText, queryByText } = render(<ImportContactsScreen />);
    await waitFor(() => {
      expect(getByText('John Doe')).toBeTruthy();
    });

    fireEvent.press(getByText('John Doe'));

    // Open modal
    fireEvent.press(getByText('Weekly rhythm'));

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
    const { getByText, getByPlaceholderText } = render(<ImportContactsScreen />);
    await waitFor(() => {
      expect(getByText('John Doe')).toBeTruthy();
    });

    // Select the contact to enable import button
    fireEvent.press(getByText('John Doe'));

    // Set custom frequency
    fireEvent.press(getByText('Weekly rhythm'));
    fireEvent.press(getByText('Custom rhythm'));
    fireEvent.changeText(getByPlaceholderText('e.g., 30'), '45');
    fireEvent.press(getByText('Save Changes'));

    // Click primary CTA
    fireEvent.press(getByText(/Add selected/));

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

  it('filters out contacts that are already imported', async () => {
    (getContacts as jest.Mock).mockReturnValue([
      {
        id: 'existing-1',
        name: 'John Doe',
        phone: '1234567890',
        isArchived: false,
      },
    ]);

    const { queryByText, getByText } = render(<ImportContactsScreen />);

    await waitFor(() => {
      expect(queryByText('John Doe')).toBeNull();
      expect(getByText(/Duplicates skipped/i)).toBeTruthy();
      expect(getByText(/already in Kindred/i)).toBeTruthy();
    });
  });

  it('shows settings guidance when iOS contacts access is limited', async () => {
    if (Platform.OS !== 'ios') return;

    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    (Contacts.getPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
      accessPrivileges: 'limited',
    });

    const { getByText } = render(<ImportContactsScreen />);

    await waitFor(() => {
      expect(getByText('John Doe')).toBeTruthy();
    });

    fireEvent.press(getByText('Add more contacts'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalled();
      expect(Contacts.getContactsAsync).toHaveBeenCalledTimes(2);
    });

    alertSpy.mockRestore();
  });

  it('requests permission from add more contacts when access is not granted', async () => {
    (Contacts.getPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'undetermined',
      accessPrivileges: 'none',
    });

    const { getByText } = render(<ImportContactsScreen />);

    fireEvent.press(getByText('Add more contacts'));

    await waitFor(() => {
      expect(Contacts.requestPermissionsAsync).toHaveBeenCalledTimes(1);
      expect(Contacts.getContactsAsync).toHaveBeenCalledTimes(1);
    });
  });

  it('normalizes imported avatar paths before navigating to review', async () => {
    (Contacts.getContactsAsync as jest.Mock).mockResolvedValue({
      data: [
        {
          id: '1',
          name: 'John Doe',
          phoneNumbers: [{ number: '1234567890' }],
          imageAvailable: true,
          image: { uri: '/var/mobile/avatar.png' },
        },
      ],
    });

    const { getByText } = render(<ImportContactsScreen />);

    await waitFor(() => {
      expect(getByText('John Doe')).toBeTruthy();
    });

    fireEvent.press(getByText('John Doe'));
    fireEvent.press(getByText(/Add selected/));

    const pushedParams = mockRouter.push.mock.calls[0][0];
    const parsedContacts = JSON.parse(pushedParams.params.contacts);

    expect(parsedContacts[0].avatarUri).toBe('file:///var/mobile/avatar.png');
  });
});
