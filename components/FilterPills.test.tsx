import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FilterPills } from './FilterPills';

describe('FilterPills', () => {
  const mockOnSelect = jest.fn();
  const defaultCounts = { all: 12, due: 3, archived: 2 };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all filter options with counts', () => {
    const { getByText } = render(
      <FilterPills selected="all" counts={defaultCounts} onSelect={mockOnSelect} />
    );

    expect(getByText(/All · 12/)).toBeTruthy();
    expect(getByText(/Due · 3/)).toBeTruthy();
    expect(getByText(/Archived · 2/)).toBeTruthy();
  });

  it('calls onSelect with filter value when pressed', () => {
    const { getByTestId } = render(
      <FilterPills selected="all" counts={defaultCounts} onSelect={mockOnSelect} />
    );

    fireEvent.press(getByTestId('filter-due'));
    expect(mockOnSelect).toHaveBeenCalledWith('due');
  });

  it('shows active styling for selected filter', () => {
    const { getByTestId } = render(
      <FilterPills selected="due" counts={defaultCounts} onSelect={mockOnSelect} />
    );

    const dueButton = getByTestId('filter-due');
    expect(dueButton.props.accessibilityState.selected).toBe(true);
  });

  it('shows unselected state for non-active filters', () => {
    const { getByTestId } = render(
      <FilterPills selected="due" counts={defaultCounts} onSelect={mockOnSelect} />
    );

    const allButton = getByTestId('filter-all');
    expect(allButton.props.accessibilityState.selected).toBe(false);
  });

  it('has proper accessibility labels', () => {
    const { getByTestId } = render(
      <FilterPills selected="all" counts={defaultCounts} onSelect={mockOnSelect} />
    );

    const allButton = getByTestId('filter-all');
    const dueButton = getByTestId('filter-due');
    expect(allButton.props.accessibilityLabel).toContain('all');
    expect(allButton.props.accessibilityLabel).toContain('12');
    expect(dueButton.props.accessibilityLabel).toContain('due');
    expect(dueButton.props.accessibilityLabel).toContain('3');
  });
});
