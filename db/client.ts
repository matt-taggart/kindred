import { Platform } from 'react-native';
import type { SQLiteDatabase } from 'expo-sqlite/next';
import { drizzle, type ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';

let sqlite: SQLiteDatabase | null = null;
let dbInstance: ExpoSQLiteDatabase | null = null;

export function getSqlite(): SQLiteDatabase {
  if (sqlite) return sqlite;
  getDb(); // Initializes both
  if (!sqlite) throw new Error('Failed to initialize SQLite');
  return sqlite;
}

export function getDb(): ExpoSQLiteDatabase {
  if (dbInstance) return dbInstance;

  if (Platform.OS === 'web') {
    throw new Error('SQLite is not supported on web');
  }

  // Use require to avoid bundling issues on web, though Platform check guards it.
  const { openDatabaseSync } = require('expo-sqlite/next');

  sqlite = openDatabaseSync('kindred.db') as SQLiteDatabase;
  
  // Enable foreign keys
  sqlite.execSync('PRAGMA foreign_keys = ON;');

  dbInstance = drizzle(sqlite);
  return dbInstance;
}
