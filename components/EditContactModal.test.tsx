import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

import EditContactModal from './EditContactModal';
import type { Contact } from '@/db/schema';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialCommunityIcons: 'MaterialCommunityIcons',
}));
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');
jest.mock('@/components/BirthdayPicker', () => 'BirthdayPicker');

describe('EditContactModal', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-02-12T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const baseContact: Contact = {
    id: 'contact-1',
    name: 'Bill',
    phone: '+15555551234',
    avatarUri: null,
    bucket: 'weekly',
    customIntervalDays: null,
    lastContactedAt: null,
    nextContactDate: new Date('2026-02-10T12:00:00Z').getTime(),
    birthday: null,
    relationship: 'friend',
    isArchived: false,
  };

  it('starts with save disabled when there are no changes', () => {
    const { getByTestId } = render(
      <EditContactModal
        visible
        contact={baseContact}
        onClose={jest.fn()}
        onSave={jest.fn()}
      />,
    );

    const saveButton = getByTestId('save-changes-button');
    expect(saveButton.props.accessibilityState.disabled).toBe(true);
  });

  it('enables save after selecting a different rhythm and calls onSave', () => {
    const onSave = jest.fn();
    const onClose = jest.fn();

    const { getByTestId } = render(
      <EditContactModal
        visible
        contact={baseContact}
        onClose={onClose}
        onSave={onSave}
      />,
    );

    fireEvent.press(getByTestId('bucket-option-daily'));
    expect(getByTestId('start-date-picker')).toBeTruthy();

    const saveButton = getByTestId('save-changes-button');
    expect(saveButton.props.accessibilityState.disabled).toBe(false);

    fireEvent.press(saveButton);

    expect(onSave).toHaveBeenCalledWith('daily', null, null, Date.now());
    expect(onClose).toHaveBeenCalled();
  });

  it('shows custom validation and keeps save disabled for invalid custom input', () => {
    const { getByTestId, getByText } = render(
      <EditContactModal
        visible
        contact={baseContact}
        onClose={jest.fn()}
        onSave={jest.fn()}
      />,
    );

    fireEvent.press(getByTestId('bucket-option-custom'));
    fireEvent.changeText(getByTestId('custom-frequency-input'), '0');

    expect(getByText('Please enter a valid duration (1-365 days)')).toBeTruthy();
    expect(getByTestId('save-changes-button').props.accessibilityState.disabled).toBe(true);
  });

  it('expands birthday editor when Add Birthday is pressed', () => {
    const { getByLabelText } = render(
      <EditContactModal
        visible
        contact={baseContact}
        onClose={jest.fn()}
        onSave={jest.fn()}
      />,
    );

    fireEvent.press(getByLabelText('Add birthday'));

    expect(getByLabelText('Cancel birthday editing')).toBeTruthy();
  });

  it('uses keyboard-aware scroll behavior for custom rhythm editing', () => {
    const { getByTestId, UNSAFE_getByType } = render(
      <EditContactModal
        visible
        contact={baseContact}
        onClose={jest.fn()}
        onSave={jest.fn()}
      />,
    );

    fireEvent.press(getByTestId('bucket-option-custom'));

    const scrollView = UNSAFE_getByType(ScrollView);
    expect(scrollView.props.keyboardShouldPersistTaps).toBe('handled');
    expect(scrollView.props.keyboardDismissMode).toBe(
      Platform.OS === 'ios' ? 'interactive' : 'on-drag',
    );

    const keyboardAvoidingView = UNSAFE_getByType(KeyboardAvoidingView);
    expect(keyboardAvoidingView.props.behavior).toBe(
      Platform.OS === 'ios' ? 'padding' : undefined,
    );
  });
});
