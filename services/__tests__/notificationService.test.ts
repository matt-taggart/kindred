import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { Contact } from '@/db/schema';
import { useUserStore } from '@/lib/userStore';
import { cancelContactReminder, scheduleDailyReminders, scheduleReminder } from '../notificationService';

const createContact = (overrides: Partial<Contact> = {}): Contact => ({
  id: 'contact-1',
  name: 'Ada',
  phone: null,
  avatarUri: null,
  bucket: 'weekly',
  customIntervalDays: null,
  lastContactedAt: null,
  nextContactDate: Date.now() + 24 * 60 * 60 * 1000,
  birthday: null,
  relationship: null,
  isArchived: false,
  ...overrides,
});

const createScheduledNotification = (identifier: string, data?: Record<string, unknown>) => ({
  identifier,
  content: { data: data ?? {} },
});

const getExpectedContactReminderCopy = (name: string) => (
  Platform.OS === 'ios'
    ? {
      title: `Reach out to ${name}`,
      body: `Check in with ${name} today.`,
    }
    : {
      title: `Reminder: Reach out to ${name}`,
      body: `${name} is ready for a check-in.`,
    }
);

describe('notificationService contact reminders', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 1, 10, 15, 0, 0, 0));
    jest.clearAllMocks();
    useUserStore.setState({
      notificationSettings: {
        frequency: 1,
        reminderTimes: ['09:00', '14:00', '19:00'],
      },
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('cancels all existing reminders for a contact before scheduling a new one', async () => {
    (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([
      createScheduledNotification('old-1', { contactId: 'contact-1' }),
      createScheduledNotification('old-2', { contactId: 'contact-1' }),
      createScheduledNotification('other', { contactId: 'contact-2' }),
    ]);

    await scheduleReminder(createContact());

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(2);
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenNthCalledWith(1, 'old-1');
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenNthCalledWith(2, 'old-2');
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        identifier: 'contact-reminder-contact-1',
        content: expect.objectContaining({
          ...getExpectedContactReminderCopy('Ada'),
          data: { type: 'contact-reminder', contactId: 'contact-1' },
        }),
      }),
    );
  });

  it('schedules overdue contacts for the next available reminder time', async () => {
    (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([
      createScheduledNotification('old-1', { contactId: 'contact-1' }),
    ]);

    const result = await scheduleReminder(
      createContact({ nextContactDate: Date.now() - 60 * 1000 }),
    );

    expect(result).toBe('mock-notification-id');
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('old-1');
    const trigger = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0].trigger;
    expect(trigger.type).toBe('date');
    expect(trigger.date.getHours()).toBe(9);
    expect(trigger.date.getMinutes()).toBe(0);
  });

  it('schedules same-day notifications at the next configured slot', async () => {
    useUserStore.setState({
      notificationSettings: {
        frequency: 3,
        reminderTimes: ['09:00', '14:00', '19:00'],
      },
    });

    await scheduleReminder(createContact({ nextContactDate: Date.now() }));

    const trigger = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0].trigger;
    expect(trigger.type).toBe('date');
    expect(trigger.date.getHours()).toBe(19);
    expect(trigger.date.getMinutes()).toBe(0);
  });

  it('schedules future contacts on the configured reminder day', async () => {
    useUserStore.setState({
      notificationSettings: {
        frequency: 1,
        reminderTimes: ['09:00', '14:00', '19:00'],
      },
    });

    const tomorrowAtThreePm = new Date(2026, 1, 11, 15, 0, 0, 0).getTime();
    await scheduleReminder(createContact({ nextContactDate: tomorrowAtThreePm }));

    const trigger = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0].trigger;
    expect(trigger.type).toBe('date');
    expect(trigger.date.getDate()).toBe(11);
    expect(trigger.date.getHours()).toBe(9);
    expect(trigger.date.getMinutes()).toBe(0);
  });

  it('schedules birthday contacts for today even when cadence date is in the future', async () => {
    useUserStore.setState({
      notificationSettings: {
        frequency: 3,
        reminderTimes: ['09:00', '14:00', '19:00'],
      },
    });

    const inTenDays = new Date(2026, 1, 20, 10, 0, 0, 0).getTime();
    await scheduleReminder(createContact({ birthday: '1990-02-10', nextContactDate: inTenDays }));

    const trigger = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0].trigger;
    expect(trigger.type).toBe('date');
    expect(trigger.date.getDate()).toBe(10);
    expect(trigger.date.getHours()).toBe(19);
    expect(trigger.date.getMinutes()).toBe(0);
  });

  it('cancelContactReminder removes both data-matched and identifier-matched reminders', async () => {
    (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([
      createScheduledNotification('legacy-one', { contactId: 'contact-1' }),
      createScheduledNotification('contact-reminder-contact-1'),
      createScheduledNotification('other', { contactId: 'contact-2' }),
    ]);

    await cancelContactReminder('contact-1');

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(2);
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenNthCalledWith(1, 'legacy-one');
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenNthCalledWith(
      2,
      'contact-reminder-contact-1',
    );
  });

  it('uses a clear fallback name when contact name is blank', async () => {
    await scheduleReminder(createContact({ name: '   ' }));

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          ...getExpectedContactReminderCopy('this connection'),
        }),
      }),
    );
  });
});

describe('notificationService daily reminders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('includes the contact name in single-contact daily reminders', async () => {
    await scheduleDailyReminders(
      [createContact({ id: 'contact-1', name: 'Ada' })],
      { frequency: 1, reminderTimes: ['09:30'] },
    );

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        identifier: 'daily-reminder-0',
        content: expect.objectContaining({
          ...getExpectedContactReminderCopy('Ada'),
          data: { type: 'daily-reminder', contactIds: ['contact-1'] },
        }),
        trigger: expect.objectContaining({ type: 'daily', hour: 9, minute: 30 }),
      }),
    );
  });

  it('includes contact names in multi-contact daily reminder titles', async () => {
    const contacts = [
      createContact({ id: 'contact-1', name: 'Ada' }),
      createContact({ id: 'contact-2', name: 'Grace' }),
      createContact({ id: 'contact-3', name: 'Linus' }),
      createContact({ id: 'contact-4', name: 'Margaret' }),
    ];

    await scheduleDailyReminders(contacts, { frequency: 1, reminderTimes: ['14:45'] });

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        identifier: 'daily-reminder-0',
        content: expect.objectContaining({
          title: Platform.OS === 'ios'
            ? 'Reach out: Ada, Grace and 2 more'
            : 'Reminder: Ada, Grace, Linus and 1 more',
          body: Platform.OS === 'ios'
            ? '4 connections are ready today.'
            : 'You have 4 connections ready today.',
          data: { type: 'daily-reminder', contactIds: ['contact-1', 'contact-2', 'contact-3', 'contact-4'] },
        }),
        trigger: expect.objectContaining({ type: 'daily', hour: 14, minute: 45 }),
      }),
    );
  });
});
