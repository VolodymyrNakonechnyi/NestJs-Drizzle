import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from 'drizzle-zod';
import z from 'zod';

export const users = pgTable('users', {
	userId: uuid('user_id').primaryKey().defaultRandom().notNull(),
	username: varchar({ length: 30 }).notNull().unique(),
	password: varchar({ length: 255 }).notNull(),
	firstName: varchar({ length: 30 }),
	lastName: varchar({ length: 30 }),
	picture: varchar({ length: 255 }),
	email: varchar({ length: 255 }).notNull().unique(),
	phoneNumber: varchar({ length: 15 }).unique(),
	createdAt: timestamp('created_at', { withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
});

export const userSelectSchema = createSelectSchema(users, {
	createdAt: z.string(),
	updatedAt: z.string(),
}).omit({
	password: true,
});
export type User = z.infer<typeof userSelectSchema>;

export const userInsertSchema = createInsertSchema(users, {
	createdAt: z.string().optional(),
	updatedAt: z.string().optional(),
}).omit({
	userId: true,
	createdAt: true,
	updatedAt: true,
});
export type UserInsert = z.infer<typeof userInsertSchema>;

export const userUpdateSchema = createUpdateSchema(users, {
	createdAt: z.string().optional(),
	updatedAt: z.string().optional(),
})
	.omit({
		userId: true,
		createdAt: true,
	})
	.partial();
export type UserUpdate = z.infer<typeof userUpdateSchema>;
