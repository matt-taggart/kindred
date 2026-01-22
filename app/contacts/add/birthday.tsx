import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Platform, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import type { Contact } from '@/db/schema';
import { addContact, getAvailableSlots } from '@/services/contactService';
import { useUserStore } from '@/lib/userStore';
import { EnhancedPaywallModal } from '@/components/EnhancedPaywallModal';
import BirthdayPicker from '@/components/BirthdayPicker';
import { formatBirthdayDisplay } from '@/utils/formatters';
import { getDateLabel } from '@/utils/scheduler';

const ProgressDots = ({ step }: { step: 1 | 2 | 3 }) => (
  <View className="flex-row items-center justify-center gap-2">
    {[1, 2, 3].map((i) => (
      <View
        key={i}
        className={`h-2.5 w-2.5 rounded-full ${i === step ? 'bg-sage' : 'bg-border'}`}
      />
    ))}
  </View>
);

export default function AddConnectionBirthdayScreen() {
  const router = useRouter();
  const { isPro } = useUserStore();
  const params = useLocalSearchParams<{ name?: string; bucket?: string; customIntervalDays?: string }>();

  const name = useMemo(() => (typeof params.name === 'string' ? params.name.trim() : ''), [params.name]);
  const bucket = useMemo(() => {
    const raw = params.bucket;
    if (typeof raw !== 'string') return 'weekly' as Contact['bucket'];
    return raw as Contact['bucket'];
  }, [params.bucket]);
  const customIntervalDays = useMemo(() => {
    const raw = params.customIntervalDays;
    if (!raw) return undefined;
    const days = parseInt(raw, 10);
    return isNaN(days) ? undefined : days;
  }, [params.customIntervalDays]);

  const [showBirthdayPicker, setShowBirthdayPicker] = useState(false);
  const [birthday, setBirthday] = useState<string>('');
  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const handleDone = async () => {
    if (!name) {
      router.replace('/contacts/add');
      return;
    }

    if (!isPro && getAvailableSlots() <= 0) {
      setShowPaywall(true);
      return;
    }

    try {
      setSaving(true);
      const created = await addContact({
        name,
        bucket,
        customIntervalDays,
        birthday: birthday || null,
        nextContactDate: startDate.getTime(),
      });
      router.dismissTo('/(tabs)/two');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add connection.';
      if (message.toLowerCase().includes('free plan')) {
        setShowPaywall(true);
      } else {
        Alert.alert('Error', message);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <Stack.Screen
        options={{
          title: name || 'Add a connection',
          headerBackTitle: 'Back',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#FDFCF8' },
          headerTintColor: '#57534E',
        }}
      />

      <View className="flex-1 px-6 pt-6">
        {/* Scrollable content area */}
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          <ProgressDots step={3} />

          <View className="items-center mb-8 mt-10">
            <View className="h-24 w-24 items-center justify-center rounded-full bg-sage mb-6 shadow-sm">
              <Ionicons name="gift" size={48} color="#fff" />
            </View>
            <Text className="text-2xl font-bold text-warmgray text-center mb-3">
              One more thing...
            </Text>
            <Text className="text-base text-warmgray-muted text-center px-4 leading-relaxed">
              Would you like to remember {name ? `${name}'s` : 'their'} birthday?
            </Text>
          </View>

          <View className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            {!showBirthdayPicker ? (
              <TouchableOpacity
                className="flex-row items-center justify-center py-4"
                onPress={() => setShowBirthdayPicker(true)}
                activeOpacity={0.7}
                disabled={saving}
              >
                <Ionicons name="gift-outline" size={24} color="#788467" style={{ marginRight: 8 }} />
                <Text className="text-lg font-semibold text-sage">
                  {birthday ? formatBirthdayDisplay(birthday) : 'Add Birthday'}
                </Text>
              </TouchableOpacity>
            ) : (
              <View>
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-base font-semibold text-warmgray">Birthday</Text>
                  <TouchableOpacity
                    onPress={() => setShowBirthdayPicker(false)}
                    activeOpacity={0.7}
                    disabled={saving}
                  >
                    <Text className="text-sm font-medium text-sage">Done</Text>
                  </TouchableOpacity>
                </View>

                <View className="py-2">
                  <BirthdayPicker
                    value={birthday}
                    onChange={setBirthday}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Start Date Selection */}
          <View className="rounded-2xl border border-border bg-surface p-5 shadow-sm mt-4">
            <TouchableOpacity
              className="flex-row items-center justify-between"
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
              disabled={saving}
            >
              <View>
                <Text className="text-base font-semibold text-warmgray">Start Reminders</Text>
                <Text className="text-sm text-warmgray-muted">{getDateLabel(startDate.getTime())}</Text>
              </View>
              <Text className="text-sm font-medium text-sage">Edit</Text>
            </TouchableOpacity>

            {showDatePicker && Platform.OS === 'ios' && (
              <View className="mt-4 pt-4 border-t border-border">
                <View className="flex-row justify-end mb-2">
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text className="text-sm font-medium text-sage">Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="spinner"
                  minimumDate={new Date()}
                  onChange={(_e, date) => date && setStartDate(date)}
                  themeVariant="light"
                  accentColor="#9CA986"
                />
              </View>
            )}

            {showDatePicker && Platform.OS === 'android' && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={(_e, date) => {
                  setShowDatePicker(false);
                  if (date) setStartDate(date);
                }}
              />
            )}
          </View>
        </ScrollView>

        {/* Fixed button at bottom - always visible */}
        <View className="pb-6 pt-4">
          <TouchableOpacity
            className="items-center justify-center rounded-2xl bg-sage h-14 shadow-sm"
            onPress={handleDone}
            activeOpacity={0.9}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-lg font-semibold text-white">Done</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <EnhancedPaywallModal visible={showPaywall} onClose={() => setShowPaywall(false)} />
    </SafeAreaView>
  );
}
