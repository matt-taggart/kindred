import { and, asc, count, desc, eq, isNull, lte, or } from 'drizzle-orm';

import { getDb } from '../db/client';
import { Contact, Interaction, NewContact, NewInteraction, contacts, interactions } from '../db/schema';
import { useUserStore } from '../lib/userStore';
import { getNextContactDate } from '../utils/scheduler';
import { scheduleReminder } from './notificationService';

export const CONTACT_LIMIT = 5;

export class LimitReachedError extends Error {
  constructor(message = 'Contact limit reached') {
    super(message);
    this.name = 'LimitReached';
  }
}

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2, 10);
};

type InteractionType = NewInteraction['type'];
type InsertableContact = Omit<NewContact, 'id'> & { id?: string };

export const addContact = async (contact: InsertableContact): Promise<Contact> => {
  const db = getDb();
  const isPro = useUserStore.getState().isPro;

  if (!isPro) {
    const [row] = db
      .select({ total: count() })
      .from(contacts)
      .where(eq(contacts.isArchived, false))
      .limit(1)
      .all();

    const total = row?.total ?? 0;

    if (total >= CONTACT_LIMIT) {
      throw new LimitReachedError('Free plan allows up to 5 contacts.');
    }
  }

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
    .limit(1)
    .all();

  if (!inserted) {
    throw new Error('Failed to insert contact');
  }

  return inserted;
};

type GetContactsOptions = {
  includeArchived?: boolean;
  onlyArchived?: boolean;
};

export const getContacts = (options: GetContactsOptions = {}): Contact[] => {
  const db = getDb();
  const { includeArchived = false, onlyArchived = false } = options;

  let query = db.select().from(contacts);

  if (onlyArchived) {
    query = query.where(eq(contacts.isArchived, true));
  } else if (!includeArchived) {
    query = query.where(eq(contacts.isArchived, false));
  }

  return query.orderBy(asc(contacts.nextContactDate)).all();
};

export const getDueContacts = (): Contact[] => {
  const db = getDb();
  const now = Date.now();

  return db
    .select()
    .from(contacts)
    .where(
      and(
        eq(contacts.isArchived, false),
        or(isNull(contacts.lastContactedAt), lte(contacts.nextContactDate, now)),
      ),
    )
    .orderBy(asc(contacts.nextContactDate))
    .all();
};

export const archiveContact = async (contactId: Contact['id']): Promise<Contact> => {
  const db = getDb();

  const [contact] = db
    .select()
    .from(contacts)
    .where(eq(contacts.id, contactId))
    .limit(1)
    .all();

  if (!contact) {
    throw new Error(`Contact not found: ${contactId}`);
  }

  db.update(contacts)
    .set({ isArchived: true })
    .where(eq(contacts.id, contactId))
    .run();

  const [updated] = db
    .select()
    .from(contacts)
    .where(eq(contacts.id, contactId))
    .limit(1)
    .all();

  if (!updated) {
    throw new Error('Failed to archive contact');
  }

  return updated;
};

export const unarchiveContact = async (contactId: Contact['id']): Promise<Contact> => {
  const db = getDb();

  const [contact] = db
    .select()
    .from(contacts)
    .where(eq(contacts.id, contactId))
    .limit(1)
    .all();

  if (!contact) {
    throw new Error(`Contact not found: ${contactId}`);
  }

  db.update(contacts)
    .set({ isArchived: false })
    .where(eq(contacts.id, contactId))
    .run();

  const [updated] = db
    .select()
    .from(contacts)
    .where(eq(contacts.id, contactId))
    .limit(1)
    .all();

  if (!updated) {
    throw new Error('Failed to unarchive contact');
  }

  return updated;
};

export const updateInteraction = async (
  contactId: Contact['id'],
  type: InteractionType,
  notes?: string,
): Promise<Contact> => {
  const db = getDb();
  const [contact] = db
    .select()
    .from(contacts)
    .where(eq(contacts.id, contactId))
    .limit(1)
    .all();

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

  const [updated] = db
    .select()
    .from(contacts)
    .where(eq(contacts.id, contactId))
    .limit(1)
    .all();

  if (!updated) {
    throw new Error('Failed to update contact after interaction');
  }

  try {
    await scheduleReminder(updated);
  } catch (error) {
    console.warn('Failed to schedule reminder', error);
  }

  return updated;
};

export const getInteractionHistory = (contactId: Contact['id']): Interaction[] => {
  const db = getDb();

  return db
    .select()
    .from(interactions)
    .where(eq(interactions.contactId, contactId))
    .orderBy(desc(interactions.date))
    .all();
};

export const deleteInteraction = async (interactionId: Interaction['id']): Promise<void> => {
  const db = getDb();

  const [interaction] = db
    .select()
    .from(interactions)
    .where(eq(interactions.id, interactionId))
    .limit(1)
    .all();

  if (!interaction) {
    throw new Error('Interaction not found');
  }

  db.delete(interactions)
    .where(eq(interactions.id, interactionId))
    .run();
};

export const updateInteractionNote = async (
  interactionId: Interaction['id'],
  notes: string,
): Promise<void> => {
  const db = getDb();

  const [interaction] = db
    .select()
    .from(interactions)
    .where(eq(interactions.id, interactionId))
    .limit(1)
    .all();

  if (!interaction) {
    throw new Error('Interaction not found');
  }

  db.update(interactions)
    .set({ notes })
    .where(eq(interactions.id, interactionId))
    .run();
};
