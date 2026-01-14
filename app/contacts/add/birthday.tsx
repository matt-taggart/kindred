import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Platform, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  const params = useLocalSearchParams<{ name?: string; bucket?: string; customIntervalDays?: string }>();

  const name = useMemo(() => (typeof params.name === 'string' ? params.name.trim() : ''), [params.name]);
  const bucket = useMemo(() => {
    const raw = params.bucket;
    if (typeof raw !== 'string') return 'bi-weekly' as Contact['bucket'];
    return raw as Contact['bucket'];
  }, [params.bucket]);
  const customIntervalDays = useMemo(() => {
    const raw = params.customIntervalDays;
    if (!raw) return undefined;
    const days = parseInt(raw, 10);
    return isNaN(days) ? undefined : days;
  }, [params.customIntervalDays]);

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
        customIntervalDays,
        nextContactDate: customIntervalDays ? undefined : null,
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
          headerStyle: { backgroundColor: '#FDFCF8' }, // bg-cream
          headerTintColor: '#57534E', // warmgray
        }}
      />

      <View className="flex-1 px-6 pt-6">
        <ProgressDots step={3} />

        <View className="items-center mb-8 mt-10">
          <View className="h-24 w-24 items-center justify-center rounded-full bg-sage-100 mb-6 shadow-sm">
            <Text className="text-5xl">🎂</Text>
          </View>
          <Text className="text-2xl font-bold text-warmgray text-center mb-3">
            One more thing...
          </Text>
          <Text className="text-base text-warmgray-muted text-center px-4 leading-relaxed">
            Would you like to remember {name ? `${name}'s` : 'their'} birthday?
          </Text>
        </View>

        <View className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          {!birthdayEnabled ? (
            <TouchableOpacity
              className="flex-row items-center justify-center py-4"
              onPress={() => setBirthdayEnabled(true)}
              activeOpacity={0.7}
              disabled={saving}
            >
              <Ionicons name="gift-outline" size={24} color="#788467" style={{ marginRight: 8 }} />
              <Text className="text-lg font-semibold text-sage">Add Birthday</Text>
            </TouchableOpacity>
          ) : (
            <View>
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-2">
                  <View className="h-8 w-8 items-center justify-center rounded-full bg-sage-100">
                    <Ionicons name="calendar-outline" size={18} color="#788467" />
                  </View>
                  <Text className="text-base font-semibold text-warmgray">Birthday</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setBirthdayEnabled(false)}
                  activeOpacity={0.7}
                  disabled={saving}
                >
                  <Text className="text-sm font-medium text-terracotta">Remove</Text>
                </TouchableOpacity>
              </View>

              <View className="items-center py-2 bg-cream rounded-xl border border-border/50">
                <DateTimePicker
                  value={birthdayDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(_e, date) => date && setBirthdayDate(date)}
                  textColor="#57534E"
                  style={Platform.OS === 'ios' ? { height: 120 } : undefined}
                />
              </View>
              
              <Text className="mt-4 text-xs text-warmgray-muted text-center">
                We'll prioritize this over regular reminders on their birthday.
              </Text>
            </View>
          )}
        </View>

        <View className="mt-auto pb-6">
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 items-center justify-center rounded-2xl bg-surface border border-border h-14"
              onPress={() => handleSave(false)}
              activeOpacity={0.9}
              disabled={saving}
            >
              <Text className="text-lg font-semibold text-warmgray-muted">Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 items-center justify-center rounded-2xl bg-sage h-14 shadow-sm"
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
