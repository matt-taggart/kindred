import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, TouchableOpacity } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { hasYear, getMonthDay } from '@/utils/birthdayValidation';

interface BirthdayPickerProps {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
}

const calendarTheme = {
  calendarBackground: '#FDFBF7',
  textSectionTitleColor: '#8B9678',
  selectedDayBackgroundColor: '#9CA986',
  selectedDayTextColor: '#ffffff',
  todayTextColor: '#9CA986',
  dayTextColor: '#5C6356',
  textDisabledColor: '#8B9678',
  dotColor: '#9CA986',
  selectedDotColor: '#ffffff',
  arrowColor: '#9CA986',
  monthTextColor: '#5C6356',
  textDayFontFamily: 'System',
  textMonthFontFamily: 'System',
  textDayHeaderFontFamily: 'System',
  textDayFontSize: 16,
  textMonthFontSize: 16,
  textDayHeaderFontSize: 13,
};

export default function BirthdayPicker({ value, onChange }: BirthdayPickerProps) {
  const [yearUnknown, setYearUnknown] = useState(() => {
    if (!value) return false;
    return !hasYear(value);
  });

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (!value) return '';
    if (hasYear(value)) return value;
    // For MM-DD, use current year to display
    const currentYear = new Date().getFullYear();
    const monthDay = getMonthDay(value);
    return `${currentYear}-${monthDay}`;
  });

  useEffect(() => {
    if (!value) {
      setYearUnknown(false);
      setSelectedDate('');
      return;
    }
    setYearUnknown(!hasYear(value));
    if (hasYear(value)) {
      setSelectedDate(value);
    } else {
      const currentYear = new Date().getFullYear();
      setSelectedDate(`${currentYear}-${getMonthDay(value)}`);
    }
  }, [value]);

  const handleToggleYear = () => {
    const newYearUnknown = !yearUnknown;
    setYearUnknown(newYearUnknown);

    if (selectedDate) {
      const parts = selectedDate.split('-');
      if (parts.length === 3) {
        const monthDay = `${parts[1]}-${parts[2]}`;
        if (newYearUnknown) {
          onChange(monthDay);
        } else {
          onChange(selectedDate);
        }
      }
    }
  };

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
    if (yearUnknown) {
      const parts = day.dateString.split('-');
      onChange(`${parts[1]}-${parts[2]}`);
    } else {
      onChange(day.dateString);
    }
  };

  const handleClear = () => {
    setSelectedDate('');
    onChange('');
  };

  const markedDates = useMemo(() => {
    if (!selectedDate) return {};
    return {
      [selectedDate]: {
        selected: true,
        selectedColor: '#9CA986',
        selectedTextColor: '#ffffff',
      },
    };
  }, [selectedDate]);

  const yearMutedTheme = useMemo(() => {
    if (!yearUnknown) return calendarTheme;
    return {
      ...calendarTheme,
      monthTextColor: '#A0A0A0',
    };
  }, [yearUnknown]);

  return (
    <View>
      {/* Toggle Row */}
      <Pressable
        testID="year-unknown-toggle"
        accessibilityState={{ checked: yearUnknown }}
        onPress={handleToggleYear}
        className="flex-row items-center gap-3 py-3 px-1"
      >
        <View
          className={`h-6 w-6 rounded-md border-2 items-center justify-center ${
            yearUnknown ? 'bg-sage border-sage' : 'border-border bg-surface'
          }`}
        >
          {yearUnknown && <Ionicons name="checkmark" size={16} color="#fff" />}
        </View>
        <Text className="text-base text-warmgray">I don't know the year</Text>
      </Pressable>

      {/* Calendar */}
      <View className="rounded-2xl overflow-hidden bg-surface border border-border">
        <Calendar
          current={selectedDate || undefined}
          markedDates={markedDates}
          onDayPress={handleDayPress}
          theme={yearMutedTheme}
          enableSwipeMonths
          firstDay={0}
        />
      </View>

      {/* Clear Link */}
      {selectedDate && (
        <TouchableOpacity
          onPress={handleClear}
          className="py-3 items-center"
          activeOpacity={0.7}
        >
          <Text className="text-sm font-medium text-warmgray-muted">Clear</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
