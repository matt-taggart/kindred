import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DailySoftnessCard } from './DailySoftnessCard';

describe('DailySoftnessCard', () => {
  const mockOnReflectPress = jest.fn();
  const testQuote = "Real connection isn't about how often you talk, but how deeply you listen.";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Daily Softness title', () => {
    const { getByText } = render(
      <DailySoftnessCard quote={testQuote} onReflectPress={mockOnReflectPress} />
    );
    expect(getByText('Daily Softness')).toBeTruthy();
  });

  it('renders the quote', () => {
    const { getByText } = render(
      <DailySoftnessCard quote={testQuote} onReflectPress={mockOnReflectPress} />
    );
    expect(getByText(`"${testQuote}"`)).toBeTruthy();
  });

  it('renders Reflect button', () => {
    const { getByText } = render(
      <DailySoftnessCard quote={testQuote} onReflectPress={mockOnReflectPress} />
    );
    expect(getByText('Reflect')).toBeTruthy();
  });

  it('calls onReflectPress when Reflect button is pressed', () => {
    const { getByTestId } = render(
      <DailySoftnessCard quote={testQuote} onReflectPress={mockOnReflectPress} />
    );
    fireEvent.press(getByTestId('reflect-button'));
    expect(mockOnReflectPress).toHaveBeenCalledTimes(1);
  });

  it('renders sparkle icon', () => {
    const { getByTestId } = render(
      <DailySoftnessCard quote={testQuote} onReflectPress={mockOnReflectPress} />
    );
    expect(getByTestId('sparkle-icon')).toBeTruthy();
  });
});
