import { Contact } from '@/db/schema';
import { isBirthdayToday, isReminderDueTodayOrOverdue } from '../contactService';

// Mock contact factory
const createContact = (overrides: Partial<Contact> = {}): Contact => ({
  id: 'test-id',
  name: 'Test Contact',
  phone: null,
  avatarUri: null,
  bucket: 'weekly',
  customIntervalDays: null,
  lastContactedAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
  nextContactDate: Date.now(),
  birthday: null,
  isArchived: false,
  ...overrides,
});

describe('isBirthdayToday', () => {
  it('returns true when birthday matches today (YYYY-MM-DD format)', () => {
    const today = new Date(2026, 0, 13); // Jan 13, 2026 (month is 0-indexed)
    const contact = createContact({ birthday: '1990-01-13' });
    expect(isBirthdayToday(contact, today)).toBe(true);
  });

  it('returns true when birthday matches today (MM-DD format)', () => {
    const today = new Date(2026, 0, 13); // Jan 13, 2026 (month is 0-indexed)
    const contact = createContact({ birthday: '01-13' });
    expect(isBirthdayToday(contact, today)).toBe(true);
  });

  it('returns false when birthday does not match', () => {
    const today = new Date(2026, 0, 13); // Jan 13, 2026 (month is 0-indexed)
    const contact = createContact({ birthday: '1990-06-15' });
    expect(isBirthdayToday(contact, today)).toBe(false);
  });

  it('returns false when no birthday set', () => {
    const today = new Date(2026, 0, 13); // Jan 13, 2026 (month is 0-indexed)
    const contact = createContact({ birthday: null });
    expect(isBirthdayToday(contact, today)).toBe(false);
  });
});

describe('isReminderDueTodayOrOverdue', () => {
  it('returns true for reminders later today', () => {
    const now = new Date('2026-02-12T09:00:00.000Z');
    const laterToday = new Date('2026-02-12T22:00:00.000Z').getTime();
    expect(isReminderDueTodayOrOverdue(laterToday, now)).toBe(true);
  });

  it('returns false for reminders tomorrow', () => {
    const now = new Date('2026-02-12T09:00:00.000Z');
    const tomorrow = new Date('2026-02-13T09:00:00.000Z').getTime();
    expect(isReminderDueTodayOrOverdue(tomorrow, now)).toBe(false);
  });
});

// Mock modules before imports that use them
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
import {
  addContact as addContactService,
  archiveContact as archiveContactService,
  getRecentlyConnectedContacts,
  getFilterCounts,
  FilterCounts,
} from '../contactService';

