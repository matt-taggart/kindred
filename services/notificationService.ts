import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { Contact } from '@/db/schema';
import { useUserStore, NotificationSettings } from '@/lib/userStore';

const DAILY_REMINDER_PREFIX = 'daily-reminder-';
const CONTACT_REMINDER_PREFIX = 'contact-reminder-';
const MAX_NAMES_IN_DAILY_TITLE_IOS = 2;
const MAX_NAMES_IN_DAILY_TITLE_ANDROID = 3;

const getContactReminderIdentifier = (contactId: string, suffix?: string): string =>
  suffix
    ? `${CONTACT_REMINDER_PREFIX}${contactId}-${suffix}`
    : `${CONTACT_REMINDER_PREFIX}${contactId}`;

const isBirthdayToday = (
  birthday: string | null | undefined,
  today: Date = new Date(),
): boolean => {
  if (!birthday) return false;

  const parts = birthday.split('-');
  let month: number;
  let day: number;

  if (parts.length === 3) {
    month = parseInt(parts[1], 10);
    day = parseInt(parts[2], 10);
  } else if (parts.length === 2) {
    month = parseInt(parts[0], 10);
    day = parseInt(parts[1], 10);
  } else {
    return false;
  }

  if (!Number.isInteger(month) || !Number.isInteger(day)) {
    return false;
  }

  return month === today.getMonth() + 1 && day === today.getDate();
};

const getDisplayName = (name: string | null | undefined): string => {
  const trimmed = name?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : 'this connection';
};

const getMaxNamesInDailyTitle = (): number =>
  Platform.OS === 'ios' ? MAX_NAMES_IN_DAILY_TITLE_IOS : MAX_NAMES_IN_DAILY_TITLE_ANDROID;

const getDailyReminderTitleNames = (contactNames: string[]): string => {
  const maxNamesInTitle = getMaxNamesInDailyTitle();

  if (contactNames.length <= maxNamesInTitle) {
    return contactNames.join(', ');
  }

  return `${contactNames.slice(0, maxNamesInTitle).join(', ')} and ${contactNames.length - maxNamesInTitle} more`;
};

const getContactReminderContent = (contactName: string): { title: string; body: string } => {
  if (Platform.OS === 'ios') {
    return {
      title: `Reach out to ${contactName}`,
      body: `Check in with ${contactName} today.`,
    };
  }

  return {
    title: `Reminder: Reach out to ${contactName}`,
    body: `${contactName} is ready for a check-in.`,
  };
};

const getDailyReminderContent = (
  dueContactsCount: number,
  contactNames: string[],
): { title: string; body: string } => {
  if (dueContactsCount === 1) {
    const name = contactNames[0];
    if (Platform.OS === 'ios') {
      return {
        title: `Reach out to ${name}`,
        body: `Check in with ${name} today.`,
      };
    }

    return {
      title: `Reminder: Reach out to ${name}`,
      body: `${name} is ready for a check-in.`,
    };
  }

  const titleNames = getDailyReminderTitleNames(contactNames);
  if (Platform.OS === 'ios') {
    return {
      title: `Reach out: ${titleNames}`,
      body: `${dueContactsCount} connections are ready today.`,
    };
  }

  return {
    title: `Reminder: ${titleNames}`,
    body: `You have ${dueContactsCount} connections ready today.`,
  };
};

const getContactReminderNotifications = async (contactId: string) => {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const contactReminderIdentifierPrefix = `${CONTACT_REMINDER_PREFIX}${contactId}`;

  return scheduled.filter((item) => {
    const data = item.content.data as { contactId?: string } | undefined;
    return data?.contactId === contactId || item.identifier.startsWith(contactReminderIdentifierPrefix);
  });
};

export const cancelContactReminder = async (contactId: string): Promise<void> => {
  const contactReminders = await getContactReminderNotifications(contactId);

  if (contactReminders.length === 0) return;

  await Promise.all(
    contactReminders.map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)),
  );
};

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
  await cancelContactReminder(contact.id);

  if (!contact.nextContactDate) return null;

  const hasPermission = await ensurePermissions();
  if (!hasPermission) return null;

  await ensureAndroidChannel();

  const notificationSettings = useUserStore.getState().notificationSettings;
  return scheduleContactReminder(contact, notificationSettings);
};

const parseTimeString = (timeStr: string): { hour: number; minute: number } => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return { hour: hours, minute: minutes };
};

const getValidReminderTimes = (
  notificationSettings: NotificationSettings,
): Array<{ hour: number; minute: number }> => {
  const parsed = notificationSettings.reminderTimes
    .slice(0, notificationSettings.frequency)
    .map(parseTimeString)
    .filter(({ hour, minute }) =>
      Number.isInteger(hour)
      && Number.isInteger(minute)
      && hour >= 0
      && hour <= 23
      && minute >= 0
      && minute <= 59
    )
    .sort((a, b) => (a.hour * 60 + a.minute) - (b.hour * 60 + b.minute));

  if (parsed.length > 0) {
    return parsed;
  }

  return [{ hour: 9, minute: 0 }];
};

