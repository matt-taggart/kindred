import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { SectionHeader } from './SectionHeader';

describe('SectionHeader', () => {
  it('renders the title', () => {
    render(<SectionHeader title="Test Section" />);
    expect(screen.getByText('Test Section')).toBeTruthy();
  });

  it('renders title in uppercase', () => {
    render(<SectionHeader title="Test Section" />);
    const titleElement = screen.getByText('Test Section');
    expect(titleElement.props.className).toContain('uppercase');
  });
});
