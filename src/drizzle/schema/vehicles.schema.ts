import {
	pgTable,
	serial,
	varchar,
	numeric,
	boolean,
} from 'drizzle-orm/pg-core';

export const vehicles = pgTable('vehicles', {
	id: serial().primaryKey().notNull(),
	licensePlate: varchar('license_plate', { length: 50 }).notNull(),
	model: varchar({ length: 100 }),
	capacityKg: numeric('capacity_kg', { precision: 10, scale: 2 }),
	active: boolean().default(true).notNull(),
});
