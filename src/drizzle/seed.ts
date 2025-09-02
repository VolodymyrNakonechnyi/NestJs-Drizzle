import * as people from './schema/people.schema';
import * as batches from './schema/batches.schema';
import * as receivers from './schema/receivers.schema';
import * as vehicles from './schema/vehicles.schema';

import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema/schema';
import 'dotenv/config';

import { seedPeople } from './seeds/people.seed';
import { seedBatches } from './seeds/batches.seed';
import { seedReceivers } from './seeds/receivers.seed';
import { seedVehicles } from './seeds/vehicles.seed';
import { seedReceiverQuotes } from './seeds/receiverQuotes.seed';
import { seedHarvests } from './seeds/harvests.seed';
import { seedSales } from './seeds/sales.seed';
import { receiverQuotes } from './schema/receiverQuotes.schema';
import { sales } from './schema/sales.schema';
import { harvests } from './schema/harvest.schema';

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: false,
});

const db = drizzle(pool, { schema }) as NodePgDatabase<typeof schema>;

async function getIds(table: any, idField = 'id') {
	const rows = await db.select({ id: table[idField] }).from(table);
	return rows.map((row: any) => row.id);
}

async function main() {
	await seedPeople(db, 50);
	await seedBatches(db, 20);
	await seedReceivers(db, 10);
	await seedVehicles(db, 10);

	const peopleIds = await getIds(people.people);
	const batchIds = await getIds(batches.batches);
	const receiverIds = await getIds(receivers.receivers);
	const vehicleIds = await getIds(vehicles.vehicles);

	await seedReceiverQuotes(db, receiverIds, 20);
	await seedHarvests(db, peopleIds, batchIds, 50);
	await seedSales(db, batchIds, receiverIds, vehicleIds, 30);
	console.log('Seeding complete!');

	await pool.end();
}

main()
	.then()
	.catch((err) => {
		console.log(err);
		process.exit(0);
	});
