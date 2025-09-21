import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { people } from '../schema/people.schema';
import { faker } from '@faker-js/faker';

export async function seedPeople(db: NodePgDatabase<any>, count = 50) {
	const peopleData = Array.from({ length: count }).map(() => ({
		fullName: faker.person.fullName(),
		nickname: faker.person.firstName(),
		phoneNumber: faker.phone.number({ style: 'international' }),
	}));
	const inserted = await db
		.insert(people)
		.values(peopleData)
		.returning({ id: people.id });
	return inserted.map((row) => row.id);
}
