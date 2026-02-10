import { getTileVariant, getTileSize } from './tileVariant';
import { Contact } from '@/db/schema';

describe('tileVariant utilities', () => {
  const baseContact: Partial<Contact> = {
    id: '1',
    name: 'Test',
    relationship: null,
  };

  describe('getTileVariant', () => {
    it('returns secondary for partner relationship', () => {
      expect(getTileVariant({ ...baseContact, relationship: 'partner' } as Contact)).toBe('secondary');
    });

    it('returns secondary for spouse relationship', () => {
      expect(getTileVariant({ ...baseContact, relationship: 'spouse' } as Contact)).toBe('secondary');
    });

    it('returns primary for family relationship', () => {
      expect(getTileVariant({ ...baseContact, relationship: 'family' } as Contact)).toBe('primary');
    });

    it('returns accent for friend relationship', () => {
      expect(getTileVariant({ ...baseContact, relationship: 'friend' } as Contact)).toBe('accent');
    });

    it('returns primary for other relationships', () => {
      expect(getTileVariant({ ...baseContact, relationship: 'colleague' } as Contact)).toBe('primary');
    });

    it('returns primary for null relationship', () => {
      expect(getTileVariant({ ...baseContact, relationship: null } as Contact)).toBe('primary');
    });

    it('returns secondary when isBirthday is true', () => {
      expect(getTileVariant({ ...baseContact, relationship: 'friend' } as Contact, true)).toBe('secondary');
    });
  });

  describe('getTileSize', () => {
    it('returns large for partner relationship', () => {
      expect(getTileSize({ ...baseContact, relationship: 'partner' } as Contact)).toBe('large');
    });

    it('returns large for spouse relationship', () => {
      expect(getTileSize({ ...baseContact, relationship: 'spouse' } as Contact)).toBe('large');
    });

    it('returns standard for family relationship', () => {
      expect(getTileSize({ ...baseContact, relationship: 'family' } as Contact)).toBe('standard');
    });

    it('returns standard for null relationship', () => {
      expect(getTileSize({ ...baseContact, relationship: null } as Contact)).toBe('standard');
    });
  });
});
