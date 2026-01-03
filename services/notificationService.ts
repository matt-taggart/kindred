import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { Contact } from '@/db/schema';

const ensurePermissions = async (): Promise<boolean> => {
  const current = await Notifications.getPermissionsAsync();

  if (current.granted) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
};

const ensureAndroidChannel = async () => {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync('reminders', {
    name: 'Reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
};

export const scheduleReminder = async (contact: Contact): Promise<string | null> => {
  if (!contact.nextContactDate) return null;

  const hasPermission = await ensurePermissions();
  if (!hasPermission) return null;

  await ensureAndroidChannel();

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const existing = scheduled.find(
    (item) => (item.content.data as { contactId?: string } | undefined)?.contactId === contact.id,
  );

  if (existing) {
    await Notifications.cancelScheduledNotificationAsync(existing.identifier);
  }

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: `Time to catch up with ${contact.name}`,
      body: "It's been a while.",
      data: { contactId: contact.id },
    },
    trigger: new Date(contact.nextContactDate),
  });

  return identifier;
};
