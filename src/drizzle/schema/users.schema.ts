import { pgTable, timestamp, varchar, boolean } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from 'drizzle-zod';
import { baseSchema } from '../../common/repository/base.schema';
import { z } from 'zod';

export const users = pgTable('users', {
	...baseSchema,
	username: varchar('username', { length: 30 }).notNull().unique(),
	password: varchar('password', { length: 255 }).notNull(),
	firstName: varchar('first_name', { length: 30 }),
	lastName: varchar('last_name', { length: 30 }),
	picture: varchar('picture', { length: 255 }),
	email: varchar('email', { length: 255 }).notNull().unique(),
	phoneNumber: varchar('phone_number', { length: 15 }).unique(),
	verifiedEmail: boolean('verified_email').default(false).notNull(),
	verifiedPhone: boolean('verified_phone').default(false).notNull(),
	lastPasswordChange: timestamp('last_password_change', {
		withTimezone: true,
	})
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
});

export type UserDB = typeof users.$inferSelect;

export const userSelectSchema = createSelectSchema(users, {
	createdAt: z.date(),
	updatedAt: z.date(),
	lastPasswordChange: z.date(),
});
export type User = z.infer<typeof userSelectSchema>;

export const userInsertSchema = createInsertSchema(users, {
	lastPasswordChange: z.date().optional(),
}).omit({
	id: true,
	createdAt: true,
	updatedAt: true,
	lastPasswordChange: true,
	verifiedEmail: true,
	verifiedPhone: true,
});
export type UserInsert = z.infer<typeof userInsertSchema>;

export const userUpdateSchema = createUpdateSchema(users, {
	lastPasswordChange: z.date().optional(),
})
	.omit({
		id: true,
		createdAt: true,
		updatedAt: true,
		lastPasswordChange: true,
		verifiedEmail: true,
		verifiedPhone: true,
	})
	.partial();
export type UserUpdate = z.infer<typeof userUpdateSchema>;

export const userIdSchema = userSelectSchema.pick({ id: true });

export const loginSchema = userSelectSchema
	.pick({
		email: true,
		password: true,
	})
	.strict();
