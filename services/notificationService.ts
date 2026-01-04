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

  await Notifications.setNotificationChannelAsync('test-notifications', {
    name: 'Test Notifications',
    importance: Notifications.AndroidImportance.HIGH,
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

export const sendTestNotification = async (): Promise<{ success: boolean; error?: string }> => {
  const hasPermission = await ensurePermissions();
  if (!hasPermission) {
    return { success: false, error: 'Notification permissions not granted' };
  }

  await ensureAndroidChannel();

  try {
    const testDate = new Date(Date.now() + 2000);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📬 Test Notification',
        body: 'This is a test notification from Kindred. Notifications are working!',
        sound: true,
        vibrate: [0, 250, 250, 250],
      },
      trigger: testDate,
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to schedule test notification',
    };
  }
};
