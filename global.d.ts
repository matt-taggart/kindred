/// <reference types="nativewind/types" />

declare module '*.css';

declare module 'expo-sqlite/next' {
  import { SQLiteDatabase } from 'expo-sqlite';

  export function openDatabaseSync(name?: string): SQLiteDatabase;
}
