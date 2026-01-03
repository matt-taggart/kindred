import { useRouter } from 'expo-router';
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

import { PaywallModal } from '@/components/PaywallModal';
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
      className="mb-2 flex-row items-center rounded-xl border border-gray-200 bg-white p-3"
      onPress={onToggle}
      activeOpacity={0.85}
    >
      {contact.avatarUri ? (
        <Image source={{ uri: contact.avatarUri }} className="h-10 w-10 rounded-full" />
      ) : (
        <View className="h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
          <Text className="text-sm font-semibold text-indigo-700">{initial}</Text>
        </View>
      )}

      <View className="ml-3 flex-1">
        <Text className="text-base font-semibold text-gray-900">{contact.name}</Text>
        <Text className="text-sm text-gray-500">{contact.phone}</Text>
      </View>

      <View
        className={`h-5 w-5 items-center justify-center rounded border ${
          selected ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300 bg-white'
        }`}
      >
        {selected ? <Text className="text-xs font-bold text-white">✓</Text> : null}
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
    <SafeAreaView className="flex-1 bg-gray-50 px-4 pt-4">
      <Text className="mb-3 text-2xl font-bold text-gray-900">Import Contacts</Text>
      <Text className="mb-4 text-sm text-gray-600">
        Grant permission to read your phone contacts, pick who you want to bring in, and save them
        to your Kindred list.
      </Text>

      <TouchableOpacity
        className="mb-4 items-center rounded-xl bg-indigo-600 py-3"
        onPress={handleImportPress}
        activeOpacity={0.9}
      >
        <Text className="text-base font-semibold text-white">Import from Phone</Text>
      </TouchableOpacity>

      {permissionDenied ? (
        <View className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
          <Text className="text-sm text-red-700">
            Permission denied. Please enable contact access in your device settings to import.
          </Text>
        </View>
      ) : null}

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : (
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
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-12">
              <Text className="text-base text-gray-500">No contacts loaded yet.</Text>
              <Text className="text-sm text-gray-400">Tap "Import from Phone" to begin.</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 24, flexGrow: contacts.length === 0 ? 1 : undefined }}
        />
      )}

      <TouchableOpacity
        className={`mb-4 items-center rounded-xl py-3 ${
          selected.size > 0 && !saving ? 'bg-green-600' : 'bg-gray-300'
        }`}
        onPress={handleSave}
        activeOpacity={0.9}
        disabled={selected.size === 0 || saving}
      >
        <Text className={`text-base font-semibold ${selected.size > 0 && !saving ? 'text-white' : 'text-gray-600'}`}>
          {saving ? 'Importing...' : `Import Selected (${selected.size})`}
        </Text>
      </TouchableOpacity>

      <PaywallModal visible={showPaywall} onClose={() => setShowPaywall(false)} />
    </SafeAreaView>
  );
}
