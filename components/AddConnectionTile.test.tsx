import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AddConnectionTile } from './AddConnectionTile';

describe('AddConnectionTile', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders add icon', () => {
    const { getByTestId } = render(
      <AddConnectionTile onPress={mockOnPress} />
    );
    expect(getByTestId('add-icon')).toBeTruthy();
  });

  it('renders "Add a connection" text', () => {
    const { getByText } = render(
      <AddConnectionTile onPress={mockOnPress} />
    );
    expect(getByText('Add a connection')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByTestId } = render(
      <AddConnectionTile onPress={mockOnPress} />
    );
    fireEvent.press(getByTestId('add-connection-tile'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('has dashed border style', () => {
    const { getByTestId } = render(
      <AddConnectionTile onPress={mockOnPress} />
    );
    const tile = getByTestId('add-connection-tile');
    expect(tile.props.accessibilityHint).toContain('dashed');
  });
});
