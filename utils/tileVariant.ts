import { Contact } from '@/db/schema';

export type TileVariant = 'primary' | 'secondary' | 'accent' | 'neutral';
export type TileSize = 'standard' | 'large';

export function getTileVariant(contact: Contact, isBirthday?: boolean): TileVariant {
  if (isBirthday) return 'secondary';

  const relationship = contact.relationship?.toLowerCase();
  const now = Date.now();
  const overdueMs = contact.nextContactDate ? now - contact.nextContactDate : 0;
  const overdueDays = Math.floor(overdueMs / (1000 * 60 * 60 * 24));

  switch (relationship) {
    case 'partner':
    case 'spouse':
      return 'secondary';
    case 'family':
      return 'primary';
    case 'friend':
      return 'accent';
    default:
      if (overdueDays >= 7) return 'primary';
      if (overdueDays >= 1) return 'accent';
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
