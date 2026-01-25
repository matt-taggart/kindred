import { Contact } from '@/db/schema';

export type TileVariant = 'primary' | 'secondary' | 'accent' | 'neutral';
export type TileSize = 'standard' | 'large';

export function getTileVariant(contact: Contact, isBirthday?: boolean): TileVariant {
  if (isBirthday) return 'secondary';

  const relationship = contact.relationship?.toLowerCase();

  switch (relationship) {
    case 'partner':
    case 'spouse':
      return 'secondary';
    case 'family':
      return 'primary';
    case 'friend':
      return 'accent';
    default:
      return 'neutral';
  }
}

export function getTileSize(contact: Contact): TileSize {
  const relationship = contact.relationship?.toLowerCase();

  if (relationship === 'partner' || relationship === 'spouse') {
    return 'large';
  }

  return 'standard';
}
