import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Calendar, DateData } from 'react-native-calendars';
import { RefreshControl, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

import { Contact } from '@/db/schema';
import {
  getContactsByDate,
  getCalendarData,
  getMonthsDueContacts,
  getTodayDateKey,
} from '@/services/calendarService';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const formatLastContacted = (lastContactedAt?: number | null) => {
  if (!lastContactedAt) {
    return 'Never';
  }

  const diff = Math.max(0, Date.now() - lastContactedAt);
  const days = Math.floor(diff / DAY_IN_MS);

  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
};

const bucketLabels: Record<Contact['bucket'], string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

type CalendarContactCardProps = {
  contact: Contact;
  onPress: () => void;
};

const CalendarContactCard = ({ contact, onPress }: CalendarContactCardProps) => {
  const isOverdue = contact.nextContactDate && contact.nextContactDate <= Date.now();
  const initial = useMemo(() => contact.name.charAt(0).toUpperCase(), [contact.name]);

  return (
    <TouchableOpacity
      className="mb-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-sage">
          <Text className="text-base font-semibold text-white">{initial}</Text>
        </View>

        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900">{contact.name}</Text>
          <Text className="text-sm text-gray-500">
            {bucketLabels[contact.bucket]} · {formatLastContacted(contact.lastContactedAt)}
          </Text>
        </View>

        <View className={`rounded-full px-3 py-1 ${isOverdue ? 'bg-terracotta-100' : 'bg-sage'}`}>
          <Text className={`text-xs font-semibold ${isOverdue ? 'text-terracotta' : 'text-white'}`}>
            {isOverdue ? 'Overdue' : 'Upcoming'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function CalendarScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateKey());
  const [calendarData, setCalendarData] = useState<Record<string, any>>({});
  const [contactsForDate, setContactsForDate] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentMonth, setCurrentMonth] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
  });

  const loadData = useCallback(() => {
    try {
      const data = getCalendarData();
      setCalendarData(data);
      const contacts = getContactsByDate(selectedDate);
      setContactsForDate(contacts);
    } catch (error) {
      console.warn('Failed to load calendar data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedDate]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();
    }, [loadData]),
  );

  const handleDayPress = useCallback((day: DateData) => {
    setSelectedDate(day.dateString);
    const contacts = getContactsByDate(day.dateString);
    setContactsForDate(contacts);
  }, []);

  const handleMonthChange = useCallback((month: DateData) => {
    const monthDate = new Date(month.dateString);
    setCurrentMonth({
      year: monthDate.getFullYear(),
      month: monthDate.getMonth(),
    });
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleContactPress = useCallback(
    (contactId: string) => {
      router.push(`/contacts/${contactId}`);
    },
    [router],
  );

  const monthDueCount = useMemo(() => {
    return getMonthsDueContacts(currentMonth.year, currentMonth.month);
  }, [currentMonth]);

  const markedDates = useMemo(() => {
    const today = getTodayDateKey();
    return {
      ...calendarData,
      [selectedDate]: {
        ...(calendarData[selectedDate] || { selected: true }),
        selected: true,
        selectedColor: '#9CA986',
        selectedTextColor: '#ffffff',
      },
      ...(today !== selectedDate && {
        [today]: {
          ...calendarData[today],
          selected: true,
          selectedColor: '#F3F0E6',
          selectedTextColor: '#9CA986',
        },
      }),
    };
  }, [calendarData, selectedDate]);

  const todayDate = useMemo(() => {
    return getTodayDateKey();
  }, []);

  const theme = {
    calendarBackground: '#FFFFFF',
    textSectionTitleColor: '#6B7280',
    selectedDayBackgroundColor: '#9CA986',
    selectedDayTextColor: '#ffffff',
    todayTextColor: '#9CA986',
    dayTextColor: '#374151',
    textDisabledColor: '#9CA3AF',
    dotColor: '#9CA986',
    selectedDotColor: '#ffffff',
    arrowColor: '#9CA986',
    monthTextColor: '#1F2937',
    textDayFontFamily: 'System',
    textMonthFontFamily: 'System',
    textDayHeaderFontFamily: 'System',
    textDayFontSize: 16,
    textMonthFontSize: 16,
    textDayHeaderFontSize: 13,
  };

  const emptyState = useMemo(() => {
    const isToday = selectedDate === todayDate;
    const dateObj = new Date(selectedDate);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return {
      title: `No contacts scheduled for ${isToday ? 'today' : 'this day'}`,
      subtitle: isToday ? 'You\'re all caught up!' : formattedDate,
    };
  }, [selectedDate, todayDate]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-cream" />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="flex-1 px-4 pt-4">
        <View className="mb-4">
          <Text className="text-2xl font-bold text-gray-900">Calendar</Text>
          <Text className="mt-1 text-sm text-gray-500">
            {monthDueCount} contact{monthDueCount !== 1 ? 's' : ''} due this month
          </Text>
        </View>

        <View className="mb-6 overflow-hidden rounded-2xl bg-white">
          <Calendar
            markingType="multi-dot"
            markedDates={markedDates}
            onDayPress={handleDayPress}
            onMonthChange={handleMonthChange}
            theme={theme}
            enableSwipeMonths
            firstDay={0}
          />
        </View>

        <Text className="mb-2 text-lg font-semibold text-gray-900">
          {selectedDate === todayDate ? 'Today' : 'Selected Date'}
        </Text>

        <View>
          {contactsForDate.length === 0 ? (
            <View className="items-center py-8">
              <Text className="text-base font-semibold text-gray-700">{emptyState.title}</Text>
              {emptyState.subtitle && (
                <Text className="mt-2 text-sm text-center text-gray-500">
                  {emptyState.subtitle}
                </Text>
              )}
            </View>
          ) : (
            contactsForDate.map((contact) => (
              <CalendarContactCard
                key={contact.id}
                contact={contact}
                onPress={() => handleContactPress(contact.id)}
              />
            ))
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
