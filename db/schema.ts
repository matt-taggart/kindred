import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const contacts = sqliteTable('contacts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone'),
  avatarUri: text('avatarUri'),
  bucket: text('bucket', { enum: ['daily', 'weekly', 'monthly', 'yearly'] }).notNull(),
  lastContactedAt: integer('lastContactedAt', { mode: 'number' }),
  nextContactDate: integer('nextContactDate', { mode: 'number' }),
  isArchived: integer('isArchived', { mode: 'boolean' }).notNull().default(false),
});

export const interactions = sqliteTable('interactions', {
  id: text('id').primaryKey(),
  contactId: text('contactId')
    .notNull()
    .references(() => contacts.id, { onDelete: 'cascade' }),
  date: integer('date', { mode: 'number' }).notNull(),
  type: text('type', { enum: ['call', 'text', 'meet'] }).notNull(),
  notes: text('notes'),
});

export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;
export type Interaction = typeof interactions.$inferSelect;
export type NewInteraction = typeof interactions.$inferInsert;
