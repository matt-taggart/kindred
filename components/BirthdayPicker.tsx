import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, Text, Pressable, TouchableOpacity, Modal, ScrollView, LayoutChangeEvent } from 'react-native';
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
const DEFAULT_DISPLAY_DATE = '1990-01-01';

const calendarTheme = {
  calendarBackground: '#FFFFFF',
  textSectionTitleColor: '#a8a29e',
  selectedDayBackgroundColor: '#9DBEBB',
  selectedDayTextColor: '#ffffff',
  todayTextColor: '#9DBEBB',
  dayTextColor: '#2D3648',
  textDisabledColor: '#d6d3d1',
  dotColor: '#9DBEBB',
  selectedDotColor: '#ffffff',
  arrowColor: '#9DBEBB',
  monthTextColor: '#2D3648',
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
    const monthDay = getMonthDay(value);
    return `1990-${monthDay}`;
  });
  const [displayDate, setDisplayDate] = useState<string>(() => {
    if (!value) return DEFAULT_DISPLAY_DATE;
    if (hasYear(value)) return value;
    const monthDay = getMonthDay(value);
    return `1990-${monthDay}`;
  });

  const [showYearPicker, setShowYearPicker] = useState(false);
  const yearScrollViewRef = useRef<ScrollView>(null);
  const [yearRowHeight, setYearRowHeight] = useState<number | null>(null);
  const [yearListHeight, setYearListHeight] = useState<number | null>(null);

  const handleYearRowLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setYearRowHeight((prev) => (prev === height ? prev : height));
  }, []);

  const handleYearListLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setYearListHeight((prev) => (prev === height ? prev : height));
  }, []);

  // Calculate scroll offset to center the selected year in view
  const scrollOffset = useMemo(() => {
    if (!yearRowHeight || !yearListHeight) return 0;
    const scrollDate = selectedDate || displayDate;
    const currentYear = parseInt(scrollDate.split('-')[0]);
    const yearIndex = currentYear ? YEARS.indexOf(currentYear) : YEARS.indexOf(1990);
    if (yearIndex < 0) return 0;

    const offset = (yearIndex * yearRowHeight) - (yearListHeight / 2) + (yearRowHeight / 2);
    return Math.max(0, offset);
  }, [selectedDate, displayDate, yearRowHeight, yearListHeight]);

  useEffect(() => {
    if (!value) {
      setYearUnknown(false);
      setSelectedDate('');
      setDisplayDate(DEFAULT_DISPLAY_DATE);
      return;
    }
    const hasYearValue = hasYear(value);
    setYearUnknown(!hasYearValue);
    if (hasYearValue) {
      setSelectedDate(value);
      setDisplayDate(value);
    } else {
      const newDate = `1990-${getMonthDay(value)}`;
      setSelectedDate(newDate);
      setDisplayDate(newDate);
    }
  }, [value]);

  // Auto-scroll to center the selected year when year picker opens
  useEffect(() => {
    if (!showYearPicker || !yearScrollViewRef.current || !yearRowHeight || !yearListHeight) {
      return;
    }
    yearScrollViewRef.current.scrollTo({ x: 0, y: scrollOffset, animated: false });
  }, [showYearPicker, scrollOffset, yearRowHeight, yearListHeight]);

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
    setDisplayDate(day.dateString);
    if (yearUnknown) {
      const parts = day.dateString.split('-');
      const value = `${parts[1]}-${parts[2]}`;
      onChange(value);
    } else {
      onChange(day.dateString);
    }
  };

  const handleClear = () => {
    setSelectedDate('');
    setDisplayDate(DEFAULT_DISPLAY_DATE);
    onChange('');
  };

  const handleYearSelect = (year: number) => {
    
    const baseDate = selectedDate || displayDate;

    if (baseDate) {
      // Preserve existing month and day, just change the year
      const parts = baseDate.split('-');
      const currentMonth = parts[1];
      const currentDay = parts[2];
      const newDateString = `${year}-${currentMonth}-${currentDay}`;
      
      
      // Update local state immediately
      setSelectedDate(newDateString);
      setDisplayDate(newDateString);
      
      // If "I don't know the year" was checked, uncheck it
      // Since we're now providing a specific year, ALWAYS pass the full date
      if (yearUnknown) {
        setYearUnknown(false);
      }
      
      // Always pass full date (YYYY-MM-DD) to parent
      // The useEffect will handle state reconciliation correctly
      onChange(newDateString);
    } else {
      // No date selected yet, default to first day of current month in selected year
      const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
      const newDateString = `${year}-${currentMonth}-01`;
      
      setSelectedDate(newDateString);
      setDisplayDate(newDateString);
      onChange(newDateString);
    }
    
    setShowYearPicker(false);
  };

  const markedDates = useMemo(() => {
    if (!selectedDate) return {};
    return {
      [selectedDate]: {
        selected: true,
        selectedColor: '#9DBEBB',
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
        <Text className="text-base font-semibold text-brand-navy">
          {month}
        </Text>
      );
    }

    return (
      <Pressable onPress={() => setShowYearPicker(true)} testID="date-header-selector">
        <Text className="text-base font-semibold text-primary underline">
          {month} {year}
        </Text>
      </Pressable>
    );
  }, [yearUnknown]);

  const renderArrow = useCallback((direction: 'left' | 'right') => (
    <View className="px-2 py-1">
      <Ionicons
        name={direction === 'left' ? 'chevron-back' : 'chevron-forward'}
        size={20}
        color="#9DBEBB"
      />
    </View>
  ), []);

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
            yearUnknown ? 'bg-primary border-primary' : 'border-stone-300 bg-white'
          }`}
        >
          {yearUnknown && <Ionicons name="checkmark" size={16} color="#fff" />}
        </View>
        <Text className="text-base text-brand-navy">{"I don't know the year"}</Text>
      </Pressable>

      {/* Calendar */}
      <View className="overflow-hidden bg-white border border-stone-200" style={{ height: 360, borderRadius: 16 }}>
        <Calendar
          key={`calendar-${displayDate?.slice(0, 7) || 'default'}-${yearUnknown}`}
          current={displayDate || undefined}
          markedDates={markedDates}
          onDayPress={handleDayPress}
          theme={yearMutedTheme}
          enableSwipeMonths
          firstDay={0}
          showSixWeeks={true}
          renderHeader={renderHeader}
          renderArrow={renderArrow}
          hideArrows={false}
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
            className="bg-white w-64 max-h-80 overflow-hidden"
            style={{ borderRadius: 16 }}
            onPress={(e) => e.stopPropagation?.()}
          >
            <Text className="text-center py-3 text-base font-semibold text-brand-navy border-b border-stone-200">
              Select Year
            </Text>
            <ScrollView ref={yearScrollViewRef} onLayout={handleYearListLayout}>
              {YEARS.map((year) => (
                <Pressable
                  key={year}
                  onPress={() => handleYearSelect(year)}
                  onLayout={year === YEARS[0] ? handleYearRowLayout : undefined}
                  className={`py-3 px-4 ${
                    selectedDate?.startsWith(String(year)) ? 'bg-primary/10' : ''
                  }`}
                  testID={`year-option-${year}`}
                >
                  <Text className={`text-center text-base ${
                    selectedDate?.startsWith(String(year))
                      ? 'text-primary font-semibold'
                      : 'text-brand-navy'
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
        <Text className={`text-sm font-medium ${selectedDate ? 'text-text-soft' : 'text-transparent'}`}>
          {selectedDate ? 'Clear' : '\u00A0'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
