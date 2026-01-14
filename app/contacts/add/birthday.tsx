import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Platform, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

import type { Contact } from '@/db/schema';
import { addContact, getAvailableSlots } from '@/services/contactService';
import { useUserStore } from '@/lib/userStore';
import { EnhancedPaywallModal } from '@/components/EnhancedPaywallModal';

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

const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export default function AddConnectionBirthdayScreen() {
  const router = useRouter();
  const { isPro } = useUserStore();
  const params = useLocalSearchParams<{ name?: string; bucket?: string; manual?: string }>();

  const name = useMemo(() => (typeof params.name === 'string' ? params.name.trim() : ''), [params.name]);
  const bucket = useMemo(() => {
    const raw = params.bucket;
    if (typeof raw !== 'string') return 'bi-weekly' as Contact['bucket'];
    return raw as Contact['bucket'];
  }, [params.bucket]);
  const manual = params.manual === '1';

  const [birthdayEnabled, setBirthdayEnabled] = useState(false);
  const [birthdayDate, setBirthdayDate] = useState<Date>(new Date());
  const [saving, setSaving] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const handleSave = async (withBirthday: boolean) => {
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
        customIntervalDays: manual ? null : undefined,
        nextContactDate: manual ? null : undefined,
        birthday: withBirthday ? formatDate(birthdayDate) : null,
      });
      router.replace(`/contacts/${created.id}`);
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
        }}
      />

      <View className="flex-1 px-5 pt-6">
        <ProgressDots step={3} />

        <Text className="mt-8 text-2xl font-semibold text-warmgray">One more thing…</Text>
        <Text className="mt-2 text-base text-warmgray-muted">
          Would you like to remember {name ? `${name}'s` : 'their'} birthday?
        </Text>

        {!birthdayEnabled ? (
          <TouchableOpacity
            className="mt-8 items-center rounded-2xl border border-sage bg-surface py-4"
            onPress={() => setBirthdayEnabled(true)}
            activeOpacity={0.9}
            disabled={saving}
          >
            <Text className="text-lg font-semibold text-sage">Add birthday (optional)</Text>
          </TouchableOpacity>
        ) : (
          <View className="mt-8 rounded-2xl border border-border bg-surface p-4">
            <Text className="mb-3 text-base font-semibold text-warmgray">Birthday</Text>
            <DateTimePicker
              value={birthdayDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'compact' : 'default'}
              onChange={(_e, date) => date && setBirthdayDate(date)}
              accentColor="#9CA986"
            />
            <TouchableOpacity
              className="mt-4 items-center py-2"
              onPress={() => setBirthdayEnabled(false)}
              activeOpacity={0.8}
              disabled={saving}
            >
              <Text className="text-base font-semibold text-warmgray-muted">Remove</Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="mt-auto pb-6">
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 items-center rounded-2xl bg-surface border border-border py-4"
              onPress={() => handleSave(false)}
              activeOpacity={0.9}
              disabled={saving}
            >
              <Text className="text-lg font-semibold text-warmgray-muted">Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 items-center rounded-2xl bg-sage py-4"
              onPress={() => handleSave(birthdayEnabled)}
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
      </View>

      <EnhancedPaywallModal visible={showPaywall} onClose={() => setShowPaywall(false)} />
    </SafeAreaView>
  );
}
