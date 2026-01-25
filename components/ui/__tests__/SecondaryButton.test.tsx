import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SecondaryButton } from '../SecondaryButton';

describe('SecondaryButton', () => {
  it('renders label text', () => {
    const { getByText } = render(<SecondaryButton label="Skip" onPress={() => {}} />);
    expect(getByText('Skip')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<SecondaryButton label="Skip" onPress={onPress} />);
    fireEvent.press(getByText('Skip'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
