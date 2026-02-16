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

  it('renders avatar image when avatarUri is provided', () => {
    const { getByTestId } = render(
      <ConnectionCard
        contact={{ ...baseContact, avatarUri: 'https://example.com/avatar.jpg' }}
        lastConnectedLabel="Connected yesterday"
        nextReminderLabel="Tomorrow"
        isReady={false}
        onPress={mockOnPress}
      />
    );

    expect(getByTestId('connection-card-avatar-image')).toBeTruthy();
  });

  it('falls back to icon when avatar image fails to load', () => {
    const { getByTestId, queryByTestId } = render(
      <ConnectionCard
        contact={{ ...baseContact, avatarUri: 'ph://not-renderable-avatar' }}
        lastConnectedLabel="Connected yesterday"
        nextReminderLabel="Tomorrow"
        isReady={false}
        onPress={mockOnPress}
      />
    );

    fireEvent(getByTestId('connection-card-avatar-image'), 'error');
    expect(getByTestId('connection-card-avatar-fallback')).toBeTruthy();
    expect(queryByTestId('connection-card-avatar-image')).toBeNull();
  });

  it('shows Overdue indicator when isOverdue is true', () => {
    const { getByText } = render(
      <ConnectionCard
        contact={baseContact}
        lastConnectedLabel="Connected yesterday"
        nextReminderLabel="2 days ago"
        isReady={true}
        isOverdue={true}
        onPress={mockOnPress}
      />
    );
    expect(getByText('Overdue')).toBeTruthy();
  });

  it('hides Overdue indicator when isOverdue is false', () => {
    const { queryByText } = render(
      <ConnectionCard
        contact={baseContact}
        lastConnectedLabel="Connected yesterday"
        nextReminderLabel="Today"
        isReady={true}
        isOverdue={false}
        onPress={mockOnPress}
      />
    );
    expect(queryByText('Overdue')).toBeNull();
  });

  it('hides Overdue indicator when isOverdue is not provided', () => {
    const { queryByText } = render(
      <ConnectionCard
        contact={baseContact}
        lastConnectedLabel="Connected yesterday"
        nextReminderLabel="Today"
        isReady={true}
        onPress={mockOnPress}
      />
    );
    expect(queryByText('Overdue')).toBeNull();
  });
});
