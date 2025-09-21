import '@fastify/cookie';
import {
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { type User } from '../../drizzle/schema/users.schema';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { FastifyReply } from 'fastify';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { KeysService } from '../../shared/crypto/services/keys.service';
import { UUID } from 'crypto';
import { HashingService } from '../../shared/crypto/services/hashing.service';

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService,
		private configService: ConfigService,
		private keysService: KeysService,
		private hashingService: HashingService,
	) {}

	async register(createUser: CreateUserDto) {
		return await this.usersService.createUser(createUser);
	}

	async validateUser(email: string, pass: string): Promise<any> {
		const user = await this.usersService.findOneByEmail(email);

		if (!user) {
			throw new NotFoundException('User not found');
		}

		const authenticated = await this.hashingService.compare(
			pass,
			user.password,
		);

		if (!authenticated) {
			throw new UnauthorizedException('Invalid credentials');
		}

		const { password, ...result } = user;

		return result;
	}

	async login(user: User, reply: FastifyReply, redirect = false) {
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
			username: user.username,
			email: user.email,
			sub: user.userId,
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

			const user = await this.usersService.findOneByEmail(
				decoded.email || decoded.username,
			);

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

	async validateRefreshToken(userId: UUID, token: string): Promise<User> {
		const user = await this.usersService.getUserById(userId);

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
