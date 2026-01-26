import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ConnectionsHeader } from './ConnectionsHeader';

describe('ConnectionsHeader', () => {
  const mockOnSearchPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the Kindred branding', () => {
    const { getByText } = render(
      <ConnectionsHeader onSearchPress={mockOnSearchPress} />
    );
    expect(getByText('KINDRED')).toBeTruthy();
  });

  it('renders the title', () => {
    const { getByText } = render(
      <ConnectionsHeader onSearchPress={mockOnSearchPress} />
    );
    expect(getByText('Connections')).toBeTruthy();
  });

  it('renders the subtitle', () => {
    const { getByText } = render(
      <ConnectionsHeader onSearchPress={mockOnSearchPress} />
    );
    expect(getByText('Stay close to the people who matter most.')).toBeTruthy();
  });

  it('calls onSearchPress when search button is pressed', () => {
    const { getByTestId } = render(
      <ConnectionsHeader onSearchPress={mockOnSearchPress} />
    );
    fireEvent.press(getByTestId('search-button'));
    expect(mockOnSearchPress).toHaveBeenCalledTimes(1);
  });

  it('has proper accessibility attributes on search button', () => {
    const { getByTestId } = render(
      <ConnectionsHeader onSearchPress={mockOnSearchPress} />
    );
    const searchButton = getByTestId('search-button');
    expect(searchButton.props.accessibilityLabel).toBe('Search connections');
    expect(searchButton.props.accessibilityRole).toBe('button');
  });
});
