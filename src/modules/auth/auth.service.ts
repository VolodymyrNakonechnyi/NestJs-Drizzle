import '@fastify/cookie';
import {
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { type User } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { verifyPassword } from '../../common/utils/hash.util';
import { FastifyReply } from 'fastify';

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService,
		private configService: ConfigService,
	) {}

	async validateUser(email: string, pass: string): Promise<any> {
		const user = await this.usersService.findOneByEmail(email);
		if (user && user.password === pass) {
			const { password, ...result } = user;
			return result;
		}
		return null;
	}

	async verifyUser(email: string, pass: string): Promise<User> {
		const user = await this.usersService.findOneByEmail(email);

		if (!user) {
			throw new NotFoundException('User not found');
		}

		const authenticated = await verifyPassword(pass, user.password);

		if (!authenticated) {
			throw new UnauthorizedException();
		}

		return user;
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

		const payload = { username: user.username, sub: user.userId };

		const accessToken = this.jwtService.sign(payload, {
			expiresIn: `${this.configService.get<string>('JWT_EXPIRATION_ACCESS')}ms`,
			algorithm: 'ES256',
			issuer: 'malina-corp',
			audience: 'malina-corp-users',
			privateKey: this.configService.get<string>('PRIVATE_KEY'),
		});

		const refreshToken = this.jwtService.sign(payload, {
			expiresIn: `${this.configService.get<string>('JWT_EXPIRATION_REFRESH_MS')}ms`,
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
			const user = await this.usersService.findOneByEmail(
				decoded.username,
			);
			if (decoded.expiresIn < Date.now()) {
				throw new NotFoundException('Refresh token expired');
			}

			if (!user) {
				throw new NotFoundException('User not found');
			}

			return this.login(user, reply);
		} catch (e) {
			throw new NotFoundException('Invalid refresh token');
		}
	}

	async logout(userId: number) {
		// Implement token invalidation logic if needed
		return { message: `User with ID ${userId} logged out successfully` };
	}
}
