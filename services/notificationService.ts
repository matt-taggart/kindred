import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { Contact } from '@/db/schema';
import { useUserStore, NotificationSettings } from '@/lib/userStore';

const DAILY_REMINDER_PREFIX = 'daily-reminder-';

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
      title: `It might be a good time to connect with ${contact.name}.`,
      body: 'A gentle nudge from Kindred.',
      data: { contactId: contact.id },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(contact.nextContactDate) },
  });

  return identifier;
};

const parseTimeString = (timeStr: string): { hour: number; minute: number } => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return { hour: hours, minute: minutes };
};

const cancelDailyReminders = async () => {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const dailyReminders = scheduled.filter((item) => item.identifier.startsWith(DAILY_REMINDER_PREFIX));

  await Promise.all(
    dailyReminders.map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)),
  );
};

export const scheduleDailyReminders = async (
  dueContacts: Contact[],
  settings?: NotificationSettings,
): Promise<string[]> => {
  const hasPermission = await ensurePermissions();
  if (!hasPermission) return [];

  await ensureAndroidChannel();
  await cancelDailyReminders();

  if (dueContacts.length === 0) return [];

  const notificationSettings = settings ?? useUserStore.getState().notificationSettings;
  const { frequency, reminderTimes } = notificationSettings;

  const contactNames = dueContacts.map((c) => c.name);
  const title =
    dueContacts.length === 1
      ? `It might be a good time to connect with ${contactNames[0]}.`
      : `${dueContacts.length} connections are ready today`;
  const body =
    dueContacts.length === 1
      ? 'A gentle nudge from Kindred.'
      : contactNames.slice(0, 3).join(', ') + (dueContacts.length > 3 ? ` and ${dueContacts.length - 3} more` : '');

  const identifiers: string[] = [];

  for (let i = 0; i < frequency; i++) {
    const { hour, minute } = parseTimeString(reminderTimes[i]);

    const identifier = await Notifications.scheduleNotificationAsync({
      identifier: `${DAILY_REMINDER_PREFIX}${i}`,
      content: {
        title,
        body,
        data: { type: 'daily-reminder', contactIds: dueContacts.map((c) => c.id) },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });

    identifiers.push(identifier);
  }

  return identifiers;
};

export const cancelAllReminders = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};
