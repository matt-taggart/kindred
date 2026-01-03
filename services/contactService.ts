import { asc, eq } from 'drizzle-orm';

import { db } from '../db/client';
import {
  Contact,
  NewContact,
  NewInteraction,
  contacts,
  interactions,
} from '../db/schema';
import { getNextContactDate } from '../utils/scheduler';

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2, 10);
};

type InteractionType = NewInteraction['type'];

export const addContact = async (contact: NewContact): Promise<Contact> => {
  const id = contact.id ?? generateId();
  const lastContactedAt = contact.lastContactedAt ?? undefined;
  const nextContactDate =
    contact.nextContactDate ?? getNextContactDate(contact.bucket, lastContactedAt ?? Date.now());

  db.insert(contacts)
    .values({ ...contact, id, lastContactedAt, nextContactDate })
    .run();

  const [inserted] = db
    .select()
    .from(contacts)
    .where(eq(contacts.id, id))
    .limit(1);

  if (!inserted) {
    throw new Error('Failed to insert contact');
  }

  return inserted;
};

export const getContacts = (): Contact[] => {
  return db
    .select()
    .from(contacts)
    .where(eq(contacts.isArchived, false))
    .orderBy(asc(contacts.nextContactDate));
};

export const updateInteraction = (
  contactId: Contact['id'],
  type: InteractionType,
  notes?: string,
): Contact => {
  const [contact] = db.select().from(contacts).where(eq(contacts.id, contactId)).limit(1);

  if (!contact) {
    throw new Error(`Contact not found: ${contactId}`);
  }

  const timestamp = Date.now();
  const interactionId = generateId();
  const nextContactDate = getNextContactDate(contact.bucket, timestamp);

  db.transaction((tx) => {
    tx.insert(interactions)
      .values({
        id: interactionId,
        contactId,
        date: timestamp,
        type,
        notes,
      })
      .run();

    tx.update(contacts)
      .set({
        lastContactedAt: timestamp,
        nextContactDate,
      })
      .where(eq(contacts.id, contactId))
      .run();
  });

  const [updated] = db.select().from(contacts).where(eq(contacts.id, contactId)).limit(1);

  if (!updated) {
    throw new Error('Failed to update contact after interaction');
  }

  return updated;
};
