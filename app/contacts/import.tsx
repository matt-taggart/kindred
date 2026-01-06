import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as Contacts from 'expo-contacts';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  FlatList,
  Image,
  Linking,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { EnhancedPaywallModal } from '@/components/EnhancedPaywallModal';
import FrequencyBadge from '@/components/FrequencyBadge';

import { Contact as DbContact } from '@/db/schema';
import { LimitReachedError, addContact as importContact } from '@/services/contactService';
import { formatPhoneNumber } from '@/utils/phone';

type Bucket = DbContact['bucket'];

const bucketLabels: Record<Bucket, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

const bucketColors: Record<Bucket, string> = {
  daily: 'bg-terracotta-100',
  weekly: 'bg-sage-100',
  monthly: 'bg-blue-100',
  yearly: 'bg-purple-100',
};

const bucketDescriptions: Record<Bucket, string> = {
  daily: 'Every day',
  weekly: 'Every 7 days',
  monthly: 'Every 30 days',
  yearly: 'Every 365 days',
};

type ImportableContact = {
  id: string;
  name: string;
  phone: string;
  avatarUri?: string;
};

const getName = (contact: any) => {
  const parts = [contact.firstName, contact.lastName].filter(Boolean).join(' ').trim();
  return (contact.name ?? parts).trim() || 'Unnamed Contact';
};

const toImportable = (contact: any): ImportableContact | null => {
  const phoneNumber = contact.phoneNumbers?.find((entry: any) => entry.number?.trim());

  if (!phoneNumber?.number) {
    return null;
  }

  return {
    id: contact.id,
    name: getName(contact),
    phone: phoneNumber.number.trim(),
    avatarUri: contact.imageAvailable ? contact.image?.uri ?? undefined : undefined,
  };
};

const ContactRow = ({
  contact,
  selected,
  onToggle,
  frequency,
  onFrequencyChange,
}: {
  contact: ImportableContact;
  selected: boolean;
  onToggle: () => void;
  frequency: Bucket;
  onFrequencyChange: (bucket: Bucket) => void;
}) => {
  const initial = useMemo(() => contact.name.charAt(0).toUpperCase(), [contact.name]);

  return (
    <TouchableOpacity
      className="mb-3 rounded-xl border border-gray-200 bg-white p-4"
      onPress={onToggle}
      activeOpacity={0.85}
    >
      <View className="flex-row items-center gap-3">
        {contact.avatarUri ? (
          <Image source={{ uri: contact.avatarUri }} className="h-10 w-10 rounded-full" />
        ) : (
          <View className="h-10 w-10 items-center justify-center rounded-full bg-sage">
            <Text className="text-sm font-semibold text-white">{initial}</Text>
          </View>
        )}

        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">{contact.name}</Text>
          <Text className="text-sm text-gray-500">{formatPhoneNumber(contact.phone)}</Text>
        </View>

        <FrequencyBadge bucket={frequency} onPress={() => onFrequencyChange(frequency)} />

        <TouchableOpacity
          className="h-6 w-6 items-center justify-center rounded border bg-white border-gray-300"
          onPress={onToggle}
          activeOpacity={0.7}
        >
          <View
            className={`h-5 w-5 items-center justify-center rounded ${
              selected ? 'bg-sage' : 'bg-white'
            }`}
          >
            {selected ? <Text className="text-xs font-bold text-white">✓</Text> : null}
          </View>
        </TouchableOpacity>
      </View>

    </TouchableOpacity>
  );
};

