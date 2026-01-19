import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, Pressable, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { hasYear, getMonthDay } from '@/utils/birthdayValidation';

interface BirthdayPickerProps {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Generate year range (1920 to current year, newest first)
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1920 + 1 }, (_, i) => CURRENT_YEAR - i);

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

  const [showYearPicker, setShowYearPicker] = useState(false);

  useEffect(() => {
    console.log('[BirthdayPicker useEffect] value changed to:', value);
    if (!value) {
      setYearUnknown(false);
      setSelectedDate('');
      return;
    }
    const hasYearValue = hasYear(value);
    console.log('[BirthdayPicker useEffect] hasYear:', hasYearValue);
    setYearUnknown(!hasYearValue);
    if (hasYearValue) {
      console.log('[BirthdayPicker useEffect] Setting selectedDate to:', value);
      setSelectedDate(value);
    } else {
      const currentYear = new Date().getFullYear();
      const newDate = `${currentYear}-${getMonthDay(value)}`;
      console.log('[BirthdayPicker useEffect] Setting selectedDate to:', newDate);
      setSelectedDate(newDate);
    }
  }, [value]);

  const handleToggleYear = () => {
    const newYearUnknown = !yearUnknown;
    setYearUnknown(newYearUnknown);
    console.log('[BirthdayPicker] handleToggleYear newYearUnknown:', newYearUnknown, 'selectedDate:', selectedDate);

    if (selectedDate) {
      const parts = selectedDate.split('-');
      if (parts.length === 3) {
        const monthDay = `${parts[1]}-${parts[2]}`;
        if (newYearUnknown) {
          console.log('[BirthdayPicker] handleToggleYear passing MM-DD:', monthDay);
          onChange(monthDay);
        } else {
          console.log('[BirthdayPicker] handleToggleYear passing full date:', selectedDate);
          onChange(selectedDate);
        }
      }
    }
  };

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
    if (yearUnknown) {
      const parts = day.dateString.split('-');
      const value = `${parts[1]}-${parts[2]}`;
      console.log('[BirthdayPicker] handleDayPress yearUnknown=true, passing:', value);
      onChange(value);
    } else {
      console.log('[BirthdayPicker] handleDayPress yearUnknown=false, passing:', day.dateString);
      onChange(day.dateString);
    }
  };

  const handleClear = () => {
    setSelectedDate('');
    onChange('');
  };

  const handleYearSelect = (year: number) => {
    console.log('[handleYearSelect] START - year:', year, 'selectedDate:', selectedDate, 'yearUnknown:', yearUnknown);
    
    if (selectedDate) {
      // Preserve existing month and day, just change the year
      const parts = selectedDate.split('-');
      const currentMonth = parts[1];
      const currentDay = parts[2];
      const newDateString = `${year}-${currentMonth}-${currentDay}`;
      
      console.log('[handleYearSelect] newDateString:', newDateString);
      
      // Update local state immediately
      setSelectedDate(newDateString);
      
      // If "I don't know the year" was checked, uncheck it
      // Since we're now providing a specific year, ALWAYS pass the full date
      if (yearUnknown) {
        console.log('[handleYearSelect] yearUnknown was TRUE, setting to FALSE');
        setYearUnknown(false);
      }
      
      // Always pass full date (YYYY-MM-DD) to parent
      // The useEffect will handle state reconciliation correctly
      console.log('[handleYearSelect] Calling onChange with:', newDateString);
      onChange(newDateString);
    } else {
      // No date selected yet, default to first day of current month in selected year
      const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
      const newDateString = `${year}-${currentMonth}-01`;
      
      console.log('[handleYearSelect] No date selected, newDateString:', newDateString);
      setSelectedDate(newDateString);
      onChange(newDateString);
    }
    
    setShowYearPicker(false);
    console.log('[handleYearSelect] END');
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

  const renderHeader = useCallback((date: any) => {
    if (!date) return null;
    const month = MONTH_NAMES[date.getMonth()];
    const year = date.getFullYear();

    if (yearUnknown) {
      return (
        <Text className="text-base font-semibold text-warmgray">
          {month}
        </Text>
      );
    }

    return (
      <Pressable onPress={() => setShowYearPicker(true)} testID="date-header-selector">
        <Text className="text-base font-semibold text-sage underline">
          {month} {year}
        </Text>
      </Pressable>
    );
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
      <View className="rounded-2xl overflow-hidden bg-surface border border-border" style={{ height: 340 }}>
        <Calendar
          key={`calendar-${selectedDate?.slice(0, 7) || 'default'}-${yearUnknown}`}
          current={selectedDate || undefined}
          markedDates={markedDates}
          onDayPress={handleDayPress}
          theme={yearMutedTheme}
          enableSwipeMonths
          firstDay={0}
          showSixWeeks={true}
          renderHeader={renderHeader}
        />
      </View>

      {/* Year Picker Modal */}
      <Modal
        visible={showYearPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowYearPicker(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center"
          onPress={() => setShowYearPicker(false)}
        >
          <Pressable
            className="bg-surface rounded-2xl w-64 max-h-80 overflow-hidden"
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="text-center py-3 text-base font-semibold text-warmgray border-b border-border">
              Select Year
            </Text>
            <ScrollView>
              {YEARS.map((year) => (
                <Pressable
                  key={year}
                  onPress={() => handleYearSelect(year)}
                  className={`py-3 px-4 ${
                    selectedDate?.startsWith(String(year)) ? 'bg-sage/20' : ''
                  }`}
                  testID={`year-option-${year}`}
                >
                  <Text className={`text-center text-base ${
                    selectedDate?.startsWith(String(year))
                      ? 'text-sage font-semibold'
                      : 'text-warmgray'
                  }`}>
                    {year}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Clear Link - always rendered to maintain stable height */}
      <TouchableOpacity
        onPress={handleClear}
        className="py-3 items-center"
        activeOpacity={selectedDate ? 0.7 : 1}
        disabled={!selectedDate}
      >
        <Text className={`text-sm font-medium ${selectedDate ? 'text-warmgray-muted' : 'text-transparent'}`}>
          Clear
        </Text>
      </TouchableOpacity>
    </View>
  );
}
