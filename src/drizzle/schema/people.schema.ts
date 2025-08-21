import { pgTable, serial, varchar, date } from 'drizzle-orm/pg-core';
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
