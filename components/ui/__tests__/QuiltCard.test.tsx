import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { QuiltCard } from '../QuiltCard';

describe('QuiltCard', () => {
  it('renders children', () => {
    const { getByText } = render(
      <QuiltCard>
        <Text>Card content</Text>
      </QuiltCard>
    );
    expect(getByText('Card content')).toBeTruthy();
  });

  it('calls onPress when pressable and pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <QuiltCard pressable onPress={onPress}>
        <Text>Pressable card</Text>
      </QuiltCard>
    );
    fireEvent.press(getByText('Pressable card'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('applies primary variant styles', () => {
    const { getByTestId } = render(
      <QuiltCard variant="primary" testID="card">
        <Text>Primary card</Text>
      </QuiltCard>
    );
    const card = getByTestId('card');
    expect(card.props.className).toContain('bg-primary/15');
  });
});
