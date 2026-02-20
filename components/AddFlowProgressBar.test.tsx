import React from 'react';
import { render } from '@testing-library/react-native';
import { AddFlowProgressBar } from './AddFlowProgressBar';

describe('AddFlowProgressBar', () => {
  it('renders correct number of segments with default totalSteps', () => {
    const { getAllByTestId } = render(<AddFlowProgressBar currentStep={1} />);
    const segments = getAllByTestId('progress-segment');
    expect(segments).toHaveLength(3);
  });

  it('renders correct number of segments with custom totalSteps', () => {
    const { getAllByTestId } = render(
      <AddFlowProgressBar currentStep={1} totalSteps={5} />
    );
    const segments = getAllByTestId('progress-segment');
    expect(segments).toHaveLength(5);
  });

  it('shows filled segments for current and completed steps at step 1', () => {
    const { getAllByTestId } = render(<AddFlowProgressBar currentStep={1} />);
    const segments = getAllByTestId('progress-segment');

    // Step 1: first segment filled, rest unfilled
    expect(segments[0].props.className).toContain('bg-primary');
    expect(segments[1].props.className).toContain('bg-stroke-soft');
    expect(segments[2].props.className).toContain('bg-stroke-soft');
  });

  it('shows filled segments for current and completed steps at step 2', () => {
    const { getAllByTestId } = render(<AddFlowProgressBar currentStep={2} />);
    const segments = getAllByTestId('progress-segment');

    // Step 2: first two segments filled, last unfilled
    expect(segments[0].props.className).toContain('bg-primary');
    expect(segments[1].props.className).toContain('bg-primary');
    expect(segments[2].props.className).toContain('bg-stroke-soft');
  });

  it('shows all segments filled at step 3', () => {
    const { getAllByTestId } = render(<AddFlowProgressBar currentStep={3} />);
    const segments = getAllByTestId('progress-segment');

    // Step 3: all segments filled
    expect(segments[0].props.className).toContain('bg-primary');
    expect(segments[1].props.className).toContain('bg-primary');
    expect(segments[2].props.className).toContain('bg-primary');
  });

  it('shows unfilled segments for future steps', () => {
    const { getAllByTestId } = render(
      <AddFlowProgressBar currentStep={2} totalSteps={4} />
    );
    const segments = getAllByTestId('progress-segment');

    // Steps 1-2 filled, steps 3-4 unfilled
    expect(segments[0].props.className).toContain('bg-primary');
    expect(segments[1].props.className).toContain('bg-primary');
    expect(segments[2].props.className).toContain('bg-stroke-soft');
    expect(segments[3].props.className).toContain('bg-stroke-soft');
  });

  it('has accessible container', () => {
    const { getByTestId } = render(<AddFlowProgressBar currentStep={1} />);
    const container = getByTestId('progress-bar-container');
    expect(container).toBeTruthy();
  });
});
