import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RecentConnectionRow } from './RecentConnectionRow';
import type { Contact } from '@/db/schema';

describe('RecentConnectionRow', () => {
  const mockOnPress = jest.fn();

  const baseContact: Contact = {
    id: '1',
    name: 'Sarah Jenkins',
    phone: null,
    avatarUri: null,
    bucket: 'weekly',
    customIntervalDays: null,
    lastContactedAt: Date.now() - 24 * 60 * 60 * 1000,
    nextContactDate: null,
    birthday: null,
    relationship: null,
    isArchived: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders contact name', () => {
    const { getByText } = render(
      <RecentConnectionRow
        contact={baseContact}
        connectedLabel="Connected yesterday"
        onPress={mockOnPress}
      />
    );
    expect(getByText('Sarah Jenkins')).toBeTruthy();
  });

  it('renders connected label', () => {
    const { getByText } = render(
      <RecentConnectionRow
        contact={baseContact}
        connectedLabel="Connected yesterday"
        onPress={mockOnPress}
      />
    );
    expect(getByText('Connected yesterday')).toBeTruthy();
  });

  it('renders check circle icon', () => {
    const { getByTestId } = render(
      <RecentConnectionRow
        contact={baseContact}
        connectedLabel="Connected yesterday"
        onPress={mockOnPress}
      />
    );
    expect(getByTestId('check-icon')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByTestId } = render(
      <RecentConnectionRow
        contact={baseContact}
        connectedLabel="Connected yesterday"
        onPress={mockOnPress}
      />
    );
    fireEvent.press(getByTestId('recent-connection-row'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});
