import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SharedMomentsSection, Moment } from './SharedMomentsSection';

const mockMoments: Moment[] = [
  {
    id: '1',
    title: 'Coffee at The Nook',
    date: 'March 14',
    description: 'Gentle conversation',
    iconBgColor: 'bg-amber-50',
    icon: 'cafe',
  },
  {
    id: '2',
    title: 'Walk in the Park',
    date: 'Feb 28',
    description: 'Sunny afternoon',
    imageUri: 'https://example.com/photo.jpg',
  },
];

describe('SharedMomentsSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when moments is empty', () => {
    const { toJSON } = render(<SharedMomentsSection moments={[]} />);

    expect(toJSON()).toBeNull();
  });

  it('renders section header "Shared moments"', () => {
    const { getByText } = render(<SharedMomentsSection moments={mockMoments} />);

    expect(getByText('Shared moments')).toBeTruthy();
  });

  it('renders "View all" button when onViewAll provided', () => {
    const onViewAll = jest.fn();
    const { getByText } = render(
      <SharedMomentsSection moments={mockMoments} onViewAll={onViewAll} />
    );

    expect(getByText('View all')).toBeTruthy();
  });

  it('does not render "View all" button when onViewAll not provided', () => {
    const { queryByText } = render(
      <SharedMomentsSection moments={mockMoments} />
    );

    expect(queryByText('View all')).toBeNull();
  });

  it('calls onViewAll when pressed', () => {
    const onViewAll = jest.fn();
    const { getByText } = render(
      <SharedMomentsSection moments={mockMoments} onViewAll={onViewAll} />
    );

    fireEvent.press(getByText('View all'));

    expect(onViewAll).toHaveBeenCalledTimes(1);
  });

  it('renders moment titles', () => {
    const { getByText } = render(<SharedMomentsSection moments={mockMoments} />);

    expect(getByText('Coffee at The Nook')).toBeTruthy();
    expect(getByText('Walk in the Park')).toBeTruthy();
  });

  it('calls onMomentPress when moment pressed', () => {
    const onMomentPress = jest.fn();
    const { getByText } = render(
      <SharedMomentsSection moments={mockMoments} onMomentPress={onMomentPress} />
    );

    fireEvent.press(getByText('Coffee at The Nook'));

    expect(onMomentPress).toHaveBeenCalledTimes(1);
    expect(onMomentPress).toHaveBeenCalledWith(mockMoments[0]);
  });

  it('calls onMomentLongPress when moment is held', () => {
    const onMomentLongPress = jest.fn();
    const { getByText } = render(
      <SharedMomentsSection moments={mockMoments} onMomentLongPress={onMomentLongPress} />
    );

    fireEvent(getByText('Coffee at The Nook'), 'longPress');

    expect(onMomentLongPress).toHaveBeenCalledTimes(1);
    expect(onMomentLongPress).toHaveBeenCalledWith(mockMoments[0]);
  });

  it('does not call onMomentPress after long press', () => {
    const onMomentPress = jest.fn();
    const onMomentLongPress = jest.fn();
    const { getByText } = render(
      <SharedMomentsSection
        moments={mockMoments}
        onMomentPress={onMomentPress}
        onMomentLongPress={onMomentLongPress}
      />
    );

    fireEvent(getByText('Coffee at The Nook'), 'longPress');
    fireEvent.press(getByText('Coffee at The Nook'));

    expect(onMomentLongPress).toHaveBeenCalledTimes(1);
    expect(onMomentPress).not.toHaveBeenCalled();
  });

  it('calls onMomentOptionsPress when overflow button is pressed', () => {
    const onMomentOptionsPress = jest.fn();
    const { getByLabelText } = render(
      <SharedMomentsSection moments={mockMoments} onMomentOptionsPress={onMomentOptionsPress} />
    );

    fireEvent.press(getByLabelText('More actions for Coffee at The Nook'));

    expect(onMomentOptionsPress).toHaveBeenCalledTimes(1);
    expect(onMomentOptionsPress).toHaveBeenCalledWith(mockMoments[0]);
  });
});
