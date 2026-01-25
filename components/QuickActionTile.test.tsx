import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { QuickActionTile } from './QuickActionTile';

describe('QuickActionTile', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders call variant correctly', () => {
    const { getByText } = render(
      <QuickActionTile variant="call" onPress={mockOnPress} />
    );
    expect(getByText('Call')).toBeTruthy();
  });

  it('renders text variant correctly', () => {
    const { getByText } = render(
      <QuickActionTile variant="text" onPress={mockOnPress} />
    );
    expect(getByText('Text')).toBeTruthy();
  });

  it('renders voice variant correctly', () => {
    const { getByText } = render(
      <QuickActionTile variant="voice" onPress={mockOnPress} />
    );
    expect(getByText('Voice Note')).toBeTruthy();
  });

  it('renders later variant correctly', () => {
    const { getByText } = render(
      <QuickActionTile variant="later" onPress={mockOnPress} />
    );
    expect(getByText('Write Later')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByLabelText } = render(
      <QuickActionTile variant="call" onPress={mockOnPress} />
    );
    fireEvent.press(getByLabelText('Call'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('has correct accessibility hint for call variant', () => {
    const { getByA11yHint } = render(
      <QuickActionTile variant="call" onPress={mockOnPress} />
    );
    expect(getByA11yHint('variant-call')).toBeTruthy();
  });

  it('has correct accessibility hint for text variant', () => {
    const { getByA11yHint } = render(
      <QuickActionTile variant="text" onPress={mockOnPress} />
    );
    expect(getByA11yHint('variant-text')).toBeTruthy();
  });

  it('has correct accessibility hint for voice variant', () => {
    const { getByA11yHint } = render(
      <QuickActionTile variant="voice" onPress={mockOnPress} />
    );
    expect(getByA11yHint('variant-voice')).toBeTruthy();
  });

  it('has correct accessibility hint for later variant', () => {
    const { getByA11yHint } = render(
      <QuickActionTile variant="later" onPress={mockOnPress} />
    );
    expect(getByA11yHint('variant-later')).toBeTruthy();
  });
});
