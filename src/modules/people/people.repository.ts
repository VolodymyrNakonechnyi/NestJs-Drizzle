import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE } from '../drizzle/drizzle.module';
import { type DrizzleDB } from '../drizzle/types/drizzle';
import { people } from '../drizzle/schema/people.schema';
import { eq } from 'drizzle-orm';
import { type Person } from '../drizzle/schema/people.schema';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';

@Injectable()
export class PeopleRepository {
	constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

	async create(data: CreatePersonDto): Promise<Person | undefined> {
		const [result] = await this.db.insert(people).values(data).returning();

		return result;
	}

	async findAll(): Promise<Person[] | undefined> {
		return await this.db.select().from(people);
	}

	async findById(id: number): Promise<Person | undefined | null> {
		const [person] = await this.db
			.select()
			.from(people)
			.where(eq(people.id, id))
			.limit(1);

		return person || null;
	}

	async findByPhoneNumber(
		phoneNumber: string,
	): Promise<Person | undefined | null> {
		const [person] = await this.db
			.select()
			.from(people)
			.where(eq(people.phoneNumber, phoneNumber))
			.limit(1);

		return person || null;
	}

	async update(
		id: number,
		data: UpdatePersonDto,
	): Promise<Person | undefined | null> {
		const [updated] = await this.db
			.update(people)
			.set(data)
			.where(eq(people.id, id))
			.returning();

		return updated || null;
	}

	async delete(id: number): Promise<Person | undefined | null> {
		const [deleted] = await this.db
			.delete(people)
			.where(eq(people.id, id))
			.returning();

		return deleted || null;
	}

	async exists(id: number): Promise<boolean | undefined> {
		const person = await this.findById(id);
		return person !== null;
	}
}
