import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Calendar, DateData } from 'react-native-calendars';
import { ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Contact } from '@/db/schema';
import {
  getContactsByDate,
  getCalendarData,
  getMonthsDueContacts,
  getTodayDateKey,
  CalendarContact,
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

const formatBucketLabel = (bucket: Contact['bucket'], customIntervalDays?: number | null) => {
  switch (bucket) {
    case 'daily':
      return 'Daily';
    case 'weekly':
      return 'Weekly';
    case 'bi-weekly':
      return 'Every two weeks';
    case 'every-three-weeks':
      return 'Every three weeks';
    case 'monthly':
      return 'Monthly';
    case 'every-six-months':
      return 'Every six months';
    case 'yearly':
      return 'Yearly';
    case 'custom': {
      if (!customIntervalDays || customIntervalDays < 1) return 'Custom';
      if (customIntervalDays % 30 === 0) {
        const months = customIntervalDays / 30;
        return months === 1 ? 'Every month' : `Every ${months} months`;
      }
      if (customIntervalDays % 7 === 0) {
        const weeks = customIntervalDays / 7;
        return weeks === 1 ? 'Every week' : `Every ${weeks} weeks`;
      }
      if (customIntervalDays === 1) return 'Daily';
      return `Every ${customIntervalDays} days`;
    }
    default:
      return 'Custom';
  }
};

type CalendarContactCardProps = {
  contact: CalendarContact;
  onPress: () => void;
};

const CalendarContactCard = ({ contact, onPress }: CalendarContactCardProps) => {
  const isOverdue = contact.nextContactDate && contact.nextContactDate <= Date.now();
  const initial = useMemo(() => contact.name.charAt(0).toUpperCase(), [contact.name]);

  // Determine card accent based on type
  const isBirthday = contact.isBirthday;

  // Generate warm, connection-focused copy
  const getCardTitle = () => {
    if (isBirthday) {
      return `${contact.name}'s birthday`;
    }
    return `Connect with ${contact.name}`;
  };

  const getStatusLabel = () => {
    if (isBirthday) return 'Celebrate';
    if (isOverdue) return 'Overdue';
    return 'Upcoming';
  };

  return (
    <TouchableOpacity
      className={`mb-3 rounded-2xl border bg-surface p-4 shadow-sm ${isBirthday ? 'border-terracotta/30' : 'border-border'}`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center gap-3">
        <View className={`h-12 w-12 items-center justify-center rounded-full ${isBirthday ? 'bg-terracotta' : 'bg-sage'}`}>
          {isBirthday ? (
            <Text className="text-lg">🎂</Text>
          ) : (
            <Text className="text-base font-semibold text-white">{initial}</Text>
          )}
        </View>

        <View className="flex-1">
          <Text className="text-lg font-semibold text-warmgray">{getCardTitle()}</Text>
          <Text className="text-sm text-warmgray-muted">
            {formatBucketLabel(contact.bucket, contact.customIntervalDays)} · {formatLastContacted(contact.lastContactedAt)}
          </Text>
        </View>

        <View className={`rounded-full px-3 py-1 ${isBirthday ? 'bg-terracotta-100' : (isOverdue ? 'bg-terracotta-100' : 'bg-sage-100')}`}>
          <Text className={`text-xs font-semibold ${isBirthday ? 'text-terracotta' : (isOverdue ? 'text-terracotta' : 'text-sage')}`}>
            {getStatusLabel()}
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
  const [contactsForDate, setContactsForDate] = useState<CalendarContact[]>([]);
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
      title: isToday ? "You're all caught up!" : "No connections scheduled",
      subtitle: isToday ? "Enjoy your day" : formattedDate,
      icon: isToday ? "checkmark-circle" as const : "calendar-outline" as const,
    };
  }, [selectedDate, todayDate]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator size="large" color="#9CA986" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="mb-4">
          <Text className="text-2xl font-bold text-warmgray">Calendar</Text>
          <Text className="mt-1 text-base text-warmgray-muted">
            {monthDueCount} connection{monthDueCount !== 1 ? 's' : ''} this month
          </Text>
        </View>

        <View className="mb-6 overflow-hidden rounded-2xl bg-white shadow-sm">
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

        <View>
          {contactsForDate.length === 0 ? (
            <View className="items-center py-12 px-6">
              <Ionicons name={emptyState.icon} size={80} color="#9CA986" />
              <Text className="mt-6 text-3xl font-bold text-warmgray text-center leading-tight">
                {emptyState.title}
              </Text>
              {emptyState.subtitle && (
                <Text className="mt-4 text-xl text-center text-warmgray-muted">
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
      </ScrollView>
    </SafeAreaView>
  );
}
