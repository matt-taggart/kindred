import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Platform, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import type { Contact } from '@/db/schema';
import { addContact, getAvailableSlots } from '@/services/contactService';
import { useUserStore } from '@/lib/userStore';
import { EnhancedPaywallModal } from '@/components/EnhancedPaywallModal';
import BirthdayPicker from '@/components/BirthdayPicker';
import { AddFlowLayout } from '@/components';
import { formatBirthdayDisplay } from '@/utils/formatters';
import { getDateLabel } from '@/utils/scheduler';
import Colors from '@/constants/Colors';

export default function AddConnectionBirthdayScreen() {
  const router = useRouter();
  const { isPro } = useUserStore();
  const params = useLocalSearchParams<{
    name?: string;
    relationship?: string;
    bucket?: string;
    customIntervalDays?: string;
  }>();

  const name = useMemo(
    () => (typeof params.name === 'string' ? params.name.trim() : ''),
    [params.name]
  );
  const relationship = useMemo(
    () => (typeof params.relationship === 'string' ? params.relationship.trim() : ''),
    [params.relationship]
  );
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

  const saveContact = async (includeBirthday: boolean) => {
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
      await addContact({
        name,
        relationship: relationship || null,
        bucket,
        customIntervalDays,
        birthday: includeBirthday && birthday ? birthday : null,
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

  const handleDone = () => saveContact(true);
  const handleSkip = () => saveContact(false);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <AddFlowLayout
        currentStep={3}
        title="Add their birthday"
        subtitle="We'll remind you when it's coming up"
        onBack={() => router.back()}
        onNext={handleDone}
        nextLabel="Save"
        nextDisabled={saving}
        showBackButton
      >
        {/* Birthday Card */}
        <View className="bg-surface-card rounded-2xl border border-stroke-soft p-4">
          {!showBirthdayPicker ? (
            <TouchableOpacity
              className="flex-row items-center py-2"
              onPress={() => setShowBirthdayPicker(true)}
              activeOpacity={0.7}
              disabled={saving}
            >
              <View className="w-10 h-10 rounded-full border border-accent-border bg-accent-soft items-center justify-center mr-3">
                <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
              </View>
              <Text className={birthday ? 'text-lg text-text-strong' : 'text-lg text-text-muted/60'}>
                {birthday ? formatBirthdayDisplay(birthday) : 'Select a date...'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View>
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-base font-semibold text-text-strong">Birthday</Text>
                <TouchableOpacity
                  onPress={() => setShowBirthdayPicker(false)}
                  activeOpacity={0.7}
                  disabled={saving}
                >
                  <Text className="text-sm font-medium text-primary">Done</Text>
                </TouchableOpacity>
              </View>

              <View className="py-2">
                <BirthdayPicker value={birthday} onChange={setBirthday} />
              </View>
            </View>
          )}
        </View>

        {/* Start Date Card */}
        <View className="bg-surface-card rounded-2xl border border-stroke-soft p-4 mt-4">
          <TouchableOpacity
            className="flex-row items-center justify-between"
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
            disabled={saving}
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-sage-light items-center justify-center mr-3">
                <Ionicons name="time-outline" size={20} color={Colors.primary} />
              </View>
              <View>
                <Text className="text-base font-semibold text-text-strong">Start Reminders</Text>
                <Text className="text-sm text-text-muted">{getDateLabel(startDate.getTime())}</Text>
              </View>
            </View>
            <Text className="text-sm font-medium text-primary">Edit</Text>
          </TouchableOpacity>

          {showDatePicker && Platform.OS === 'ios' && (
            <View className="mt-4 pt-4 border-t border-stroke-soft">
              <View className="flex-row justify-end mb-2">
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text className="text-sm font-medium text-primary">Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={startDate}
                mode="date"
                display="spinner"
                minimumDate={new Date()}
                onChange={(_e, date) => date && setStartDate(date)}
                themeVariant="light"
                accentColor={Colors.primary}
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

        {/* Skip hint */}
        <Text className="text-sm text-text-muted/70 text-center mt-4">
          You can always add this later
        </Text>
      </AddFlowLayout>

      <EnhancedPaywallModal visible={showPaywall} onClose={() => setShowPaywall(false)} />
    </>
  );
}
