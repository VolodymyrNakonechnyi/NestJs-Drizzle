import { Injectable, Inject } from '@nestjs/common';
import { type DrizzleDB } from '../drizzle/types/drizzle';
import { DRIZZLE } from '../drizzle/drizzle.module';
import { UUID } from 'crypto';
import { UserInsert, users, UserUpdate } from '../drizzle/schema/users.schema';
import { eq } from 'drizzle-orm';
import { User } from '../drizzle/schema/users.schema';

@Injectable()
export class UsersRepository {
	constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

	async findById(id: UUID): Promise<User | null> {
		const [person] = await this.db
			.select()
			.from(users)
			.where(eq(users.userId, id))
			.limit(1);

		return person || null;
	}

	async findByEmail(email: string): Promise<User | null> {
		const [person] = await this.db
			.select()
			.from(users)
			.where(eq(users.email, email))
			.limit(1);
		return person || null;
	}

	async findByUsername(username: string): Promise<User | null> {
		const [person] = await this.db
			.select()
			.from(users)
			.where(eq(users.username, username))
			.limit(1);
		return person || null;
	}

	async create(user: UserInsert): Promise<User> {
		const [newUser] = await this.db
			.insert(users)
			.values({
				...user,
			})
			.returning();
		return newUser;
	}

	async update(userId: UUID, user: UserUpdate): Promise<User> {
		const [updatedUser] = await this.db
			.update(users)
			.set({
				...user,
			})
			.where(eq(users.userId, userId))
			.returning();
		return updatedUser;
	}

	async delete(userId: UUID): Promise<void> {
		await this.db.delete(users).where(eq(users.userId, userId));
	}

	async verifyEmail(userId: UUID): Promise<User> {
		const [updatedUser] = await this.db
			.update(users)
			.set({
				verifiedEmail: true,
			})
			.where(eq(users.userId, userId))
			.returning();
		return updatedUser;
	}

	async verifyPhone(userId: UUID): Promise<User> {
		const [updatedUser] = await this.db
			.update(users)
			.set({
				verifiedPhone: true,
			})
			.where(eq(users.userId, userId))
			.returning();
		return updatedUser;
	}

	async setPassword(userId: UUID, hashedPassword: string): Promise<User> {
		const [updatedUser] = await this.db
			.update(users)
			.set({
				password: hashedPassword,
			})
			.where(eq(users.userId, userId))
			.returning();
		return updatedUser;
	}
}
