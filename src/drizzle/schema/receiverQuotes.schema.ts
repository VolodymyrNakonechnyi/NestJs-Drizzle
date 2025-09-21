import {
	pgTable,
	serial,
	integer,
	numeric,
	date,
	text,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const receiverQuotes = pgTable('receiver_quotes', {
	id: serial().primaryKey().notNull(),
	receiverId: integer('receiver_id').notNull(),
	quotedPricePerKg: numeric('quoted_price_per_kg', {
		precision: 10,
		scale: 2,
	}).notNull(),
	quoteDate: date('quote_date')
		.default(sql`CURRENT_DATE`)
		.notNull(),
	notes: text(),
});
