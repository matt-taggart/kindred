import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Heading, Body, Caption } from '@/components/ui';
import { MomentCard, MomentSectionDivider } from '@/components';
import { getUpcomingMoments, UpcomingMoments } from '@/services/calendarService';

export default function MomentsScreen() {
  const router = useRouter();
  const [moments, setMoments] = useState<UpcomingMoments>({
    thisWeek: [],
    nextWeek: [],
    laterThisSeason: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(() => {
    try {
      const data = getUpcomingMoments();
      setMoments(data);
    } catch (error) {
      console.warn('Failed to load moments data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();
    }, [loadData]),
  );

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

  const isEmpty =
    moments.thisWeek.length === 0 &&
    moments.nextWeek.length === 0 &&
    moments.laterThisSeason.length === 0;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
        <ActivityIndicator size="large" color="#9DBEBB" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="pt-2 mb-8">
          <Heading size={1} className="text-brand-navy dark:text-slate-100 mb-2">
            Upcoming Moments
          </Heading>
          <Caption muted className="italic">
            A gentle pace for meaningful returns.
          </Caption>
        </View>

        {isEmpty ? (
          /* Empty State */
          <View className="items-center py-16 px-6">
            <Ionicons name="sunny-outline" size={72} color="#9DBEBB" />
            <Heading size={3} className="mt-6 text-center text-brand-navy dark:text-slate-100">
              All caught up!
            </Heading>
            <Body className="mt-3 text-center opacity-60">
              No moments on the horizon. Enjoy the stillness.
            </Body>
          </View>
        ) : (
          <View className="space-y-10">
            {/* This Week Section */}
            {moments.thisWeek.length > 0 && (
              <View>
                <MomentSectionDivider title="This Week" highlighted />
                <View className="space-y-3">
                  {moments.thisWeek.map((moment) => (
                    <MomentCard
                      key={moment.contact.id}
                      contact={moment.contact}
                      emoji={moment.emoji}
                      rhythmLabel={moment.rhythmLabel}
                      timeLabel={moment.timeLabel}
                      isUrgent={moment.isUrgent}
                      onPress={() => handleContactPress(moment.contact.id)}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Next Week Section */}
            {moments.nextWeek.length > 0 && (
              <View>
                <MomentSectionDivider title="Next Week" />
                <View className="space-y-3">
                  {moments.nextWeek.map((moment) => (
                    <MomentCard
                      key={moment.contact.id}
                      contact={moment.contact}
                      emoji={moment.emoji}
                      rhythmLabel={moment.rhythmLabel}
                      timeLabel={moment.timeLabel}
                      onPress={() => handleContactPress(moment.contact.id)}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Later This Season Section */}
            {moments.laterThisSeason.length > 0 && (
              <View>
                <MomentSectionDivider title="Later This Season" />
                <View className="space-y-3 opacity-80">
                  {moments.laterThisSeason.map((moment) => (
                    <MomentCard
                      key={moment.contact.id}
                      contact={moment.contact}
                      emoji={moment.emoji}
                      rhythmLabel={moment.rhythmLabel}
                      timeLabel={moment.timeLabel}
                      isResting={moment.isResting}
                      onPress={() => handleContactPress(moment.contact.id)}
                    />
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
