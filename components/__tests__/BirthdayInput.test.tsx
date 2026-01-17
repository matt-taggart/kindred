import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BirthdayInput from '../BirthdayInput';

describe('BirthdayInput', () => {
  it('renders with placeholder when empty', () => {
    const { getByPlaceholderText } = render(
      <BirthdayInput value="" onChange={jest.fn()} />
    );
    expect(getByPlaceholderText('MM/DD')).toBeTruthy();
  });

  it('displays current value', () => {
    const { getByDisplayValue } = render(
      <BirthdayInput value="03-15" onChange={jest.fn()} />
    );
    expect(getByDisplayValue('03-15')).toBeTruthy();
  });

  it('calls onChange with normalized value on valid input', () => {
    const onChange = jest.fn();
    const { getByPlaceholderText } = render(
      <BirthdayInput value="" onChange={onChange} />
    );

    fireEvent.changeText(getByPlaceholderText('MM/DD'), '3/15');
    expect(onChange).toHaveBeenCalledWith('03-15');
  });

  it('calls onChange with empty string when cleared', () => {
    const onChange = jest.fn();
    const { getByDisplayValue } = render(
      <BirthdayInput value="03-15" onChange={onChange} />
    );

    fireEvent.changeText(getByDisplayValue('03-15'), '');
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('shows error for invalid input', () => {
    const { getByPlaceholderText, getByText } = render(
      <BirthdayInput value="" onChange={jest.fn()} />
    );

    fireEvent.changeText(getByPlaceholderText('MM/DD'), '13/15');
    expect(getByText('Month must be 1-12')).toBeTruthy();
  });

  it('does not call onChange for invalid input', () => {
    const onChange = jest.fn();
    const { getByPlaceholderText } = render(
      <BirthdayInput value="" onChange={onChange} />
    );

    fireEvent.changeText(getByPlaceholderText('MM/DD'), '13/15');
    expect(onChange).not.toHaveBeenCalled();
  });
});