describe('getRecentlyConnectedContacts', () => {
  let mockContacts: Contact[];

  beforeEach(() => {
    mockContacts = [];
    jest.clearAllMocks();

    // Create a mock database that stores contacts in memory
    const RECENTLY_CONNECTED_DAYS = 14;
    const mockDb = {
      insert: jest.fn(() => ({
        values: jest.fn((contact: Contact) => {
          mockContacts.push(contact);
          return { run: jest.fn() };
        }),
      })),
      select: jest.fn(() => ({
        from: jest.fn(() => ({
          where: jest.fn((condition?: unknown) => ({
            orderBy: jest.fn(() => ({
              all: jest.fn(() => {
                // Filter for non-archived contacts within 14-day window, sorted by lastContactedAt desc
                const cutoffMs = Date.now() - RECENTLY_CONNECTED_DAYS * 24 * 60 * 60 * 1000;
                return mockContacts
                  .filter((c) => !c.isArchived && c.lastContactedAt !== null && c.lastContactedAt >= cutoffMs)
                  .sort((a, b) => (b.lastContactedAt || 0) - (a.lastContactedAt || 0));
              }),
            })),
            limit: jest.fn(() => ({
              all: jest.fn(() => {
                // For single contact lookup by ID
                const id = mockContacts[mockContacts.length - 1]?.id;
                return mockContacts.filter((c) => c.id === id);
              }),
            })),
          })),
        })),
      })),
      update: jest.fn(() => ({
        set: jest.fn(() => ({
          where: jest.fn((condition: unknown) => ({
            run: jest.fn(() => {
              // Find and update the contact (simplified mock)
              // The last updated contact gets isArchived = true
            }),
          })),
        })),
      })),
    };

    (getDb as jest.Mock).mockReturnValue(mockDb);
  });

  // Helper to add a contact with required fields
  const addContact = (data: {
    name: string;
    bucket: Contact['bucket'];
    lastContactedAt: number;
  }): Contact => {
    const contact: Contact = {
      id: `test-${Date.now()}-${Math.random()}`,
      name: data.name,
      phone: null,
      avatarUri: null,
      bucket: data.bucket,
      customIntervalDays: null,
      lastContactedAt: data.lastContactedAt,
      nextContactDate: Date.now(),
      birthday: null,
      isArchived: false,
    };
    mockContacts.push(contact);
    return contact;
  };

  // Helper to archive a contact
  const archiveContact = (contactId: string): void => {
    const contact = mockContacts.find((c) => c.id === contactId);
    if (contact) {
      contact.isArchived = true;
    }
  };

  it('returns contacts connected within last 14 days', () => {
    const now = Date.now();
    const fiveDaysAgo = now - 5 * 24 * 60 * 60 * 1000;
    const twentyDaysAgo = now - 20 * 24 * 60 * 60 * 1000;

    addContact({
      name: 'Recent Contact',
      bucket: 'weekly',
      lastContactedAt: fiveDaysAgo,
    });

    addContact({
      name: 'Old Contact',
      bucket: 'weekly',
      lastContactedAt: twentyDaysAgo,
    });

    const recent = getRecentlyConnectedContacts();

    expect(recent).toHaveLength(1);
    expect(recent[0].name).toBe('Recent Contact');
  });

  it('excludes archived contacts', () => {
    const now = Date.now();
    const fiveDaysAgo = now - 5 * 24 * 60 * 60 * 1000;

    const contact = addContact({
      name: 'Archived Recent',
      bucket: 'weekly',
      lastContactedAt: fiveDaysAgo,
    });
    archiveContact(contact.id);

    const recent = getRecentlyConnectedContacts();

    expect(recent).toHaveLength(0);
  });

  it('sorts by most recent first', () => {
    const now = Date.now();
    const twoDaysAgo = now - 2 * 24 * 60 * 60 * 1000;
    const fiveDaysAgo = now - 5 * 24 * 60 * 60 * 1000;

    addContact({
      name: 'Five Days Ago',
      bucket: 'weekly',
      lastContactedAt: fiveDaysAgo,
    });
    addContact({
      name: 'Two Days Ago',
      bucket: 'weekly',
      lastContactedAt: twoDaysAgo,
    });

    const recent = getRecentlyConnectedContacts();

    expect(recent[0].name).toBe('Two Days Ago');
    expect(recent[1].name).toBe('Five Days Ago');
  });
});

describe('contact sorting', () => {
  it('sorts birthdays before non-birthdays', () => {
    const today = new Date(2026, 0, 13); // Jan 13, 2026
    const birthdayContact = createContact({
      id: 'birthday',
      name: 'Birthday Person',
      birthday: '01-13',
      lastContactedAt: Date.now(), // recent
    });
    const regularContact = createContact({
      id: 'regular',
      name: 'Regular Person',
      birthday: null,
      lastContactedAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
    });

    const contacts = [regularContact, birthdayContact];

    // Sort: birthdays first, then by lastContactedAt ascending (longest gap)
    const sorted = contacts.sort((a, b) => {
      const aBirthday = isBirthdayToday(a, today);
      const bBirthday = isBirthdayToday(b, today);

      if (aBirthday && !bBirthday) return -1;
      if (!aBirthday && bBirthday) return 1;

      // Within same group, sort by longest gap (oldest lastContactedAt first)
      const aLast = a.lastContactedAt || 0;
      const bLast = b.lastContactedAt || 0;
      return aLast - bLast;
    });

    expect(sorted[0].id).toBe('birthday');
    expect(sorted[1].id).toBe('regular');
  });

  it('within non-birthday group, sorts by longest gap first', () => {
    const recentContact = createContact({
      id: 'recent',
      lastContactedAt: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
    });
    const oldContact = createContact({
      id: 'old',
      lastContactedAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
    });

    const contacts = [recentContact, oldContact];

    const sorted = contacts.sort((a, b) => {
      const aLast = a.lastContactedAt || 0;
      const bLast = b.lastContactedAt || 0;
      return aLast - bLast; // ascending = oldest first
    });

    expect(sorted[0].id).toBe('old');
    expect(sorted[1].id).toBe('recent');
  });
});

