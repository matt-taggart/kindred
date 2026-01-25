import React from 'react';
import { render } from '@testing-library/react-native';
import { Heading } from '../Heading';

describe('Heading', () => {
  it('renders children text', () => {
    const { getByText } = render(<Heading>Hello World</Heading>);
    expect(getByText('Hello World')).toBeTruthy();
  });

  it('applies size 1 styles', () => {
    const { getByText } = render(<Heading size={1}>Title</Heading>);
    const element = getByText('Title');
    expect(element.props.className).toContain('text-3xl');
  });

  it('applies size 4 styles', () => {
    const { getByText } = render(<Heading size={4}>Small</Heading>);
    const element = getByText('Small');
    expect(element.props.className).toContain('text-base');
  });
});
