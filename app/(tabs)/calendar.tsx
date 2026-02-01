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
import Colors from '@/constants/Colors';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
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
          title="Moments"
          subtitle="A gentle pace for meaningful connections."
        />

        {isEmpty ? (
          <EmptyState
            icon="sunny-outline"
            title="All caught up!"
            subtitle="No moments on the horizon. Enjoy the stillness."
          />
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