type ResolveReminderTriggerDateOptions = {
  nowMs?: number;
  allowTodayOverride?: boolean;
};

const resolveReminderTriggerDates = (
  nextContactDateMs: number,
  notificationSettings: NotificationSettings,
  options: ResolveReminderTriggerDateOptions = {},
): Date[] => {
  const nowMs = options.nowMs ?? Date.now();
  const allowTodayOverride = options.allowTodayOverride ?? false;
  const reminderTimes = getValidReminderTimes(notificationSettings);
  const now = new Date(nowMs);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const dueDate = new Date(nextContactDateMs);
  const dueDayStart = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

  const startDay = allowTodayOverride
    ? todayStart
    : dueDayStart.getTime() > todayStart.getTime()
      ? dueDayStart
      : todayStart;

  const triggerDates: Date[] = [];
  let dayOffset = 0;
  while (dayOffset < 366) {
    const candidateDay = new Date(startDay);
    candidateDay.setDate(candidateDay.getDate() + dayOffset);

    for (const reminderTime of reminderTimes) {
      const candidate = new Date(candidateDay);
      candidate.setHours(reminderTime.hour, reminderTime.minute, 0, 0);

      if (candidate.getTime() > nowMs) {
        triggerDates.push(candidate);

        if (triggerDates.length >= reminderTimes.length) {
          return triggerDates;
        }
      }
    }

    dayOffset += 1;
  }

  return [new Date(nowMs + 60_000)];
};

const formatReminderIdentifierSuffix = (date: Date, slotIndex: number): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${year}${month}${day}-${hours}${minutes}-${slotIndex}`;
};

const scheduleContactReminder = async (
  contact: Contact,
  notificationSettings: NotificationSettings,
  nowMs: number = Date.now(),
): Promise<string | null> => {
  if (!contact.nextContactDate) return null;

  const today = new Date(nowMs);
  const contactName = getDisplayName(contact.name);
  const content = getContactReminderContent(contactName);
  const triggerDates = resolveReminderTriggerDates(contact.nextContactDate, notificationSettings, {
    nowMs,
    allowTodayOverride: isBirthdayToday(contact.birthday, today),
  });

  let firstScheduledIdentifier: string | null = null;

  for (const [slotIndex, triggerDate] of triggerDates.entries()) {
    const identifier = getContactReminderIdentifier(
      contact.id,
      formatReminderIdentifierSuffix(triggerDate, slotIndex),
    );

    const scheduledIdentifier = await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: content.title,
        body: content.body,
        data: { type: 'contact-reminder', contactId: contact.id },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
    });

    if (!firstScheduledIdentifier) {
      firstScheduledIdentifier = scheduledIdentifier;
    }
  }

  return firstScheduledIdentifier;
};

const getAllContactReminderNotificationIdentifiers = async (): Promise<string[]> => {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  const identifiers = scheduled
    .filter((item) => {
      if (item.identifier.startsWith(CONTACT_REMINDER_PREFIX)) return true;

      const data = item.content.data as { type?: string; contactId?: string } | undefined;
      return data?.type === 'contact-reminder' || typeof data?.contactId === 'string';
    })
    .map((item) => item.identifier);

  return [...new Set(identifiers)];
};

export const rescheduleContactReminders = async (
  contacts: Contact[],
  settings?: NotificationSettings,
): Promise<void> => {
  const hasPermission = await ensurePermissions();
  if (!hasPermission) return;

  await ensureAndroidChannel();

  const existingReminderIdentifiers = await getAllContactReminderNotificationIdentifiers();
  if (existingReminderIdentifiers.length > 0) {
    await Promise.all(
      existingReminderIdentifiers.map((identifier) =>
        Notifications.cancelScheduledNotificationAsync(identifier),
      ),
    );
  }

  const notificationSettings = settings ?? useUserStore.getState().notificationSettings;
  const nowMs = Date.now();

  await Promise.all(
    contacts.map((contact) => scheduleContactReminder(contact, notificationSettings, nowMs)),
  );
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

  const contactNames = dueContacts.map((c) => getDisplayName(c.name));
  const content = getDailyReminderContent(dueContacts.length, contactNames);

  const identifiers: string[] = [];

  for (let i = 0; i < frequency; i++) {
    const { hour, minute } = parseTimeString(reminderTimes[i]);

    const identifier = await Notifications.scheduleNotificationAsync({
      identifier: `${DAILY_REMINDER_PREFIX}${i}`,
      content: {
        title: content.title,
        body: content.body,
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
