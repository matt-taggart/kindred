import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ConnectionNotesCard } from './ConnectionNotesCard';

describe('ConnectionNotesCard', () => {
  const defaultProps = {
    notes: '',
    onChangeNotes: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Notes header text', () => {
    const { getByText } = render(<ConnectionNotesCard {...defaultProps} />);

    expect(getByText('Notes')).toBeTruthy();
  });

  it('renders default placeholder text', () => {
    const { getByPlaceholderText } = render(
      <ConnectionNotesCard {...defaultProps} />
    );

    expect(
      getByPlaceholderText('What matters to you about this connection?')
    ).toBeTruthy();
  });

  it('renders custom placeholder when provided', () => {
    const customPlaceholder = 'Add your notes here...';
    const { getByPlaceholderText } = render(
      <ConnectionNotesCard {...defaultProps} placeholder={customPlaceholder} />
    );

    expect(getByPlaceholderText(customPlaceholder)).toBeTruthy();
  });

  it('displays notes value', () => {
    const notesValue = 'This is a test note about my connection.';
    const { getByDisplayValue } = render(
      <ConnectionNotesCard {...defaultProps} notes={notesValue} />
    );

    expect(getByDisplayValue(notesValue)).toBeTruthy();
  });

  it('calls onChangeNotes when text changes', () => {
    const onChangeNotes = jest.fn();
    const { getByLabelText } = render(
      <ConnectionNotesCard {...defaultProps} onChangeNotes={onChangeNotes} />
    );

    fireEvent.changeText(
      getByLabelText('Connection notes'),
      'New note content'
    );

    expect(onChangeNotes).toHaveBeenCalledWith('New note content');
  });
});
