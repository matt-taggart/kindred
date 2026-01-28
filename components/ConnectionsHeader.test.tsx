import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ConnectionsHeader } from './ConnectionsHeader';

describe('ConnectionsHeader', () => {
  const mockOnSearchPress = jest.fn();
  const mockOnSearchChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the Kindred branding', () => {
    const { getByText } = render(
      <ConnectionsHeader 
        onSearchPress={mockOnSearchPress} 
        searchQuery="" 
        onSearchChange={mockOnSearchChange} 
        isSearching={false} 
      />
    );
    expect(getByText('KINDRED')).toBeTruthy();
  });

  it('renders the title', () => {
    const { getByText } = render(
      <ConnectionsHeader 
        onSearchPress={mockOnSearchPress} 
        searchQuery="" 
        onSearchChange={mockOnSearchChange} 
        isSearching={false} 
      />
    );
    expect(getByText('Connections')).toBeTruthy();
  });

  it('renders the subtitle when not searching', () => {
    const { getByText } = render(
      <ConnectionsHeader 
        onSearchPress={mockOnSearchPress} 
        searchQuery="" 
        onSearchChange={mockOnSearchChange} 
        isSearching={false} 
      />
    );
    expect(getByText('Stay close to the people who matter most.')).toBeTruthy();
  });

  it('calls onSearchPress when search button is pressed', () => {
    const { getByTestId } = render(
      <ConnectionsHeader 
        onSearchPress={mockOnSearchPress} 
        searchQuery="" 
        onSearchChange={mockOnSearchChange} 
        isSearching={false} 
      />
    );
    fireEvent.press(getByTestId('search-button'));
    expect(mockOnSearchPress).toHaveBeenCalledTimes(1);
  });

  it('has proper accessibility attributes on search button', () => {
    const { getByTestId } = render(
      <ConnectionsHeader 
        onSearchPress={mockOnSearchPress} 
        searchQuery="" 
        onSearchChange={mockOnSearchChange} 
        isSearching={false} 
      />
    );
    const searchButton = getByTestId('search-button');
    expect(searchButton.props.accessibilityLabel).toBe('Search connections');
    expect(searchButton.props.accessibilityRole).toBe('button');
  });

  it('renders search input when isSearching is true', () => {
    const { getByPlaceholderText, queryByText } = render(
      <ConnectionsHeader 
        onSearchPress={mockOnSearchPress} 
        searchQuery="test" 
        onSearchChange={mockOnSearchChange} 
        isSearching={true} 
      />
    );
    expect(getByPlaceholderText('Search by name...')).toBeTruthy();
    expect(queryByText('Stay close to the people who matter most.')).toBeNull();
  });

  it('calls onSearchChange when typing in search input', () => {
    const { getByPlaceholderText } = render(
      <ConnectionsHeader 
        onSearchPress={mockOnSearchPress} 
        searchQuery="" 
        onSearchChange={mockOnSearchChange} 
        isSearching={true} 
      />
    );
    fireEvent.changeText(getByPlaceholderText('Search by name...'), 'John');
    expect(mockOnSearchChange).toHaveBeenCalledWith('John');
  });
});
