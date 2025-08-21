import { pgTable, serial, numeric, date, text } from 'drizzle-orm/pg-core';

export const batches = pgTable('batches', {
	id: serial().primaryKey().notNull(),
	averagePricePerKg: numeric('average_price_per_kg', {
		precision: 10,
		scale: 2,
	}),
	harvestDate: date('harvest_date'),
	receivedDate: date('received_date'),
	notes: text(),
});
