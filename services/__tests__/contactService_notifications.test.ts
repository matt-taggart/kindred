import type { Contact } from '@/db/schema';

jest.mock('../../db/client', () => ({
  getDb: jest.fn(),
}));

jest.mock('../../lib/userStore', () => ({
  useUserStore: {
    getState: () => ({ isPro: true }),
  },
}));

jest.mock('../notificationService', () => ({
  scheduleReminder: jest.fn().mockResolvedValue('notification-id'),
  cancelContactReminder: jest.fn().mockResolvedValue(undefined),
  cancelAllReminders: jest.fn().mockResolvedValue(undefined),
}));

import { getDb } from '../../db/client';
import { cancelAllReminders, cancelContactReminder, scheduleReminder } from '../notificationService';
import { addContact, archiveContact, resetDatabase, snoozeContact, unarchiveContact } from '../contactService';

type MockDb = ReturnType<typeof createMockDb>['db'];

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

function createMockDb(seedContacts: Contact[] = []) {
  const contactsStore = [...seedContacts];
  let lastInserted: Contact | null = null;

  const db = {
    insert: jest.fn(() => ({
      values: jest.fn((vals: Contact) => {
        lastInserted = vals;
        contactsStore.push(vals);
        return { run: jest.fn() };
      }),
    })),
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          limit: jest.fn(() => ({
            all: jest.fn(() => {
              if (lastInserted) return [lastInserted];
              if (contactsStore.length > 0) return [contactsStore[0]];
              return [];
            }),
          })),
          all: jest.fn(() => contactsStore),
          orderBy: jest.fn(() => ({ all: jest.fn(() => contactsStore) })),
        })),
        all: jest.fn(() => contactsStore),
      })),
    })),
    update: jest.fn(() => ({
      set: jest.fn((updates: Partial<Contact>) => ({
        where: jest.fn(() => ({
          run: jest.fn(() => {
            if (contactsStore[0]) {
              contactsStore[0] = { ...contactsStore[0], ...updates };
            }
          }),
        })),
      })),
    })),
    delete: jest.fn(() => ({
      run: jest.fn(),
    })),
  };

  return { db, contactsStore };
}

describe('contactService notification integration', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-02-10T12:00:00.000Z'));
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('schedules a reminder when adding a contact', async () => {
    const { db } = createMockDb();
    (getDb as jest.Mock<MockDb>).mockReturnValue(db);

    await addContact({
      id: 'contact-1',
      name: 'Ada',
      bucket: 'weekly',
      nextContactDate: Date.now() + 60 * 60 * 1000,
    });

    expect(scheduleReminder).toHaveBeenCalledTimes(1);
    expect(scheduleReminder).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'contact-1' }),
    );
  });

  it('cancels an existing reminder when archiving a contact', async () => {
    const { db } = createMockDb([createContact({ id: 'contact-archive' })]);
    (getDb as jest.Mock<MockDb>).mockReturnValue(db);

    const updated = await archiveContact('contact-archive');

    expect(updated.isArchived).toBe(true);
    expect(cancelContactReminder).toHaveBeenCalledWith('contact-archive');
  });

  it('re-schedules reminder when unarchiving a contact', async () => {
    const { db } = createMockDb([
      createContact({ id: 'contact-unarchive', isArchived: true }),
    ]);
    (getDb as jest.Mock<MockDb>).mockReturnValue(db);

    const updated = await unarchiveContact('contact-unarchive');

    expect(updated.isArchived).toBe(false);
    expect(scheduleReminder).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'contact-unarchive', isArchived: false }),
    );
  });

  it('does not move reminders earlier when snoozing a birthday-due contact', async () => {
    const now = Date.now();
    const existingFutureDate = now + 10 * 24 * 60 * 60 * 1000;
    const requestedSnoozeDate = now + 24 * 60 * 60 * 1000;

    const { db } = createMockDb([
      createContact({
        id: 'contact-birthday',
        birthday: '02-10',
        nextContactDate: existingFutureDate,
      }),
    ]);
    (getDb as jest.Mock<MockDb>).mockReturnValue(db);

    const updated = await snoozeContact('contact-birthday', requestedSnoozeDate);

    expect(updated.nextContactDate).toBe(existingFutureDate);
    expect(scheduleReminder).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'contact-birthday', nextContactDate: existingFutureDate }),
    );
  });

  it('snaps snooze date to cadence boundary when within merge window', async () => {
    const cadenceAnchor = new Date('2026-02-10T09:00:00.000Z').getTime();
    const requestedSnoozeDate = new Date('2026-02-16T20:00:00.000Z').getTime();
    const nextCadenceBoundary = new Date('2026-02-17T09:00:00.000Z').getTime();

    const { db } = createMockDb([
      createContact({
        id: 'contact-weekly',
        bucket: 'weekly',
        nextContactDate: cadenceAnchor,
      }),
    ]);
    (getDb as jest.Mock<MockDb>).mockReturnValue(db);

    const updated = await snoozeContact('contact-weekly', requestedSnoozeDate);

    expect(updated.nextContactDate).toBe(nextCadenceBoundary);
  });

  it('keeps requested snooze date when not near next cadence boundary', async () => {
    const cadenceAnchor = new Date('2026-02-10T09:00:00.000Z').getTime();
    const requestedSnoozeDate = new Date('2026-02-14T12:00:00.000Z').getTime();

    const { db } = createMockDb([
      createContact({
        id: 'contact-weekly-far',
        bucket: 'weekly',
        nextContactDate: cadenceAnchor,
      }),
    ]);
    (getDb as jest.Mock<MockDb>).mockReturnValue(db);

    const updated = await snoozeContact('contact-weekly-far', requestedSnoozeDate);

    expect(updated.nextContactDate).toBe(requestedSnoozeDate);
  });

  it('cancels all reminders when resetting the database', async () => {
    const { db } = createMockDb([createContact({ id: 'contact-reset' })]);
    (getDb as jest.Mock<MockDb>).mockReturnValue(db);

    await resetDatabase();

    expect(cancelAllReminders).toHaveBeenCalledTimes(1);
    expect(db.delete).toHaveBeenCalledTimes(2);
  });
});
