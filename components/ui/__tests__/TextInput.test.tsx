import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TextInput } from '../TextInput';

describe('TextInput', () => {
  it('renders with placeholder', () => {
    const { getByPlaceholderText } = render(
      <TextInput placeholder="Enter name" />
    );
    expect(getByPlaceholderText('Enter name')).toBeTruthy();
  });

  it('renders label when provided', () => {
    const { getByText } = render(
      <TextInput label="Name" placeholder="Enter name" />
    );
    expect(getByText('Name')).toBeTruthy();
  });

  it('renders error message when provided', () => {
    const { getByText } = render(
      <TextInput error="This field is required" placeholder="Enter name" />
    );
    expect(getByText('This field is required')).toBeTruthy();
  });

  it('calls onChangeText when text changes', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <TextInput placeholder="Enter name" onChangeText={onChangeText} />
    );
    fireEvent.changeText(getByPlaceholderText('Enter name'), 'John');
    expect(onChangeText).toHaveBeenCalledWith('John');
  });
});