export default function ImportContactsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ autoRequest?: string }>();
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<ImportableContact[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [contactFrequencies, setContactFrequencies] = useState<Record<string, Bucket>>({});
  const [showFrequencySelector, setShowFrequencySelector] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);

  const shouldAutoRequest = useMemo(() => {
    const value = params.autoRequest;
    if (Array.isArray(value)) {
      return value.includes('1') || value.includes('true');
    }
    return value === '1' || value === 'true';
  }, [params.autoRequest]);

  const loadContacts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Image],
        sort: Contacts.SortTypes.FirstName,
      });

      const withPhones: ImportableContact[] = data
        .map(toImportable)
        .filter((item): item is ImportableContact => Boolean(item));

      setContacts(withPhones);
      setSelected(new Set());

      const initialFrequencies = withPhones.reduce(
        (acc, contact) => {
          acc[contact.id] = 'weekly';
          return acc;
        },
        {} as Record<string, Bucket>,
      );
      setContactFrequencies(initialFrequencies);
      setEditingContactId(null);
      setShowFrequencySelector(false);
      setPermissionDenied(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const requestPermissionAndLoad = useCallback(async () => {
    setPermissionDenied(false);
    setLoading(true);

    try {
      const permission = await Contacts.requestPermissionsAsync();

      if (permission.status !== Contacts.PermissionStatus.GRANTED) {
        setPermissionDenied(true);
        setContacts([]);
        setSelected(new Set());

        if (!permission.canAskAgain) {
          Alert.alert(
            'Permission needed',
            'Enable contact access in Settings to import from your address book.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings?.() },
            ],
          );
        }
        return;
      }

      await loadContacts();
    } finally {
      setLoading(false);
    }
  }, [loadContacts]);

  useEffect(() => {
    const initialize = async () => {
      const permission = await Contacts.getPermissionsAsync();

      if (permission.status === Contacts.PermissionStatus.GRANTED) {
        await loadContacts();
        return;
      }

      if (shouldAutoRequest) {
        await requestPermissionAndLoad();
      }
    };

    initialize();
  }, [loadContacts, requestPermissionAndLoad, shouldAutoRequest]);

  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        const permission = await Contacts.getPermissionsAsync();
        if (permission.status === Contacts.PermissionStatus.GRANTED) {
          await loadContacts();
        }
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, [loadContacts]);

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selected.size === contacts.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(contacts.map((c) => c.id)));
    }
  }, [contacts, selected]);

  const handleFrequencyChange = useCallback((contactId: string) => {
    setEditingContactId(contactId);
    setShowFrequencySelector(true);
  }, []);

  const handleSelectFrequency = useCallback(
    (bucket: Bucket) => {
      if (editingContactId) {
        setContactFrequencies((prev) => ({
          ...prev,
          [editingContactId]: bucket,
        }));
      }
      setShowFrequencySelector(false);
      setEditingContactId(null);
    },
    [editingContactId],
  );

  const handleSetAllFrequency = useCallback(
    (bucket: Bucket) => {
      const newFrequencies = contacts.reduce(
        (acc, contact) => {
          acc[contact.id] = bucket;
          return acc;
        },
        {} as Record<string, Bucket>,
      );
      setContactFrequencies(newFrequencies);
    },
    [contacts],
  );

  const handleImportPress = useCallback(async () => {
    await requestPermissionAndLoad();
  }, [requestPermissionAndLoad]);

  const handleAddMoreContacts = useCallback(() => {
    Alert.alert(
      'Add More Contacts',
      'To share more contacts with Kindred, update your contact access in Settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: async () => {
            await Linking.openSettings();
          },
        },
      ],
    );
  }, []);

  const handleSave = useCallback(async () => {
    if (saving || selected.size === 0) {
      return;
    }

    setSaving(true);

    try {
      const chosen = contacts.filter((contact) => selected.has(contact.id));

      for (const contact of chosen) {
        await importContact({
          name: contact.name,
          phone: contact.phone,
          bucket: contactFrequencies[contact.id] || 'weekly',
          avatarUri: contact.avatarUri,
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
  }, [contacts, router, selected, saving, contactFrequencies]);

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <Stack.Screen
        options={{
          title: 'Import Contacts',
          headerBackTitle: 'Contacts',
          headerShadowVisible: false,
          headerTitleStyle: { fontSize: 18, fontWeight: '700' },
        }}
      />

      {loading ? (
        <View className="flex-1 items-center justify-center px-4">
          <ActivityIndicator size="large" color="#9CA986" />
          <Text className="mt-3 text-sm font-semibold text-gray-700">Fetching contacts...</Text>
        </View>
      ) : (
        <View className="flex-1 px-4 pt-4">
          <FlatList
            data={contacts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ContactRow
                contact={item}
                selected={selected.has(item.id)}
                onToggle={() => toggleSelect(item.id)}
                frequency={contactFrequencies[item.id] || 'weekly'}
                onFrequencyChange={() => handleFrequencyChange(item.id)}
              />
            )}
            ListHeaderComponent={
              <View className="pb-3">
                <View className="mb-6 rounded-2xl border border-sage-100 bg-white p-5 shadow-sm">
                  <Text className="text-xs font-semibold uppercase tracking-wide text-sage">Import</Text>
                  <Text className="mt-1 text-xl font-bold text-gray-900">
                    {contacts.length > 0 ? 'Select contacts to import' : 'Bring your people to Kindred'}
                  </Text>
                  <Text className="mt-2 text-sm text-gray-600">
                    {contacts.length > 0
                      ? 'Choose which contacts you want to add to Kindred.'
                      : 'Grant permission to read your phone contacts, pick who you want to bring in, and save them to your Kindred list.'}
                  </Text>

                  {contacts.length === 0 ? (
                    <TouchableOpacity
                      className="mt-4 items-center rounded-xl bg-sage py-4"
                      onPress={handleImportPress}
                      activeOpacity={0.9}
                    >
                      <Text className="text-base font-semibold text-white">Import from Phone</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      className="mt-4 items-center rounded-xl border-2 border-sage bg-transparent py-4"
                      onPress={handleAddMoreContacts}
                      activeOpacity={0.9}
                    >
                      <Text className="text-base font-semibold text-sage">Add More Contacts</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {contacts.length > 0 && (
                  <TouchableOpacity
                    className="mb-2 flex-row items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                    onPress={handleSelectAll}
                    activeOpacity={0.7}
                  >
                    <Text className="text-base font-semibold text-gray-900">Select All</Text>
                    <View
                      className={`h-6 w-6 items-center justify-center rounded border border-gray-300 ${
                        selected.size === contacts.length ? 'bg-sage border-sage' : 'bg-white'
                      }`}
                    >
                      <View
                        className={`h-5 w-5 items-center justify-center rounded ${
                          selected.size === contacts.length ? 'bg-sage' : 'bg-white'
                        }`}
                      >
                        {selected.size === contacts.length ? <Text className="text-xs font-bold text-white">✓</Text> : null}
                      </View>
                    </View>
                  </TouchableOpacity>
                )}

                {permissionDenied ? (
                  <View className="rounded-2xl border border-red-200 bg-red-50 p-4">
                    <Text className="text-sm font-semibold text-red-700">Permission denied</Text>
                    <Text className="mt-1 text-sm text-red-600">
                      Enable contact access in Settings to import from your address book.
                    </Text>
                  </View>
                ) : null}
              </View>
            }
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-12">
                <Text className="text-base font-semibold text-gray-900">No contacts loaded yet.</Text>
                <Text className="mt-2 text-sm text-center text-gray-500">
                  Tap "Import from Phone" to begin and pick people to bring into Kindred.
                </Text>
              </View>
            }
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: 140,
              paddingTop: 4,
              flexGrow: contacts.length === 0 ? 1 : undefined,
            }}
          />
        </View>
      )}

      <View className="border-t border-gray-200 bg-white px-4 pb-4 pt-3">
        <TouchableOpacity
          className={`items-center rounded-xl py-4 ${selected.size > 0 && !saving ? 'bg-sage' : 'bg-gray-200'}`}
          onPress={handleSave}
          activeOpacity={0.9}
          disabled={selected.size === 0 || saving}
        >
          <Text className={`text-base font-semibold ${selected.size > 0 && !saving ? 'text-white' : 'text-gray-600'}`}>
            {saving ? 'Importing...' : `Import Selected (${selected.size})`}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showFrequencySelector}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFrequencySelector(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/50 px-6">
          <View className="w-full rounded-2xl bg-white p-6 shadow-lg">
            <Text className="mb-2 text-lg font-bold text-slate">Check-in frequency</Text>
            {editingContactId && (
              <Text className="mb-4 text-base text-slate-600">
                How often should you check in with {contacts.find((c) => c.id === editingContactId)?.name}?
              </Text>
            )}

            <ScrollView>
              {(['daily', 'weekly', 'monthly', 'yearly'] as Bucket[]).map((bucket) => (
                <TouchableOpacity
                  key={bucket}
                  className={`mb-3 rounded-2xl border-2 p-4 ${
                    contactFrequencies[editingContactId || ''] === bucket
                      ? 'border-sage bg-sage-10'
                      : 'border-gray-200 bg-white'
                  }`}
                  onPress={() => handleSelectFrequency(bucket)}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text
                        className={`text-base font-semibold ${
                          contactFrequencies[editingContactId || ''] === bucket
                            ? 'text-slate'
                            : 'text-slate-700'
                        }`}
                      >
                        {bucketLabels[bucket]}
                      </Text>
                      <Text className="mt-1 text-sm text-slate-500">{bucketDescriptions[bucket]}</Text>
                    </View>
                    <View
                      className={`h-6 w-6 rounded-full border-2 ${
                        contactFrequencies[editingContactId || ''] === bucket
                          ? 'border-sage bg-sage'
                          : 'border-gray-300'
                      }`}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              className="mt-4 items-center rounded-xl bg-gray-100 py-3"
              onPress={() => setShowFrequencySelector(false)}
              activeOpacity={0.7}
            >
              <Text className="font-semibold text-slate-600">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


      <EnhancedPaywallModal visible={showPaywall} onClose={() => setShowPaywall(false)} />
    </SafeAreaView>
  );
}
