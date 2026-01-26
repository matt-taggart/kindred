import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ConnectionCard } from './ConnectionCard';
import type { Contact } from '@/db/schema';

describe('ConnectionCard', () => {
  const mockOnPress = jest.fn();

  const baseContact: Contact = {
    id: '1',
    name: 'Test Contact',
    phone: null,
    avatarUri: null,
    bucket: 'weekly',
    customIntervalDays: null,
    lastContactedAt: null,
    nextContactDate: Date.now(),
    birthday: null,
    relationship: null,
    isArchived: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders contact name', () => {
    const { getByText } = render(
      <ConnectionCard
        contact={baseContact}
        lastConnectedLabel="Connected yesterday"
        nextReminderLabel="Tomorrow"
        isReady={false}
        onPress={mockOnPress}
      />
    );
    expect(getByText('Test Contact')).toBeTruthy();
  });

  it('renders rhythm label', () => {
    const { getByText } = render(
      <ConnectionCard
        contact={baseContact}
        lastConnectedLabel="Connected yesterday"
        nextReminderLabel="Tomorrow"
        isReady={false}
        onPress={mockOnPress}
      />
    );
    expect(getByText('Every week')).toBeTruthy();
  });

  it('renders last connected label', () => {
    const { getByText } = render(
      <ConnectionCard
        contact={baseContact}
        lastConnectedLabel="Connected yesterday"
        nextReminderLabel="Tomorrow"
        isReady={false}
        onPress={mockOnPress}
      />
    );
    expect(getByText('Connected yesterday')).toBeTruthy();
  });

  it('renders next reminder label', () => {
    const { getByText } = render(
      <ConnectionCard
        contact={baseContact}
        lastConnectedLabel="Connected yesterday"
        nextReminderLabel="Tomorrow"
        isReady={false}
        onPress={mockOnPress}
      />
    );
    expect(getByText('Tomorrow')).toBeTruthy();
  });

  it('shows READY badge when isReady is true', () => {
    const { getByText } = render(
      <ConnectionCard
        contact={baseContact}
        lastConnectedLabel="Connected yesterday"
        nextReminderLabel="Today"
        isReady={true}
        onPress={mockOnPress}
      />
    );
    expect(getByText('READY')).toBeTruthy();
  });

  it('hides READY badge when isReady is false', () => {
    const { queryByText } = render(
      <ConnectionCard
        contact={baseContact}
        lastConnectedLabel="Connected yesterday"
        nextReminderLabel="Tomorrow"
        isReady={false}
        onPress={mockOnPress}
      />
    );
    expect(queryByText('READY')).toBeNull();
  });

  it('calls onPress when pressed', () => {
    const { getByTestId } = render(
      <ConnectionCard
        contact={baseContact}
        lastConnectedLabel="Connected yesterday"
        nextReminderLabel="Tomorrow"
        isReady={false}
        onPress={mockOnPress}
      />
    );
    fireEvent.press(getByTestId('connection-card'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});
