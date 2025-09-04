import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sales } from '../schema/sales.schema';
import { faker } from '@faker-js/faker';

export async function seedSales(
	db: NodePgDatabase<any>,
	batchIds: number[],
	receiverIds: number[],
	vehicleIds: number[],
	count = 30,
) {
	const salesData = Array.from({ length: count }).map(() => ({
		batchId: faker.helpers.arrayElement(batchIds),
		receiverId: faker.helpers.arrayElement(receiverIds),
		vehicleId: faker.helpers.arrayElement(vehicleIds),
		quantityKg: faker.number
			.float({ min: 10, max: 100, fractionDigits: 2 })
			.toFixed(2),
		pricePerKg: faker.number
			.float({ min: 10, max: 50, fractionDigits: 2 })
			.toFixed(2),
		deliveryCost: faker.number
			.float({ min: 0, max: 100, fractionDigits: 2 })
			.toFixed(2),
		saleDate: faker.date.past().toISOString().split('T')[0],
		status: faker.helpers.arrayElement([
			'processing',
			'completed',
			'cancelled',
		]),
	}));
	const inserted = await db
		.insert(sales)
		.values(salesData)
		.returning({ id: sales.id });
	return inserted.map((row) => row.id);
}
