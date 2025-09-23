import { timestamp, uuid } from 'drizzle-orm/pg-core';
import z from 'zod';
import { sql } from 'drizzle-orm';
import { PgTable, PgColumn } from 'drizzle-orm/pg-core';

export const baseSchema = {
	id: uuid('id').primaryKey().defaultRandom().notNull(),
	createdAt: timestamp('created_at', { withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull()
		.$onUpdate(() => new Date()),
};

export type BaseSchema = z.infer<typeof baseSchema>;
export interface BaseTable extends PgTable {
	id: PgColumn;
	createdAt: PgColumn;
	updatedAt: PgColumn;
}
