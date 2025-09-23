import { Injectable, Inject } from '@nestjs/common';
import { type DrizzleDB } from '../../drizzle/types/drizzle';
import { DRIZZLE } from '../../drizzle/drizzle.module';
import { UUID } from 'crypto';
import { eq, and, gt, or } from 'drizzle-orm';
import { User } from '../../drizzle/schema/users.schema';
import { users } from '../../drizzle/schema/users.schema';
import { BaseRepository } from 'src/common/repository/base.repository';
import { PublicUser, UserSerializer } from './serializer/user.serializer';
import { HashingService } from '../../shared/crypto/services/hashing.service';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersRepository extends BaseRepository<User, PublicUser> {
	protected table = users;
	protected serializer = UserSerializer;

	constructor(
		@Inject(DRIZZLE) db: DrizzleDB,
		private readonly hashingService: HashingService,
	) {
		super(db);
	}

	/**
	 * Store new user
	 * @param createUserDto
	 * @param token
	 */
	async store(
		createUserDto: CreateUserDto,
		token: string,
	): Promise<PublicUser> {
		if (createUserDto.password) {
			createUserDto.password = await this.hashingService.hash(
				createUserDto.password,
			);
		}

		const user = await this.createRaw(createUserDto);
		return this.transform(user);
	}

	/**
	 * Login user - повертає повні дані для валідації
	 * @param userLoginDto
	 */
	async login(
		userLoginDto: LoginUserDto,
	): Promise<[user: User | null, error: string | null, code: number | null]> {
		const { email, password } = userLoginDto;

		const user = await this.findWithCustomWhereRaw(
			eq(users.email, email),
		).then((users) => users[0] || null);

		if (user && (await this.validatePassword(password, user.password))) {
			return [user, null, null];
		}

		return [null, 'Invalid credentials', 401];
	}

	/**
	 * Find by email - повертає публічні дані
	 * @param email
	 */
	async findByEmail(email: string): Promise<PublicUser | null> {
		return this.findByField('email', email);
	}

	/**
	 * Find by username - повертає публічні дані
	 * @param username
	 */
	async findByUsername(username: string): Promise<PublicUser | null> {
		return this.findByField('username', username);
	}

	/**
	 * Verify email
	 * @param userId
	 */
	async verifyEmail(userId: UUID): Promise<PublicUser | null> {
		const updated = await this.updateRaw(userId, {
			verifiedEmail: true,
		});

		return updated ? this.transform(updated) : null;
	}

	/**
	 * Verify phone
	 * @param userId
	 */
	async verifyPhone(userId: UUID): Promise<PublicUser | null> {
		const updated = await this.updateRaw(userId, {
			verifiedPhone: true,
		});

		return updated ? this.transform(updated) : null;
	}

	/**
	 * Set password
	 * @param userId
	 * @param plainPassword
	 */
	async setPassword(
		userId: UUID,
		plainPassword: string,
	): Promise<PublicUser | null> {
		const hashedPassword = await this.hashingService.hash(plainPassword);

		const updated = await this.updateRaw(userId, {
			password: hashedPassword,
			lastPasswordChange: new Date(),
		});

		return updated ? this.transform(updated) : null;
	}

	// ВНУТРІШНІ МЕТОДИ ДЛЯ АУТЕНТИФІКАЦІЇ (ПОВЕРТАЮТЬ ПОВНІ ДАНІ)

	/**
	 * Find by email for authentication - повертає повні дані
	 * @param email
	 */
	async findByEmailForAuth(email: string): Promise<User | null> {
		return this.findByFieldRaw('email', email);
	}

	/**
	 * Find by username for authentication - повертає повні дані
	 * @param username
	 */
	async findByUsernameForAuth(username: string): Promise<User | null> {
		return this.findByFieldRaw('username', username);
	}

	/**
	 * Find by ID for authentication - повертає повні дані
	 * @param id
	 */
	async findByIdForAuth(id: UUID): Promise<User | null> {
		return this.findByIdRaw(id);
	}

	/**
	 * Validate password
	 * @param plainPassword
	 * @param hashedPassword
	 */
	private async validatePassword(
		plainPassword: string,
		hashedPassword: string,
	): Promise<boolean> {
		if (!hashedPassword) {
			return false;
		}

		return this.hashingService.compare(plainPassword, hashedPassword);
	}

	/**
	 * Hash password
	 * @param plainPassword
	 */
	async hashPassword(plainPassword: string): Promise<string> {
		return this.hashingService.hash(plainPassword);
	}
}
