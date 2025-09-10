import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from 'drizzle-zod';
import z from 'zod';
import { createZodDto } from 'nestjs-zod';

export const users = pgTable('users', {
	userId: uuid('user_id').primaryKey().defaultRandom().notNull(),
	username: varchar({ length: 30 }).notNull().unique(),
	password: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull().unique(),
	createdAt: timestamp('created_at', { withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
});

export const userSelectSchema = createSelectSchema(users);
export type User = z.infer<typeof userSelectSchema>;

export const userInsertSchema = createInsertSchema(users);
export type UserInsert = z.infer<typeof userInsertSchema>;

export const userUpdateSchema = createUpdateSchema(users);
export type UserUpdate = z.infer<typeof userUpdateSchema>;
