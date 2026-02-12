import type { Contact } from '@/db/schema';
import { DAY_IN_MS } from '@/utils/scheduler';

jest.mock('../../db/client', () => ({
  getDb: jest.fn(),
}));

jest.mock('../../lib/userStore', () => ({
  useUserStore: {
    getState: () => ({ isPro: true }),
  },
}));

jest.mock('../notificationService', () => ({
  scheduleReminder: jest.fn().mockResolvedValue(undefined),
}));

import { getDb } from '../../db/client';
import { updateContactCadence } from '../contactService';

const createContact = (overrides: Partial<Contact> = {}): Contact => ({
  id: 'contact-1',
  name: 'Ada',
  phone: null,
  avatarUri: null,
  bucket: 'weekly',
  customIntervalDays: null,
  lastContactedAt: new Date('2026-02-01T12:00:00.000Z').getTime(),
  nextContactDate: new Date('2026-02-08T12:00:00.000Z').getTime(),
  birthday: null,
  relationship: null,
  isArchived: false,
  ...overrides,
});

function createMockDb(seedContact: Contact) {
  const contactsStore = [seedContact];

  const db = {
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          limit: jest.fn(() => ({
            all: jest.fn(() => contactsStore),
          })),
        })),
      })),
    })),
    update: jest.fn(() => ({
      set: jest.fn((updates: Partial<Contact>) => ({
        where: jest.fn(() => ({
          run: jest.fn(() => {
            contactsStore[0] = { ...contactsStore[0], ...updates };
          }),
        })),
      })),
    })),
  };

  return { db, contactsStore };
}

describe('updateContactCadence nextContactDate defaults', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-02-12T12:00:00.000Z'));
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('defaults start date to today when cadence changes and no explicit date is provided', async () => {
    const { db } = createMockDb(createContact({ bucket: 'weekly' }));
    (getDb as jest.Mock).mockReturnValue(db);

    const updated = await updateContactCadence('contact-1', 'daily');

    expect(updated.bucket).toBe('daily');
    expect(updated.nextContactDate).toBe(Date.now());
  });

  it('preserves explicit override start date when provided during cadence change', async () => {
    const explicitStart = new Date('2026-03-01T08:00:00.000Z').getTime();
    const { db } = createMockDb(createContact({ bucket: 'weekly' }));
    (getDb as jest.Mock).mockReturnValue(db);

    const updated = await updateContactCadence('contact-1', 'daily', null, explicitStart);

    expect(updated.nextContactDate).toBe(explicitStart);
  });

  it('keeps existing behavior when cadence is unchanged and no explicit date is provided', async () => {
    const lastContactedAt = new Date('2026-02-01T12:00:00.000Z').getTime();
    const { db } = createMockDb(createContact({ bucket: 'weekly', lastContactedAt }));
    (getDb as jest.Mock).mockReturnValue(db);

    const updated = await updateContactCadence('contact-1', 'weekly');

    expect(updated.nextContactDate).toBe(lastContactedAt + 7 * DAY_IN_MS);
  });
});
