import {
	pgTable,
	index,
	foreignKey,
	serial,
	numeric,
	integer,
	date,
	boolean,
	varchar,
	text,
	unique,
	pgView,
	bigint,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const harvests = pgTable('harvests', {
	id: serial().primaryKey().notNull(),
	quantityKg: numeric('quantity_kg', { precision: 10, scale: 2 }).notNull(),
	costPerKg: numeric('cost_per_kg', { precision: 10, scale: 2 }),
	harvesterId: integer('harvester_id').notNull(),
	harvestDate: date('harvest_date')
		.default(sql`CURRENT_DATE`)
		.notNull(),
	additionalPayment: numeric('additional_payment', {
		precision: 10,
		scale: 2,
	}).default('0'),
	isPurchased: boolean('is_purchased').default(false).notNull(),
	batchId: integer('batch_id'),
});
