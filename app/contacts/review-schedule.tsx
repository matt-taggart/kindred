import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { EnhancedPaywallModal } from '@/components/EnhancedPaywallModal';
import FrequencyBadge from '@/components/FrequencyBadge';

import { LimitReachedError, addContact } from '@/services/contactService';
import {
  DAY_IN_MS,
  DistributionResult,
  bucketOffsets,
  distributeContacts,
  getDateLabel,
  groupByDate,
} from '@/utils/scheduler';

type ContactToImport = {
  id: string;
  name: string;
  phone: string;
  avatarUri?: string;
  bucket: 'daily' | 'weekly' | 'bi-weekly' | 'every-three-weeks' | 'monthly' | 'every-six-months' | 'yearly' | 'custom';
  customIntervalDays?: number | null;
};

const bucketLabels: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  'bi-weekly': 'Bi-weekly',
  'every-three-weeks': 'Every 3 weeks',
  monthly: 'Monthly',
  'every-six-months': 'Every 6 months',
  yearly: 'Yearly',
  custom: 'Custom',
};

export default function ReviewScheduleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ contacts: string }>();

  const [distributedContacts, setDistributedContacts] = useState<DistributionResult[]>([]);
  const [contactsData, setContactsData] = useState<ContactToImport[]>([]);
  const [saving, setSaving] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (params.contacts) {
      try {
        const parsed: ContactToImport[] = JSON.parse(params.contacts);
        setContactsData(parsed);

        const distributed = distributeContacts(
          parsed.map((c) => ({
            id: c.id,
            name: c.name,
            bucket: c.bucket,
            customIntervalDays: c.customIntervalDays,
          })),
        );
        setDistributedContacts(distributed);
      } catch (e) {
        Alert.alert('Error', 'Failed to parse contacts data');
        router.back();
      }
    }
  }, [params.contacts, router]);

  const groupedByDate = useMemo(() => {
    const grouped = groupByDate(distributedContacts);
    const sortedEntries = Array.from(grouped.entries()).sort(
      ([a], [b]) => new Date(a).getTime() - new Date(b).getTime(),
    );
    return sortedEntries;
  }, [distributedContacts]);

  const stats = useMemo(() => {
    const totalDays = groupedByDate.length;
    const maxPerDay = Math.max(...groupedByDate.map(([, contacts]) => contacts.length), 0);
    const avgPerDay = totalDays > 0 ? (distributedContacts.length / totalDays).toFixed(1) : '0';
    return { totalDays, maxPerDay, avgPerDay };
  }, [groupedByDate, distributedContacts]);

  const handleEditDate = useCallback((contactId: string) => {
    const contact = distributedContacts.find((c) => c.id === contactId);
    if (contact) {
      setEditingContactId(contactId);
      setSelectedDate(new Date(contact.nextContactDate));
      setShowDatePicker(true);
    }
  }, [distributedContacts]);

  const handleDateChange = useCallback(
    (_event: any, date?: Date) => {
      if (Platform.OS === 'android') {
        setShowDatePicker(false);
      }

      if (date && editingContactId) {
        setDistributedContacts((prev) =>
          prev.map((c) =>
            c.id === editingContactId ? { ...c, nextContactDate: date.getTime() } : c,
          ),
        );
      }
    },
    [editingContactId],
  );

  const handleConfirmDate = useCallback(() => {
    if (editingContactId) {
      setDistributedContacts((prev) =>
        prev.map((c) =>
          c.id === editingContactId ? { ...c, nextContactDate: selectedDate.getTime() } : c,
        ),
      );
    }
    setShowDatePicker(false);
    setEditingContactId(null);
  }, [editingContactId, selectedDate]);

  const handleImport = useCallback(async () => {
    if (saving) return;
    setSaving(true);

    try {
      for (const distributed of distributedContacts) {
        const original = contactsData.find((c) => c.id === distributed.id);
        if (!original) continue;

        await addContact({
          name: original.name,
          phone: original.phone,
          bucket: original.bucket,
          avatarUri: original.avatarUri,
          customIntervalDays: original.customIntervalDays,
          nextContactDate: distributed.nextContactDate,
        });
      }

      router.replace('/');
    } catch (error) {
      if (error instanceof LimitReachedError || (error as Error)?.name === 'LimitReached') {
        setShowPaywall(true);
        return;
      }
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to import contacts.');
    } finally {
      setSaving(false);
    }
  }, [distributedContacts, contactsData, router, saving]);

  const editingContact = useMemo(
    () => distributedContacts.find((c) => c.id === editingContactId),
    [distributedContacts, editingContactId],
  );

  if (distributedContacts.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-cream items-center justify-center">
        <ActivityIndicator size="large" color="#9CA986" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <Stack.Screen
        options={{
          title: 'Review Schedule',
          headerBackTitle: 'Back',
          headerShadowVisible: false,
          headerTitleStyle: { fontSize: 18, fontWeight: '700' },
        }}
      />

      <FlatList
        data={groupedByDate}
        keyExtractor={([dateKey]) => dateKey}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 140, paddingTop: 8 }}
        ListHeaderComponent={
          <View className="mb-4">
            <View className="rounded-2xl border border-sage-100 bg-white p-5 shadow-sm mb-4">
              <Text className="text-xs font-semibold uppercase tracking-wide text-sage">
                Schedule Preview
              </Text>
              <Text className="mt-1 text-xl font-bold text-gray-900">
                Your reminders are spread out
              </Text>
              <Text className="mt-2 text-sm text-gray-600">
                Kindred has distributed your {distributedContacts.length} contacts across{' '}
                {stats.totalDays} days (~{stats.avgPerDay} per day). Tap any contact to adjust
                their start date.
              </Text>
            </View>

            <View className="flex-row gap-3 mb-2">
              <View className="flex-1 rounded-xl bg-white border border-gray-200 p-3">
                <Text className="text-2xl font-bold text-sage">{stats.totalDays}</Text>
                <Text className="text-xs text-gray-500">Days covered</Text>
              </View>
              <View className="flex-1 rounded-xl bg-white border border-gray-200 p-3">
                <Text className="text-2xl font-bold text-sage">{stats.avgPerDay}</Text>
                <Text className="text-xs text-gray-500">Avg per day</Text>
              </View>
              <View className="flex-1 rounded-xl bg-white border border-gray-200 p-3">
                <Text className="text-2xl font-bold text-sage">{stats.maxPerDay}</Text>
                <Text className="text-xs text-gray-500">Max per day</Text>
              </View>
            </View>
          </View>
        }
        renderItem={({ item: [dateKey, contacts] }) => (
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2 px-1">
              {getDateLabel(new Date(dateKey).getTime())}
            </Text>
            {contacts.map((contact) => (
              <TouchableOpacity
                key={contact.id}
                className="mb-2 rounded-xl border border-gray-200 bg-white p-4"
                onPress={() => handleEditDate(contact.id)}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">{contact.name}</Text>
                    <Text className="text-sm text-gray-500">{bucketLabels[contact.bucket]}</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-xs text-sage">Tap to edit</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />

      <View className="border-t border-gray-200 bg-white px-4 pb-4 pt-3">
        <TouchableOpacity
          className={`items-center rounded-xl py-4 ${!saving ? 'bg-sage' : 'bg-gray-200'}`}
          onPress={handleImport}
          activeOpacity={0.9}
          disabled={saving}
        >
          <Text className={`text-base font-semibold ${!saving ? 'text-white' : 'text-gray-600'}`}>
            {saving ? 'Importing...' : 'Looks Good - Import All'}
          </Text>
        </TouchableOpacity>
      </View>

      {Platform.OS === 'ios' ? (
        <Modal
          visible={showDatePicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View className="flex-1 items-center justify-center bg-black/50 px-6">
            <View className="w-full rounded-2xl bg-white p-6 shadow-lg">
              <Text className="mb-2 text-lg font-bold text-slate">Adjust Start Date</Text>
              {editingContact && (
                <Text className="mb-4 text-base text-slate-600">
                  When should {editingContact.name}'s first reminder appear?
                </Text>
              )}

              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                minimumDate={new Date()}
                maximumDate={new Date(Date.now() + 365 * DAY_IN_MS)}
                onChange={(_e, date) => date && setSelectedDate(date)}
              />

              <View className="flex-row gap-3 mt-4">
                <TouchableOpacity
                  className="flex-1 items-center rounded-xl bg-gray-100 py-3"
                  onPress={() => {
                    setShowDatePicker(false);
                    setEditingContactId(null);
                  }}
                  activeOpacity={0.7}
                >
                  <Text className="font-semibold text-slate-600">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 items-center rounded-xl bg-sage py-3"
                  onPress={handleConfirmDate}
                  activeOpacity={0.7}
                >
                  <Text className="font-semibold text-white">Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      ) : (
        showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            minimumDate={new Date()}
            maximumDate={new Date(Date.now() + 365 * DAY_IN_MS)}
            onChange={handleDateChange}
          />
        )
      )}

      <EnhancedPaywallModal visible={showPaywall} onClose={() => setShowPaywall(false)} />
    </SafeAreaView>
  );
}
