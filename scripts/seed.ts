import { sql } from 'drizzle-orm';

import { getDb } from '../db/client';
import { runMigrations } from '../db/migrations';
import { contacts } from '../db/schema';
import { addContact } from '../services/contactService';

const seedData = [
  { name: 'Alice Example', phone: '555-0100', bucket: 'weekly' as const },
  { name: 'Brian Example', phone: '555-0101', bucket: 'monthly' as const },
  { name: 'Carmen Example', phone: '555-0102', bucket: 'yearly' as const },
];

const main = async () => {
  // Note: getDb() and runMigrations() might fail in Node environment if they depend on expo-sqlite native modules.
  // For seeding in Node, a different adapter (like better-sqlite3) is typically needed.
  runMigrations();

  const db = getDb();
  const [{ count }] = db.select({ count: sql<number>`count(*)` }).from(contacts).all();
  const existingCount = Number(count ?? 0);

  if (existingCount > 0) {
    console.log('Database already has contacts; skipping seed.');
    return;
  }

  const now = Date.now();

  for (const contact of seedData) {
    await addContact({ ...contact, lastContactedAt: now });
  }

  console.log('Inserted 3 dummy contacts.');
};

main().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
