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
import { addContact } from '../contactService';

describe('addContact scheduling', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-13T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.resetAllMocks();
  });

  it('defaults nextContactDate to today when passed null for a non-custom bucket', async () => {
    const now = Date.now();
    const expectedNext = now;

    let lastInserted: any;

    const db = {
      insert: jest.fn(() => ({
        values: jest.fn((vals: any) => {
          lastInserted = vals;
          return { run: jest.fn() };
        }),
      })),
      select: jest.fn(() => ({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn(() => ({
              all: jest.fn(() => [lastInserted]),
            })),
          })),
        })),
      })),
    };

    (getDb as unknown as jest.Mock).mockReturnValue(db);

    const created = await addContact({
      id: 'id-1',
      name: 'Ada',
      bucket: 'weekly',
      nextContactDate: null,
    } as any);

    expect(lastInserted.nextContactDate).toBe(expectedNext);
    expect(created.nextContactDate).toBe(expectedNext);
  });

  it('preserves explicit numeric nextContactDate when provided', async () => {
    const explicit = Date.now() + 3 * DAY_IN_MS;

    let lastInserted: any;

    const db = {
      insert: jest.fn(() => ({
        values: jest.fn((vals: any) => {
          lastInserted = vals;
          return { run: jest.fn() };
        }),
      })),
      select: jest.fn(() => ({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn(() => ({
              all: jest.fn(() => [lastInserted]),
            })),
          })),
        })),
      })),
    };

    (getDb as unknown as jest.Mock).mockReturnValue(db);

    const created = await addContact({
      id: 'id-2',
      name: 'Grace',
      bucket: 'weekly',
      nextContactDate: explicit,
    } as any);

    expect(lastInserted.nextContactDate).toBe(explicit);
    expect(created.nextContactDate).toBe(explicit);
  });
});
