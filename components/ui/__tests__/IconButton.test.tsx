import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { IconButton } from '../IconButton';

describe('IconButton', () => {
  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <IconButton icon="arrow-back" onPress={onPress} testID="icon-btn" />
    );
    fireEvent.press(getByTestId('icon-btn'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <IconButton icon="arrow-back" onPress={onPress} disabled testID="icon-btn" />
    );
    fireEvent.press(getByTestId('icon-btn'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
