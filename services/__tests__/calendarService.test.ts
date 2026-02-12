import { Contact } from '../../db/schema';

jest.mock('../contactService', () => ({
  getContacts: jest.fn(),
}));

import { getContacts } from '../contactService';
import { getCalendarData, getContactsByDate, getMonthsDueContacts } from '../calendarService';

const mockedGetContacts = getContacts as jest.MockedFunction<typeof getContacts>;

const createContact = (overrides: Partial<Contact> = {}): Contact => ({
  id: 'contact-1',
  name: 'Test Contact',
  phone: null,
  avatarUri: null,
  bucket: 'weekly',
  customIntervalDays: null,
  lastContactedAt: null,
  nextContactDate: null,
  birthday: null,
  relationship: null,
  isArchived: false,
  ...overrides,
});

describe('calendarService recurring reminders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-02-10T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('marks recurring custom cadence dates in calendar data', () => {
    const contact = createContact({
      id: 'custom-2-days',
      bucket: 'custom',
      customIntervalDays: 2,
      nextContactDate: new Date('2026-02-10T09:00:00.000Z').getTime(),
    });

    mockedGetContacts.mockReturnValue([contact]);

    const data = getCalendarData();

    expect(data['2026-02-10']).toBeDefined();
    expect(data['2026-02-12']).toBeDefined();
    expect(data['2026-02-14']).toBeDefined();
    expect(data['2026-02-11']).toBeUndefined();
  });

  it('returns recurring contacts for subsequent cadence days in agenda', () => {
    const contact = createContact({
      id: 'custom-2-days',
      bucket: 'custom',
      customIntervalDays: 2,
      nextContactDate: new Date('2026-02-10T09:00:00.000Z').getTime(),
    });

    mockedGetContacts.mockReturnValue([contact]);

    const contactsForDay = getContactsByDate('2026-02-12');

    expect(contactsForDay).toHaveLength(1);
    expect(contactsForDay[0].id).toBe('custom-2-days');
  });

  it('counts cadence contacts in later months when recurrence lands in that month', () => {
    const contact = createContact({
      id: 'custom-2-days',
      bucket: 'custom',
      customIntervalDays: 2,
      nextContactDate: new Date('2026-02-28T09:00:00.000Z').getTime(),
    });

    mockedGetContacts.mockReturnValue([contact]);

    // Month is zero-based, so 2 = March.
    expect(getMonthsDueContacts(2026, 2)).toBe(1);
  });
});
