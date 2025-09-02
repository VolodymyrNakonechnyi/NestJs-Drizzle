import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { vehicles } from '../schema/vehicles.schema';
import { faker } from '@faker-js/faker';

export async function seedVehicles(db: NodePgDatabase<any>, count = 10) {
	const vehicleData = Array.from({ length: count }).map(() => ({
		licensePlate: faker.vehicle.vrm(),
		model: faker.vehicle.model(),
		capacityKg: faker.number
			.float({ min: 500, max: 5000, fractionDigits: 2 })
			.toFixed(2),
		active: faker.datatype.boolean(),
	}));
	const inserted = await db
		.insert(vehicles)
		.values(vehicleData)
		.returning({ id: vehicles.id });
	return inserted.map((row) => row.id);
}
