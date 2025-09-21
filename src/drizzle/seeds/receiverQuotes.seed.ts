import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { receiverQuotes } from '../schema/receiverQuotes.schema';
import { faker } from '@faker-js/faker';

export async function seedReceiverQuotes(
	db: NodePgDatabase<any>,
	receiverIds: number[],
	count = 20,
) {
	const quoteData = Array.from({ length: count }).map(() => ({
		receiverId: faker.helpers.arrayElement(receiverIds),
		quotedPricePerKg: faker.number
			.float({ min: 10, max: 50, fractionDigits: 2 })
			.toFixed(2),
		quoteDate: faker.date.past().toISOString().split('T')[0],
		notes: faker.lorem.sentence(),
	}));
	const inserted = await db
		.insert(receiverQuotes)
		.values(quoteData)
		.returning({ id: receiverQuotes.id });
	return inserted.map((row) => row.id);
}
