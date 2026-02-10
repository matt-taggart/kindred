import React from 'react';
import { render } from '@testing-library/react-native';
import { ConnectionProfileSection } from './ConnectionProfileSection';

describe('ConnectionProfileSection', () => {
  const defaultProps = {
    avatarUri: null,
    name: 'Maya Chen',
    relationship: 'Friend',
    lastConnected: 'Last connected 3 days ago',
    birthday: null,
    isFavorite: false,
  };

  it('renders initials when no avatar provided', () => {
    const { getByTestId, getByText } = render(
      <ConnectionProfileSection {...defaultProps} />
    );

    expect(getByTestId('profile-initials')).toBeTruthy();
    expect(getByText('M')).toBeTruthy();
  });

  it('renders contact name above the avatar', () => {
    const { getByText } = render(
      <ConnectionProfileSection {...defaultProps} />
    );

    expect(getByText('Maya Chen')).toBeTruthy();
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

  it('renders birthday pill when birthday is provided', () => {
    const { getByTestId, getByText } = render(
      <ConnectionProfileSection {...defaultProps} birthday="1990-03-15" />
    );

    expect(getByTestId('birthday-pill')).toBeTruthy();
    expect(getByText('March 15')).toBeTruthy();
  });

  it('does not render birthday pill when birthday is null', () => {
    const { queryByTestId } = render(
      <ConnectionProfileSection {...defaultProps} birthday={null} />
    );

    expect(queryByTestId('birthday-pill')).toBeNull();
  });

  it('renders the connection profile section container', () => {
    const { getByTestId } = render(
      <ConnectionProfileSection {...defaultProps} />
    );

    expect(getByTestId('connection-profile-section')).toBeTruthy();
  });

  it('does not render relationship pill when showRelationshipPill is false', () => {
    const { queryByText } = render(
      <ConnectionProfileSection
        {...defaultProps}
        showRelationshipPill={false}
      />
    );

    expect(queryByText('Friend')).toBeNull();
  });
});
