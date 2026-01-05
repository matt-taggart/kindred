import { Platform } from 'react-native';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

let sqlite: any = null;
let dbInstance: any = null;

export function getSqlite(): any {
  if (sqlite) return sqlite;
  getDb();
  if (!sqlite) throw new Error('Failed to initialize SQLite');
  return sqlite;
}

export function getDb(): any {
  if (dbInstance) return dbInstance;

  if (Platform.OS === 'web') {
    throw new Error('SQLite is not supported on web');
  }

  sqlite = openDatabaseSync('kindred.db');
  sqlite.execSync('PRAGMA foreign_keys = ON;');

  dbInstance = drizzle(sqlite);
  return dbInstance;
}
