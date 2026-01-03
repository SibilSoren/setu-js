import { pgTable, serial, text, timestamp, varchar, boolean } from 'drizzle-orm/pg-core';

/**
 * Example schema - customize this for your application
 * 
 * Documentation: https://orm.drizzle.team/docs/sql-schema-declaration
 */

// Example: users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: text('name'),
  passwordHash: text('password_hash'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Export types for use in your application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

/**
 * Add more tables below as needed:
 * 
 * export const posts = pgTable('posts', {
 *   id: serial('id').primaryKey(),
 *   title: text('title').notNull(),
 *   content: text('content'),
 *   authorId: integer('author_id').references(() => users.id),
 *   createdAt: timestamp('created_at').defaultNow().notNull(),
 * });
 */
