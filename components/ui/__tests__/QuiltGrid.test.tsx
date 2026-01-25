import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { QuiltGrid } from '../QuiltGrid';

describe('QuiltGrid', () => {
  it('renders children', () => {
    const { getByText } = render(
      <QuiltGrid>
        <Text>Child 1</Text>
        <Text>Child 2</Text>
      </QuiltGrid>
    );
    expect(getByText('Child 1')).toBeTruthy();
    expect(getByText('Child 2')).toBeTruthy();
  });
});
