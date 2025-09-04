import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { harvests } from '../schema/harvest.schema';
import { faker } from '@faker-js/faker';

export async function seedHarvests(
	db: NodePgDatabase<any>,
	harvesterIds: number[],
	batchIds: number[],
	count = 50,
) {
	const harvestData = Array.from({ length: count }).map(() => ({
		quantityKg: faker.number
			.float({ min: 10, max: 100, fractionDigits: 2 })
			.toFixed(2),
		costPerKg: faker.number
			.float({ min: 10, max: 50, fractionDigits: 2 })
			.toFixed(2),
		harvesterId: faker.helpers.arrayElement(harvesterIds),
		harvestDate: faker.date.past().toISOString().split('T')[0],
		additionalPayment: faker.number
			.float({ min: 0, max: 100, fractionDigits: 2 })
			.toFixed(2),
		isPurchased: faker.datatype.boolean(),
		batchId: faker.helpers.arrayElement(batchIds),
	}));
	const inserted = await db
		.insert(harvests)
		.values(harvestData)
		.returning({ id: harvests.id });
	return inserted.map((row) => row.id);
}
