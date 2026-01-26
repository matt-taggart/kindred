import React from 'react';
import { render } from '@testing-library/react-native';
import { MomentSectionDivider } from './MomentSectionDivider';

describe('MomentSectionDivider', () => {
  it('renders the title text', () => {
    const { getByText } = render(<MomentSectionDivider title="This Week" />);
    expect(getByText('This Week')).toBeTruthy();
  });

  it('renders with highlighted style when highlighted prop is true', () => {
    const { getByTestId } = render(
      <MomentSectionDivider title="This Week" highlighted />
    );
    const divider = getByTestId('moment-section-divider');
    expect(divider.props.accessibilityHint).toContain('highlighted');
  });

  it('renders without highlighted style by default', () => {
    const { getByTestId } = render(
      <MomentSectionDivider title="Next Week" />
    );
    const divider = getByTestId('moment-section-divider');
    expect(divider.props.accessibilityHint).not.toContain('highlighted');
  });
});
