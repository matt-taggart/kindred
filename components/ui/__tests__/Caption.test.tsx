import React from 'react';
import { render } from '@testing-library/react-native';
import { Caption } from '../Caption';

describe('Caption', () => {
  it('renders children text', () => {
    const { getByText } = render(<Caption>Label</Caption>);
    expect(getByText('Label')).toBeTruthy();
  });

  it('applies uppercase styles when uppercase prop is true', () => {
    const { getByText } = render(<Caption uppercase>Label</Caption>);
    const element = getByText('Label');
    expect(element.props.className).toContain('uppercase');
    expect(element.props.className).toContain('tracking-widest');
  });

  it('applies muted styles by default', () => {
    const { getByText } = render(<Caption>Label</Caption>);
    const element = getByText('Label');
    expect(element.props.className).toContain('opacity-50');
  });
});
