import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ExpandableFAB } from './ExpandableFAB';

describe('ExpandableFAB', () => {
  const mockOnAddManually = jest.fn();
  const mockOnImportContacts = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders primary FAB button', () => {
    const { getByTestId } = render(
      <ExpandableFAB
        onAddManually={mockOnAddManually}
        onImportContacts={mockOnImportContacts}
      />
    );
    expect(getByTestId('primary-fab')).toBeTruthy();
  });

  it('shows secondary actions when expanded', () => {
    const { getByTestId, queryByTestId } = render(
      <ExpandableFAB
        onAddManually={mockOnAddManually}
        onImportContacts={mockOnImportContacts}
      />
    );

    // Initially secondary actions should not be visible
    expect(queryByTestId('add-manually-fab')).toBeNull();
    expect(queryByTestId('import-contacts-fab')).toBeNull();

    // Expand the FAB
    fireEvent.press(getByTestId('primary-fab'));

    // Secondary actions should now be visible
    expect(getByTestId('add-manually-fab')).toBeTruthy();
    expect(getByTestId('import-contacts-fab')).toBeTruthy();
  });

  it('calls onAddManually when add manually button pressed', () => {
    const { getByTestId } = render(
      <ExpandableFAB
        onAddManually={mockOnAddManually}
        onImportContacts={mockOnImportContacts}
      />
    );

    // Expand first
    fireEvent.press(getByTestId('primary-fab'));

    // Press add manually button
    fireEvent.press(getByTestId('add-manually-fab'));

    expect(mockOnAddManually).toHaveBeenCalledTimes(1);
  });

  it('calls onImportContacts when import button pressed', () => {
    const { getByTestId } = render(
      <ExpandableFAB
        onAddManually={mockOnAddManually}
        onImportContacts={mockOnImportContacts}
      />
    );

    // Expand first
    fireEvent.press(getByTestId('primary-fab'));

    // Press import contacts button
    fireEvent.press(getByTestId('import-contacts-fab'));

    expect(mockOnImportContacts).toHaveBeenCalledTimes(1);
  });

  it('collapses when primary FAB pressed while expanded', () => {
    const { getByTestId, queryByTestId } = render(
      <ExpandableFAB
        onAddManually={mockOnAddManually}
        onImportContacts={mockOnImportContacts}
      />
    );

    // Expand
    fireEvent.press(getByTestId('primary-fab'));
    expect(getByTestId('add-manually-fab')).toBeTruthy();

    // Collapse
    fireEvent.press(getByTestId('primary-fab'));

    // Secondary actions should no longer be visible
    expect(queryByTestId('add-manually-fab')).toBeNull();
    expect(queryByTestId('import-contacts-fab')).toBeNull();
  });
});
