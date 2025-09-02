import { Inject, Injectable } from '@nestjs/common';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { DRIZZLE } from 'src/drizzle/drizzle.module';
import { type DrizzleDB } from 'src/drizzle/types/drizzle';
import { people } from 'src/drizzle/schema/people.schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class PeopleService {
	constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

	create(createPersonDto: CreatePersonDto) {
		return this.db.insert(people).values(createPersonDto).returning();
	}

	findAll() {
		return this.db.select().from(people);
	}

	findOne(id: number) {
		return this.db.select().from(people).where(eq(people.id, id))[0];
	}

	update(id: number, updatePersonDto: UpdatePersonDto) {
		return this.db
			.update(people)
			.set(updatePersonDto)
			.where(eq(people.id, id))
			.returning();
	}

	remove(id: number) {
		return this.db.delete(people).where(eq(people.id, id)).returning();
	}
}
