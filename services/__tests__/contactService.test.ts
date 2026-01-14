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
