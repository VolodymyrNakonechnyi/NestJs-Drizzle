import { Inject } from '@nestjs/common';
import { DRIZZLE } from '../../drizzle/drizzle.module';
import { type DrizzleDB } from '../../drizzle/types/drizzle';
import { eq, sql } from 'drizzle-orm';
import { type SQL } from 'drizzle-orm';
import { type BaseTable } from './base.schema';
import { UUID } from 'crypto';

export interface ISerializer<TInput, TOutput> {
	serialize(data: TInput): TOutput;
	serializeMany(data: TInput[]): TOutput[];
}

export abstract class BaseRepository<TEntity, TSerializer> {
	protected abstract table: BaseTable;
	protected abstract serializer: ISerializer<TEntity, TSerializer>;

	constructor(@Inject(DRIZZLE) protected db: DrizzleDB) {}

	/**
	 * Transform single entity to public format
	 * @param model
	 */
	transform(model: TEntity): TSerializer {
		return this.serializer.serialize(model);
	}

	/**
	 * Transform multiple entities to public format
	 * @param models
	 */
	transformMany(models: TEntity[]): TSerializer[] {
		return this.serializer.serializeMany(models);
	}

	async create(createDto: Partial<TEntity>): Promise<TSerializer> {
		const [entity] = await this.db
			.insert(this.table)
			.values(createDto as any)
			.returning();

		return this.transform(entity as TEntity);
	}

	async findAll(): Promise<TSerializer[]> {
		const entities = await this.db.select().from(this.table);
		return this.transformMany(entities as TEntity[]);
	}

	async findById(id: number | UUID): Promise<TSerializer | null> {
		const [entity] = await this.db
			.select()
			.from(this.table)
			.where(eq(this.table.id, id))
			.limit(1);

		return entity ? this.transform(entity as TEntity) : null;
	}

	async findByField(
		fieldName: keyof TEntity,
		value: any,
	): Promise<TSerializer | null> {
		const [entity] = await this.db
			.select()
			.from(this.table)
			.where(eq(this.table[fieldName as string], value))
			.limit(1);

		return entity ? this.transform(entity as TEntity) : null;
	}

	async findManyByField(
		fieldName: keyof TEntity,
		value: any,
	): Promise<TSerializer[]> {
		const entities = await this.db
			.select()
			.from(this.table)
			.where(eq(this.table[fieldName as string], value));

		return this.transformMany(entities as TEntity[]);
	}

	async update(
		id: number | UUID,
		updateDto: Partial<TEntity>,
	): Promise<TSerializer | null> {
		const [updated] = await this.db
			.update(this.table)
			.set(updateDto as any)
			.where(eq(this.table.id, id))
			.returning();

		return updated ? this.transform(updated as TEntity) : null;
	}

	async delete(id: number | UUID): Promise<TSerializer | null> {
		const [deleted] = await this.db
			.delete(this.table)
			.where(eq(this.table.id, id))
			.returning();

		return deleted ? this.transform(deleted as TEntity) : null;
	}

	async exists(id: number | UUID): Promise<boolean> {
		const entity = await this.findByIdRaw(id);
		return entity !== null;
	}

	async count(): Promise<number> {
		const result = await this.db
			.select({ count: sql<number>`count(*)` })
			.from(this.table);

		return result[0].count;
	}

	async findWithCustomWhere(whereClause: SQL): Promise<TSerializer[]> {
		const entities = await this.db
			.select()
			.from(this.table)
			.where(whereClause);

		return this.transformMany(entities as TEntity[]);
	}

	async updateWithCustomWhere(
		whereClause: SQL,
		updateDto: Partial<TEntity>,
	): Promise<TSerializer[]> {
		const entities = await this.db
			.update(this.table)
			.set(updateDto as any)
			.where(whereClause)
			.returning();

		return this.transformMany(entities as TEntity[]);
	}

	async deleteWithCustomWhere(whereClause: SQL): Promise<TSerializer[]> {
		const entities = await this.db
			.delete(this.table)
			.where(whereClause)
			.returning();

		return this.transformMany(entities as TEntity[]);
	}

	/**
	 * Find entity by ID without transformation (for internal use)
	 * @param id
	 */
	protected async findByIdRaw(id: number | UUID): Promise<TEntity | null> {
		const [entity] = await this.db
			.select()
			.from(this.table)
			.where(eq(this.table.id, id))
			.limit(1);

		return (entity as TEntity) || null;
	}

	/**
	 * Find entity by field without transformation (for internal use)
	 * @param fieldName
	 * @param value
	 */
	protected async findByFieldRaw(
		fieldName: keyof TEntity,
		value: any,
	): Promise<TEntity | null> {
		const [entity] = await this.db
			.select()
			.from(this.table)
			.where(eq(this.table[fieldName as string], value))
			.limit(1);

		return (entity as TEntity) || null;
	}

	/**
	 * Find multiple entities by field without transformation (for internal use)
	 * @param fieldName
	 * @param value
	 */
	protected async findManyByFieldRaw(
		fieldName: keyof TEntity,
		value: any,
	): Promise<TEntity[]> {
		const entities = await this.db
			.select()
			.from(this.table)
			.where(eq(this.table[fieldName as string], value));

		return entities as TEntity[];
	}

	/**
	 * Find entities with custom WHERE without transformation (for internal use)
	 * @param whereClause
	 */
	protected async findWithCustomWhereRaw(
		whereClause: SQL,
	): Promise<TEntity[]> {
		const entities = await this.db
			.select()
			.from(this.table)
			.where(whereClause);

		return entities as TEntity[];
	}

	/**
	 * Create entity without transformation (for internal use)
	 * @param createDto
	 */
	protected async createRaw(createDto: Partial<TEntity>): Promise<TEntity> {
		const [entity] = await this.db
			.insert(this.table)
			.values(createDto as any)
			.returning();

		return entity as TEntity;
	}

	/**
	 * Update entity without transformation (for internal use)
	 * @param id
	 * @param updateDto
	 */
	protected async updateRaw(
		id: number | UUID,
		updateDto: Partial<TEntity>,
	): Promise<TEntity | null> {
		const [updated] = await this.db
			.update(this.table)
			.set(updateDto as any)
			.where(eq(this.table.id, id))
			.returning();

		return (updated as TEntity) || null;
	}
}
