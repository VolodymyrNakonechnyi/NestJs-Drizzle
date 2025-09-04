import { pgTable, serial, varchar, boolean } from 'drizzle-orm/pg-core';

export const receivers = pgTable('receivers', {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	phone: varchar({ length: 20 }),
	active: boolean().default(true).notNull(),
});
