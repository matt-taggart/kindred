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

export const getContactCount = (): number => {
  const db = getDb();
  const [row] = db
    .select({ total: count() })
    .from(contacts)
    .where(eq(contacts.isArchived, false))
    .limit(1)
    .all();
  return row?.total ?? 0;
};

export const getAvailableSlots = (): number => {
  const isPro = useUserStore.getState().isPro;
  if (isPro) return Infinity;
  const currentCount = getContactCount();
  return Math.max(0, CONTACT_LIMIT - currentCount);
};

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2, 10);
};

type InteractionType = NewInteraction['type'];
type InsertableContact = Omit<NewContact, 'id'> & { id?: string };

const normalizeCustomInterval = (bucket: Contact['bucket'], customIntervalDays?: number | null) => {
  if (bucket !== 'custom') return null;
  if (!customIntervalDays || customIntervalDays < 1 || customIntervalDays > 365) {
    throw new Error('Custom reminders require a valid interval');
  }
  return customIntervalDays;
};

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
  const customIntervalDays = normalizeCustomInterval(contact.bucket, contact.customIntervalDays);
  const nextContactDate =
    contact.nextContactDate ?? getNextContactDate(contact.bucket, lastContactedAt ?? Date.now(), customIntervalDays);

  db.insert(contacts)
    .values({ ...contact, id, lastContactedAt, nextContactDate, customIntervalDays })
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
  const now = new Date();
  const nowMs = now.getTime();

  // Fetch all active contacts to check for birthdays and due dates in JS
  const allContacts: Contact[] = db
    .select()
    .from(contacts)
    .where(eq(contacts.isArchived, false))
    .all();

  return allContacts
    .filter((contact: Contact) => {
      const isDue = !contact.lastContactedAt || (contact.nextContactDate !== null && contact.nextContactDate <= nowMs);
      const isBirthday = isBirthdayToday(contact, now);
      return isDue || isBirthday;
    })
    .sort((a: Contact, b: Contact) => {
      // Priority: Birthday > Overdue/Due
      const aBirthday = isBirthdayToday(a, now);
      const bBirthday = isBirthdayToday(b, now);

      if (aBirthday && !bBirthday) return -1;
      if (!aBirthday && bBirthday) return 1;

      return (a.nextContactDate || 0) - (b.nextContactDate || 0);
    });
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
  const nextContactDate = getNextContactDate(contact.bucket, timestamp, contact.customIntervalDays);

  db.transaction((tx: any) => {
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

export const snoozeContact = async (
  contactId: Contact['id'],
  untilDate: number,
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

  db.update(contacts)
    .set({ nextContactDate: untilDate })
    .where(eq(contacts.id, contactId))
    .run();

  const [updated] = db
    .select()
    .from(contacts)
    .where(eq(contacts.id, contactId))
    .limit(1)
    .all();

  if (!updated) {
    throw new Error('Failed to snooze contact');
  }

  try {
    await scheduleReminder(updated);
  } catch (error) {
    console.warn('Failed to schedule reminder', error);
  }

  return updated;
};

export const updateContactCadence = async (
  contactId: Contact['id'],
  newBucket: Contact['bucket'],
  customIntervalDays?: number | null,
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

  const normalizedCustomDays = normalizeCustomInterval(newBucket, customIntervalDays ?? contact.customIntervalDays);
  const lastContactedAt = contact.lastContactedAt || Date.now();
  const nextContactDate = getNextContactDate(newBucket, lastContactedAt, normalizedCustomDays);

  db.update(contacts)
    .set({
      bucket: newBucket,
      customIntervalDays: newBucket === 'custom' ? normalizedCustomDays : null,
      nextContactDate,
    })
    .where(eq(contacts.id, contactId))
    .run();

  const [updated] = db
    .select()
    .from(contacts)
    .where(eq(contacts.id, contactId))
    .limit(1)
    .all();

  if (!updated) {
    throw new Error('Failed to update contact reminders');
  }

  try {
    await scheduleReminder(updated);
  } catch (error) {
    console.warn('Failed to schedule reminder', error);
  }

  return updated;
};

export const addNoteOnly = async (
  contactId: Contact['id'],
  notes: string,
  type: InteractionType = 'call',
): Promise<Interaction> => {
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

  db.insert(interactions)
    .values({
      id: interactionId,
      contactId,
      date: timestamp,
      type,
      notes,
    })
    .run();

  const [inserted] = db
    .select()
    .from(interactions)
    .where(eq(interactions.id, interactionId))
    .limit(1)
    .all();

  if (!inserted) {
    throw new Error('Failed to insert interaction');
  }

  return inserted;
};

export const resetDatabase = async (): Promise<void> => {
  const db = getDb();

  db.delete(interactions).run();
  db.delete(contacts).run();
};

export const updateContact = async (
  contactId: Contact['id'],
  updates: Partial<Pick<Contact, 'name' | 'phone' | 'birthday' | 'avatarUri'>>,
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

  db.update(contacts)
    .set(updates)
    .where(eq(contacts.id, contactId))
    .run();

  const [updated] = db
    .select()
    .from(contacts)
    .where(eq(contacts.id, contactId))
    .limit(1)
    .all();

  if (!updated) {
    throw new Error('Failed to update contact');
  }

  return updated;
};

export const isBirthdayToday = (contact: Contact, today: Date = new Date()): boolean => {
  if (!contact.birthday) return false;

  try {
    // Expected format: YYYY-MM-DD or MM-DD
    const parts = contact.birthday.split('-');
    let bMonth: number, bDay: number;

    if (parts.length === 3) {
      bMonth = parseInt(parts[1], 10);
      bDay = parseInt(parts[2], 10);
    } else if (parts.length === 2) {
      bMonth = parseInt(parts[0], 10);
      bDay = parseInt(parts[1], 10);
    } else {
      return false;
    }

    const tMonth = today.getMonth() + 1; // 0-indexed
    const tDay = today.getDate();

    return bMonth === tMonth && bDay === tDay;
  } catch (e) {
    console.warn('Error parsing birthday', e);
    return false;
  }
};

export type ReminderPriority = 'birthday' | 'standard';

export const getReminderPriority = (contact: Contact, today: Date = new Date()): ReminderPriority => {
  if (isBirthdayToday(contact, today)) {
    return 'birthday';
  }
  return 'standard';
};
