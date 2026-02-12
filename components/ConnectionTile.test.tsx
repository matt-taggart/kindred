import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ConnectionTile } from './ConnectionTile';
import { Contact } from '@/db/schema';

describe('ConnectionTile', () => {
  const mockOnPress = jest.fn();

  const baseContact: Contact = {
    id: '1',
    name: 'Emma',
    phone: '+1234567890',
    email: null,
    birthday: null,
    frequency: 7,
    relationship: 'partner',
    lastContactedAt: Date.now() - 86400000,
    nextContactAt: Date.now(),
    snoozedUntil: null,
    avatarUri: null,
    notes: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders contact name', () => {
    const { getByText } = render(
      <ConnectionTile contact={baseContact} onPress={mockOnPress} />
    );
    expect(getByText('Emma')).toBeTruthy();
  });

  it('calls onPress when tile is pressed', () => {
    const { getByTestId } = render(
      <ConnectionTile contact={baseContact} onPress={mockOnPress} />
    );
    fireEvent.press(getByTestId('connection-tile'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('does not render relationship text badge in compact layout', () => {
    const { queryByText } = render(
      <ConnectionTile contact={baseContact} onPress={mockOnPress} />
    );
    expect(queryByText('PARTNER')).toBeNull();
  });

  it('renders status text', () => {
    const { getByText } = render(
      <ConnectionTile contact={baseContact} onPress={mockOnPress} />
    );
    expect(getByText(/Connected|day/)).toBeTruthy();
  });

  it('applies secondary variant styling', () => {
    const { getByTestId } = render(
      <ConnectionTile contact={baseContact} variant="secondary" onPress={mockOnPress} />
    );
    const tile = getByTestId('connection-tile');
    // NativeWind converts className to style, so we check the accessibilityHint for variant info
    expect(tile.props.accessibilityHint).toContain('secondary');
  });

  it('applies primary variant styling', () => {
    const familyContact = { ...baseContact, relationship: 'family' };
    const { getByTestId } = render(
      <ConnectionTile contact={familyContact} variant="primary" onPress={mockOnPress} />
    );
    const tile = getByTestId('connection-tile');
    // NativeWind converts className to style, so we check the accessibilityHint for variant info
    expect(tile.props.accessibilityHint).toContain('primary');
  });

  it('renders large size with larger styling', () => {
    const { getByTestId } = render(
      <ConnectionTile contact={baseContact} size="large" onPress={mockOnPress} />
    );
    const tile = getByTestId('connection-tile');
    // NativeWind converts className to style, so we check the accessibilityHint for size info
    expect(tile.props.accessibilityHint).toContain('large');
  });

  it('renders birthday indicator when isBirthday is true', () => {
    const { getByText } = render(
      <ConnectionTile contact={baseContact} isBirthday onPress={mockOnPress} />
    );
    expect(getByText("It's Emma's birthday! 🎂")).toBeTruthy();
  });

  it('renders relationship icon', () => {
    const { getByTestId } = render(
      <ConnectionTile contact={baseContact} onPress={mockOnPress} />
    );
    expect(getByTestId('relationship-icon')).toBeTruthy();
  });
});
