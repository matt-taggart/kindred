import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BirthdayPicker from '../BirthdayPicker';

describe('BirthdayPicker', () => {
  it('renders with toggle unchecked by default', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <BirthdayPicker value="" onChange={onChange} />
    );

    expect(getByText("I don't know the year")).toBeTruthy();
  });

  it('renders with toggle checked when value is MM-DD format', () => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      <BirthdayPicker value="03-15" onChange={onChange} />
    );

    const toggle = getByTestId('year-unknown-toggle');
    expect(toggle.props.accessibilityState.checked).toBe(true);
  });

  it('renders with toggle unchecked when value is YYYY-MM-DD format', () => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      <BirthdayPicker value="1990-03-15" onChange={onChange} />
    );

    const toggle = getByTestId('year-unknown-toggle');
    expect(toggle.props.accessibilityState.checked).toBe(false);
  });
});
