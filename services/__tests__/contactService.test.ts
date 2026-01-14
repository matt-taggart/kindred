import { Contact } from '@/db/schema';
import { isBirthdayToday } from '../contactService';

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
