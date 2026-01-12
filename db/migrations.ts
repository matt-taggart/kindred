import { getSqlite } from './client';

const MIGRATION_VERSION = '2';

let hasRunMigrations = false;

const CONTACT_TABLE_SQL = `
  CREATE TABLE contacts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    avatarUri TEXT,
    bucket TEXT NOT NULL CHECK (bucket IN ('daily','weekly','bi-weekly','every-three-weeks','monthly','every-six-months','yearly','custom')),
    customIntervalDays INTEGER,
    lastContactedAt INTEGER,
    nextContactDate INTEGER,
    birthday TEXT,
    isArchived INTEGER NOT NULL DEFAULT 0
  );
`;

const recreateContactsTableIfNeeded = () => {
  const sqlite = getSqlite();

  try {
    const result = sqlite.getAllSync('SELECT sql FROM sqlite_master WHERE type="table" AND name="contacts";');

    if (result && result.length > 0) {
      const tableSql = result[0].sql || '';

      const hasCustomColumn = tableSql.includes('customIntervalDays');
      const hasBirthdayColumn = tableSql.includes('birthday');
      const allowsCustomBucket = tableSql.includes("'custom'");
      const hasExpandedBuckets = tableSql.includes('bi-weekly') && tableSql.includes('every-three-weeks') && tableSql.includes('every-six-months');
      const needsMigration = !hasCustomColumn || !hasBirthdayColumn || !allowsCustomBucket || !hasExpandedBuckets;

      if (needsMigration) {
        console.log('Migrating contacts table to support new features...');

        sqlite.execSync('BEGIN TRANSACTION;');

        try {
          const contactsData = sqlite.getAllSync('SELECT * FROM contacts;');

          sqlite.execSync('DROP TABLE IF EXISTS contacts;');
          sqlite.execSync(CONTACT_TABLE_SQL);

          if (contactsData && contactsData.length > 0) {
            for (const row of contactsData) {
              const id = (row.id || '').replace(/'/g, "''");
              const name = (row.name || '').replace(/'/g, "''");
              const phone = (row.phone || '').replace(/'/g, "''");
              const avatarUri = (row.avatarUri || '').replace(/'/g, "''");
              const bucket = (row.bucket || '').replace(/'/g, "''");
              const customIntervalDays = row.customIntervalDays ?? null;
              const lastContactedAt = row.lastContactedAt ?? 'NULL';
              const nextContactDate = row.nextContactDate ?? 'NULL';
              const birthday = row.birthday ? `'${row.birthday.replace(/'/g, "''")}'` : 'NULL';
              const isArchived = row.isArchived ?? 0;

              sqlite.execSync(
                `INSERT INTO contacts (id, name, phone, avatarUri, bucket, customIntervalDays, lastContactedAt, nextContactDate, birthday, isArchived) VALUES ('${id}', '${name}', '${phone}', '${avatarUri}', '${bucket}', ${customIntervalDays ?? 'NULL'}, ${lastContactedAt}, ${nextContactDate}, ${birthday}, ${isArchived});`
              );
            }
          }

          sqlite.execSync('COMMIT;');
          console.log('Contact table migration completed successfully');
        } catch (error) {
          sqlite.execSync('ROLLBACK;');
          console.error('Migration failed, rolling back:', error);
          throw error;
        }
      }
    }
  } catch (error) {
    console.error('Error during migration:', error);
  }
};

export const runMigrations = () => {
  if (hasRunMigrations) return;

  const sqlite = getSqlite();

  recreateContactsTableIfNeeded();

  sqlite.execSync(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      avatarUri TEXT,
      bucket TEXT NOT NULL CHECK (bucket IN ('daily','weekly','bi-weekly','every-three-weeks','monthly','every-six-months','yearly','custom')),
      customIntervalDays INTEGER,
      lastContactedAt INTEGER,
      nextContactDate INTEGER,
      birthday TEXT,
      isArchived INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS interactions (
      id TEXT PRIMARY KEY,
      contactId TEXT NOT NULL,
      date INTEGER NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('call','text','meet')),
      notes TEXT,
      FOREIGN KEY (contactId) REFERENCES contacts(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_interactions_contactId ON interactions (contactId);
  `);

  hasRunMigrations = true;
  console.log('Migrations completed successfully');
};

// Clear all existing tables for blank slate
export const clearDatabase = () => {
  const sqlite = getSqlite();
  sqlite.execSync(`
    PRAGMA foreign_keys = OFF;
    DROP TABLE IF EXISTS interactions;
    DROP TABLE IF EXISTS contacts;
  `);
  console.log('Database cleared - working with blank slate');
};
