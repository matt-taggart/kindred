import { Stack, useRouter } from 'expo-router';
import * as Contacts from 'expo-contacts';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { EnhancedPaywallModal } from '@/components/EnhancedPaywallModal';
import { LimitReachedError, addContact } from '@/services/contactService';

type ImportableContact = {
  id: string;
  name: string;
  phone: string;
  avatarUri?: string;
};

const getName = (contact: Contacts.Contact) => {
  const parts = [contact.firstName, contact.lastName].filter(Boolean).join(' ').trim();
  return (contact.name ?? parts).trim() || 'Unnamed Contact';
};

const toImportable = (contact: Contacts.Contact): ImportableContact | null => {
  const phoneNumber = contact.phoneNumbers?.find((entry) => entry.number?.trim());

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
}: {
  contact: ImportableContact;
  selected: boolean;
  onToggle: () => void;
}) => {
  const initial = useMemo(() => contact.name.charAt(0).toUpperCase(), [contact.name]);

  return (
    <TouchableOpacity
      className="mb-3 flex-row items-center rounded-xl border border-gray-200 bg-white p-4"
      onPress={onToggle}
      activeOpacity={0.85}
    >
      {contact.avatarUri ? (
        <Image source={{ uri: contact.avatarUri }} className="h-10 w-10 rounded-full" />
      ) : (
        <View className="h-10 w-10 items-center justify-center rounded-full bg-sage">
          <Text className="text-sm font-semibold text-white">{initial}</Text>
        </View>
      )}

      <View className="ml-3 flex-1">
        <Text className="text-base font-semibold text-gray-900">{contact.name}</Text>
        <Text className="text-sm text-gray-500">{contact.phone}</Text>
      </View>

      <View className="h-6 w-6 items-center justify-center rounded border bg-white border-gray-300">
        <View
          className={`h-5 w-5 items-center justify-center rounded ${
            selected ? 'bg-sage' : 'bg-white'
          }`}
        >
          {selected ? <Text className="text-xs font-bold text-white">✓</Text> : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function ImportContactsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<ImportableContact[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

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

  const handleImportPress = useCallback(async () => {
    setPermissionDenied(false);
    setLoading(true);

    try {
      const { status } = await Contacts.requestPermissionsAsync();

      if (status !== Contacts.PermissionStatus.GRANTED) {
        setPermissionDenied(true);
        setContacts([]);
        setSelected(new Set());
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Image],
        sort: Contacts.SortTypes.FirstName,
      });

      const withPhones: ImportableContact[] = data
        .map(toImportable)
        .filter((item): item is ImportableContact => Boolean(item));

      setContacts(withPhones);
      setSelected(new Set());
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (saving || selected.size === 0) {
      return;
    }

    setSaving(true);

    try {
      const chosen = contacts.filter((contact) => selected.has(contact.id));

      for (const contact of chosen) {
        await addContact({ name: contact.name, phone: contact.phone, bucket: 'monthly' });
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
  }, [contacts, router, selected, saving]);

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
              />
            )}
            ListHeaderComponent={
              <View className="pb-3">
                <View className="mb-3 rounded-2xl border border-sage-100 bg-white p-5 shadow-sm">
                  <Text className="text-xs font-semibold uppercase tracking-wide text-sage">Import</Text>
                  <Text className="mt-1 text-xl font-bold text-gray-900">Bring your people to Kindred</Text>
                  <Text className="mt-2 text-sm text-gray-600">
                    Grant permission to read your phone contacts, pick who you want to bring in, and save them to
                    your Kindred list.
                  </Text>

                  <TouchableOpacity
                    className="mt-4 items-center rounded-xl bg-sage py-4"
                    onPress={handleImportPress}
                    activeOpacity={0.9}
                  >
                    <Text className="text-base font-semibold text-white">Import from Phone</Text>
                  </TouchableOpacity>
                </View>

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

      <EnhancedPaywallModal visible={showPaywall} onClose={() => setShowPaywall(false)} />
    </SafeAreaView>
  );
}
