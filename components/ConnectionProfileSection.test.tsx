import React from 'react';
import { render } from '@testing-library/react-native';
import { ConnectionProfileSection } from './ConnectionProfileSection';

describe('ConnectionProfileSection', () => {
  const defaultProps = {
    avatarUri: null,
    name: 'Maya Chen',
    relationship: 'Friend',
    lastConnected: 'Last connected 3 days ago',
    isFavorite: false,
  };

  it('renders initials when no avatar provided', () => {
    const { getByTestId, getByText } = render(
      <ConnectionProfileSection {...defaultProps} />
    );

    expect(getByTestId('profile-initials')).toBeTruthy();
    expect(getByText('MC')).toBeTruthy();
  });

  it('renders avatar image when avatarUri provided', () => {
    const { getByTestId, getByLabelText, queryByTestId } = render(
      <ConnectionProfileSection
        {...defaultProps}
        avatarUri="https://example.com/avatar.jpg"
      />
    );

    expect(getByTestId('profile-avatar')).toBeTruthy();
    expect(getByLabelText("Maya Chen's profile photo")).toBeTruthy();
    expect(queryByTestId('profile-initials')).toBeNull();
  });

  it('renders last connected text when provided', () => {
    const { getByTestId, getByText } = render(
      <ConnectionProfileSection {...defaultProps} />
    );

    expect(getByTestId('last-connected-text')).toBeTruthy();
    expect(getByText('Last connected 3 days ago')).toBeTruthy();
  });

  it('does not render last connected when null', () => {
    const { queryByTestId } = render(
      <ConnectionProfileSection {...defaultProps} lastConnected={null} />
    );

    expect(queryByTestId('last-connected-text')).toBeNull();
  });

  it('renders favorite badge when isFavorite is true', () => {
    const { getByTestId } = render(
      <ConnectionProfileSection {...defaultProps} isFavorite={true} />
    );

    expect(getByTestId('favorite-badge')).toBeTruthy();
  });

  it('does not render favorite badge when isFavorite is false', () => {
    const { queryByTestId } = render(
      <ConnectionProfileSection {...defaultProps} isFavorite={false} />
    );

    expect(queryByTestId('favorite-badge')).toBeNull();
  });

  it('renders the connection profile section container', () => {
    const { getByTestId } = render(
      <ConnectionProfileSection {...defaultProps} />
    );

    expect(getByTestId('connection-profile-section')).toBeTruthy();
  });
});
