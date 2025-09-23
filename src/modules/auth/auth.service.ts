import '@fastify/cookie';
import {
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { type User } from '../../drizzle/schema/users.schema';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { FastifyReply } from 'fastify';
import { CreateUserDto } from './dto/create-user.dto';
import { KeysService } from '../../shared/crypto/services/keys.service';
import { UUID } from 'crypto';
import { HashingService } from '../../shared/crypto/services/hashing.service';
import { UsersRepository } from './users.repository';
import {
	BadRequestException,
	ConflictException,
} from '@nestjs/common/exceptions';
import { PublicUser } from './serializer/user.serializer';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
	constructor(
		private usersRepository: UsersRepository,
		private jwtService: JwtService,
		private configService: ConfigService,
		private keysService: KeysService,
		private hashingService: HashingService,
	) {}

	/**
	 * add new user
	 * @param createUserDto
	 * @return User
	 */
	async register(createUser: CreateUserDto) {
		const existingUserByEmail = await this.usersRepository.findByEmail(
			createUser.email,
		);
		if (existingUserByEmail) {
			throw new ConflictException('User with this email exists');
		}

		const existingUserByUsername =
			await this.usersRepository.findByUsername(createUser.username);
		if (existingUserByUsername) {
			throw new ConflictException('User with this username exists');
		}

		const newUser = await this.usersRepository.create({
			...createUser,
		});

		return newUser;
	}

	/**
	 * validate user
	 * @param email
	 * @param pass
	 * @return PublicUser
	 */
	async validateUser(email: string, pass: string): Promise<any> {
		const userLoginDto: LoginUserDto = { email, password: pass };

		const [user, error, code] =
			await this.usersRepository.login(userLoginDto);

		if (error) {
			if (code === 401) {
				throw new UnauthorizedException(error);
			}

			throw new BadRequestException(error);
		}

		return user;
	}

	/**
	 * login user
	 * @param user: PublicUser
	 * @param reply: FastifyReply
	 * @param redirect: boolean
	 * @return void
	 * */
	async login(user: PublicUser, reply: FastifyReply, redirect = false) {
		const expiresAccessToken = new Date();
		expiresAccessToken.setMilliseconds(
			expiresAccessToken.getMilliseconds() +
				parseInt(
					this.configService.getOrThrow<string>(
						'JWT_EXPIRATION_ACCESS_MS',
					),
				),
		);

		const expiresRefreshToken = new Date();
		expiresRefreshToken.setMilliseconds(
			expiresRefreshToken.getMilliseconds() +
				parseInt(
					this.configService.getOrThrow<string>(
						'JWT_EXPIRATION_REFRESH_MS',
					),
				),
		);

		const payload = {
			email: user.email,
		};

		const accessToken = this.jwtService.sign(payload, {
			expiresIn: `${parseInt(this.configService.getOrThrow<string>('JWT_EXPIRATION_ACCESS_MS')) / 1000}s`,
			algorithm: 'ES256',
			issuer: 'malina-corp',
			audience: 'malina-corp-users',
			privateKey: this.keysService.getKeysSync().privateKey,
		});

		const refreshToken = this.jwtService.sign(payload, {
			expiresIn: `${parseInt(this.configService.getOrThrow<string>('JWT_EXPIRATION_REFRESH_MS')) / 1000}s`,
			algorithm: 'HS256',
			issuer: 'malina-corp',
			audience: 'malina-corp-users',
			secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
		});

		reply.setCookie('Authentification', accessToken, {
			httpOnly: true,
			secure: this.configService.get('NODE_ENV') === 'production',
			expires: expiresAccessToken,
		});

		reply.setCookie('Refresh', refreshToken, {
			httpOnly: true,
			secure: this.configService.get('NODE_ENV') === 'production',
			expires: expiresRefreshToken,
		});

		if (redirect) {
			reply.redirect(this.configService.getOrThrow('AUTH_UI_REDIRECT'));
		}
	}

	/**
	 * refresh token
	 * @param token
	 * @param reply
	 * @return void
	 * */
	async refreshToken(token: string, reply: FastifyReply) {
		try {
			const decoded = this.jwtService.verify(token, {
				secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
				algorithms: ['HS256'],
				issuer: 'malina-corp',
				audience: 'malina-corp-users',
			});

			const currentTime = Math.floor(Date.now() / 1000);
			if (decoded.exp < currentTime) {
				throw new UnauthorizedException('Refresh token expired');
			}

			const user = await this.usersRepository.findByEmail(decoded.email);

			if (!user) {
				throw new NotFoundException('User not found');
			}

			return this.login(user, reply, false);
		} catch (e) {
			if (
				e instanceof UnauthorizedException ||
				e instanceof NotFoundException
			) {
				throw e;
			}
			throw new UnauthorizedException('Invalid refresh token');
		}
	}

	/**
	 * validate refresh token
	 * @param userId
	 * @param token
	 * @return User
	 * */
	async validateRefreshToken(
		userId: UUID,
		token: string,
	): Promise<PublicUser> {
		const user = await this.usersRepository.findById(userId);

		if (!user) {
			throw new NotFoundException('User not found');
		}

		const verify = await this.jwtService.verifyAsync(token, {
			secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
		});

		if (!verify) {
			throw new UnauthorizedException('Token is not valid');
		}

		return user;
	}

	async logout(userId: number) {
		// Implement token invalidation logic if needed
		return { message: `User with ID ${userId} logged out successfully` };
	}
}