describe('getFilterCounts', () => {
  let mockContacts: Contact[];

  beforeEach(() => {
    mockContacts = [];
    jest.clearAllMocks();

    // Create a mock database that stores contacts in memory
    const mockDb = {
      select: jest.fn(() => ({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            all: jest.fn(() => mockContacts),
          })),
          all: jest.fn(() => mockContacts),
        })),
      })),
    };

    (getDb as jest.Mock).mockReturnValue(mockDb);
  });

  it('returns correct counts for mixed contacts', () => {
    const now = Date.now();
    const today = new Date();

    // Active contact, not due
    mockContacts.push(
      createContact({
        id: 'active-not-due',
        name: 'Active Not Due',
        isArchived: false,
        nextContactDate: now + 7 * 24 * 60 * 60 * 1000, // 7 days in future
      })
    );

    // Active contact, due (past nextContactDate)
    mockContacts.push(
      createContact({
        id: 'active-due',
        name: 'Active Due',
        isArchived: false,
        nextContactDate: now - 24 * 60 * 60 * 1000, // 1 day in past
      })
    );

    // Archived contact
    mockContacts.push(
      createContact({
        id: 'archived',
        name: 'Archived Contact',
        isArchived: true,
        nextContactDate: now - 24 * 60 * 60 * 1000,
      })
    );

    const counts = getFilterCounts();

    expect(counts.all).toBe(2); // Non-archived contacts
    expect(counts.due).toBe(1); // Active + due
    expect(counts.archived).toBe(1); // Archived contacts
  });

  it('due includes contacts with nextContactDate in past', () => {
    const now = Date.now();

    // Contact with nextContactDate in the past
    mockContacts.push(
      createContact({
        id: 'overdue',
        name: 'Overdue Contact',
        isArchived: false,
        nextContactDate: now - 3 * 24 * 60 * 60 * 1000, // 3 days ago
      })
    );

    // Contact with nextContactDate in the future
    mockContacts.push(
      createContact({
        id: 'future',
        name: 'Future Contact',
        isArchived: false,
        nextContactDate: now + 3 * 24 * 60 * 60 * 1000, // 3 days in future
      })
    );

    const counts = getFilterCounts();

    expect(counts.due).toBe(1); // Only overdue contact
    expect(counts.all).toBe(2); // Both active contacts
  });

  it('due includes contacts with reminders later today', () => {
    const now = new Date();
    const laterToday = new Date(now);
    laterToday.setHours(23, 59, 0, 0);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    mockContacts.push(
      createContact({
        id: 'later-today',
        name: 'Later Today',
        isArchived: false,
        nextContactDate: laterToday.getTime(),
      })
    );

    mockContacts.push(
      createContact({
        id: 'tomorrow',
        name: 'Tomorrow',
        isArchived: false,
        nextContactDate: tomorrow.getTime(),
      })
    );

    const counts = getFilterCounts();

    expect(counts.due).toBe(1);
    expect(counts.all).toBe(2);
  });

  it('due includes birthday contacts', () => {
    const now = Date.now();
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayBirthday = `1990-${month}-${day}`;

    // Contact with birthday today (not otherwise due)
    mockContacts.push(
      createContact({
        id: 'birthday',
        name: 'Birthday Contact',
        isArchived: false,
        birthday: todayBirthday,
        nextContactDate: now + 30 * 24 * 60 * 60 * 1000, // 30 days in future
      })
    );

    // Contact without birthday, not due
    mockContacts.push(
      createContact({
        id: 'regular',
        name: 'Regular Contact',
        isArchived: false,
        birthday: null,
        nextContactDate: now + 7 * 24 * 60 * 60 * 1000, // 7 days in future
      })
    );

    const counts = getFilterCounts();

    expect(counts.due).toBe(1); // Only birthday contact
    expect(counts.all).toBe(2); // Both active contacts
  });

  it('handles empty database', () => {
    // mockContacts is empty

    const counts = getFilterCounts();

    expect(counts.all).toBe(0);
    expect(counts.due).toBe(0);
    expect(counts.archived).toBe(0);
  });

  it('due excludes contacts contacted today', () => {
    const now = Date.now();

    // Contact that is due but was contacted today
    mockContacts.push(
      createContact({
        id: 'contacted-today',
        name: 'Contacted Today',
        isArchived: false,
        nextContactDate: now - 24 * 60 * 60 * 1000, // Due yesterday
        lastContactedAt: now - 1000, // Contacted 1 second ago (today)
      })
    );

    // Contact that is due and was NOT contacted today
    mockContacts.push(
      createContact({
        id: 'not-contacted-today',
        name: 'Not Contacted Today',
        isArchived: false,
        nextContactDate: now - 24 * 60 * 60 * 1000, // Due yesterday
        lastContactedAt: now - 2 * 24 * 60 * 60 * 1000, // Contacted 2 days ago
      })
    );

    const counts = getFilterCounts();

    expect(counts.all).toBe(2); // Both active contacts
    expect(counts.due).toBe(1); // Only the one NOT contacted today
  });
});
