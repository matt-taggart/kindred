import { sql } from 'drizzle-orm';

import { getDb } from '@/db/client';
import { contacts } from '@/db/schema';
import { addContact } from '@/services/contactService';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const demoContacts = () => {
  const now = Date.now();

  return [
    {
      name: 'Avery Chen',
      phone: '555-0191',
      bucket: 'weekly' as const,
      lastContactedAt: now - 9 * DAY_IN_MS,
    },
    {
      name: 'Miles Hart',
      phone: '555-0134',
      bucket: 'daily' as const,
      lastContactedAt: now - 2 * DAY_IN_MS,
    },
    {
      name: 'Priya Patel',
      phone: '555-0110',
      bucket: 'monthly' as const,
      lastContactedAt: now - 34 * DAY_IN_MS,
    },
    {
      name: 'Luca Fernandez',
      phone: '555-0176',
      bucket: 'yearly' as const,
      lastContactedAt: now - 210 * DAY_IN_MS,
    },
  ];
};

let seedingPromise: Promise<void> | null = null;

export const ensureDemoContacts = async () => {
  if (seedingPromise) {
    return seedingPromise;
  }

  seedingPromise = (async () => {
    const db = getDb();
    const [{ total }] = db.select({ total: sql<number>`count(*)` }).from(contacts).limit(1).all();
    const hasContacts = (total ?? 0) > 0;

    if (hasContacts) {
      return;
    }

    for (const contact of demoContacts()) {
      await addContact(contact);
    }
  })();

  try {
    await seedingPromise;
  } finally {
    seedingPromise = null;
  }
};
