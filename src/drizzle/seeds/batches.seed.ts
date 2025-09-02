import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { batches } from '../schema/batches.schema';
import { faker } from '@faker-js/faker';

export async function seedBatches(db: NodePgDatabase<any>, count = 20) {
	const batchData = Array.from({ length: count }).map(() => ({
		averagePricePerKg: faker.number
			.float({ min: 10, max: 50, fractionDigits: 2 })
			.toFixed(2),
		harvestDate: faker.date.past().toISOString().split('T')[0],
		receivedDate: faker.date.past().toISOString().split('T')[0],
		notes: faker.lorem.sentence(),
	}));
	const inserted = await db
		.insert(batches)
		.values(batchData)
		.returning({ id: batches.id });
	return inserted.map((row) => row.id);
}
