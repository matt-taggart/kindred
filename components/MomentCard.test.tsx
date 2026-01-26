import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MomentCard } from './MomentCard';
import { Contact } from '@/db/schema';

describe('MomentCard', () => {
  const mockOnPress = jest.fn();

  const baseContact: Contact = {
    id: '1',
    name: 'Emma',
    phone: '+1234567890',
    birthday: null,
    bucket: 'daily',
    customIntervalDays: null,
    lastContactedAt: Date.now() - 86400000,
    nextContactDate: Date.now(),
    relationship: 'partner',
    isArchived: false,
    avatarUri: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders contact name', () => {
    const { getByText } = render(
      <MomentCard
        contact={baseContact}
        emoji="🌸"
        rhythmLabel="Returning daily"
        timeLabel="Tomorrow"
        onPress={mockOnPress}
      />
    );
    expect(getByText('Emma')).toBeTruthy();
  });

  it('renders emoji', () => {
    const { getByText } = render(
      <MomentCard
        contact={baseContact}
        emoji="🌸"
        rhythmLabel="Returning daily"
        timeLabel="Tomorrow"
        onPress={mockOnPress}
      />
    );
    expect(getByText('🌸')).toBeTruthy();
  });

  it('renders rhythm label', () => {
    const { getByText } = render(
      <MomentCard
        contact={baseContact}
        emoji="🌸"
        rhythmLabel="Returning daily"
        timeLabel="Tomorrow"
        onPress={mockOnPress}
      />
    );
    expect(getByText('Returning daily')).toBeTruthy();
  });

  it('renders time label', () => {
    const { getByText } = render(
      <MomentCard
        contact={baseContact}
        emoji="🌸"
        rhythmLabel="Returning daily"
        timeLabel="Tomorrow"
        onPress={mockOnPress}
      />
    );
    expect(getByText('Tomorrow')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByTestId } = render(
      <MomentCard
        contact={baseContact}
        emoji="🌸"
        rhythmLabel="Returning daily"
        timeLabel="Tomorrow"
        onPress={mockOnPress}
      />
    );
    fireEvent.press(getByTestId('moment-card'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('applies urgent styling when isUrgent is true', () => {
    const { getByTestId } = render(
      <MomentCard
        contact={baseContact}
        emoji="🌸"
        rhythmLabel="Returning daily"
        timeLabel="Tomorrow"
        isUrgent
        onPress={mockOnPress}
      />
    );
    const card = getByTestId('moment-card');
    expect(card.props.accessibilityHint).toContain('urgent');
  });

  it('applies resting styling when isResting is true', () => {
    const { getByTestId } = render(
      <MomentCard
        contact={baseContact}
        emoji="☕️"
        rhythmLabel="Seasonally gathering"
        timeLabel="Late June"
        isResting
        onPress={mockOnPress}
      />
    );
    const card = getByTestId('moment-card');
    expect(card.props.accessibilityHint).toContain('resting');
  });
});
