import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HomeHeader } from './HomeHeader';

describe('HomeHeader', () => {
  const mockOnAvatarPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders greeting with user name', () => {
    const { getByText } = render(
      <HomeHeader userName="Sarah" onAvatarPress={mockOnAvatarPress} />
    );
    expect(getByText(/Sarah/)).toBeTruthy();
  });

  it('renders Kindred title', () => {
    const { getByText } = render(
      <HomeHeader userName="Sarah" onAvatarPress={mockOnAvatarPress} />
    );
    expect(getByText('Kindred')).toBeTruthy();
  });

  it('shows morning greeting before noon', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-25T09:00:00'));

    const { getByText } = render(
      <HomeHeader userName="Sarah" onAvatarPress={mockOnAvatarPress} />
    );
    expect(getByText(/Good morning/)).toBeTruthy();

    jest.useRealTimers();
  });

  it('shows afternoon greeting after noon', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-25T14:00:00'));

    const { getByText } = render(
      <HomeHeader userName="Sarah" onAvatarPress={mockOnAvatarPress} />
    );
    expect(getByText(/Good afternoon/)).toBeTruthy();

    jest.useRealTimers();
  });

  it('shows evening greeting after 6pm', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-25T19:00:00'));

    const { getByText } = render(
      <HomeHeader userName="Sarah" onAvatarPress={mockOnAvatarPress} />
    );
    expect(getByText(/Good evening/)).toBeTruthy();

    jest.useRealTimers();
  });

  it('calls onAvatarPress when avatar is pressed', () => {
    const { getByTestId } = render(
      <HomeHeader userName="Sarah" onAvatarPress={mockOnAvatarPress} />
    );
    fireEvent.press(getByTestId('avatar-button'));
    expect(mockOnAvatarPress).toHaveBeenCalledTimes(1);
  });

  it('shows notification badge when hasNotification is true', () => {
    const { getByTestId } = render(
      <HomeHeader userName="Sarah" onAvatarPress={mockOnAvatarPress} hasNotification />
    );
    expect(getByTestId('notification-badge')).toBeTruthy();
  });

  it('hides notification badge when hasNotification is false', () => {
    const { queryByTestId } = render(
      <HomeHeader userName="Sarah" onAvatarPress={mockOnAvatarPress} hasNotification={false} />
    );
    expect(queryByTestId('notification-badge')).toBeNull();
  });

  it('renders avatar image when avatarUri is provided', () => {
    const { getByTestId } = render(
      <HomeHeader
        userName="Sarah"
        onAvatarPress={mockOnAvatarPress}
        avatarUri="https://example.com/avatar.jpg"
      />
    );
    expect(getByTestId('avatar-image')).toBeTruthy();
  });

  it('renders default avatar when avatarUri is not provided', () => {
    const { getByTestId } = render(
      <HomeHeader userName="Sarah" onAvatarPress={mockOnAvatarPress} />
    );
    expect(getByTestId('default-avatar')).toBeTruthy();
  });
});
