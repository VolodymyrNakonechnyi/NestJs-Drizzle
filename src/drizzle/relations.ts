import { relations } from 'drizzle-orm/relations';
import { people } from './schema/people.schema';
import { harvests } from './schema/harvest.schema';
import { batches } from './schema/batches.schema';
import { sales } from './schema/sales.schema';
import { receivers } from './schema/receivers.schema';
import { vehicles } from './schema/vehicles.schema';
import { receiverQuotes } from './schema/receiverQuotes.schema';

export const harvestsRelations = relations(harvests, ({ one }) => ({
	person: one(people, {
		fields: [harvests.harvesterId],
		references: [people.id],
	}),
	batch: one(batches, {
		fields: [harvests.batchId],
		references: [batches.id],
	}),
}));

export const peopleRelations = relations(people, ({ many }) => ({
	harvests: many(harvests),
}));

export const batchesRelations = relations(batches, ({ many }) => ({
	harvests: many(harvests),
	sales: many(sales),
}));

export const salesRelations = relations(sales, ({ one }) => ({
	batch: one(batches, {
		fields: [sales.batchId],
		references: [batches.id],
	}),
	receiver: one(receivers, {
		fields: [sales.receiverId],
		references: [receivers.id],
	}),
	vehicle: one(vehicles, {
		fields: [sales.vehicleId],
		references: [vehicles.id],
	}),
}));

export const receiversRelations = relations(receivers, ({ many }) => ({
	sales: many(sales),
	receiverQuotes: many(receiverQuotes),
}));

export const vehiclesRelations = relations(vehicles, ({ many }) => ({
	sales: many(sales),
}));

export const receiverQuotesRelations = relations(receiverQuotes, ({ one }) => ({
	receiver: one(receivers, {
		fields: [receiverQuotes.receiverId],
		references: [receivers.id],
	}),
}));
