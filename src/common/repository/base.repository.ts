import { Inject } from '@nestjs/common';
import { DRIZZLE } from '../../drizzle/drizzle.module';
import { type DrizzleDB } from '../../drizzle/types/drizzle';
import { eq, sql } from 'drizzle-orm';
import { type SQL } from 'drizzle-orm';
import { type BaseTable } from './base.schema';
import { UUID } from 'crypto';

export abstract class BaseRepository<T, U> {
	protected abstract table: BaseTable;

	constructor(@Inject(DRIZZLE) protected db: DrizzleDB) {}

	async create(createDto: Partial<T>): Promise<U> {
		const [entity] = await this.db
			.insert(this.table)
			.values(createDto as any)
			.returning();

		return entity as U;
	}

	async findAll(): Promise<U[]> {
		return (await this.db.select().from(this.table)) as U[];
	}

	async findById(id: number | UUID): Promise<U | null> {
		const [entity] = await this.db
			.select()
			.from(this.table)
			.where(eq(this.table.id, id))
			.limit(1);

		return (entity as U) || null;
	}

	async findByField(fieldName: keyof T, value: any): Promise<U | null> {
		const [entity] = await this.db
			.select()
			.from(this.table)
			.where(eq(this.table[fieldName as string], value))
			.limit(1);

		return (entity as U) || null;
	}

	async findManyByField(fieldName: keyof T, value: any): Promise<U[]> {
		return (await this.db
			.select()
			.from(this.table)
			.where(eq(this.table[fieldName as string], value))) as U[];
	}

	async update(id: number | UUID, updateDto: Partial<T>): Promise<U | null> {
		const [updated] = await this.db
			.update(this.table)
			.set(updateDto as any)
			.where(eq(this.table.id, id))
			.returning();

		return (updated as U) || null;
	}

	async delete(id: number | UUID): Promise<U | null> {
		const [deleted] = await this.db
			.delete(this.table)
			.where(eq(this.table.id, id))
			.returning();

		return (deleted as U) || null;
	}

	async exists(id: number | UUID): Promise<boolean> {
		const entity = await this.findById(id);
		return entity !== null;
	}

	async count(): Promise<number> {
		const result = await this.db
			.select({ count: sql<number>`count(*)` })
			.from(this.table);

		return result[0].count;
	}

	async findWithCustomWhere(whereClause: SQL): Promise<U[]> {
		return (await this.db
			.select()
			.from(this.table)
			.where(whereClause)) as U[];
	}

	async updateWithCustomWhere(
		whereClause: SQL,
		updateDto: Partial<T>,
	): Promise<U[]> {
		return (await this.db
			.update(this.table)
			.set(updateDto as any)
			.where(whereClause)
			.returning()) as U[];
	}

	async deleteWithCustomWhere(whereClause: SQL): Promise<U[]> {
		return (await this.db
			.delete(this.table)
			.where(whereClause)
			.returning()) as U[];
	}
}
