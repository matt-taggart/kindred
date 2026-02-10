import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RelationshipTypePicker } from './RelationshipTypePicker';

const RELATIONSHIP_TYPES = ['Friend', 'Family', 'Mentor', 'Other'];

describe('RelationshipTypePicker', () => {
  it('renders all 4 relationship types', () => {
    const onSelect = jest.fn();
    const { getByText } = render(
      <RelationshipTypePicker selected={null} onSelect={onSelect} />
    );

    RELATIONSHIP_TYPES.forEach((type) => {
      expect(getByText(type)).toBeTruthy();
    });
  });

  it('calls onSelect with type when pill tapped', () => {
    const onSelect = jest.fn();
    const { getByText } = render(
      <RelationshipTypePicker selected={null} onSelect={onSelect} />
    );

    fireEvent.press(getByText('Friend'));
    expect(onSelect).toHaveBeenCalledWith('Friend');

    fireEvent.press(getByText('Mentor'));
    expect(onSelect).toHaveBeenCalledWith('Mentor');
  });

  it('shows selected state correctly with bg-primary', () => {
    const onSelect = jest.fn();
    const { getByTestId } = render(
      <RelationshipTypePicker selected="Family" onSelect={onSelect} />
    );

    const familyPill = getByTestId('relationship-pill-Family');
    const friendPill = getByTestId('relationship-pill-Friend');

    // Selected pill should have bg-primary
    expect(familyPill.props.className).toContain('bg-primary');
    // Unselected pill should use neutral surface styling
    expect(friendPill.props.className).toContain('bg-surface-card');
  });

  it('calls onSelect with null when tapping already selected pill (deselection)', () => {
    const onSelect = jest.fn();
    const { getByText } = render(
      <RelationshipTypePicker selected="Friend" onSelect={onSelect} />
    );

    fireEvent.press(getByText('Friend'));
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it('only one pill can be selected at a time', () => {
    const onSelect = jest.fn();
    const { getByTestId } = render(
      <RelationshipTypePicker selected="Mentor" onSelect={onSelect} />
    );

    // Only Mentor should be selected
    const mentorPill = getByTestId('relationship-pill-Mentor');
    const otherPill = getByTestId('relationship-pill-Other');
    const friendPill = getByTestId('relationship-pill-Friend');

    expect(mentorPill.props.className).toContain('bg-primary');
    expect(otherPill.props.className).toContain('bg-surface-card');
    expect(friendPill.props.className).toContain('bg-surface-card');
  });
});
