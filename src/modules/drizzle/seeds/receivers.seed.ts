import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { receivers } from '../schema/receivers.schema';
import { faker } from '@faker-js/faker';

export async function seedReceivers(db: NodePgDatabase<any>, count = 10) {
	const receiverData = Array.from({ length: count }).map(() => ({
		name: faker.company.name(),
		phone: faker.phone.number(),
		active: faker.datatype.boolean(),
	}));
	const inserted = await db
		.insert(receivers)
		.values(receiverData)
		.returning({ id: receivers.id });
	return inserted.map((row) => row.id);
}
