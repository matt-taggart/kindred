import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { PageHeader } from '@/components/PageHeader';
import { Body, Caption, Heading } from '@/components/ui';
import {
  getCalendarData,
  getContactsByDate,
  getTodayDateKey,
  CalendarContact,
  CalendarData,
} from '@/services/calendarService';

export default function CalendarScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [calendarData, setCalendarData] = useState<CalendarData>({});
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateKey());
  const [agendaContacts, setAgendaContacts] = useState<CalendarContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(() => {
    try {
      const data = getCalendarData();
      setCalendarData(data);

      const contacts = getContactsByDate(selectedDate);
      setAgendaContacts(contacts);
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

  const handleDayPress = useCallback(
    (day: DateData) => {
      setSelectedDate(day.dateString);
      const contacts = getContactsByDate(day.dateString);
      setAgendaContacts(contacts);
    },
    [],
  );

  const handleContactPress = useCallback(
    (contactId: string) => {
      router.push(`/contacts/${contactId}`);
    },
    [router],
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const todayKey = getTodayDateKey();

  // Build marked dates for the calendar
  const markedDates = Object.entries(calendarData).reduce(
    (acc, [date, data]) => {
      acc[date] = {
        marked: true,
        dots: data.dots.map((dot, i) => ({ key: `dot-${i}`, color: dot.color })),
        selected: date === selectedDate,
        selectedColor: date === selectedDate ? (isDark ? 'rgba(125, 157, 122, 0.2)' : 'rgba(125, 157, 122, 0.15)') : undefined,
        selectedTextColor: date === selectedDate ? (isDark ? '#fff' : '#1e293b') : undefined,
      };
      return acc;
    },
    {} as Record<string, any>,
  );

  // Ensure selected date is always marked
  if (!markedDates[selectedDate]) {
    markedDates[selectedDate] = {
      selected: true,
      selectedColor: isDark ? 'rgba(125, 157, 122, 0.2)' : 'rgba(125, 157, 122, 0.15)',
      selectedTextColor: isDark ? '#fff' : '#1e293b',
    };
  }

  // Format selected date for display
  const formatSelectedDate = (dateString: string): string => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 140 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          title="Calendar"
          subtitle="Your rhythm at a glance."
        />

        {/* Month Grid */}
        <View className="mb-6 rounded-3xl overflow-hidden bg-white dark:bg-card-dark border border-slate-100 dark:border-slate-800 shadow-soft">
          <Calendar
            markingType="multi-dot"
            markedDates={markedDates}
            onDayPress={handleDayPress}
            theme={{
              backgroundColor: 'transparent',
              calendarBackground: 'transparent',
              textSectionTitleColor: isDark ? '#94a3b8' : '#64748b',
              selectedDayBackgroundColor: Colors.primary,
              selectedDayTextColor: '#ffffff',
              todayTextColor: Colors.primary,
              todayBackgroundColor: isDark ? 'rgba(125, 157, 122, 0.1)' : 'rgba(125, 157, 122, 0.08)',
              dayTextColor: isDark ? '#e2e8f0' : '#1e293b',
              textDisabledColor: isDark ? '#475569' : '#cbd5e1',
              monthTextColor: isDark ? '#f1f5f9' : '#1e293b',
              arrowColor: Colors.primary,
              textDayFontFamily: 'Outfit_400Regular',
              textMonthFontFamily: 'Quicksand_600SemiBold',
              textDayHeaderFontFamily: 'Outfit_500Medium',
              textDayFontSize: 15,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 13,
            }}
          />
        </View>

        {/* Agenda Section */}
        <View>
          <View className="mb-4">
            <Heading size={3}>{formatSelectedDate(selectedDate)}</Heading>
            {selectedDate === todayKey && (
              <Caption muted>Today</Caption>
            )}
          </View>

          {agendaContacts.length === 0 ? (
            <View className="items-center py-10">
              <View className="w-14 h-14 rounded-full bg-sage-light dark:bg-accent-dark-sage items-center justify-center mb-3">
                <Ionicons name="sunny-outline" size={24} color={Colors.primary} />
              </View>
              <Body muted>Nothing planned for this day</Body>
            </View>
          ) : (
            <View className="space-y-3">
              {agendaContacts.map((contact) => (
                <TouchableOpacity
                  key={contact.id}
                  onPress={() => handleContactPress(contact.id)}
                  activeOpacity={0.7}
                  className="bg-white dark:bg-card-dark p-4 rounded-3xl flex-row items-center justify-between border border-slate-100 dark:border-slate-800 shadow-soft"
                >
                  <View className="flex-row items-center gap-4">
                    <View className={`w-10 h-10 rounded-2xl items-center justify-center ${
                      contact.isBirthday
                        ? 'bg-secondary/20'
                        : 'bg-primary/20'
                    }`}>
                      <Ionicons
                        name={contact.isBirthday ? 'gift-outline' : 'notifications-outline'}
                        size={18}
                        color={contact.isBirthday ? '#D4896A' : Colors.primary}
                      />
                    </View>
                    <View>
                      <Body weight="medium">{contact.name}</Body>
                      <Caption muted>
                        {contact.isBirthday ? 'Birthday' : 'Reminder'}
                        {contact.relationship ? ` \u00b7 ${contact.relationship}` : ''}
                      </Caption>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={isDark ? '#475569' : '#94a3b8'} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
