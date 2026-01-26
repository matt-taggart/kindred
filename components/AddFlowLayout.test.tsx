import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AddFlowLayout } from './AddFlowLayout';

describe('AddFlowLayout', () => {
  const defaultProps = {
    currentStep: 1,
    title: 'Test Title',
    onBack: jest.fn(),
    onNext: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders progress bar with correct step', () => {
    const { getByTestId } = render(
      <AddFlowLayout {...defaultProps} currentStep={2}>
        <Text>Content</Text>
      </AddFlowLayout>
    );

    const progressBar = getByTestId('progress-bar-container');
    expect(progressBar).toBeTruthy();
    expect(progressBar.props.accessibilityValue.now).toBe(2);
  });

  it('renders title', () => {
    const { getByText } = render(
      <AddFlowLayout {...defaultProps} title="Add Connection">
        <Text>Content</Text>
      </AddFlowLayout>
    );

    expect(getByText('Add Connection')).toBeTruthy();
  });

  it('renders subtitle when provided', () => {
    const { getByText } = render(
      <AddFlowLayout {...defaultProps} subtitle="Enter your details">
        <Text>Content</Text>
      </AddFlowLayout>
    );

    expect(getByText('Enter your details')).toBeTruthy();
  });

  it('does not render subtitle when not provided', () => {
    const { queryByTestId } = render(
      <AddFlowLayout {...defaultProps}>
        <Text>Content</Text>
      </AddFlowLayout>
    );

    expect(queryByTestId('subtitle')).toBeNull();
  });

  it('renders children content', () => {
    const { getByText } = render(
      <AddFlowLayout {...defaultProps}>
        <Text>Child Content Here</Text>
      </AddFlowLayout>
    );

    expect(getByText('Child Content Here')).toBeTruthy();
  });

  it('calls onBack when back button is pressed', () => {
    const onBack = jest.fn();
    const { getByLabelText } = render(
      <AddFlowLayout {...defaultProps} onBack={onBack}>
        <Text>Content</Text>
      </AddFlowLayout>
    );

    fireEvent.press(getByLabelText('Go back'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('shows Skip button only when onSkip is provided', () => {
    const onSkip = jest.fn();
    const { getByText, rerender, queryByText } = render(
      <AddFlowLayout {...defaultProps} onSkip={onSkip}>
        <Text>Content</Text>
      </AddFlowLayout>
    );

    expect(getByText('Skip')).toBeTruthy();

    rerender(
      <AddFlowLayout {...defaultProps}>
        <Text>Content</Text>
      </AddFlowLayout>
    );

    expect(queryByText('Skip')).toBeNull();
  });

  it('calls onSkip when Skip button is pressed', () => {
    const onSkip = jest.fn();
    const { getByText } = render(
      <AddFlowLayout {...defaultProps} onSkip={onSkip}>
        <Text>Content</Text>
      </AddFlowLayout>
    );

    fireEvent.press(getByText('Skip'));
    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  it('calls onNext when Next button is pressed', () => {
    const onNext = jest.fn();
    const { getByText } = render(
      <AddFlowLayout {...defaultProps} onNext={onNext}>
        <Text>Content</Text>
      </AddFlowLayout>
    );

    fireEvent.press(getByText('Next'));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('shows nextLabel text on Next button', () => {
    const { getByText } = render(
      <AddFlowLayout {...defaultProps} nextLabel="Save">
        <Text>Content</Text>
      </AddFlowLayout>
    );

    expect(getByText('Save')).toBeTruthy();
  });

  it('uses "Next" as default nextLabel', () => {
    const { getByText } = render(
      <AddFlowLayout {...defaultProps}>
        <Text>Content</Text>
      </AddFlowLayout>
    );

    expect(getByText('Next')).toBeTruthy();
  });

  it('disables Next button when nextDisabled is true', () => {
    const onNext = jest.fn();
    const { getByTestId } = render(
      <AddFlowLayout {...defaultProps} onNext={onNext} nextDisabled={true}>
        <Text>Content</Text>
      </AddFlowLayout>
    );

    const nextButton = getByTestId('next-button');
    expect(nextButton.props.accessibilityState.disabled).toBe(true);

    fireEvent.press(nextButton);
    expect(onNext).not.toHaveBeenCalled();
  });

  it('enables Next button by default', () => {
    const { getByTestId } = render(
      <AddFlowLayout {...defaultProps}>
        <Text>Content</Text>
      </AddFlowLayout>
    );

    const nextButton = getByTestId('next-button');
    expect(nextButton.props.accessibilityState.disabled).toBe(false);
  });
});
