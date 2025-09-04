import { pgTable, serial, varchar, date } from 'drizzle-orm/pg-core';
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from 'drizzle-zod';
import z from 'zod';
import { sql } from 'drizzle-orm';

export const people = pgTable('people', {
	id: serial().primaryKey().notNull(),
	fullName: varchar('full_name', { length: 255 }).notNull(),
	nickname: varchar({ length: 100 }),
	phoneNumber: varchar('phone_number', { length: 20 }),
	registrationDate: date('registration_date')
		.default(sql`CURRENT_DATE`)
		.notNull(),
});

export const personIdSchema = z.object({
	id: z.coerce.number().int().positive(),
});
export type PersonId = z.infer<typeof personIdSchema>;

export const personSelectSchema = createSelectSchema(people);
export type Person = z.infer<typeof personSelectSchema>;

export const personInsertSchema = createInsertSchema(people);
export type PersonInsert = z.infer<typeof personInsertSchema>;

export const personUpdateSchema = createUpdateSchema(people);
export type PersonUpdate = z.infer<typeof personUpdateSchema>;

export const personDeleteSchema = personSelectSchema.pick({ id: true });
export type PersonDelete = z.infer<typeof personDeleteSchema>;
