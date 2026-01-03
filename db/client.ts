import { openDatabaseSync } from 'expo-sqlite/next';
import { drizzle } from 'drizzle-orm/expo-sqlite';

export const sqlite = openDatabaseSync('kindred.db');

sqlite.execSync('PRAGMA foreign_keys = ON;');

export const db = drizzle(sqlite);
