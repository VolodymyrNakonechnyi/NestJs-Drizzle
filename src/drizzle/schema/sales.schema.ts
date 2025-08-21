import {
	pgTable,
	serial,
	numeric,
	integer,
	date,
	varchar,
	boolean,
	text,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const sales = pgTable('sales', {
	id: serial().primaryKey().notNull(),
	batchId: integer('batch_id').notNull(),
	receiverId: integer('receiver_id').notNull(),
	vehicleId: integer('vehicle_id'),
	quantityKg: numeric('quantity_kg', { precision: 10, scale: 2 }).notNull(),
	pricePerKg: numeric('price_per_kg', { precision: 10, scale: 2 }).notNull(),
	deliveryCost: numeric('delivery_cost', { precision: 10, scale: 2 }).default(
		'0',
	),
	saleDate: date('sale_date')
		.default(sql`CURRENT_DATE`)
		.notNull(),
	status: varchar({ length: 50 }).default('processing'),
});
