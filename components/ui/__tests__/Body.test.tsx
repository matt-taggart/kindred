import React from 'react';
import { render } from '@testing-library/react-native';
import { Body } from '../Body';

describe('Body', () => {
  it('renders children text', () => {
    const { getByText } = render(<Body>Hello World</Body>);
    expect(getByText('Hello World')).toBeTruthy();
  });

  it('applies muted styles when muted prop is true', () => {
    const { getByText } = render(<Body muted>Muted text</Body>);
    const element = getByText('Muted text');
    expect(element.props.className).toContain('opacity-60');
  });

  it('applies size sm styles', () => {
    const { getByText } = render(<Body size="sm">Small</Body>);
    const element = getByText('Small');
    expect(element.props.className).toContain('text-sm');
  });
});
