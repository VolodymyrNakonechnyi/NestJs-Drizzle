import { Injectable, Inject } from '@nestjs/common';
import { type DrizzleDB } from '../drizzle/types/drizzle';
import { DRIZZLE } from '../drizzle/drizzle.module';
import { UUID } from 'crypto';
import { users } from '../drizzle/schema/users.schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class UsersRepository {
	constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

	async findById(id: UUID) {
		const [person] = await this.db
			.select()
			.from(users)
			.where(eq(users.userId, id))
			.limit(1);

		return person || null;
	}
}
