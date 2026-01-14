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
    return 'Never connected';
  }

  const diff = Math.max(0, Date.now() - lastContactedAt);
  const days = Math.floor(diff / DAY_IN_MS);

  if (days === 0) return 'Connected today';
  if (days === 1) return 'Connected yesterday';
  return `${days} days ago`;
};

const formatBucketLabel = (bucket: Contact['bucket'], customIntervalDays?: number | null) => {
  switch (bucket) {
    case 'daily': return 'Daily';
    case 'weekly': return 'Weekly';
    case 'bi-weekly': return 'Bi-weekly';
    case 'every-three-weeks': return 'Every 3 weeks';
    case 'monthly': return 'Monthly';
    case 'every-six-months': return 'Seasonally';
    case 'yearly': return 'Yearly';
    case 'custom': return 'Custom';
    default: return 'Custom';
  }
};

type CalendarContactCardProps = {
  contact: CalendarContact;
  onPress: () => void;
};

const CalendarContactCard = ({ contact, onPress }: CalendarContactCardProps) => {
  const isOverdue = contact.nextContactDate && contact.nextContactDate <= Date.now();
  const initial = useMemo(() => contact.name.charAt(0).toUpperCase(), [contact.name]);

  return (
    <TouchableOpacity
      className="mb-4 rounded-3xl bg-surface p-5 shadow-sm shadow-slate-200/50 border border-border/50"
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View className="flex-row items-center gap-4">
        <View className={`h-12 w-12 items-center justify-center rounded-full ${contact.isBirthday ? 'bg-terracotta' : 'bg-sage'}`}>
          {contact.isBirthday ? (
            <Ionicons name="gift-outline" size={24} color="white" />
          ) : (
            <Text className="text-lg font-semibold text-white">{initial}</Text>
          )}
        </View>

        <View className="flex-1">
          <Text className="text-lg font-semibold text-slate-900">{contact.name}</Text>
          <Text className="text-sm text-sage-muted">
            {contact.isBirthday ? 'Birthday today' : `${formatBucketLabel(contact.bucket, contact.customIntervalDays)} · ${formatLastContacted(contact.lastContactedAt)}`}
          </Text>
        </View>

        {isOverdue && !contact.isBirthday && (
           <View className="bg-terracotta/10 px-3 py-1 rounded-full">
              <Text className="text-xs font-semibold text-terracotta">Due</Text>
           </View>
        )}
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

  const theme = {
    calendarBackground: '#F3F0E6', // Cream background to match page
    textSectionTitleColor: '#8B9678', // Muted sage
    selectedDayBackgroundColor: '#9CA986',
    selectedDayTextColor: '#ffffff',
    todayTextColor: '#9CA986',
    dayTextColor: '#5C6356', // Slate
    textDisabledColor: '#D1D5DB',
    dotColor: '#D4896A', // Terracotta for dots
    selectedDotColor: '#ffffff',
    arrowColor: '#9CA986',
    monthTextColor: '#5C6356',
    textDayFontFamily: 'System',
    textMonthFontFamily: 'System',
    textDayHeaderFontFamily: 'System',
    textDayFontSize: 16,
    textMonthFontSize: 18,
    textDayHeaderFontSize: 13,
    textMonthFontWeight: '600',
  };

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9CA986" />}
      >
        <View className="mb-6">
          <Text className="text-3xl font-semibold text-slate-900 tracking-tight">Calendar</Text>
          <Text className="mt-1 text-lg text-sage-muted">
            {monthDueCount} reminder{monthDueCount !== 1 ? 's' : ''} this month
          </Text>
        </View>

        <View className="mb-8 overflow-hidden rounded-3xl bg-surface shadow-sm border border-border/50 p-2">
          <Calendar
            markingType="multi-dot"
            markedDates={markedDates}
            onDayPress={handleDayPress}
            onMonthChange={handleMonthChange}
            theme={theme}
            enableSwipeMonths
            firstDay={0}
            style={{ borderRadius: 16 }}
          />
        </View>

        <View>
           <Text className="text-lg font-semibold text-slate-900 mb-4 px-1">
              {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
           </Text>
           
          {contactsForDate.length === 0 ? (
            <View className="items-center py-8 opacity-60 rounded-3xl border-2 border-dashed border-sage/20 bg-sage/5">
              <Ionicons name="sunny-outline" size={48} color="#9CA986" />
              <Text className="mt-4 text-base text-slate-600 font-medium">No plans for today</Text>
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
