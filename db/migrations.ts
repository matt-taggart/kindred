import { sqlite } from './client';

export const runMigrations = () => {
  sqlite.execSync(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      avatarUri TEXT,
      bucket TEXT NOT NULL CHECK (bucket IN ('daily','weekly','monthly','yearly')),
      lastContactedAt INTEGER,
      nextContactDate INTEGER,
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
};
