import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ConnectionDetailHeader } from './ConnectionDetailHeader';

describe('ConnectionDetailHeader', () => {
  const mockOnBackPress = jest.fn();
  const mockOnMorePress = jest.fn();

  const defaultProps = {
    name: 'Sarah Johnson',
    relationship: 'Friend',
    onBackPress: mockOnBackPress,
    onMorePress: mockOnMorePress,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders contact name', () => {
    const { getByText } = render(<ConnectionDetailHeader {...defaultProps} />);
    expect(getByText('Sarah Johnson')).toBeTruthy();
  });

  it('renders relationship type', () => {
    const { getByText } = render(<ConnectionDetailHeader {...defaultProps} />);
    expect(getByText('Friend')).toBeTruthy();
  });

  it('calls onBackPress when back button pressed', () => {
    const { getByLabelText } = render(
      <ConnectionDetailHeader {...defaultProps} />
    );
    fireEvent.press(getByLabelText('Go back'));
    expect(mockOnBackPress).toHaveBeenCalledTimes(1);
  });

  it('calls onMorePress when more button pressed', () => {
    const { getByLabelText } = render(
      <ConnectionDetailHeader {...defaultProps} />
    );
    fireEvent.press(getByLabelText('More options'));
    expect(mockOnMorePress).toHaveBeenCalledTimes(1);
  });
});
